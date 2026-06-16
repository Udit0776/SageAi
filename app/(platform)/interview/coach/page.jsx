import { getInterviewSessions } from "@/action/interview-coach";
import { getUserOnboardingStatus } from "@/action/user";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InterviewSetup from "./_components/interview-setup";

export default async function InterviewCoachPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const pastSessions = await getInterviewSessions();

  return (
    <div className="max-w-6xl mx-auto">
      <InterviewSetup user={user} pastSessions={pastSessions} />
    </div>
  );
}
