import { Suspense } from "react";
import InterviewSession from "../_components/interview-session";
import { Loader2 } from "lucide-react";

export default function SessionPage() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading session...</p>
        </div>
      }>
        <InterviewSession />
      </Suspense>
    </div>
  );
}
