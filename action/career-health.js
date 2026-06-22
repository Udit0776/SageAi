"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAIResponse } from "@/lib/gemini";
import { subDays } from "date-fns";
import { inngest } from "@/lib/inngest/client";
import { computeLinearRegression, generateTrendInsight } from "@/lib/trend-analysis";

// Helper to compute linear regression on user's last 12 scores and append trend metadata
async function appendTrendMetrics(userId, baseScoreRecord) {
  const history = await db.careerHealthScore.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  let finalHistory = [...history];
  if (baseScoreRecord && !finalHistory.some(h => h.id === baseScoreRecord.id)) {
    finalHistory.unshift(baseScoreRecord);
  }

  // Sort oldest first (chronological)
  finalHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const dataPoints = finalHistory.map(h => ({
    timestamp: h.createdAt,
    score: h.atsScoreWeight || 0
  }));

  const regressionResult = computeLinearRegression(dataPoints);
  const currentScore = baseScoreRecord ? baseScoreRecord.atsScoreWeight : (dataPoints[dataPoints.length - 1]?.score || 0);
  const resumeTrendInsight = generateTrendInsight(regressionResult, currentScore, dataPoints);

  // Return a clean plain object with trend analysis fields
  const plainObject = JSON.parse(JSON.stringify(baseScoreRecord || {}));
  
  return {
    ...plainObject,
    resumeTrend: regressionResult.trend,
    resumeTrendInsight,
    resumeRSquared: regressionResult.rSquared,
    atsScoreHistory: dataPoints.slice(-8).map(d => d.score)
  };
}

export async function calculateBaselineHealthScore(clerkUserId) {
  const user = await db.user.findUnique({
    where: { clerkUserId },
    include: {
      resume: true,
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      skillGapReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // 1. ATS Score Weight (25%)
  const atsScore = user.resume?.atsScore || 0;

  // 2. Interview Readiness Weight (25%)
  let interviewScore = 0;
  if (user.interviewSessions && user.interviewSessions.length > 0) {
    const validScores = user.interviewSessions.map(s => s.readinessScore || s.overallScore || 0);
    const sum = validScores.reduce((acc, val) => acc + val, 0);
    interviewScore = sum / user.interviewSessions.length;
  }

  // 3. Skill Gap Coverage Weight (25%)
  let skillGapScore = 0;
  if (user.industryInsight && user.industryInsight.recommendedSkills?.length > 0) {
    const recommended = user.industryInsight.recommendedSkills;
    const userSkillsSet = new Set(user.skills.map(s => s.toLowerCase().trim()));
    const matching = recommended.filter(s => userSkillsSet.has(s.toLowerCase().trim())).length;
    skillGapScore = (matching / recommended.length) * 100;
  } else if (user.skillGapReports && user.skillGapReports.length > 0) {
    skillGapScore = user.skillGapReports[0].readinessScore || 50;
  } else {
    skillGapScore = user.skills.length > 0 ? Math.min(user.skills.length * 10, 100) : 0;
  }

  // 4. Kanban Pipeline Activity Weight (25%)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const activeApplicationsCount = await db.jobApplication.count({
    where: {
      userId: user.id,
      updatedAt: { gte: thirtyDaysAgo },
    },
  });
  const kanbanScore = Math.min(activeApplicationsCount * 10, 100);

  // Calculate Overall Composite Score
  const overallScore = Math.round(
    (atsScore * 0.25) +
    (interviewScore * 0.25) +
    (skillGapScore * 0.25) +
    (kanbanScore * 0.25)
  );

  const commentary = "Analyzing your profile and generating personalized AI insights...";

  const savedScore = await db.careerHealthScore.create({
    data: {
      userId: user.id,
      score: overallScore,
      atsScoreWeight: atsScore,
      readinessWeight: interviewScore,
      skillGapWeight: skillGapScore,
      kanbanWeight: kanbanScore,
      commentary,
    },
  });

  return await appendTrendMetrics(user.id, savedScore);
}

export async function calculateCareerHealthScore(explicitClerkUserId = null) {
  let targetClerkUserId = explicitClerkUserId;
  if (!targetClerkUserId) {
    const { userId } = await auth();
    targetClerkUserId = userId;
  }
  if (!targetClerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: targetClerkUserId },
    include: {
      resume: true,
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      skillGapReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // 1. ATS Score Weight (25%)
  const atsScore = user.resume?.atsScore || 0;

  // 2. Interview Readiness Weight (25%)
  let interviewScore = 0;
  if (user.interviewSessions && user.interviewSessions.length > 0) {
    const validScores = user.interviewSessions.map(s => s.readinessScore || s.overallScore || 0);
    const sum = validScores.reduce((acc, val) => acc + val, 0);
    interviewScore = sum / user.interviewSessions.length;
  }

  // 3. Skill Gap Coverage Weight (25%)
  let skillGapScore = 0;
  if (user.industryInsight && user.industryInsight.recommendedSkills?.length > 0) {
    const recommended = user.industryInsight.recommendedSkills;
    const userSkillsSet = new Set(user.skills.map(s => s.toLowerCase().trim()));
    const matching = recommended.filter(s => userSkillsSet.has(s.toLowerCase().trim())).length;
    skillGapScore = (matching / recommended.length) * 100;
  } else if (user.skillGapReports && user.skillGapReports.length > 0) {
    skillGapScore = user.skillGapReports[0].readinessScore || 50;
  } else {
    skillGapScore = user.skills.length > 0 ? Math.min(user.skills.length * 10, 100) : 0;
  }

  // 4. Kanban Pipeline Activity Weight (25%)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const activeApplicationsCount = await db.jobApplication.count({
    where: {
      userId: user.id,
      updatedAt: { gte: thirtyDaysAgo },
    },
  });
  const kanbanScore = Math.min(activeApplicationsCount * 10, 100);

  // Calculate Overall Composite Score
  const overallScore = Math.round(
    (atsScore * 0.25) +
    (interviewScore * 0.25) +
    (skillGapScore * 0.25) +
    (kanbanScore * 0.25)
  );

  // Call Gemini for dynamic, one-line drag analysis commentary
  const prompt = `
    You are an elite career strategist. Analyze the following candidate stats and output a single, highly actionable, concise commentary sentence (max 120 characters) explaining the primary factor dragging down the score and the exact next step.
    
    Overall Career Health Score: ${overallScore}/100
    Sub-scores:
    - Resume ATS Score: ${atsScore.toFixed(0)}/100 (25% weight)
    - Interview Readiness: ${interviewScore.toFixed(0)}/100 (25% weight)
    - Skill Gap Coverage: ${skillGapScore.toFixed(0)}/100 (25% weight)
    - Kanban Activity: ${kanbanScore.toFixed(0)}/100 (25% weight)
    
    Industry: ${user.industry || "general"}
    Experience: ${user.experience || 0} years
 
    Rules:
    - Focus on the single lowest sub-score.
    - Keep it under 120 characters.
    - Be supportive but direct and action-oriented.
    - Do not use markdown bold/italic tags.
  `;

  let commentary = "Build your profile, upload a resume, or complete mock interviews to generate insights.";
  try {
    const aiResponse = await getAIResponse(prompt);
    commentary = aiResponse.trim().replace(/["']/g, "");
  } catch (error) {
    console.error("Failed to generate AI commentary for health score:", error);
  }

  // Check if a placeholder was created recently (within the last 1 minute)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const latestPlaceholder = await db.careerHealthScore.findFirst({
    where: {
      userId: user.id,
      createdAt: { gte: oneMinuteAgo },
      commentary: "Analyzing your profile and generating personalized AI insights..."
    },
    orderBy: { createdAt: "desc" }
  });

  let savedScore;
  if (latestPlaceholder) {
    savedScore = await db.careerHealthScore.update({
      where: { id: latestPlaceholder.id },
      data: {
        score: overallScore,
        atsScoreWeight: atsScore,
        readinessWeight: interviewScore,
        skillGapWeight: skillGapScore,
        kanbanWeight: kanbanScore,
        commentary,
      }
    });
  } else {
    savedScore = await db.careerHealthScore.create({
      data: {
        userId: user.id,
        score: overallScore,
        atsScoreWeight: atsScore,
        readinessWeight: interviewScore,
        skillGapWeight: skillGapScore,
        kanbanWeight: kanbanScore,
        commentary,
      },
    });
  }

  return await appendTrendMetrics(user.id, savedScore);
}

export async function getCareerHealthHistory() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const scores = await db.careerHealthScore.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 10, // Fetch last 10 records for trend line charts
  });

  return scores;
}

export async function getLatestCareerHealthScore() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: { select: { updatedAt: true } },
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true }
      },
      jobApplications: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true }
      },
      skillGapReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true }
      }
    }
  });

  if (!user) throw new Error("User not found");

  // Fetch the absolute latest score
  let latest = await db.careerHealthScore.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // If none exists, calculate baseline on the fly and trigger AI commentary recalculation in background
  if (!latest) {
    console.log("[CareerHealth] No score exists. Generating baseline score...");
    const baseline = await calculateBaselineHealthScore(userId);
    inngest.send({
      name: "app/career-health.recalculate",
      data: { userId }
    }).catch(err => console.error("Failed to send Inngest event for career health:", err));
    return baseline;
  }

  // Check if any user activity is newer than the saved health score
  const latestResumeTime = user.resume?.updatedAt ? new Date(user.resume.updatedAt) : new Date(0);
  const latestInterviewTime = user.interviewSessions?.[0]?.createdAt ? new Date(user.interviewSessions[0].createdAt) : new Date(0);
  const latestJobAppTime = user.jobApplications?.[0]?.updatedAt ? new Date(user.jobApplications[0].updatedAt) : new Date(0);
  const latestSkillGapTime = user.skillGapReports?.[0]?.createdAt ? new Date(user.skillGapReports[0].createdAt) : new Date(0);

  const latestScoreTime = new Date(latest.createdAt);

  const isOutdated = 
    latestResumeTime > latestScoreTime ||
    latestInterviewTime > latestScoreTime ||
    latestJobAppTime > latestScoreTime ||
    latestSkillGapTime > latestScoreTime;

  if (isOutdated) {
    console.log("[CareerHealth] Cached score is outdated. Dispatching background Inngest event for recalculation...");
    inngest.send({
      name: "app/career-health.recalculate",
      data: { userId }
    }).catch(err => console.error("Failed to send Inngest event for career health:", err));
  }

  return await appendTrendMetrics(user.id, latest);
}
