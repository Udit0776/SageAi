"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getAIResponse } from "@/lib/gemini";
import { extractText, getDocumentProxy } from "unpdf";

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
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
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    return await db.resume.findUnique({
      where: { userId: user.id },
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
    where: { clerkUserId: userId },
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
    console.error("Error improving with AI:", error);
    throw new Error(error.message || "Failed to improve content with AI");
  }
}

export async function parsePDFResume(formData) {
  const file = formData.get("file");
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return { base64, text };
  } catch (error) {
    console.error("Unpdf extraction failed, falling back to multimodal:", error);
    return { base64, text: null };
  }
}

export async function extractResumeFromPDF(data) {
  const { base64, text: extractedText } = data;
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    You are an expert resume parser. I have provided a ${extractedText ? "text version" : "PDF"} of a resume.
    Extract the following information and structure it into a JSON object:
    {
      "contactInfo": {
        "email": "",
        "mobile": "",
        "linkedin": "",
        "twitter": ""
      },
      "summary": "...",
      "skills": "...",
      "experience": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "education": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "projects": [
        { "title": "", "link": "", "description": "" }
      ]
    }

    Rules:
    - Extract as much information as possible accurately.
    - If a field is not found, leave it as an empty string or empty array.
    - Format dates consistently (e.g., YYYY-MM).
    - Return ONLY the JSON object. No markdown formatting.
  `;

  try {
    const aiResponse = extractedText 
      ? await getAIResponse(`${prompt}\n\nResume Content:\n${extractedText}`)
      : await getAIResponse(prompt, { pdfData: base64 });

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error extracting resume:", error);
    throw new Error(error.message || "Failed to extract resume from PDF");
  }
}

export async function tailorResumeWithAI({ currentResume, jobDescription }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    You are an expert ATS optimizer. 
    Candidate Resume: """${currentResume}"""
    Target Job Description: """${jobDescription}"""

    1. Calculate a "Match Score" (0-100).
    2. Rewrite the resume (in the same JSON structure) to better match the job.
    
    Return strictly as JSON:
    {
      "matchScore": number,
      "tailoredResume": { ...same structure... }
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error(error.message || "Failed to tailor resume with AI");
  }
}
