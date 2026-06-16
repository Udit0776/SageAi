"use client";

import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Building2, Users, Globe, MessageSquare, CheckCircle2,
  Newspaper, IndianRupee, ArrowRight, Lightbulb
} from "lucide-react";

export default function BattlePlanView({ content, companyName }) {
  if (!content) return null;

  const getToneColor = (category) => {
    switch (category) {
      case "behavioral": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "technical": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "culture": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Company Overview */}
      <Card className="md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            About {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.companyOverview?.mission && (
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              {content.companyOverview.mission}
            </p>
          )}
          {Array.isArray(content.companyOverview?.values) && (
            <div className="flex flex-wrap gap-2">
              {content.companyOverview.values.map((v, i) => (
                <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 py-0">
                  {v}
                </Badge>
              ))}
            </div>
          )}
          {content.companyOverview?.culture && (
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{content.companyOverview.culture}</p>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
            {content.companyOverview?.size && (
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {content.companyOverview.size}</span>
            )}
            {content.companyOverview?.headquarters && (
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {content.companyOverview.headquarters}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Process */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRight className="h-5 w-5 text-primary" />
            Interview Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(content.interviewProcess?.rounds) && (
            <div className="space-y-2">
              {content.interviewProcess.rounds.map((round, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm">{round}</span>
                </div>
              ))}
            </div>
          )}
          {content.interviewProcess?.duration && (
            <p className="text-xs text-muted-foreground">⏱️ Expected Duration: {content.interviewProcess.duration}</p>
          )}
          {content.interviewProcess?.tips?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs font-bold text-muted-foreground uppercase">Pro Tips</div>
              {content.interviewProcess.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why You're a Fit */}
      <Card className="border-green-500/10 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Why You're a Fit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content.whyYouFit?.length > 0 ? (
            <ul className="space-y-3">
              {content.whyYouFit.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Upload your resume for personalized fit analysis.</p>
          )}
        </CardContent>
      </Card>

      {/* Common Questions */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-primary" />
            Common Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(content.commonQuestions) && content.commonQuestions.length > 0 ? (
            <div className="space-y-4">
              {content.commonQuestions.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/20 border border-muted/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium flex-1">{q?.question || "Interview Question"}</p>
                    <Badge className={`text-[10px] shrink-0 ${getToneColor(q?.category)}`}>
                      {q?.category || "general"}
                    </Badge>
                  </div>
                  {q?.tip && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-1">
                      <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                      {q.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Recent News & Salary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="h-5 w-5 text-primary" />
            Recent News
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content.recentNews?.length > 0 ? (
            <div className="space-y-3">
              {content.recentNews.map((news, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-medium">{news.title}</p>
                  <p className="text-xs text-muted-foreground">{news.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent news found.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-yellow-500/10 bg-yellow-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <IndianRupee className="h-5 w-5 text-yellow-500" />
            Expected Salary Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content.salaryRange && typeof content.salaryRange === 'object' ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {content.salaryRange.currency === "INR" 
                    ? `₹${((Number(content.salaryRange.min) || 0) / 100000).toFixed(1)}L` 
                    : `$${((Number(content.salaryRange.min) || 0) / 1000).toFixed(0)}K`}
                </span>
                <span className="text-muted-foreground pb-0.5">—</span>
                <span className="text-2xl font-bold text-primary">
                  {content.salaryRange.currency === "INR" 
                    ? `₹${((Number(content.salaryRange.max) || 0) / 100000).toFixed(1)}L` 
                    : `$${((Number(content.salaryRange.max) || 0) / 1000).toFixed(0)}K`}
                </span>
                <span className="text-xs text-muted-foreground pb-1">
                  {content.salaryRange.currency || "INR"}/{content.salaryRange.format || "LPA"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-primary rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Salary data not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
