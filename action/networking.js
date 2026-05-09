"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { getAIResponse } from "@/lib/gemini";

export async function generateReferralMessage(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeText = user.resume?.content || "No resume uploaded yet.";

  const prompt = `
    You are an expert at professional networking. Write a highly effective "Cold Outreach" message for LinkedIn or Email asking for a referral or introduction.
    
    Target Company: ${data.company}
    Target Role: ${data.role}
    Contact Name: ${data.contactName || "the professional"}
    Contact Role: ${data.contactRole || "someone at the company"}
    
    Candidate's Background (Resume):
    """${resumeText}"""
    
    Your Task:
    1. Write a message that is concise, professional, and has a clear value proposition.
    2. Reference specific skills or experiences from the resume that match the target company/role.
    3. Make it easy for the recipient to say "yes" (mention you've already researched the role).
    4. Provide two versions: "LinkedIn Invite" (short) and "Full Message" (detailed).
    
    Return JSON ONLY:
    {
      "linkedinInvite": "string (under 300 characters)",
      "fullMessage": "string (the detailed networking message)",
      "subjectLine": "string (for email versions)",
      "tips": ["string (2-3 tips for this specific outreach)"]
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating referral message:", error.message);
    throw new Error("Failed to generate networking message.");
  }
}
