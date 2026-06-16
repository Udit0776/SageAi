"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { startOfDay } from "date-fns";
import { inngest } from "@/lib/inngest/client";

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

  // If no byte for today, trigger generation in the background asynchronously
  inngest.send({
    name: "app/career-byte.generate",
    data: { userId: user.id, industry: user.industry || "general" }
  }).catch(err => console.error("Failed to send Inngest event for career byte:", err));

  // Return a static fallback byte immediately so the user doesn't wait
  return {
    type: "tip",
    title: "Preparation is Key",
    content: "Spend 15 minutes today researching a company you admire. Knowledge is power in any interview.",
    industry: user.industry || "general",
    date: today,
  };
}
