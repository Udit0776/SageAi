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

  // Group skills: Present, Critical, Important, Nice-to-have
  const presentSkills = Array.isArray(content.presentSkills) 
    ? content.presentSkills 
    : (Array.isArray(content.matchingSkills) ? content.matchingSkills.map(m => typeof m === "string" ? m : m.skill) : []);

  const missingSkills = Array.isArray(content.missingSkills) ? content.missingSkills : [];
  
  const criticalSkills = missingSkills.filter(m => m.priority === "critical").map(m => m.skill);
  const importantSkills = missingSkills.filter(m => m.priority === "important").map(m => m.skill);
  const niceToHaveSkills = missingSkills.filter(m => m.priority === "nice-to-have").map(m => m.skill);

  // Group missing skills by category
  let missingByCategory = content.missingByCategory;
  if (!missingByCategory || Object.keys(missingByCategory).length === 0) {
    missingByCategory = {};
    missingSkills.forEach(item => {
      const cat = item.category || "other";
      if (!missingByCategory[cat]) missingByCategory[cat] = [];
      missingByCategory[cat].push(item.skill);
    });
  }

  const getReadinessColor = (score) => {
    if (score >= 70) return "text-green-500 bg-green-500/10";
    if (score >= 40) return "text-yellow-500 bg-yellow-500/10";
    return "text-red-500 bg-red-500/10";
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
                    <span className="text-xs font-medium">{presentSkills.length} Present Skills</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium">{missingSkills.length} Skill Gaps</span>
                 </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Skills Overview */}
      <Card className="md:col-span-1 border-primary/10 bg-background/50">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-300">
            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            Skills Groupings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Present Skills */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>Present ✓</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/10">{presentSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presentSkills.length > 0 ? presentSkills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-300 border-emerald-500/15 py-0.5">
                  {s}
                </Badge>
              )) : <span className="text-xs text-zinc-500">None detected</span>}
            </div>
          </div>

          {/* Critical Missing Skills */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <span>Missing (Critical) ✗</span>
              <span className="text-[9px] bg-rose-500/10 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/10">{criticalSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {criticalSkills.length > 0 ? criticalSkills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-rose-500/5 text-rose-300 border-rose-500/15 py-0.5">
                  {s}
                </Badge>
              )) : <span className="text-xs text-zinc-500">None critical missing</span>}
            </div>
          </div>

          {/* Important Missing Skills */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>Missing (Important) !</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/10">{importantSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {importantSkills.length > 0 ? importantSkills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/5 text-amber-300 border-amber-500/15 py-0.5">
                  {s}
                </Badge>
              )) : <span className="text-xs text-zinc-500">None important missing</span>}
            </div>
          </div>

          {/* Nice to Have Missing Skills */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <span>Nice-to-Have</span>
              <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-full border border-zinc-700">{niceToHaveSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {niceToHaveSkills.length > 0 ? niceToHaveSkills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700 py-0.5">
                  {s}
                </Badge>
              )) : <span className="text-xs text-zinc-500">None missing</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Skills Grouped by Category */}
      <Card className="md:col-span-2 border-primary/10 bg-background/50">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-300">
            <AlertTriangle className="h-5 w-5 text-indigo-400" />
            Missing Skills by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {Object.entries(missingByCategory).length > 0 ? (
            Object.entries(missingByCategory).map(([category, skills], i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-800/20 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-xs font-bold capitalize text-zinc-300">{category}</span>
                  <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/10 py-0 h-4">
                    {skills.length} missing
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, j) => (
                    <Badge key={j} variant="outline" className="text-[10px] bg-rose-500/5 text-rose-300 border-rose-500/10 py-0.5">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-emerald-400">Zero Skill Gaps!</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">You possess all canonical skills required for this job.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Roadmap */}
      <Card className="md:col-span-3">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            AI-Generated Learning Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
             {Object.entries(content.roadmap || {}).map(([week, data], i) => (
                <div key={week} className="p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-primary font-bold">Week {i + 1}</span>
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
