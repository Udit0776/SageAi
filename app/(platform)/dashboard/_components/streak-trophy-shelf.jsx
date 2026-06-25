"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  Award, Flame, Trophy, Lock, CheckCircle2, 
  FileText, GraduationCap, Briefcase
} from 'lucide-react';

export default function StreakTrophyShelf({ streak }) {
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const earnedBadgesList = streak?.earnedBadges || [];

  const badges = [
    {
      id: 'first_interview',
      name: 'First Contact',
      description: 'Completed your first mock interview prep session',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500 text-blue-400 border-blue-500/30 shadow-blue-500/10',
    },
    {
      id: 'resume_pro',
      name: 'Resume Pro',
      description: 'Achieved an ATS score of 80% or higher on your resume',
      icon: FileText,
      color: 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    },
    {
      id: 'streak_7',
      name: 'Consistency King',
      description: 'Maintained a 7-day platform engagement streak',
      icon: Flame,
      color: 'from-orange-500 to-amber-500 text-orange-400 border-orange-500/30 shadow-orange-500/10',
    },
    {
      id: 'apps_10',
      name: 'Market Hunter',
      description: 'Added 10 or more job applications to your Kanban board',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500 text-purple-400 border-purple-500/30 shadow-purple-500/10',
    },
    {
      id: 'offer_received',
      name: 'Deal Secured',
      description: 'Moved a job application to the OFFERED stage',
      icon: Award,
      color: 'from-yellow-500 to-amber-500 text-yellow-400 border-yellow-500/30 shadow-yellow-500/10',
    },
    {
      id: 'negotiation_master',
      name: 'Negotiation Master',
      description: 'Scored 85% or higher in the salary negotiation simulator',
      icon: Trophy,
      color: 'from-rose-500 to-red-500 text-rose-400 border-rose-500/30 shadow-rose-500/10',
    },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-yellow-500" />
            Trophy Shelf & Streaks
          </CardTitle>
          <CardDescription className="text-[10px]">Your consecutive engagement milestones</CardDescription>
        </div>
        
        {/* Streak Indicator */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-3 py-1 rounded-xl">
          <div className="flex items-center gap-1">
            <Flame className={`h-4.5 w-4.5 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-zinc-650'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white leading-none">{currentStreak} Days</span>
              <span className="text-[7px] text-zinc-400 uppercase tracking-wider">Current Streak</span>
            </div>
          </div>
          <div className="h-5 w-px bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white leading-none">{longestStreak} Days</span>
            <span className="text-[7px] text-zinc-400 uppercase tracking-wider">Record Streak</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 space-y-4">
        {/* Badges Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5 pt-1">
          {badges.map((badge, idx) => {
            const isEarned = earnedBadgesList.includes(badge.id);
            const BadgeIcon = badge.icon;
            
            const tooltipAlignClass = 
              idx === 0 
                ? "left-0 translate-x-0" 
                : idx === badges.length - 1 
                  ? "right-0 left-auto translate-x-0" 
                  : "left-1/2 -translate-x-1/2";
            
            return (
              <div 
                key={badge.id} 
                className="flex flex-col items-center justify-center text-center group cursor-help select-none relative"
              >
                {/* Outer circular badge frame */}
                <div className={`h-11 w-11 rounded-full flex items-center justify-center border relative transition-all duration-300 ${
                  isEarned 
                    ? `bg-gradient-to-br ${badge.color} border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.05)] scale-100 hover:scale-105` 
                    : 'bg-[#18181b]/30 border-white/5 text-zinc-500 scale-95 opacity-55'
                }`}>
                  <BadgeIcon className={`h-5 w-5 ${isEarned ? 'text-white' : 'text-zinc-500'}`} />
                  
                  {/* Status overlays */}
                  {isEarned ? (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-black shadow">
                      <CheckCircle2 className="h-2 w-2 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#18181b] border border-white/5 rounded-full p-0.5 shadow">
                      <Lock className="h-2 w-2 text-zinc-500" />
                    </div>
                  )}
                </div>
                
                <span className="text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors truncate w-full mt-2">
                  {badge.name}
                </span>

                {/* CSS/Tailwind Hover Tooltip Overlay */}
                <div className={`absolute bottom-full mb-2.5 ${tooltipAlignClass} w-48 p-2.5 rounded-xl bg-[#09090b] border border-white/10 text-[10px] text-zinc-350 font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-2xl flex flex-col gap-1 text-left`}>
                  <p className="font-bold text-white flex items-center gap-1.5 uppercase text-[8px] tracking-wider">
                    {badge.name}
                    <span className={`text-[7px] font-bold px-1 rounded-sm ${
                      isEarned 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/10' 
                        : 'bg-zinc-500/10 text-zinc-400 border border-white/5'
                    }`}>
                      {isEarned ? 'Unlocked' : 'Locked'}
                    </span>
                  </p>
                  <p className="text-[9.5px] leading-relaxed text-zinc-400">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
