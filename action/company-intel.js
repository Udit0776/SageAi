"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function generateCompanyBattlePlan(companyName, targetRole) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeText = user.resume?.content || "No resume uploaded yet.";

  const prompt = `
    You are a career intelligence analyst. Research "${companyName}" and create a comprehensive interview preparation "Battle Plan" for a "${targetRole}" role.

    The candidate's resume:
    """${resumeText}"""

    Return the response in this EXACT JSON format ONLY:
    {
      "companyOverview": {
        "mission": "string (1-2 sentences about the company mission)",
        "values": ["string (core company values)"],
        "culture": "string (2-3 sentences about work culture)",
        "size": "string (e.g. '180,000+ employees')",
        "headquarters": "string (city, country)"
      },
      "interviewProcess": {
        "rounds": ["string (e.g. 'Phone Screen', 'Technical Round', 'Onsite', 'Team Match')"],
        "duration": "string (e.g. '4-6 weeks')",
        "tips": ["string (3-4 interview tips specific to this company)"]
      },
      "commonQuestions": [
        {
          "question": "string",
          "category": "behavioral | technical | culture",
          "tip": "string (how to approach this question)"
        }
      ],
      "whyYouFit": [
        "string (personalized reason based on the candidate's resume - give 3-4 reasons)"
      ],
      "recentNews": [
        {
          "title": "string",
          "summary": "string (1-2 sentences)"
        }
      ],
      "salaryRange": {
        "min": number,
        "max": number,
        "currency": "INR",
        "format": "LPA"
      }
    }

    IMPORTANT:
    - Provide salary in Indian Rupees (INR) and use Lakhs Per Annum (LPA) format (e.g., 1200000 for 12 LPA).
    - Include exactly 5-7 common interview questions.
    - Include 2-3 recent news items.
    - Personalize "whyYouFit" based on the candidate's actual resume skills and experience.
    - Return ONLY the JSON, no markdown formatting.
  `;

  try {
    const text = await getAIResponse(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned invalid data format. Please try again.");
    }

    let battlePlanData;
    try {
      battlePlanData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[CompanyIntel] JSON parse failed:", parseErr.message);
      throw new Error("AI returned malformed data. Please try again.");
    }

    if (!battlePlanData || typeof battlePlanData !== "object") {
       throw new Error("AI failed to provide structured data.");
    }

    const companyIntel = await db.companyIntel.create({
      data: {
        userId: user.id,
        companyName,
        targetRole,
        content: JSON.stringify(battlePlanData),
      },
    });

    revalidatePath("/company-intel");
    
    // Return a plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(companyIntel));
  } catch (error) {
    console.error("Error generating battle plan:", error.message);
    throw new Error(error.message || "Failed to generate company battle plan.");
  }
}

export async function getCompanyBattlePlans() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.companyIntel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteCompanyBattlePlan(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const intel = await db.companyIntel.findUnique({ where: { id } });
  if (!intel || intel.userId !== user.id) {
    throw new Error("Battle plan not found or unauthorized.");
  }

  await db.companyIntel.delete({ where: { id } });
  revalidatePath("/company-intel");
  return { success: true };
}
