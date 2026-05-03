import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Quiz } from "../_components/quiz";

export default function MockInterviewPage() {
    return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href={"/interview"} className="mb-5">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" /> Back to Interview Preparation
          </Button>
        </Link>

        <div className="mb-5">
          <h1 className="text-4xl font-bold gradient-title">Mock AI Interview</h1>
          <p className="text-muted-foreground">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </div>

      <Quiz />
    </div>
    )
}