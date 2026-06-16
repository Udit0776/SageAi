"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Trophy, CheckCircle2, Circle, Star, Sparkles } from "lucide-react";

export default function ReadinessScore({ stats }) {
  const requirements = [
    { label: "Resume Built", status: stats.hasResume },
    { label: "Portfolio Published", status: stats.hasPortfolio },
    { label: "Interview Practiced", status: stats.interviewCount > 0 },
    { label: "Skill Gap Analyzed", status: stats.skillGapCount > 0 },
  ];

  const completedCount = requirements.filter((r) => r.status).length;
  const score = (completedCount / requirements.length) * 100;

  return (
    <Card className="group/card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Upload Progress
          </CardTitle>
          <Badge score={score} />
        </div>
        <CardDescription className="text-[10px]">Your progress towards becoming hire-ready.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span>Overall Progress</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className="h-1.5 bg-primary/10" />
          </div>

          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit text-[9px] h-4 px-1.5 group-hover/card:hidden border-primary/20 text-primary/70">
               +{requirements.length} Milestones
            </Badge>

            <div className="hidden group-hover/card:grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    {req.status ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                    )}
                    <span className={`text-xs ${req.status ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {req.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


        {score === 100 && (
          <div className="hidden group-hover/card:flex pt-2 mt-2 border-t border-primary/10 items-center gap-2 text-[10px] text-primary font-bold animate-pulse">
            <Sparkles className="h-3 w-3" />
            Platform Milestones Completed!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Badge({ score }) {
  const getLevel = () => {
    if (score === 100) return { label: "COMPLETE", color: "bg-primary text-primary-foreground" };
    if (score >= 50) return { label: "MID", color: "bg-blue-500/10 text-blue-500" };
    return { label: "BEGINNER", color: "bg-muted text-muted-foreground" };
  };

  const level = getLevel();

  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${level.color}`}>
      {level.label}
    </span>
  );
}
