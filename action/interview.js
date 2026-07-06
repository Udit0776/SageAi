"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { computeWeaknessProfile, buildAdaptivePromptContext } from "@/lib/quiz-adapter";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  // Fetch the user's past Assessment records (last 10)
  const assessments = await db.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const weaknessProfile = computeWeaknessProfile(assessments);

  // Extract last 30 questions to avoid repeating
  const recentQuestions = [];
  for (const assessment of assessments) {
    if (assessment.questions) {
      for (const q of assessment.questions) {
        if (recentQuestions.length < 30) {
          recentQuestions.push(q.question);
        } else {
          break;
        }
      }
    }
    if (recentQuestions.length >= 30) break;
  }

  const adaptiveContext = buildAdaptivePromptContext(
    weaknessProfile,
    user.skills,
    user.industry,
    recentQuestions,
    assessments.length
  );

  const prompt = `
    Generate 10 random, highly varied, and creative technical interview questions for a ${
      user.industry
    } professional${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    ${adaptiveContext ? `Adaptive parameters:\n${adaptiveContext}\n` : ""}
    
    CRITICAL: Do not use standard or repetitive textbook examples. Ensure high variation in the generated questions.
    Each question should be multiple choice with 4 options.
    For each question, also detect its topic/category from the list: ["javascript", "react", "system design", "algorithms", "databases", "css", "typescript", "nodejs", "python", "devops", "testing"]. Use "other" if none match.
    Also specify the difficulty: "easy", "medium", or "hard".
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string",
          "category": "string",
          "difficulty": "string"
        }
      ]
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return {
      questions: quiz.questions,
      weaknessProfile,
      isPersonalized: assessments.length >= 3
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. Please try again later.");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
    category: q.category || "other",
    difficulty: q.difficulty || "medium",
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nYour Answer: "${q.userAnswer}"`,
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      improvementTip = await getAIResponse(improvementPrompt);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });
    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result. Please try again later.");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments. Please try again later.");
  }
}
