"use client";

import { useState } from "react";
import { generateCompanyBattlePlan, deleteCompanyBattlePlan } from "@/action/company-intel";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, Building2, Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import BattlePlanView from "./battle-plan-view";

export default function BattlePlanGenerator({ pastPlans: initialPlans }) {
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [plans, setPlans] = useState(initialPlans || []);
  const [activePlan, setActivePlan] = useState(null);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name.");
      return;
    }

    try {
      setIsGenerating(true);
      const promise = generateCompanyBattlePlan(companyName.trim(), targetRole.trim() || null);
      
      toast.promise(promise, {
        loading: `Researching ${companyName}...`,
        success: `Battle plan for ${companyName} is ready!`,
        error: (err) => err.message || "Failed to generate battle plan.",
      });

      const newPlan = await promise;
      setPlans((prev) => [newPlan, ...prev]);
      setActivePlan(newPlan);
      setExpandedPlanId(newPlan.id);
      setCompanyName("");
      setTargetRole("");
    } catch (error) {
      // Handled by toast.promise
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await toast.promise(deleteCompanyBattlePlan(id), {
        loading: "Deleting...",
        success: "Battle plan deleted.",
        error: "Failed to delete.",
      });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (expandedPlanId === id) setExpandedPlanId(null);
    } catch (error) {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-8">
      {/* Generator Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Generate Battle Plan
          </CardTitle>
          <CardDescription>
            Enter a company name and we'll create a comprehensive interview prep cheat sheet.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="e.g. Google, Stripe, Amazon"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Target Role (Optional)</Label>
              <Input
                id="role"
                placeholder="e.g. Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !companyName.trim()}
              className="w-full sm:w-auto min-w-[200px] h-12 text-sm sm:text-base font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Intel...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Battle Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Past Battle Plans */}
      {plans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Your Battle Plans ({plans.length})
          </h3>
          <div className="space-y-4">
            {isGenerating && (
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
                      <Brain className="h-3 w-3 animate-bounce" />
                      AI is researching company insights...
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            {plans.map((plan, index) => (
              <Card
                key={plan.id || `plan-${index}`}
                className={`transition-all border ${expandedPlanId === plan.id ? "border-primary/30 shadow-lg" : "border-border hover:border-primary/20"}`}
              >
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">{plan.companyName || "Unknown Company"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {plan.targetRole && <Badge variant="outline" className="text-[10px] h-4">{plan.targetRole}</Badge>}
                          {plan.createdAt && !isNaN(new Date(plan.createdAt)) && (
                            <span>{format(new Date(plan.createdAt), "MMM d, yyyy")}</span>
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
                          handleDelete(plan.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedPlanId === plan.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedPlanId === plan.id && (
                    <div className="border-t p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {(() => {
                        try {
                          if (!plan.content || plan.content === "undefined") throw new Error("No content");
                          const parsedContent = typeof plan.content === "string" ? JSON.parse(plan.content) : plan.content;
                          return <BattlePlanView content={parsedContent} companyName={plan.companyName || "this company"} />;
                        } catch (err) {
                          return (
                            <div className="text-sm text-destructive p-4 text-center bg-destructive/5 rounded-lg border border-destructive/10">
                              <p className="font-bold mb-1">Data Display Error</p>
                              <p className="text-[10px] opacity-70">The AI response for this plan was malformed. Please try deleting and regenerating it.</p>
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
