"use client";

import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  CheckCircle2, AlertTriangle, BookOpen, Calendar,
  ArrowRight, Sparkles, TrendingUp
} from "lucide-react";
import { Progress } from "@/app/components/ui/progress";

export default function SkillGapReportView({ content }) {
  if (!content) return null;

  const getReadinessColor = (score) => {
    if (score >= 70) return "text-green-500 bg-green-500/10";
    if (score >= 40) return "text-yellow-500 bg-yellow-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "important": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Readiness Score & Assessment */}
      <Card className="md:col-span-3 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
               <svg className="w-32 h-32 transform -rotate-90">
                 <circle
                   className="text-muted/20"
                   strokeWidth="8"
                   stroke="currentColor"
                   fill="transparent"
                   r="58"
                   cx="64"
                   cy="64"
                 />
                 <circle
                   className={(content?.readinessScore || 0) >= 70 ? "text-green-500" : (content?.readinessScore || 0) >= 40 ? "text-yellow-500" : "text-red-500"}
                   strokeWidth="8"
                   strokeDasharray={364.4}
                   strokeDashoffset={364.4 - (364.4 * (content?.readinessScore || 0)) / 100}
                   strokeLinecap="round"
                   stroke="currentColor"
                   fill="transparent"
                   r="58"
                   cx="64"
                   cy="64"
                   style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold">{content?.readinessScore || 0}%</span>
                 <span className="text-[10px] uppercase font-bold text-muted-foreground">Match</span>
               </div>
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Assessment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                   "{content?.overallAssessment || "No assessment available."}"
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium">{Array.isArray(content?.matchingSkills) ? content.matchingSkills.length : 0} Matches</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium">{Array.isArray(content?.missingSkills) ? content.missingSkills.length : 0} Gaps</span>
                 </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Skills */}
      <Card className="border-green-500/10 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            Matching Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(content.matchingSkills) && content.matchingSkills.map((item, i) => (
            <div key={i} className="space-y-1.5">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{item?.skill || "Skill"}</span>
                  <span className="text-[10px] font-bold text-green-400">{item?.confidence || 0}%</span>
               </div>
               <Progress value={item?.confidence || 0} className="h-1 bg-green-500/20" color="bg-green-500" />
               {item?.evidence && (
                  <p className="text-[10px] text-muted-foreground leading-tight italic">
                    "{item.evidence}"
                  </p>
               )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card className="border-red-500/10 bg-red-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Missing Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.isArray(content.missingSkills) && content.missingSkills.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-background/50 border border-red-500/10 space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{item?.skill || "Skill"}</span>
                  <Badge className={`text-[9px] h-4 border-none ${getPriorityColor(item?.priority)}`}>
                     {item?.priority || "medium"}
                  </Badge>
               </div>
               {item?.reason && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {item.reason}
                  </p>
               )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning Roadmap */}
      <Card className="md:col-span-3">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            1-Month Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
             {Object.entries(content.roadmap || {}).map(([week, data], i) => (
                <div key={week} className="p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">Week {i + 1}</span>
                      <TrendingUp className="h-4 w-4 text-primary opacity-30" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-sm font-bold leading-tight">{data.focus}</h4>
                   </div>
                   <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">Key Tasks</div>
                      <ul className="space-y-1.5">
                         {(data.tasks || []).map((task, j) => (
                            <li key={j} className="text-xs text-foreground/80 flex items-start gap-2">
                               <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                               {task}
                            </li>
                         ))}
                      </ul>
                   </div>
                   {data.resources?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                         <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Resources
                         </div>
                         <div className="flex flex-wrap gap-1">
                            {data.resources.map((res, j) => (
                               <Badge key={j} variant="outline" className="text-[9px] font-medium py-0 h-4">
                                  {res}
                               </Badge>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
