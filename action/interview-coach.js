"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";


export async function generateInterviewQuestions(type, targetRole, company) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User Not Found");

  const resumeText = user.resume?.content || "No resume uploaded yet.";

  const prompt = `
    Generate 10 personalized interview questions for a ${targetRole} role ${company ? `at ${company}` : ""}.
    The candidate's industry is ${user.industry} and their resume content is:
    """${resumeText}"""

    Interview Type: ${type} (behavioral, technical, or HR)

    Rules:
    - Questions should be tailored to their experience and the target role.
    - For behavioral questions, focus on leadership, conflict, and teamwork.
    - For technical questions, focus on skills mentioned in their resume.
    - Provide 1 hint for each question.
    
    Return the response in this JSON format ONLY:
    {
      "questions": [
        {
          "id": "q1",
          "question": "string",
          "category": "string",
          "difficulty": "string",
          "hints": ["string"]
        }
      ]
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const result = JSON.parse(cleanedText);
    return result.questions;
  } catch (error) {
    console.error("Error generating questions:", error.message, error);
    
    // FALLBACK: If AI fails, return 10 high-quality default questions so the user can demo
    console.log("Using fallback questions due to AI failure...");
    return [
      {
        id: "f1",
        question: `As a ${targetRole}, tell me about a time you handled a difficult project requirement.`,
        category: "behavioral",
        difficulty: "medium",
        hints: ["Focus on your problem-solving process and the final outcome."]
      },
      {
        id: "f2",
        question: `What are the most important technical skills for someone in ${targetRole}?`,
        category: "technical",
        difficulty: "hard",
        hints: ["Mention specific tools or methodologies relevant to your role."]
      },
      {
        id: "f3",
        question: `How do you stay updated with the latest trends in the ${user.industry || 'industry'} sector?`,
        category: "HR",
        difficulty: "easy",
        hints: ["Talk about blogs, newsletters, or community projects."]
      },
      {
        id: "f4",
        question: `Describe a situation where you had to work with a team to achieve a common goal.`,
        category: "behavioral",
        difficulty: "medium",
        hints: ["Use the STAR method: Situation, Task, Action, Result."]
      },
      {
        id: "f5",
        question: `How do you handle high-pressure situations or tight deadlines in a ${targetRole} position?`,
        category: "behavioral",
        difficulty: "medium",
        hints: ["Give a specific example of prioritizing tasks and managing time."]
      },
      {
        id: "f6",
        question: `What do you consider your biggest professional achievement so far?`,
        category: "behavioral",
        difficulty: "easy",
        hints: ["Focus on an achievement that aligns with the job requirements."]
      },
      {
        id: "f7",
        question: `Tell me about a technical challenge you faced and how you solved it.`,
        category: "technical",
        difficulty: "hard",
        hints: ["Explain the problem, your approach, and the tools you used."]
      },
      {
        id: "f8",
        question: `Why do you want to work as a ${targetRole} and what makes you a good fit?`,
        category: "HR",
        difficulty: "medium",
        hints: ["Mention your passion for the field and specific skills that match the role."]
      },
      {
        id: "f9",
        question: `How do you handle constructive criticism or negative feedback on your work?`,
        category: "behavioral",
        difficulty: "easy",
        hints: ["Emphasize your willingness to learn and improve."]
      },
      {
        id: "f10",
        question: `Where do you see yourself in five years in your career as a ${targetRole}?`,
        category: "HR",
        difficulty: "medium",
        hints: ["Show ambition but stay realistic and relevant to the company."]
      }
    ];
  }
}

export async function analyzeAnswer(question, userAnswer, category) {
  const prompt = `
    You are an expert interview coach. Analyze the following answer to this interview question.
    Question: "${question}"
    User Answer: "${userAnswer}"
    Category: ${category}

    Provide a detailed analysis including:
    1. Scores (0-10) for clarity, relevance, depth, and confidence.
    2. STAR Method analysis: Identify if the user covered Situation, Task, Action, and Result.
    3. Constructive feedback on how to improve.
    4. An improved "Ideal Version" of their answer based on their input.
    5. List any key missing elements or metrics.
    6. Identify any filler words or weak phrases.

    Return the response in this JSON format ONLY:
    {
      "scores": { "clarity": number, "relevance": number, "depth": number, "confidence": number },
      "overallScore": number,
      "starAnalysis": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean },
      "feedback": "string",
      "improvedAnswer": "string",
      "keyMissing": ["string"],
      "fillerPhrases": ["string"]
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error analyzing answer:", error);
    throw new Error("Failed to analyze answer.");
  }
}

export async function saveInterviewSession(sessionData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  try {
    return await db.interviewSession.create({
      data: {
        userId: user.id,
        ...sessionData,
      },
    });
  } catch (error) {
    console.error("Error saving session:", error);
    throw new Error("Failed to save interview session.");
  }
}

export async function generateSessionReport(questionsWithAnswers) {
  const prompt = `
    Analyze this full interview session and provide a holistic report.
    Session Data:
    ${JSON.stringify(questionsWithAnswers, null, 2)}

    Provide:
    1. Overall Readiness Score (0-100).
    2. Top 3 Strengths and Top 3 Weaknesses.
    3. A brutally honest "Rejection Risk" assessment (why a recruiter might reject them).
    4. A 3-step improvement plan.

    Return the response in this JSON format ONLY:
    {
      "readinessScore": number,
      "strengths": ["string"],
      "weaknesses": ["string"],
      "rejectionRisk": "string",
      "improvementPlan": "string"
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate session report.");
  }
}

export async function getInterviewSessions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  try {
    return await db.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw new Error("Failed to fetch interview sessions.");
  }
}
