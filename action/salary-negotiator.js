"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function startNegotiation(targetRole, company, expectedSalary) {
  const salary = parseFloat(expectedSalary);
  if (isNaN(salary) || salary <= 0) throw new Error("Invalid expected salary.");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeText = user.resume?.content || "No resume uploaded yet.";

  const prompt = `
    You are a tough but professional recruiter at ${company || "a top company"}. You are making a job offer to a candidate for the role of ${targetRole}.
    The candidate's target salary is INR ${expectedSalary}. (Note: All amounts are in INR).
    
    Candidate's background:
    """${resumeText}"""

    Your task:
    1. Make an initial offer that is 10-15% LOWER than their expected salary.
    2. Provide a brief justification (e.g., budget constraints, market rates, internal equity).
    3. The tone should be welcoming but firm on the budget.

    Return the response in this EXACT JSON format ONLY:
    {
      "initialOffer": number,
      "message": "string (the recruiter's message)",
      "justification": "string (brief internal note on why the offer is low)"
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result = JSON.parse(jsonMatch[0]);

    const session = await db.negotiationSession.create({
      data: {
        userId: user.id,
        targetRole,
        company,
        expectedSalary: salary,
        initialOffer: result.initialOffer,
        conversation: [{ role: "recruiter", message: result.message }],
      },
    });

    revalidatePath("/salary-negotiator");
    return session;
  } catch (error) {
    console.error("Error starting negotiation:", error.message);
    throw new Error("Failed to start negotiation session.");
  }
}

export async function sendNegotiationMessage(sessionId, userMessage, history) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const session = await db.negotiationSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error("Session not found");

  const prompt = `
    You are a professional recruiter at ${session.company || "the company"}. You are in a salary negotiation with a candidate for a ${session.targetRole} role.
    
    Expected Salary: INR ${session.expectedSalary}
    Initial Offer: INR ${session.initialOffer}
    
    Current Conversation History:
    ${JSON.stringify(history)}
    
    User's Latest Argument: "${userMessage}"
    
    Your Task:
    1. Respond to the user's argument as the recruiter.
    2. If the user makes a strong case (using data, experience, or multiple arguments), you can increase the offer slightly (2-3%), but NEVER exceed their expected salary.
    3. If the user is passive or lacks arguments, stay firm on the current offer.
    4. Limit the conversation to 4-5 turns.
    
    Return the response in this EXACT JSON format ONLY:
    {
      "message": "string (recruiter's response)",
      "currentOffer": number,
      "isFinal": boolean (true if you've reached your limit or 5 turns reached)
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result = JSON.parse(jsonMatch[0]);

    const updatedConversation = [
      ...history,
      { role: "user", message: userMessage },
      { role: "recruiter", message: result.message },
    ];

    return await db.negotiationSession.update({
      where: { id: sessionId },
      data: {
        conversation: updatedConversation,
        finalSalary: result.currentOffer,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw new Error("Failed to process message.");
  }
}

export async function finalizeNegotiation(sessionId, history) {
  const prompt = `
    Analyze this salary negotiation session and provide a final report.
    Conversation History:
    ${JSON.stringify(history)}
    
    Provide:
    1. A negotiation score (0-100).
    2. Feedback on their arguments (what worked, what didn't).
    3. Suggestions for future negotiations.
    
    Return JSON ONLY:
    {
      "score": number,
      "feedback": "string",
      "suggestions": ["string"]
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result = JSON.parse(jsonMatch[0]);

    const session = await db.negotiationSession.update({
      where: { id: sessionId },
      data: {
        score: result.score,
        feedback: result.feedback,
      },
    });

    return {
      ...session,
      suggestions: JSON.stringify(result.suggestions || []),
    };
  } catch (error) {
    console.error("Error finalizing negotiation:", error.message);
    throw new Error("Failed to finalize session.");
  }
}

export async function getNegotiationSessions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.negotiationSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
