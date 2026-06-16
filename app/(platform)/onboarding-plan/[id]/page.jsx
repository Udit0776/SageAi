"use client";

import React, { useState, useEffect, use } from 'react';
import { getOnboardingPlanById, toggleMilestone } from "@/action/onboarding-plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { 
  CheckCircle, ArrowLeft, Loader2, Sparkles, 
  BookOpen, Rocket, Award, ShieldCheck, HeartHandshake
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function OnboardingPlanPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const planId = params.id;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        const data = await getOnboardingPlanById(planId);
        setPlan(data);
      } catch (err) {
        toast.error("Failed to load onboarding plan.");
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [planId]);

  const handleToggle = async (phaseName, milestoneId, currentStatus) => {
    setTogglingId(milestoneId);
    try {
      const updatedPlan = await toggleMilestone(planId, phaseName, milestoneId, !currentStatus);
      setPlan(updatedPlan);
      toast.success(currentStatus ? "Milestone unmarked" : "Milestone completed! Keep it up! 🎉");
    } catch (err) {
      toast.error("Failed to update milestone.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Retrieving your 30-60-90 Day Onboarding Plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldCheck className="h-12 w-12 text-rose-500/50" />
        <h2 className="text-lg font-bold text-white">Plan Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          This onboarding plan could not be found or you do not have permission to view it.
        </p>
        <Link href="/job-tracker">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Job Tracker
          </Button>
        </Link>
      </div>
    );
  }

  const phases = plan.phases || [];
  
  // Calculate Progress Stats
  let totalMilestones = 0;
  let completedMilestones = 0;
  
  phases.forEach(p => {
    p.milestones.forEach(m => {
      totalMilestones++;
      if (m.isCompleted) completedMilestones++;
    });
  });

  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const getPhaseIcon = (phase) => {
    switch (phase.toLowerCase()) {
      case 'learn':
        return BookOpen;
      case 'contribute':
        return Rocket;
      case 'lead':
        return Award;
      default:
        return HeartHandshake;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-6xl space-y-8 select-none">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/job-tracker">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white cursor-pointer -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Tracker
          </Button>
        </Link>
        <Badge variant="outline" className="border-green-500/20 bg-green-500/5 text-green-500 text-[10px] py-1 px-3">
          Onboarding Mode Active
        </Badge>
      </div>

      {/* Main Title card */}
      <div className="bg-card/30 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            30-60-90 Day Success Blueprint
          </h1>
          <p className="text-sm text-zinc-400">
            Structured roadmap for your role as <span className="text-indigo-400 font-bold">{plan.role}</span> at <span className="text-white font-bold">{plan.company}</span>.
          </p>
        </div>

        {/* Global Progress bar widget */}
        <div className="w-full md:w-64 bg-white/[0.02] border border-white/5 p-4 rounded-2xl relative z-10">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Overall Onboarding</span>
            <span className="text-white">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-primary/10" />
          <p className="text-[9px] text-muted-foreground mt-2 text-right">
            {completedMilestones} of {totalMilestones} Milestones Completed
          </p>
        </div>
      </div>

      {/* 3 Columns for 30, 60, 90 days */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {phases.map((p, idx) => {
          const PhaseIcon = getPhaseIcon(p.phase);
          const totalInPhase = p.milestones.length;
          const completedInPhase = p.milestones.filter(m => m.isCompleted).length;
          const phaseProgress = totalInPhase > 0 ? Math.round((completedInPhase / totalInPhase) * 100) : 0;
          
          return (
            <Card key={idx} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 shrink-0">
                      <PhaseIcon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        Phase {idx + 1}: {p.phase}
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        Days {idx === 0 ? "1–30" : idx === 1 ? "31–60" : "61–90"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {completedInPhase}/{totalInPhase}
                  </Badge>
                </div>
                {/* Phase progress line */}
                <Progress value={phaseProgress} className="h-1 bg-primary/10 mt-4" />
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {p.milestones.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleToggle(p.phase, m.id, m.isCompleted)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      m.isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/10' 
                        : 'bg-[#18181b]/20 border-white/5 text-zinc-300 hover:bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    {/* Tick Checkbox */}
                    <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                      m.isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-zinc-650 hover:border-primary'
                    }`}>
                      {togglingId === m.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-inherit" />
                      ) : m.isCompleted ? (
                        <CheckCircle className="h-3 w-3 stroke-[3]" />
                      ) : null}
                    </div>

                    <span className={`text-xs font-medium leading-relaxed ${m.isCompleted ? 'line-through opacity-60 text-zinc-400' : ''}`}>
                      {m.text}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion congratulations block */}
      {overallProgress === 100 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl font-bold animate-bounce">
            🏆
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              Onboarding Blueprint Completed!
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Fantastic work! You have successfully completed all milestones for your onboarding roadmap. You are fully positioned to dominate your new role at {plan.company}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
