import React from 'react';
import { getIndustryInsights } from '@/action/dashboard';
import { getUserOnboardingStatus } from '@/action/user';
import { getInterviewSessions } from '@/action/interview-coach';
import { getSkillGapReports } from '@/action/skill-gap';
import { getJobApplications } from '@/action/job-tracker';
import { getLatestCareerHealthScore, getCareerHealthHistory } from '@/action/career-health';
import { getUserStreak } from '@/action/streak';
import { redirect } from 'next/navigation';
import DashboardView from './_components/dashboard-view';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true, portfolio: true }
  });

  const insights = await getIndustryInsights();
  const interviewSessions = await getInterviewSessions();
  const skillGapReports = await getSkillGapReports();
  const jobApplications = await getJobApplications();
  const latestHealthScore = await getLatestCareerHealthScore();
  const healthHistory = await getCareerHealthHistory();
  const streak = await getUserStreak();

  const stats = {
    hasResume: !!user?.resume,
    hasPortfolio: !!user?.portfolio?.isPublished,
    interviewCount: interviewSessions.length,
    skillGapCount: skillGapReports.length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardView 
        insights={insights} 
        interviewSessions={interviewSessions} 
        jobApplications={jobApplications}
        stats={stats}
        latestHealthScore={latestHealthScore}
        healthHistory={healthHistory}
        streak={streak}
      />
    </div>
  );
}
