"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Ensure industry insight record exists (with defaults — AI fills it on dashboard visit)
    await db.industryInsight.upsert({
      where: { industry: data.industry },
      update: {}, // do nothing if it already exists
      create: {
        industry: data.industry,
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "MEDIUM",
        topSkills: [],
        marketOutlook: "NEUTRAL",
        keyTrends: [],
        recommendedSkills: [],
        nextUpdate: new Date(), // triggers AI generation on first dashboard visit
      },
    });

    // Update user profile (fast — no AI call)
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    return { success: true, updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    let user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    if (!user) {
      // If user is not found in database (e.g. newly signed up via Clerk), sync them
      user = await checkUser();
    }

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isOnboarded: !!user.industry,
    };
  } catch (error) {
    console.log("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
