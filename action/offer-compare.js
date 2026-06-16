"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function compareOffers(offers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!offers || offers.length < 2 || offers.length > 3) {
    throw new Error("You must supply between 2 and 3 offers to compare.");
  }

  const prompt = `
    You are an elite career negotiator and financial planner. Analyze the following 2 to 3 job offers and score them comparatively on a 100-point scale.
    Provide scores for Salary, Flexibility (work model), Growth Potential, Location, and Overall.
    Identify the clear winner and provide detailed reasoning.

    Offers to compare:
    ${JSON.stringify(offers, null, 2)}

    Candidate Profile:
    - Industry: ${user.industry || "general"}
    - Experience: ${user.experience || 0} years
    - Skills: ${user.skills.join(", ")}

    Return the response in this EXACT JSON format ONLY:
    {
      "winner": "string (exactly matching the company name of the recommended offer)",
      "reasoning": "string (detailed, professional paragraph of summary reasoning)",
      "scores": {
        "[companyName1]": {
          "salaryScore": number (0-100),
          "flexibilityScore": number (0-100),
          "growthScore": number (0-100),
          "locationScore": number (0-100),
          "overallScore": number (0-100),
          "pros": ["string", "string"],
          "cons": ["string", "string"]
        },
        "[companyName2]": {
          "salaryScore": number (0-100),
          "flexibilityScore": number (0-100),
          "growthScore": number (0-100),
          "locationScore": number (0-100),
          "overallScore": number (0-100),
          "pros": ["string", "string"],
          "cons": ["string", "string"]
        }
      }
    }

    Rules:
    - Return JSON ONLY. Do not write markdown blocks or comments.
    - Ensure key names in "scores" exactly match the companyName values supplied in input.
  `;

  try {
    const aiResponse = await getAIResponse(prompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse comparative insights from AI");

    const comparisonData = JSON.parse(jsonMatch[0]);

    const session = await db.offerComparison.create({
      data: {
        userId: user.id,
        offers,
        comparisonData,
      },
    });

    revalidatePath("/offer-compare");
    return session;
  } catch (error) {
    console.error("Error comparing offers:", error);
    throw new Error(error.message || "Failed to compare offers.");
  }
}

export async function getOfferComparisons() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.offerComparison.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteOfferComparison(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  await db.offerComparison.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/offer-compare");
  return { success: true };
}
