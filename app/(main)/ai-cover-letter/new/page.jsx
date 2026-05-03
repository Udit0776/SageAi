import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0 text-muted-foreground hover:text-primary text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="pb-6">
          <h1 className="text-2xl sm:text-4xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      <CoverLetterGenerator />
    </div>
  );
}
