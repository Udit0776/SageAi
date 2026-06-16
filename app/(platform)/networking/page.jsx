import { getUserOnboardingStatus } from "@/action/user";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ReferralForm from "./_components/referral-form";

export default async function NetworkingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <ReferralForm user={user} />
    </div>
  );
}
