"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { 
  FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { generateFunnelCommentary } from "@/action/dashboard";
import { Filter, Sparkles, Loader2, Info } from "lucide-react";

export default function ApplicationFunnel({ applications }) {
  const [commentary, setCommentary] = useState("");
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  const totalApps = applications?.length || 0;
  
  // Count how many reached each stage
  const appliedCount = totalApps;
  const interviewingCount = applications?.filter(app => 
    app.status === "INTERVIEWING" || app.status === "OFFERED"
  ).length || 0;
  const offeredCount = applications?.filter(app => 
    app.status === "OFFERED"
  ).length || 0;

  useEffect(() => {
    if (totalApps === 0) {
      setCommentary("No applications tracked yet. Start logging job applications to unlock funnel analysis.");
      return;
    }

    setIsLoadingCommentary(true);
    generateFunnelCommentary({
      applied: appliedCount,
      interviewing: interviewingCount,
      offered: offeredCount
    })
      .then(res => setCommentary(res))
      .catch(() => setCommentary("Failed to retrieve AI feedback. Please try again later."))
      .finally(() => setIsLoadingCommentary(false));
  }, [applications, totalApps, appliedCount, interviewingCount, offeredCount]);

  const data = [
    { value: appliedCount, name: "Applied", fill: "#3b82f6" },
    { value: interviewingCount, name: "Interviewing", fill: "#eab308" },
    { value: offeredCount, name: "Offered", fill: "#22c55e" },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, fill } = payload[0].payload;
      const pctOfApplied = totalApps > 0 ? ((value / totalApps) * 100).toFixed(0) : 0;
      return (
        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl p-3 shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: fill }} />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{name}</p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {value} {value === 1 ? 'Application' : 'Applications'} ({pctOfApplied}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-primary" />
          Application Funnel Analytics
        </CardTitle>
        <CardDescription className="text-[10px]">Your conversion pipeline from Applied to Offered</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between gap-4">
        {totalApps > 0 ? (
          <>
            {/* Recharts Funnel Chart */}
            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                  <Funnel
                    dataKey="value"
                    data={data}
                    isAnimationActive
                  >
                    <LabelList 
                      position="right" 
                      fill="var(--muted-foreground)" 
                      stroke="none" 
                      dataKey="name" 
                      fontSize={10} 
                      fontWeight={600}
                    />
                    <LabelList 
                      position="inside" 
                      fill="var(--primary-foreground)" 
                      stroke="none" 
                      dataKey="value" 
                      fontSize={11} 
                      fontWeight={800}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Funnel Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-muted/30 border border-border rounded-xl p-2.5">
              <div className="flex flex-col">
                <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Applied</span>
                <span className="text-sm font-black text-blue-500 mt-0.5">{appliedCount}</span>
              </div>
              <div className="flex flex-col border-x border-border">
                <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Interviewing</span>
                <span className="text-sm font-black text-yellow-500 mt-0.5">
                  {interviewingCount} <span className="text-[9px] font-bold text-muted-foreground/80">({totalApps > 0 ? ((interviewingCount / totalApps) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Offered</span>
                <span className="text-sm font-black text-green-500 mt-0.5">
                  {offeredCount} <span className="text-[9px] font-bold text-muted-foreground/80">({totalApps > 0 ? ((offeredCount / totalApps) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
            </div>

            {/* AI diagnostic commentary */}
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 flex gap-2.5 items-start">
              {isLoadingCommentary ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-black tracking-tight text-foreground uppercase">
                  Funnel Leak Analysis
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                  {isLoadingCommentary ? "Analyzing drop-off leak points..." : commentary}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 py-12 flex-1">
            <Info className="h-9 w-9 text-muted-foreground/30 mb-3" />
            <p className="text-xs font-bold text-foreground mb-1">No Applications Logged</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Add job applications in the AI Job Tracker Kanban board to display conversion analytics.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
