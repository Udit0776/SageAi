"use client";

import { useState, useEffect } from "react";
import { updateJobStatus, deleteJobApplication, getAIJobAdvice } from "@/action/job-tracker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog";
import { generateOnboardingPlan } from "@/action/onboarding-plan";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  ArrowRightCircle,
  Loader2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLUMNS = [
  { label: "Applied", value: "APPLIED", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { label: "Interviewing", value: "INTERVIEWING", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { label: "Offered", value: "OFFERED", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { label: "Rejected", value: "REJECTED", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

export default function KanbanBoard({ initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [advisingJobId, setAdvisingJobId] = useState(null);
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateJobStatus(id, newStatus);
      
      // Update status locally, preserving custom inclusion links
      setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
      toast.success(`Moved to ${newStatus}`);

      if (newStatus === "OFFERED") {
        const job = jobs.find(j => j.id === id);
        setSelectedJob(job);
        setShowOnboardingModal(true);
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedJob) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await generateOnboardingPlan(selectedJob.id);
      toast.success("30-60-90 Day Onboarding Plan generated!");
      setShowOnboardingModal(false);
      router.push(`/onboarding-plan/${plan.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate onboarding plan.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJobApplication(id);
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Application deleted.");
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const handleGetAIAdvice = async (id) => {
    try {
      setAdvisingJobId(id);
      const result = await getAIJobAdvice(id);
      setJobs(jobs.map(j => j.id === id ? { ...j, nextAction: result.nextAction } : j));
      toast.success("AI advice updated!");
    } catch (error) {
      toast.error("AI was unable to provide advice.");
    } finally {
      setAdvisingJobId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATUS_COLUMNS.map((column) => (
        <div key={column.value} className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${column.color.split(' ')[0]}`} />
              {column.label}
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-muted/50 border-none">
                {jobs.filter(j => j.status === column.value).length}
              </Badge>
            </h3>
          </div>

          <div className="flex flex-col gap-4 min-h-[500px] p-2 rounded-2xl bg-muted/20 border border-dashed border-muted">
            {jobs.filter(j => j.status === column.value).map((job) => (
              <Card key={job.id} className="group border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                       </div>
                       <div className="min-w-0">
                          <CardTitle className="text-sm font-bold truncate leading-none mb-1">{job.company}</CardTitle>
                          <CardDescription className="text-[10px] truncate">{job.role}</CardDescription>
                       </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                        <div className="h-px bg-muted my-1" />
                        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase">Move to</div>
                        {STATUS_COLUMNS.filter(c => c.value !== job.status).map(c => (
                          <DropdownMenuItem 
                            key={c.value} 
                            className="cursor-pointer"
                            onClick={() => handleStatusUpdate(job.id, c.value)}
                          >
                            <ChevronRight className="h-3 w-3 mr-2" /> {c.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 py-2 space-y-3">
                  {job.nextAction ? (
                    <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary tracking-tighter">
                         <Sparkles className="h-3 w-3" /> AI Suggestion
                      </div>
                      <p className="text-[11px] font-medium leading-tight text-foreground/80">{job.nextAction}</p>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full h-8 text-[10px] font-bold border border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary/70 cursor-pointer"
                      onClick={() => handleGetAIAdvice(job.id)}
                      disabled={advisingJobId === job.id}
                    >
                      {advisingJobId === job.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-2" />
                      )}
                      Ask AI for Next Step
                    </Button>
                  )}
                  
                  {job.status === "OFFERED" && (
                    job.onboardingPlan ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 cursor-pointer mt-1"
                        onClick={() => router.push(`/onboarding-plan/${job.onboardingPlan.id}`)}
                      >
                        View 30-60-90 Plan
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-[10px] font-bold bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer mt-1"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowOnboardingModal(true);
                        }}
                      >
                        Generate 30-60-90 Plan
                      </Button>
                    )
                  )}

                  {job.notes && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                      "{job.notes}"
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t border-muted/30 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                       <Clock className="h-3 w-3" />
                       {job.updatedAt && !isNaN(new Date(job.updatedAt)) 
                         ? `${formatDistanceToNow(new Date(job.updatedAt))} ago`
                         : "Recently"}
                    </div>
                   <ArrowRightCircle className="h-4 w-4 text-muted-foreground/30" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Onboarding Plan Dialog Confirmation */}
      <Dialog open={showOnboardingModal} onOpenChange={setShowOnboardingModal}>
        <DialogContent className="bg-[#09090b] border border-white/10 text-white rounded-2xl max-w-sm p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xl">
              🎉
            </div>
            <DialogTitle className="text-lg font-bold text-center">Congratulations!</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 text-center leading-relaxed">
              You received an offer for the <strong>{selectedJob?.role}</strong> role at <strong>{selectedJob?.company}</strong>! 
              <br /><br />
              Would you like Sage AI to generate a structured <strong>30-60-90 Day Onboarding Plan</strong> to guarantee your success in the first three months?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-row gap-2 justify-center sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnboardingModal(false)}
              className="border-white/5 hover:bg-white/5 text-xs h-9 px-4 rounded-xl cursor-pointer"
              disabled={isGeneratingPlan}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
