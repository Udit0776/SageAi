"use client";

import { 
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown, 
  Award, Target, ThumbsUp, ThumbsDown, ArrowRight,
  ShieldAlert, ClipboardList, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer
} from "recharts";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import Link from "next/link";

export default function SessionReport({ data, results, type, role, onBack }) {
  const [expanded, setExpanded] = useState(false);

  const radarData = [
    { subject: "Clarity", A: 0, fullMark: 10 },
    { subject: "Relevance", A: 0, fullMark: 10 },
    { subject: "Depth", A: 0, fullMark: 10 },
    { subject: "Confidence", A: 0, fullMark: 10 },
    { subject: "Structure", A: 0, fullMark: 10 },
  ];

  // Calculate averages for radar chart
  results.forEach(r => {
    radarData[0].A += r.scores.clarity;
    radarData[1].A += r.scores.relevance;
    radarData[2].A += r.scores.depth;
    radarData[3].A += r.scores.confidence;
    // Estimate structure based on STAR score
    const starCount = Object.values(r.starAnalysis).filter(Boolean).length;
    radarData[4].A += (starCount / 4) * 10;
  });

  radarData.forEach(d => d.A = d.A / results.length);

  const getReadinessColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold gradient-title">Interview Analysis</h1>
            <p className="text-xs text-muted-foreground">Comprehensive feedback for your {type} session.</p>
         </div>
         {onBack ? (
            <Button variant="outline" className="rounded-full px-6" onClick={onBack}>
               Start New Session
               <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
         ) : (
            <Link href="/interview/coach">
               <Button variant="outline" className="rounded-full px-6">
                  Start New Session
                  <ArrowRight className="h-4 w-4 ml-2" />
               </Button>
            </Link>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-1 border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="relative h-48 w-48 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="88"
                    fill="none" stroke="currentColor" strokeWidth="12"
                    className="text-muted-foreground/10"
                  />
                  <circle
                    cx="96" cy="96" r="88"
                    fill="none" stroke="currentColor" strokeWidth="12"
                    strokeDasharray={552}
                    strokeDashoffset={552 - (552 * data.readinessScore) / 100}
                    strokeLinecap="round"
                    className={`${getReadinessColor(data.readinessScore)} transition-all duration-1000 ease-out`}
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl sm:text-3xl font-black ${getReadinessColor(data.readinessScore)}`}>
                    {data.readinessScore}%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Readiness</span>
               </div>
            </div>
            <div className="mt-8 space-y-2">
               <h3 className="text-lg font-bold">
                 {data.readinessScore >= 80 ? "Interview Ready!" : data.readinessScore >= 60 ? "Almost There" : "Needs More Practice"}
               </h3>
               <p className="text-sm text-muted-foreground max-w-[200px]">
                 Based on your {results.length} answers, here's how you compare to industry benchmarks.
               </p>
            </div>
         </Card>

         <Card className="lg:col-span-2 border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="p-6 pb-0">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Radar
               </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px] p-0">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="var(--primary)" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                    <Radar
                      name="Your Score"
                      dataKey="A"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-green-500/10 bg-green-500/5 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
               <ThumbsUp className="h-6 w-6 text-green-500" />
               <CardTitle className="text-green-500">Key Strengths</CardTitle>
            </CardHeader>
            <CardContent>
               <ul className="space-y-2">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs">
                       <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                       <span className="font-medium text-foreground/80">{s}</span>
                    </li>
                  ))}
               </ul>
            </CardContent>
         </Card>

         <Card className="border-red-500/10 bg-red-500/5 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
               <ThumbsDown className="h-6 w-6 text-red-500" />
               <CardTitle className="text-red-500">Weak Areas</CardTitle>
            </CardHeader>
            <CardContent>
               <ul className="space-y-2">
                  {data.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs">
                       <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                       <span className="font-medium text-foreground/80">{w}</span>
                    </li>
                  ))}
               </ul>
            </CardContent>
         </Card>
      </div>

      <Card className="border-red-500/20 bg-red-500/10 shadow-xl overflow-hidden relative">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="h-24 w-24 text-red-500" />
         </div>
         <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
               <ShieldAlert className="h-6 w-6" />
               Rejection Risk Assessment
            </CardTitle>
            <CardDescription className="text-red-500/70">A brutally honest look at why a recruiter might say "no".</CardDescription>
         </CardHeader>
         <CardContent>
            <p className="text-sm font-medium leading-relaxed italic">"{data.rejectionRisk}"</p>
         </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-xl mb-10">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <ClipboardList className="h-6 w-6 text-primary" />
               Personalized Improvement Plan
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {data.improvementPlan.split(/\d\./).filter(Boolean).map((step, i) => (
                   <div key={i} className="bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-primary/10 relative group hover:border-primary/30 transition-colors shadow-sm">
                     <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] shadow-md border border-white/20">
                        {i + 1}
                     </div>
                     <p className="text-xs font-medium leading-relaxed mt-2">{step.trim()}</p>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>

      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl sm:text-2xl font-bold">Answer Breakdown</h3>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-primary h-8">
               {expanded ? "Collapse All" : "Expand All"}
            </Button>
         </div>
         <Accordion type="multiple" className="w-full space-y-4" value={expanded ? results.map((_, i) => `item-${i}`) : undefined}>
            {results.map((r, i) => (
               <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-card/50 overflow-hidden">
                   <AccordionTrigger className="hover:no-underline py-6">
                     <div className="flex items-center gap-4 text-left">
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-black text-white shadow-lg ${r.overallScore >= 8 ? 'bg-green-500' : r.overallScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                           {r.overallScore}
                        </div>
                        <div className="font-bold line-clamp-1">{r.question}</div>
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Your Answer</Label>
                              <p className="text-xs leading-relaxed text-foreground/80">{r.userAnswer}</p>
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-primary">Coach's Feedback</Label>
                              <p className="text-xs leading-relaxed text-primary/80 italic">{r.feedback}</p>
                           </div>
                        </div>
                        <div className="bg-primary/5 rounded-2xl p-6 space-y-4 border border-primary/10">
                           <div className="flex items-center gap-2 font-bold text-primary text-sm">
                              <Award className="h-4 w-4" />
                              Stronger Version
                           </div>
                           <p className="text-xs leading-relaxed">{r.improvedAnswer}</p>
                           <div className="pt-4 border-t border-primary/10">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">STAR Check</Label>
                              <div className="flex gap-2">
                                 {['Situation', 'Task', 'Action', 'Result'].map(key => (
                                    <Badge key={key} variant={r.starAnalysis[key.toLowerCase()] ? "default" : "outline"} className="text-[10px]">
                                       {r.starAnalysis[key.toLowerCase()] ? "✅" : "❌"} {key}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </AccordionContent>
               </AccordionItem>
            ))}
         </Accordion>
      </div>
    </div>
  );
}
