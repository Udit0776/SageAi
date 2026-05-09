"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Trophy, TrendingUp, AlertCircle, CheckCircle2, IndianRupee, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function NegotiationReport({ session }) {
  const initialOffer = Number(session?.initialOffer || 0);
  const expectedSalary = Number(session?.expectedSalary || 0);
  const finalSalary = Number(session?.finalSalary || initialOffer);
  const increase = Math.max(0, finalSalary - initialOffer);
  const percentIncrease = initialOffer > 0 ? ((increase / initialOffer) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
           <Trophy className="h-4 w-4" /> Negotiation Complete
        </div>
        <h1 className="text-4xl font-bold gradient-title tracking-tight">Final Assessment</h1>
        <p className="text-muted-foreground">See how you performed in the boardroom.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Success Score */}
        <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Trophy className="h-20 w-20 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-widest">Negotiation Score</CardDescription>
            <CardTitle className="text-5xl font-black text-primary">{session.score || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Based on your persuasion skills, data points used, and final salary outcome.
             </p>
          </CardContent>
        </Card>

        {/* Salary Outcome */}
        <Card className="md:col-span-2 border-primary/10">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Salary Summary
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                   <div className="text-[10px] text-muted-foreground uppercase font-bold">Initial Offer</div>
                   <div className="text-xl font-bold">₹{initialOffer.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] text-primary uppercase font-bold">Final Achieved</div>
                   <div className="text-xl font-bold text-primary">₹{finalSalary.toLocaleString()}</div>
                </div>
                <div className="space-y-1 text-right">
                   <div className="text-[10px] text-green-500 uppercase font-bold">Increase</div>
                   <div className="text-xl font-bold text-green-500">+{percentIncrease}%</div>
                </div>
             </div>
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-muted-foreground" style={{ width: `${expectedSalary > 0 ? (initialOffer / expectedSalary) * 100 : 0}%` }} />
                <div className="h-full bg-primary animate-in slide-in-from-left duration-1000" style={{ width: `${expectedSalary > 0 ? (increase / expectedSalary) * 100 : 0}%` }} />
             </div>
             <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Initial Offer</span>
                <span className="text-primary font-bold">You Negotiated Up ₹{increase.toLocaleString()}</span>
                <span>Target: ₹{expectedSalary.toLocaleString()}</span>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detailed Feedback */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-primary" />
               Strategy Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-muted-foreground leading-relaxed italic">
               "{session.feedback}"
             </p>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-muted/30 border-muted">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <CheckCircle2 className="h-5 w-5 text-primary" />
               Future Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-3">
                {(session.suggestions ? JSON.parse(session.suggestions) : []).map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-3">
                     <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                     {tip}
                  </li>
                ))}
                {(!session.suggestions || JSON.parse(session.suggestions).length === 0) && (
                  <p className="text-sm text-muted-foreground">Great job! Keep practicing to refine your technique.</p>
                )}
             </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Link href="/dashboard">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
