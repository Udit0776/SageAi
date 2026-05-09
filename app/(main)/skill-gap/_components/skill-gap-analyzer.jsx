"use client";

import { useState, useEffect } from "react";
import { analyzeSkillGap, deleteSkillGapReport } from "@/action/skill-gap";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, Target, Sparkles, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import SkillGapReportView from "./skill-gap-report";

export default function SkillGapAnalyzer({ pastReports: initialReports }) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState(initialReports || []);
  const [expandedReportId, setExpandedReportId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error("Please enter both a job title and job description.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const promise = analyzeSkillGap(jobTitle.trim(), company.trim() || undefined, jobDescription.trim());
      
      toast.promise(promise, {
        loading: "Analyzing your skill profile...",
        success: "Skill gap analysis complete!",
        error: (err) => err.message || "Failed to analyze skill gap.",
      });

      const newReport = await promise;
      setReports((prev) => [newReport, ...prev]);
      setExpandedReportId(newReport.id);
      setJobTitle("");
      setCompany("");
      setJobDescription("");
    } catch (error) {
      // Handled by toast.promise
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await toast.promise(deleteSkillGapReport(id), {
        loading: "Deleting...",
        success: "Report deleted.",
        error: "Failed to delete.",
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (expandedReportId === id) setExpandedReportId(null);
    } catch (error) {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-8">
      {/* Analyzer Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            New Skill Gap Analysis
          </CardTitle>
          <CardDescription>
            Paste a job description to see how your resume matches and what you need to learn.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Target Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                placeholder="e.g. Meta, Netflix"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Paste the full job description here..."
              className="min-h-[200px] resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobTitle.trim() || !jobDescription.trim()}
              className="w-auto px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Expertise...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze My Skills
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Past Reports */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Your Reports ({reports.length})
          </h3>
          <div className="space-y-4">
            {isAnalyzing && (
              <Card className="border-primary/20 bg-primary/5 animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-primary/10 rounded w-1/3" />
                      <div className="h-3 bg-primary/5 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="mt-4 h-24 bg-primary/5 rounded-lg border border-dashed border-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary font-medium flex items-center gap-2">
                      <Sparkles className="h-3 w-3 animate-bounce" />
                      AI is mapping your career path...
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            {reports.map((report) => (
              <Card
                key={report.id}
                className={`transition-all border ${expandedReportId === report.id ? "border-primary/30 shadow-lg" : "border-border hover:border-primary/20"}`}
              >
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">{report.jobTitle}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {report.company && <span>{report.company}</span>}
                          {report.readinessScore !== null && (
                            <Badge variant="outline" className={`text-[10px] h-4 ${report.readinessScore > 70 ? "text-green-500" : report.readinessScore > 40 ? "text-yellow-500" : "text-red-500"}`}>
                              {report.readinessScore}% Ready
                            </Badge>
                          )}
                          {report.createdAt && !isNaN(new Date(report.createdAt)) && (
                             <span>{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(report.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedReportId === report.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedReportId === report.id && (
                    <div className="border-t p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {(() => {
                        try {
                          if (!report.content || report.content === "undefined") throw new Error("No content");
                          const parsedContent = typeof report.content === "string" ? JSON.parse(report.content) : report.content;
                          return <SkillGapReportView content={parsedContent} />;
                        } catch (err) {
                          return (
                            <div className="text-sm text-destructive p-4 text-center bg-destructive/5 rounded-lg border border-destructive/10">
                              <p className="font-bold mb-1">Data Display Error</p>
                              <p className="text-[10px] opacity-70">The AI response for this report was malformed. Please try deleting and re-analyzing.</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
