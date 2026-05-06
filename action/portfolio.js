"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function getPortfolio() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
  });

  return portfolio;
}

export async function generatePortfolio() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume?.content) throw new Error("Resume not found. Please build your resume first.");

  const prompt = `
    You are an expert web designer and copywriter. Convert the following resume into a structured JSON payload for a personal portfolio website.
    Write a catchy headline, a compelling "About Me" section, and extract the key skills and experiences.

    Resume Text:
    """${user.resume.content}"""

    Return the response in this EXACT JSON format ONLY:
    {
      "headline": "A short, punchy 1-sentence headline",
      "aboutMe": "A 2-3 paragraph engaging about me section",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "experience": [
        {
          "role": "Job Title",
          "company": "Company Name",
          "duration": "Duration (e.g., 2020-2023)",
          "description": "Short 1-sentence description of impact"
        }
      ],
      "projects": [
        {
          "name": "Project Name (infer from resume if possible)",
          "description": "Short description of the project"
        }
      ],
      "contactEmail": "Extract from resume or leave empty string"
    }
  `;

  try {
    console.log("[Portfolio] Resume content length:", user.resume.content.length, "chars");
    const text = await getAIResponse(prompt);
    console.log("[Portfolio] AI response received, length:", text.length, "chars");
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Portfolio] AI response did not contain JSON:", text.substring(0, 200));
      throw new Error("AI returned invalid data format. Please try again.");
    }
    
    let portfolioData;
    try {
      portfolioData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[Portfolio] JSON parse failed:", parseErr.message);
      console.error("[Portfolio] Raw JSON attempt:", jsonMatch[0].substring(0, 300));
      throw new Error("AI returned malformed JSON. Please try again.");
    }

    // Save to database
    const portfolio = await db.portfolio.upsert({
      where: { userId: user.id },
      update: { content: JSON.stringify(portfolioData) },
      create: { 
        userId: user.id,
        content: JSON.stringify(portfolioData),
        customUrl: user.username || user.email.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6)
      },
    });

    revalidatePath("/portfolio");
    return portfolio;
  } catch (error) {
    console.error("Error generating portfolio:", error.message);
    throw new Error(error.message || "Failed to generate portfolio from resume.");
  }

}

export async function updatePortfolioSettings(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // If changing customUrl, check for uniqueness
  if (data.customUrl) {
    const existing = await db.portfolio.findUnique({
      where: { customUrl: data.customUrl }
    });
    
    if (existing && existing.userId !== user.id) {
      throw new Error("This URL is already taken.");
    }
  }

  const portfolio = await db.portfolio.update({
    where: { userId: user.id },
    data,
  });

  revalidatePath("/portfolio");
  return portfolio;
}
