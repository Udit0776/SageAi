import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { getCoverLetter } from "@/action/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";
import { notFound } from "next/navigation";

export default async function CoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0 text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold gradient-title">
            {coverLetter.jobTitle} at {coverLetter.companyName}
          </h1>
        </div>
      </div>

      <CoverLetterPreview id={id} initialContent={coverLetter.content} />
    </div>
  );
}
