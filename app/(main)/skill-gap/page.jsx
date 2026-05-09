import { getSkillGapReports } from "@/action/skill-gap";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import SkillGapAnalyzer from "./_components/skill-gap-analyzer";

export default async function SkillGapPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const pastReports = await getSkillGapReports();

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-xl sm:text-2xl md:text-2xl sm:text-xl sm:text-2xl font-bold gradient-title">
          Skill Gap Analysis
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Compare your skills against any job description and get a personalized learning roadmap
        </p>
      </div>
      <SkillGapAnalyzer pastReports={pastReports} />
    </div>
  );
}
