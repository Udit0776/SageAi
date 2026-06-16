"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function generateOnboardingPlan(jobApplicationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const job = await db.jobApplication.findUnique({
    where: { id: jobApplicationId, userId: user.id },
  });

  if (!job) throw new Error("Job application not found");
  if (job.status !== "OFFERED") {
    throw new Error("Onboarding plans can only be generated for jobs in the OFFERED stage.");
  }

  const prompt = `
    You are an executive onboarding coach. Create a highly detailed, personalized 30-60-90 Day Onboarding Plan for a professional starting as a "${job.role}" at "${job.company}".
    
    Candidate Background:
    - Industry: ${user.industry || "general"}
    - Experience: ${user.experience || 0} years
    - Core Skills: ${user.skills.join(", ")}

    Structure the plan into three phases:
    1. "Learn" (Days 1–30): Focus on setting up environments, reading internal documentation, understanding workflows, and building team relationships.
    2. "Contribute" (Days 31–60): Focus on executing early tasks, building minor features, taking on shadows, and engaging in code review cycles.
    3. "Lead" (Days 61–90): Focus on taking ownership of tasks/projects, driving independent initiatives, and mentoring peers.

    Each phase must contain exactly 4 to 5 highly specific, actionable, and concrete milestones.

    Return the response in this EXACT JSON format ONLY:
    [
      {
        "phase": "Learn",
        "milestones": [
          { "id": "m1", "text": "Set up local coding environments and request repository privileges.", "isCompleted": false },
          { "id": "m2", "text": "string (concrete step 2)", "isCompleted": false }
        ]
      },
      {
        "phase": "Contribute",
        "milestones": [
          { "id": "m6", "text": "string (concrete step)", "isCompleted": false }
        ]
      },
      {
        "phase": "Lead",
        "milestones": [
          { "id": "m11", "text": "string (concrete step)", "isCompleted": false }
        ]
      }
    ]

    Rules:
    - Return JSON ONLY. Do not write markdown blocks or commentary.
    - Each milestone must have a unique "id" string (e.g. m1, m2, m3...).
  `;

  try {
    const aiResponse = await getAIResponse(prompt);
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse onboarding plan from AI");

    const phases = JSON.parse(jsonMatch[0]);

    // Upsert the onboarding plan linked to this application
    const plan = await db.onboardingPlan.upsert({
      where: { jobApplicationId },
      update: {
        phases,
        role: job.role,
        company: job.company,
      },
      create: {
        userId: user.id,
        jobApplicationId,
        role: job.role,
        company: job.company,
        phases,
      },
    });

    revalidatePath(`/onboarding-plan/${plan.id}`);
    revalidatePath("/job-tracker");
    return plan;
  } catch (error) {
    console.error("Error generating onboarding plan:", error);
    throw new Error(error.message || "Failed to generate onboarding plan.");
  }
}

export async function getOnboardingPlan(jobApplicationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.onboardingPlan.findUnique({
    where: { jobApplicationId },
  });
}

export async function getOnboardingPlanById(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.onboardingPlan.findUnique({
    where: { id, userId: user.id },
  });
}

export async function toggleMilestone(planId, phaseName, milestoneId, isCompleted) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const plan = await db.onboardingPlan.findUnique({
    where: { id: planId, userId: user.id },
  });

  if (!plan) throw new Error("Plan not found");

  const phases = plan.phases;
  
  // Update the checked state of the target milestone
  const updatedPhases = phases.map(p => {
    if (p.phase === phaseName) {
      return {
        ...p,
        milestones: p.milestones.map(m => {
          if (m.id === milestoneId) {
            return { ...m, isCompleted };
          }
          return m;
        }),
      };
    }
    return p;
  });

  const updatedPlan = await db.onboardingPlan.update({
    where: { id: planId },
    data: { phases: updatedPhases },
  });

  revalidatePath(`/onboarding-plan/${planId}`);
  return updatedPlan;
}
