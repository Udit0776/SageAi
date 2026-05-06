"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Target, Briefcase, Sparkles, History, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { format } from "date-fns";
import { Badge } from "@/app/components/ui/badge";

export default function InterviewSetup({ user, pastSessions }) {
  const [type, setType] = useState("mixed");
  const [targetRole, setTargetRole] = useState(user?.industry || "");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setLoading(true);
    const params = new URLSearchParams({
      type,
      role: targetRole,
      company: company || "General"
    });
    router.push(`/interview/coach/session?${params.toString()}`);
  };

  const interviewTypes = [
    { id: "behavioral", title: "Behavioral", description: "Leadership, conflict, teamwork", icon: Target },
    { id: "technical", title: "Technical", description: "Skills & problem solving", icon: Brain },
    { id: "hr", title: "HR / Culture", description: "Values & fit", icon: Briefcase },
    { id: "mixed", title: "Mixed Round", description: "A balanced interview", icon: Sparkles },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold gradient-title">AI Interview Coach</h1>
        <p className="text-muted-foreground">
          Simulate a real interview with AI that corrects you live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Customize Your Session
              </CardTitle>
              <CardDescription>Configure the interview to match your target job.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Interview Focus
                </Label>
                <RadioGroup 
                  value={type} 
                  onValueChange={setType}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {interviewTypes.map((item) => (
                    <div key={item.id}>
                      <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                      <Label
                        htmlFor={item.id}
                        className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-muted bg-popover hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <div className="font-bold">{item.title}</div>
                        <div className="text-xs text-muted-foreground leading-tight">{item.description}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Target Role</Label>
                  <Input 
                    id="role" 
                    placeholder="e.g. Software Engineer" 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input 
                    id="company" 
                    placeholder="e.g. Google" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleStart} 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                disabled={loading || !targetRole}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Start AI Interview
              </Button>
            </CardContent>
          </Card>

          {pastSessions?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Recent Sessions
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pastSessions.slice(0, 4).map((session) => (
                  <Card key={session.id} className="hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-2">
                           <span className="capitalize">{session.type}</span>
                           <Badge variant="outline" className="text-[10px] h-4">
                              {session.readinessScore}% Ready
                           </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(session.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 text-muted-foreground leading-relaxed">
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                <p>Use the <span className="text-foreground font-semibold">STAR method</span> (Situation, Task, Action, Result) for behavioral questions.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                <p>Be specific with <span className="text-foreground font-semibold">metrics</span> (e.g., "improved performance by 20%").</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                <p>Don't rush! AI analyzes your structure and clarity.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
