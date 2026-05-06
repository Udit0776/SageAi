import React from "react";
import { getPortfolio } from "@/action/portfolio";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import PortfolioBuilder from "./_components/portfolio-builder";

export default async function PortfolioPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const initialPortfolio = await getPortfolio();

  return (
    <div className="container mx-auto py-6 px-4 md:px-0">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-2xl md:text-4xl font-bold gradient-title tracking-tighter">
          AI Portfolio Builder
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Turn your resume into a stunning, shareable personal website in one click.
        </p>
      </div>

      <PortfolioBuilder initialPortfolio={initialPortfolio} />
    </div>
  );
}
