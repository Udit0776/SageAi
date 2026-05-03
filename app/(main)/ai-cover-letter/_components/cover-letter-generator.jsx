"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { generateCoverLetter } from "@/action/cover-letter";
import { improveWithAI } from "@/action/resume";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const jobDescription = watch("jobDescription");

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent) {
      setValue("jobDescription", improvedContent);
      toast.success("Job description improved!");
    }
  }, [improvedContent, setValue]);

  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
    }
  }, [generatedLetter, router]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  const handleImproveDescription = async () => {
    if (!jobDescription) {
      toast.error("Please enter a job description first");
      return;
    }

    try {
      await improveWithAIFn({
        current: jobDescription,
        type: "job description",
      });
    } catch (error) {
      toast.error(error.message || "Failed to improve description");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Job Details</CardTitle>
          <CardDescription className="text-sm">
            Provide information about the position you&apos;re applying for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs sm:text-sm">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                  className="text-xs sm:text-sm"
                />
                {errors.companyName && (
                  <p className="text-[10px] sm:text-xs text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-xs sm:text-sm">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                  className="text-xs sm:text-sm"
                />
                {errors.jobTitle && (
                  <p className="text-[10px] sm:text-xs text-destructive">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <Label htmlFor="jobDescription" className="text-xs sm:text-sm">Job Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] sm:text-xs h-7 sm:h-8"
                  onClick={handleImproveDescription}
                  disabled={isImproving || !jobDescription}
                >
                  {isImproving ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Improve with AI
                </Button>
              </div>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here"
                className="h-32 text-xs sm:text-sm"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-[10px] sm:text-xs text-destructive">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={generating} className="cursor-pointer text-xs sm:text-sm">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}