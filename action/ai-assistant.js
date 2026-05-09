"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";

export async function getAssistantResponse(message) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
      jobApplications: { take: 5, orderBy: { updatedAt: "desc" } },
      interviewSessions: { take: 3, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) throw new Error("User not found");

  const context = `
    User Profile:
    Industry: ${user.industry || "Not set"}
    Skills: ${user.skills.join(", ")}
    
    Resume Content:
    ${user.resume?.content ? user.resume.content.substring(0, 1000) + "..." : "No resume uploaded."}
    
    Recent Job Applications:
    ${user.jobApplications.map(app => `- ${app.role} at ${app.company} (${app.status})`).join("\n")}
    
    Recent Interview Performance:
    ${user.interviewSessions.map(s => `- ${s.type} session, Score: ${s.overallScore}`).join("\n")}
    
    User Question: "${message}"
  `;

  const prompt = `
    You are the "Sage AI Assistant," a helpful and expert career coach built into the Sage AI platform.
    Your goal is to provide specific, encouraging, and data-backed career advice based on the user's profile.
    
    Context:
    ${context}
    
    Guidelines:
    1. Be concise (max 3-4 sentences).
    2. Refer to their specific data (resume, jobs, or interviews) when relevant.
    3. If they ask about platform features, explain how they can help.
    4. Maintain a professional, supportive, and slightly "wise" persona.
    5. Do not use markdown formatting like bold or bullet points in your response string.
  `;

  try {
    const response = await getAIResponse(prompt);
    return response.trim();
  } catch (error) {
    console.error("Error in AI Assistant:", error.message);
    throw new Error("Assistant is temporarily offline.");
  }
}
