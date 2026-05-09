"use client";

import { useState, useEffect } from "react";
import { optimizeLinkedInSection } from "@/action/linkedin";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Globe, Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import OptimizerResult from "./optimizer-result";

export default function OptimizerForm() {
  const [sectionType, setSectionType] = useState("about");
  const [targetRole, setTargetRole] = useState("");
  const [content, setContent] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOptimize = async () => {
    if (!targetRole.trim() || !content.trim()) {
      toast.error("Please enter both a target role and content to optimize.");
      return;
    }

    try {
      setIsOptimizing(true);
      const promise = optimizeLinkedInSection(sectionType, content.trim(), targetRole.trim());
      
      toast.promise(promise, {
        loading: "Optimizing your profile with AI...",
        success: "LinkedIn section optimized!",
        error: "Failed to optimize profile.",
      });

      const data = await promise;
      console.log("OPTIMIZER_DATA:", data);
      
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        setResult(data);
      } else {
        throw new Error("Received empty data from AI.");
      }
    } catch (error) {
      console.error("Optimization error:", error);
      // Handled by toast
    } finally {
      setIsOptimizing(false);
    }
  };

  if (result) {
    return <OptimizerResult result={result} onReset={() => setResult(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 mx-auto mb-2">
          <Globe className="h-5 w-5" />
        </div>
        <h1 className="text-xl sm:text-3xl font-bold gradient-title">LinkedIn Optimizer</h1>
        <p className="text-[10px] sm:text-xs text-muted-foreground max-w-md mx-auto">
          Transform your LinkedIn profile into a recruiter magnet with AI-powered SEO optimization.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10 py-3 sm:py-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Optimize Profile Section
          </CardTitle>
          <CardDescription className="text-[10px]">Select a section and paste your current text below.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] sm:text-xs">Section Type</Label>
              <Select value={sectionType} onValueChange={setSectionType}>
                <SelectTrigger className="h-9 text-[11px] sm:text-xs">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="about">"About" (Summary)</SelectItem>
                  <SelectItem value="experience">Experience Description</SelectItem>
                  <SelectItem value="headline">Profile Headline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[11px] sm:text-xs">Target Role</Label>
              <Input
                id="role"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={isOptimizing}
                className="h-9 text-[11px] sm:text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-[11px] sm:text-xs">Your Current Content</Label>
            <Textarea
              id="content"
              placeholder="Paste your existing LinkedIn text here..."
              className="min-h-[150px] sm:min-h-[180px] resize-none text-[11px] sm:text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isOptimizing}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !targetRole.trim() || !content.trim()}
              className="w-auto px-10 h-10 sm:h-11 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing for Recruiter...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
         {[
           { title: "SEO Keywords", desc: "Rank higher in search" },
           { title: "Action Verbs", desc: "Sound more authoritative" },
           { title: "Recruiter Score", desc: "Check your visibility" },
         ].map((tip, i) => (
           <div key={i} className="bg-muted/30 p-3 sm:p-4 rounded-xl border border-muted flex flex-col gap-1">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-primary tracking-widest">{tip.title}</span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">{tip.desc}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
