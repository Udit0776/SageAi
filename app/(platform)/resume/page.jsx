import { getResume } from "@/action/resume";
import ResumeBuilder from "./_components/resume-builder";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function ResumePage() {
  const resume = await getResume();
  const { userId } = await auth();
  
  const userProfile = userId 
    ? await db.user.findUnique({
        where: { clerkUserId: userId },
        include: { industryInsight: true }
      })
    : null;
  
  return (
    <div>
      <ResumeBuilder 
        initialContent={resume?.content} 
        initialAtsResult={resume} 
        userProfile={userProfile} 
      />
    </div>
  );
}