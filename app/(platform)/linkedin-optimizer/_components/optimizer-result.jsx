"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Check, Copy, ArrowLeft, TrendingUp, Search, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

export default function OptimizerResult({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimizedContent || "");
    setCopied(true);
    toast.success("Content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onReset} className="cursor-pointer h-8 text-xs sm:text-sm">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Start Over
        </Button>
        <div className="flex items-center gap-2 sm:gap-3">
           <Badge variant="outline" className="text-[9px] sm:text-[10px] h-5 px-1.5 uppercase font-bold tracking-tight">Recruiter Match</Badge>
           <div className="text-lg sm:text-2xl font-bold text-primary">{result.recruiterScore || 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-primary/10 shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between py-3 px-4 sm:py-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Optimized Version
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 cursor-pointer">
                {copied ? <Check className="h-3 w-3 mr-1 sm:mr-2" /> : <Copy className="h-3 w-3 mr-1 sm:mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground text-xs sm:text-sm">
                {result.optimizedContent || "No content generated."}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/50">
            <CardHeader className="py-4 px-4 sm:px-6">
               <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Key Improvements
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
               {(result.improvements || []).length > 0 ? (
                 result.improvements.map((item, i) => (
                   <div key={i} className="space-y-2 p-3 rounded-xl bg-muted/30 border border-muted transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground break-words">
                         <AlertCircle className="h-3 w-3 text-red-400 shrink-0" /> Before: <span className="text-foreground/80">{item.before}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-green-400 break-words">
                         <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" /> After: <span className="text-foreground/80">{item.after}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight pl-5 mt-1">{item.reason}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-muted-foreground italic text-center py-4">No specific improvements analyzed.</p>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3 px-4 sm:px-6">
               <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  SEO Keywords Added
               </CardTitle>
               <CardDescription className="text-[10px]">Boost your search visibility.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 px-4 sm:px-6 pb-6">
               {(result.seoKeywords || []).length > 0 ? (
                 result.seoKeywords.map((kw, i) => (
                   <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] sm:text-[10px] px-2 py-0.5">
                      {kw}
                   </Badge>
                 ))
               ) : (
                 <p className="text-[10px] text-muted-foreground italic">No keywords detected.</p>
               )}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 px-4 sm:px-6">
               <CardTitle className="text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-widest">Coach's Analysis</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
               <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                 "{result.analysis || "The AI is currently analyzing your improvements..."}"
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
