"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to delay execution (for retries)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateCoverLetterContent(prompt) {
  const modelNames = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
  const maxRetries = 3;

  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Trying ${modelName} (attempt ${attempt}/${maxRetries})...`);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();

        return text;
      } catch (error) {
        const is503 = error.message?.includes("503") || error.message?.includes("Service Unavailable");
        const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");

        if ((is503 || is429) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.warn(`${modelName} returned ${is503 ? "503" : "429"}, retrying in ${waitTime / 1000}s...`);
          await delay(waitTime);
          continue;
        }

        console.warn(`${modelName} failed after attempt ${attempt}: ${error.message}`);
        break; // Try next model
      }
    }
  }

  throw new Error("Failed to generate cover letter. The AI service is temporarily unavailable. Please try again in a few minutes.");
}

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  const content = await generateCoverLetterContent(prompt);

  const coverLetter = await db.coverLetter.create({
    data: {
      content,
      jobDescription: data.jobDescription,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: "completed",
      userId: user.id,
    },
  });

  return coverLetter;
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}
export async function updateCoverLetter(id, content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      content,
    },
  });
}
