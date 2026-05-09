"use server";

import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";

export async function optimizeLinkedInSection(sectionType, content, targetRole) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    You are a professional LinkedIn profile optimizer and career coach. Optimize the following LinkedIn "${sectionType}" section for a "${targetRole}" role.
    
    Original Content:
    """${content}"""
    
    Your Task:
    1. Rewrite the content to be more impactful, action-oriented, and professional.
    2. Incorporate high-ranking SEO keywords for a ${targetRole}.
    3. Ensure a clear "hook" at the beginning and a strong "Call to Action" or value proposition.
    4. Maintain a natural, first-person voice (if applicable for the section).
    
    Return the response in this EXACT JSON format ONLY:
    {
      "optimizedContent": "string (the full rewritten section)",
      "seoKeywords": ["string (keywords you added)"],
      "improvements": [
        { "before": "string", "after": "string", "reason": "string" }
      ],
      "recruiterScore": number (0-100),
      "analysis": "string (2-3 sentences on what was changed)"
    }
    
    IMPORTANT:
    - Provide at least 3-4 specific "before/after" improvement points.
    - SEO keywords should be industry-standard and relevant to ${targetRole}.
    - Return ONLY the JSON, no markdown formatting.
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error optimizing LinkedIn:", error.message);
    throw new Error("Failed to optimize LinkedIn profile.");
  }
}
