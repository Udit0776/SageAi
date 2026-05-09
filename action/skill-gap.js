"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function analyzeSkillGap(jobTitle, company, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeText = user.resume?.content || "No resume uploaded yet.";

  const prompt = `
    You are a career strategist. Compare the candidate's resume against the following job description and provide a comprehensive skill gap analysis.

    Candidate Resume:
    """${resumeText}"""

    Target Job: ${jobTitle}${company ? ` at ${company}` : ""}
    Job Description:
    """${jobDescription}"""

    Return the response in this EXACT JSON format ONLY:
    {
      "readinessScore": number (0-100, how ready the candidate is for this role),
      "overallAssessment": "string (2-3 sentences summarizing the fit)",
      "matchingSkills": [
        {
          "skill": "string",
          "confidence": number (0-100, how strongly this skill is demonstrated),
          "evidence": "string (brief evidence from resume)"
        }
      ],
      "missingSkills": [
        {
          "skill": "string",
          "priority": "critical | important | nice-to-have",
          "reason": "string (why this skill is needed for the role)"
        }
      ],
      "roadmap": {
        "week1": {
          "focus": "string (main skill to learn)",
          "tasks": ["string (specific learning tasks)"],
          "resources": ["string (course names, documentation, or project ideas)"]
        },
        "week2": {
          "focus": "string",
          "tasks": ["string"],
          "resources": ["string"]
        },
        "week3": {
          "focus": "string",
          "tasks": ["string"],
          "resources": ["string"]
        },
        "week4": {
          "focus": "string",
          "tasks": ["string"],
          "resources": ["string"]
        }
      }
    }

    IMPORTANT:
    - Include at least 4-6 matching skills with realistic confidence percentages.
    - Include at least 3-5 missing skills with appropriate priority levels.
    - The roadmap should be actionable and specific with real resource names.
    - Return ONLY the JSON, no markdown formatting.
  `;

  try {
    const text = await getAIResponse(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned invalid data format. Please try again.");
    }

    let analysisData;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[SkillGap] JSON parse failed:", parseErr.message);
      throw new Error("AI returned malformed data. Please try again.");
    }

    const report = await db.skillGapReport.create({
      data: {
        userId: user.id,
        jobTitle,
        company: company || null,
        jobDescription,
        content: JSON.stringify(analysisData),
        readinessScore: analysisData.readinessScore || null,
      },
    });

    revalidatePath("/skill-gap");
    
    // Return a plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.error("Error analyzing skill gap:", error.message);
    throw new Error(error.message || "Failed to analyze skill gap.");
  }
}

export async function getSkillGapReports() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.skillGapReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSkillGapReport(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const report = await db.skillGapReport.findUnique({ where: { id } });
  if (!report || report.userId !== user.id) {
    throw new Error("Report not found or unauthorized.");
  }

  await db.skillGapReport.delete({ where: { id } });
  revalidatePath("/skill-gap");
  return { success: true };
}
