"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { startOfDay } from "date-fns";

export async function getDailyCareerByte() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const today = startOfDay(new Date());

  // Check if we already have a byte for today
  const existingByte = await db.careerByte.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (existingByte) return existingByte;

  // Generate a new byte
  const prompt = `
    Generate a personalized "Career Byte" (daily tip or question) for a professional in the "${user.industry || "general"}" industry.
    
    Choose one of these types:
    - "tip": A quick, actionable career tip.
    - "question": A common interview question to ponder.
    - "trend": A brief update on an industry trend.
    - "motivation": A short, impactful piece of career motivation.
    
    Return the response in this EXACT JSON format ONLY:
    {
      "type": "tip | question | trend | motivation",
      "title": "string (short, catchy title)",
      "content": "string (1-2 sentences of high-value content)"
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    
    const result = JSON.parse(jsonMatch[0]);

    return await db.careerByte.create({
      data: {
        userId: user.id,
        type: result.type,
        title: result.title,
        content: result.content,
        industry: user.industry || "general",
        date: today,
      },
    });
  } catch (error) {
    console.error("Error generating career byte:", error.message);
    // Fallback static byte if AI fails
    return {
      type: "tip",
      title: "Preparation is Key",
      content: "Spend 15 minutes today researching a company you admire. Knowledge is power in any interview.",
    };
  }
}
