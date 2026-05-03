import { db } from "../prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const modelNames = [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
          ];
          const maxRetries = 3;

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

          for (const modelName of modelNames) {
            const model = genAI.getGenerativeModel({ model: modelName });

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                console.log(
                  `Trying ${modelName} (attempt ${attempt}/${maxRetries})...`
                );
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const cleanedText = text
                  .replace(/```(?:json)?\n?/g, "")
                  .trim();

                // Robust JSON extraction
                const start = cleanedText.indexOf("{");
                const end = cleanedText.lastIndexOf("}");
                if (start === -1 || end === -1)
                  throw new Error("No JSON found in AI response");

                return JSON.parse(cleanedText.substring(start, end + 1));
              } catch (error) {
                const is503 =
                  error.message?.includes("503") ||
                  error.message?.includes("Service Unavailable");
                const is429 =
                  error.message?.includes("429") ||
                  error.message?.includes("Too Many Requests");

                if ((is503 || is429) && attempt < maxRetries) {
                  const waitTime = Math.pow(2, attempt) * 1000;
                  console.warn(
                    `${modelName} returned ${is503 ? "503" : "429"}, retrying in ${waitTime / 1000}s...`
                  );
                  await delay(waitTime);
                  continue;
                }

                console.warn(
                  `${modelName} failed after attempt ${attempt}: ${error.message}`
                );
                break; // Try next model
              }
            }
          }

          throw new Error(
            "All AI models failed to generate insights for " + industry
          );
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