import { getJobApplications } from "@/action/job-tracker";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import KanbanBoard from "./_components/kanban-board";
import AddJobDialog from "./_components/add-job-dialog";
import { Briefcase } from "lucide-react";

export default async function JobTrackerPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const jobs = await getJobApplications();

  return (
    <div className="container mx-auto py-10 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-xl sm:text-2xl font-bold gradient-title">AI Job Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track your applications and get AI-powered advice for every step.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-muted">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold">{jobs.length} Applications</span>
           </div>
           <AddJobDialog />
        </div>
      </div>

      <KanbanBoard initialJobs={jobs} />
    </div>
  );
}
