"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import { getPlainTextFromResume } from "@/lib/ats-scorer";
import { computeSkillGap } from "@/lib/skill-taxonomy";

export async function analyzeSkillGap(jobTitle, company, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeTextRaw = user.resume?.content || "";
  const resumeText = getPlainTextFromResume(resumeTextRaw);
  const gapResult = computeSkillGap(resumeText, jobDescription);

  const prompt = `
    You are a career strategist. Compare the candidate's skills against the target job requirements.
    The following skill gap has been deterministically computed for a candidate applying for: ${jobTitle}${company ? ` at ${company}` : ""}.
    
    Deterministic Gap Results:
    - Readiness Score: ${gapResult.readinessScore}%
    - Matching Skills: ${JSON.stringify(gapResult.matchingSkills)}
    - Present Skills (User has): ${JSON.stringify(gapResult.presentSkills)}
    - Required Skills (from Job Description): ${JSON.stringify(gapResult.requiredSkills)}
    - Extra Skills (User has but not required): ${JSON.stringify(gapResult.extraSkills)}
    - Missing Skills: ${JSON.stringify(gapResult.missingSkills.map(m => m.skill))}
    
    IMPORTANT Rules:
    - Do NOT recompute or contradict these scores or matching/missing skills lists.
    - Your job is ONLY to generate a 4-week learning roadmap addressing the missing skills in priority order, along with a high-level 2-3 sentence overall fit assessment.
    
    Return the response in this EXACT JSON format ONLY:
    {
      "overallAssessment": "string (2-3 sentences summarizing the fit based on the deterministic gap)",
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

    Return ONLY the JSON, no markdown formatting.
  `;

  try {
    const text = await getAIResponse(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned invalid data format. Please try again.");
    }

    let aiResponseData;
    try {
      aiResponseData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[SkillGap] JSON parse failed:", parseErr.message);
      throw new Error("AI returned malformed data. Please try again.");
    }

    const combinedData = {
      readinessScore: gapResult.readinessScore,
      presentSkills: gapResult.presentSkills,
      requiredSkills: gapResult.requiredSkills,
      matchingSkills: gapResult.matchingSkills,
      missingSkills: gapResult.missingSkills,
      extraSkills: gapResult.extraSkills,
      missingByCategory: gapResult.missingByCategory,
      overallAssessment: aiResponseData.overallAssessment,
      roadmap: aiResponseData.roadmap
    };

    const report = await db.skillGapReport.create({
      data: {
        userId: user.id,
        jobTitle,
        company: company || null,
        jobDescription,
        content: JSON.stringify(combinedData),
        readinessScore: gapResult.readinessScore,
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
