import React from "react";
import { getAssessments } from "@/action/interview";
import { PerformanceChart } from "./_components/performance-chart";
import { QuizList } from "./_components/quiz-list";
import { StatsCards } from "./_components/stats-card";

export default async function InterviewPage() {

  const assessments = await getAssessments();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold gradient-title tracking-tight">
            Interview Preparation
          </h1>

          {/* <div>
            <StatsCards assessments={assessments} />
            <PerformanceChart assessments={assessments} />
            <QuizList assessments={assessments} />
          </div> */}

        </div>

        {/* Content goes here */}
        <div className="space-y-8">
          <StatsCards assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>

      </div>
    </div>
  );
}