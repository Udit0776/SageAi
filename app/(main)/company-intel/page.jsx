import { getCompanyBattlePlans } from "@/action/company-intel";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import BattlePlanGenerator from "./_components/battle-plan-generator";

export default async function CompanyIntelPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const pastPlans = await getCompanyBattlePlans();

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-title">
          Company Intelligence
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Get AI-powered battle plans for any company interview
        </p>
      </div>
      <BattlePlanGenerator pastPlans={pastPlans} />
    </div>
  );
}
