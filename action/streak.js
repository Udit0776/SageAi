"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, differenceInCalendarDays } from "date-fns";

export async function getUserStreak() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { streak: true },
  });

  if (!user) throw new Error("User not found");

  // If no streak object exists yet, return a default one
  if (!user.streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      earnedBadges: [],
    };
  }

  return user.streak;
}

export async function checkAndAwardBadges(userDbId) {
  const user = await db.user.findUnique({
    where: { id: userDbId },
    include: {
      streak: true,
      resume: true,
      _count: {
        select: {
          interviewSessions: true,
          jobApplications: true,
          negotiationSessions: true,
        },
      },
      jobApplications: {
        where: { status: "OFFERED" },
        take: 1,
      },
      negotiationSessions: {
        where: { score: { gte: 85 } },
        take: 1,
      },
    },
  });

  if (!user) return [];

  const earnedBadges = new Set(user.streak?.earnedBadges || []);
  let updated = false;

  // 1. First Interview
  if (user._count.interviewSessions >= 1 && !earnedBadges.has("first_interview")) {
    earnedBadges.add("first_interview");
    updated = true;
  }

  // 2. Resume Pro
  if (user.resume && user.resume.atsScore >= 80 && !earnedBadges.has("resume_pro")) {
    earnedBadges.add("resume_pro");
    updated = true;
  }

  // 3. 7-Day Streak
  if (user.streak && user.streak.longestStreak >= 7 && !earnedBadges.has("streak_7")) {
    earnedBadges.add("streak_7");
    updated = true;
  }

  // 4. 10 Applications
  if (user._count.jobApplications >= 10 && !earnedBadges.has("apps_10")) {
    earnedBadges.add("apps_10");
    updated = true;
  }

  // 5. Offer Received
  if (user.jobApplications.length >= 1 && !earnedBadges.has("offer_received")) {
    earnedBadges.add("offer_received");
    updated = true;
  }

  // 6. Negotiation Master
  if (user.negotiationSessions.length >= 1 && !earnedBadges.has("negotiation_master")) {
    earnedBadges.add("negotiation_master");
    updated = true;
  }

  if (updated && user.streak) {
    await db.userStreak.update({
      where: { id: user.streak.id },
      data: {
        earnedBadges: Array.from(earnedBadges),
      },
    });
  }

  return Array.from(earnedBadges);
}

export async function registerUserActivity() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { streak: true },
  });

  if (!user) return { success: false, error: "User not found" };

  const now = new Date();
  const todayStart = startOfDay(now);

  try {
    if (!user.streak) {
      // First activity record ever
      const newStreak = await db.userStreak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: now,
          earnedBadges: [],
        },
      });
      
      await checkAndAwardBadges(user.id);
      return { success: true, streak: newStreak };
    }

    const lastActivityStart = startOfDay(user.streak.lastActivityDate);
    const dayDifference = differenceInCalendarDays(todayStart, lastActivityStart);

    let updatedStreak;

    if (dayDifference === 0) {
      // Already registered activity today, do not increment but check badges just in case
      updatedStreak = user.streak;
    } else if (dayDifference === 1) {
      // Active yesterday, increment streak
      const newCurrent = user.streak.currentStreak + 1;
      const newLongest = Math.max(user.streak.longestStreak, newCurrent);

      updatedStreak = await db.userStreak.update({
        where: { id: user.streak.id },
        data: {
          currentStreak: newCurrent,
          longestStreak: newLongest,
          lastActivityDate: now,
        },
      });
    } else {
      // Broke streak, reset to 1
      updatedStreak = await db.userStreak.update({
        where: { id: user.streak.id },
        data: {
          currentStreak: 1,
          lastActivityDate: now,
        },
      });
    }

    const badges = await checkAndAwardBadges(user.id);
    return { success: true, streak: { ...updatedStreak, earnedBadges: badges } };
  } catch (error) {
    console.error("Error registering user activity:", error);
    return { success: false, error: error.message };
  }
}
