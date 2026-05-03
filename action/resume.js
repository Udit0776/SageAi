"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAIResponse(prompt) {
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ];
  const maxRetries = 3;

  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Trying ${modelName} (attempt ${attempt}/${maxRetries})...`,
        );
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
      } catch (error) {
        const is503 =
          error.message?.includes("503") ||
          error.message?.includes("Service Unavailable");
        const is429 =
          error.message?.includes("429") ||
          error.message?.includes("Too Many Requests");

        if ((is503 || is429) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.warn(
            `${modelName} returned ${is503 ? "503" : "429"}, retrying in ${waitTime / 1000}s...`,
          );
          await delay(waitTime);
          continue;
        }

        console.warn(
          `${modelName} failed after attempt ${attempt}: ${error.message}`,
        );
        break; // Try next model
      }
    }
  }

  throw new Error(
    "All AI models failed to respond. Please try again in a few minutes.",
  );
}

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error in saving resume:", error.message);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");

  try {
    return await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error.message);
    throw new Error("Failed to fetch resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:[a-z]+)?\n?|\n?```/gi, "").trim();
    return cleanedText;
  } catch (error) {
    console.error("Error improving with AI:", error.message);
    throw new Error("Failed to improve content with AI. Please try again.");
  }
}
