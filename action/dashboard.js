"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { inngest } from "@/lib/inngest/client";

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const text = await getAIResponse(prompt);
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("Industry not set. Please complete onboarding.");

  const hasNoInsights = !user.industryInsight;
  const isOutdated = user.industryInsight && user.industryInsight.nextUpdate < new Date();

  // If no insights or insights are outdated, trigger background updates
  if (hasNoInsights || isOutdated) {
    console.log(`[Dashboard] Industry insights for "${user.industry}" are outdated/missing. Dispatching background Inngest event.`);
    try {
      await inngest.send({
        name: "app/industry-insights.generate",
        data: { industry: user.industry },
      });
    } catch (err) {
      console.error("Failed to send Inngest event for industry insights (likely offline). Generating synchronously inline:", err);
      try {
        const insights = await generateAIInsights(user.industry);
        const industryInsight = await db.industryInsight.upsert({
          where: { industry: user.industry },
          create: {
            industry: user.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          update: {
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        return industryInsight;
      } catch (inlineErr) {
        console.error("Inline insight generation failed:", inlineErr);
      }
    }
  }

  // If we don't have insights at all in the DB, return a temporary static fallback immediately
  if (hasNoInsights) {
    return {
      industry: user.industry,
      salaryRanges: [
        { role: "Software Engineer", min: 400000, max: 1200000, median: 800000, location: "Remote" },
        { role: "Product Manager", min: 600000, max: 1800000, median: 1100000, location: "Remote" },
        { role: "Data Scientist", min: 500000, max: 1500000, median: 1000000, location: "Remote" },
        { role: "UX Designer", min: 350000, max: 1000000, median: 650000, location: "Remote" },
        { role: "DevOps Engineer", min: 450000, max: 1400000, median: 900000, location: "Remote" }
      ],
      growthRate: 12.5,
      demandLevel: "MEDIUM",
      topSkills: ["Problem Solving", "Communication", "Technical Skills", "Teamwork", "Adaptability"],
      marketOutlook: "NEUTRAL",
      keyTrends: [
        "Increasing adoption of artificial intelligence and machine learning tools.",
        "Growing emphasis on remote and hybrid collaboration frameworks.",
        "Increased focus on data security, privacy, and regulatory compliance.",
        "Rise of low-code/no-code platforms for rapid development cycles.",
        "Shift towards continuous integration and automated testing workflows."
      ],
      recommendedSkills: [
        "Continuous Learning",
        "Cross-functional Collaboration",
        "Systems Thinking",
        "Data-driven Decision Making",
        "Emotional Intelligence"
      ],
      lastUpdated: new Date(0), // Outdated to trigger refresh indicator
      nextUpdate: new Date(),
    };
  }

  return user.industryInsight;
}

export async function generateFunnelCommentary(funnelData) {
  const prompt = `
    You are an expert career advisor. Analyze this job application conversion funnel:
    - Total Applications (Applied): ${funnelData.applied}
    - Reached Interviewing: ${funnelData.interviewing}
    - Reached Offered: ${funnelData.offered}
    
    Provide a concise, 1-2 sentence diagnostic commentary explaining what the drop-off numbers suggest and how to improve.
    If applied-to-interview drop-off is high, suggest resume tailoring.
    If interview-to-offer drop-off is high, suggest mock interview practice.
    Do not use markdown formatting. Keep it brief (max 150 characters).
  `;
  try {
    const text = await getAIResponse(prompt);
    return text.trim();
  } catch (error) {
    console.error("Error generating funnel commentary:", error);
    return "Keep applying and tracking your applications to generate diagnostic drop-off insights.";
  }
}
