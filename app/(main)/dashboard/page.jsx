import React from 'react';
import { getIndustryInsights } from '@/action/dashboard';
import { getUserOnboardingStatus } from '@/action/user';
import { redirect } from 'next/navigation';
import DashboardView from './_components/dashboard-view';

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
