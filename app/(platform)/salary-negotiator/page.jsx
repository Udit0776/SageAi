import { getUserOnboardingStatus } from "@/action/user";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NegotiatorClient from "./_components/negotiator-client";

export default async function SalaryNegotiatorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return (
    <NegotiatorClient user={user} />
  );
}
