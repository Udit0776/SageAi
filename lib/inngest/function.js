import { db } from "../prisma";
import { inngest } from "./client";
import { getAIResponse } from "../gemini";
import { startOfDay } from "date-fns";

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    triggers: [
      { cron: "0 0 * * 0" },
      { event: "app/industry-insights.generate" }
    ],
  },
  async ({ event, step }) => {
    // Event trigger path (single industry update)
    if (event?.name === "app/industry-insights.generate") {
      const { industry } = event.data;
      if (!industry) return { message: "No industry provided" };

      const insights = await step.run(
        `Generate ${industry} insights`,
        async () => {
          const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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

          const text = await getAIResponse(prompt, { useSearch: true });
          const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

          const start = cleanedText.indexOf("{");
          const end = cleanedText.lastIndexOf("}");
          if (start === -1 || end === -1)
            throw new Error("No JSON found in AI response");

          return JSON.parse(cleanedText.substring(start, end + 1));
        }
      );

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.upsert({
          where: { industry },
          update: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          create: {
            industry,
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        });
      });

      return { message: `Updated insights for industry: ${industry}` };
    }

    // Cron trigger path (all industries update)
    const industries = await step.run("Get Industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    if (industries.length === 0) return { message: "No industries found" };

    for (const { industry } of industries) {
      const insights = await step.run(
        `Generate ${industry} insights`,
        async () => {
          const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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

          const text = await getAIResponse(prompt, { useSearch: true });
          const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

          const start = cleanedText.indexOf("{");
          const end = cleanedText.lastIndexOf("}");
          if (start === -1 || end === -1)
            throw new Error("No JSON found in AI response");

          return JSON.parse(cleanedText.substring(start, end + 1));
        }
      );

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }

    return { message: `Updated ${industries.length} industries` };
  }
);

export const generateDailyCareerByte = inngest.createFunction(
  {
    id: "generate-daily-career-byte",
    name: "Generate Daily Career Byte",
    triggers: [{ event: "app/career-byte.generate" }],
  },
  async ({ event, step }) => {
    const { userId, industry } = event.data;
    if (!userId) return { message: "No userId provided" };

    const today = startOfDay(new Date());

    // Check again to avoid duplicate generation
    const exists = await step.run("Check existing byte", async () => {
      return await db.careerByte.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      });
    });

    if (exists && exists.title !== "Preparation is Key") {
      return { message: "Personalized byte already exists for today" };
    }

    const prompt = `
      Generate a personalized "Career Byte" (daily tip or question) for a professional in the "${industry || "general"}" industry.
      
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
      const text = await step.run("Get AI response", async () => {
        return await getAIResponse(prompt);
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      
      const result = JSON.parse(jsonMatch[0]);

      await step.run("Save career byte", async () => {
        if (exists) {
          await db.careerByte.update({
            where: { id: exists.id },
            data: {
              type: result.type,
              title: result.title,
              content: result.content,
              industry: industry || "general",
            }
          });
        } else {
          await db.careerByte.create({
            data: {
              userId,
              type: result.type,
              title: result.title,
              content: result.content,
              industry: industry || "general",
              date: today,
            },
          });
        }
      });

      return { message: "Successfully generated career byte" };
    } catch (error) {
      console.error("Error generating career byte in background:", error.message);
      
      if (!exists) {
        await step.run("Save fallback career byte", async () => {
          await db.careerByte.create({
            data: {
              userId,
              type: "tip",
              title: "Preparation is Key",
              content: "Spend 15 minutes today researching a company you admire. Knowledge is power in any interview.",
              industry: industry || "general",
              date: today,
            },
          });
        });
      }
      return { message: "Failed generating, kept/saved fallback" };
    }
  }
);

export const recalculateCareerHealthScore = inngest.createFunction(
  {
    id: "recalculate-career-health-score",
    name: "Recalculate Career Health Score",
    triggers: [{ event: "app/career-health.recalculate" }],
  },
  async ({ event, step }) => {
    const { userId } = event.data;
    if (!userId) return { message: "No userId provided" };

    await step.run("Calculate and update career health score", async () => {
      const { calculateCareerHealthScore } = require("../../action/career-health");
      await calculateCareerHealthScore(userId);
    });

    return { message: `Recalculated career health score for user: ${userId}` };
  }
);