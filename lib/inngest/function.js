import { db } from "../prisma";
import { inngest } from "./client";
import { getAIResponse } from "../gemini";

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    triggers: [{ cron: "0 0 * * 0" }],
  },
  async ({ step }) => {
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

          const text = await getAIResponse(prompt);
          const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

          // Robust JSON extraction
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