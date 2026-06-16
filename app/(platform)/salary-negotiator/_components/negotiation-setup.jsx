"use client";

import { useState, useEffect } from "react";
import { startNegotiation } from "@/action/salary-negotiator";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { IndianRupee, Briefcase, Building2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NegotiationSetup({ user, onStart }) {
  const [role, setRole] = useState(user?.industry || "");
  const [company, setCompany] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStart = async () => {
    if (!role.trim() || !expectedSalary.trim()) {
      toast.error("Please enter both a target role and expected salary.");
      return;
    }

    if (parseFloat(expectedSalary) <= 0) {
      toast.error("Expected salary must be a positive number.");
      return;
    }

    try {
      setIsStarting(true);
      const promise = startNegotiation(role.trim(), company.trim() || undefined, expectedSalary);
      
      toast.promise(promise, {
        loading: "Contacting the recruiter...",
        success: "Negotiation started!",
        error: (err) => err.message || "Failed to start negotiation.",
      });

      const session = await promise;
      console.log("Session created successfully:", session);
      
      if (session && session.id) {
        onStart(session);
      } else {
        throw new Error("Failed to create a valid session.");
      }
    } catch (error) {
      console.error("Start negotiation error:", error);
      // toast handles the error message
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl font-bold gradient-title">Salary Negotiator</h1>
        <p className="text-muted-foreground">
          Practice the most stressful part of the job search with a tough AI recruiter.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-primary" />
            Set Your Target
          </CardTitle>
          <CardDescription>Configure the negotiation scenario.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Target Role *
              </Label>
              <Input
                id="role"
                placeholder="e.g. Senior Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isStarting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company (Optional)
              </Label>
              <Input
                id="company"
                placeholder="e.g. Google, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isStarting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                Expected Annual Salary *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                <Input
                  id="salary"
                  type="number"
                  placeholder="120000"
                  className="pl-7"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  min="0"
                  disabled={isStarting}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                AI will likely start with an offer 10-15% lower than this.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleStart}
              disabled={isStarting || !role.trim() || !expectedSalary.trim()}
              className="w-auto px-10 h-12 text-base font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Entering Boardroom...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Negotiation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
             <Lightbulb className="h-5 w-5 text-primary" />
             Negotiation Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
          <p>• <b>Don't accept the first offer</b>: It's almost always a starting point.</p>
          <p>• <b>Use data</b>: Mention industry averages or your specific metrics/achievements.</p>
          <p>• <b>Be professional but firm</b>: AI detects your tone and reacts accordingly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Lightbulb(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}
