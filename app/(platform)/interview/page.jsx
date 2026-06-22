import React from "react";
import { getAssessments } from "@/action/interview";
import { PerformanceChart } from "./_components/performance-chart";
import { QuizList } from "./_components/quiz-list";
import { StatsCards } from "./_components/stats-card";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import CommunicationTrends from "./coach/_components/communication-trends";

export default async function InterviewPage() {

  const assessments = await getAssessments();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-title tracking-tight text-left">
              Interview Preparation
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-left">
              Prepare for your target roles with interactive AI mock interviews and specialized quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/interview/coach" className="w-full md:w-auto">
              <Button className="w-full md:w-auto font-bold shadow-lg shadow-primary/20 cursor-pointer">
                Start AI Mock Interview
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="quizzes" className="w-full space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1">
            <TabsTrigger value="quizzes" className="font-semibold px-4 cursor-pointer">
              Mock Quizzes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-semibold px-4 cursor-pointer">
              Communication Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-8 mt-2">
            <StatsCards assessments={assessments} />
            <PerformanceChart assessments={assessments} />
            <QuizList assessments={assessments} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-2">
            <CommunicationTrends />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}