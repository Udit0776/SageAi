"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function addJobApplication(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const application = await db.jobApplication.create({
    data: {
      userId: user.id,
      company: data.company,
      role: data.role,
      status: data.status,
      notes: data.notes,
    },
  });

  revalidatePath("/job-tracker");
  return application;
}

export async function updateJobStatus(id, newStatus) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const application = await db.jobApplication.update({
    where: { id, userId: user.id },
    data: { status: newStatus },
  });

  revalidatePath("/job-tracker");
  return application;
}

export async function deleteJobApplication(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  await db.jobApplication.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/job-tracker");
  return { success: true };
}

export async function getJobApplications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.jobApplication.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAIJobAdvice(jobId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const job = await db.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job) throw new Error("Job not found");

  const prompt = `
    Analyze this job application and provide a specific "Next Action" or career advice.
    
    Company: ${job.company}
    Role: ${job.role}
    Status: ${job.status}
    Notes: ${job.notes || "None"}
    Last Updated: ${job.updatedAt}
    
    If the status is "APPLIED", suggest follow-up or research.
    If "INTERVIEWING", suggest preparation or questions to ask.
    If "OFFERED", suggest negotiation or due diligence.
    If "REJECTED", suggest a post-mortem or moving on strategy.
    
    Return JSON ONLY:
    {
      "nextAction": "string (1 short, actionable sentence)",
      "advice": "string (brief context or tip)"
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    
    const result = JSON.parse(jsonMatch[0]);

    const updatedJob = await db.jobApplication.update({
      where: { id: jobId },
      data: { nextAction: result.nextAction },
    });

    return { ...result, job: updatedJob };
  } catch (error) {
    console.error("Error getting AI job advice:", error.message);
    throw new Error("Failed to generate AI advice.");
  }
}
