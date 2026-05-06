"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from "@/app/components/ui/progress";
import { 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  ListTodo,
  History,
  BookOpen
} from 'lucide-react';
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PerformanceAnalytics = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg text-center p-12">
        <Target className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
        <CardTitle className="text-2xl font-bold mb-2">No Data Yet</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          Take your first AI Interview to unlock advanced performance analytics, rejection risk analysis, and your daily practice planner.
        </CardDescription>
      </Card>
    );
  }

  // Analytics Calculations
  const latestSession = sessions[0];
  const avgReadiness = sessions.reduce((acc, s) => acc + (s.readinessScore || 0), 0) / sessions.length;
  
  // Aggregate Weaknesses
  const allWeaknesses = sessions.flatMap(s => s.weaknesses || []);
  const weaknessCount = allWeaknesses.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
  const topWeaknesses = Object.entries(weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(w => w[0]);

  // Chart Data (Scores over time)
  const chartData = [...sessions].reverse().map((s, idx) => ({
    name: `Session ${idx + 1}`,
    score: s.overallScore || s.readinessScore || 0,
    industryAverage: 75 // Mocked standard
  }));

  // Improvement tasks from latest session
  const practiceTasks = latestSession.improvementPlan 
    ? latestSession.improvementPlan.split('\n').filter(t => t.trim().length > 5).slice(0, 4)
    : [
        "Review your latest interview feedback",
        "Practice using the STAR method",
        "Research the company's recent news"
      ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Average Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(avgReadiness)}%</div>
            <Progress value={avgReadiness} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Based on {sessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-red-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Rejection Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground font-medium">
              {latestSession.rejectionRisk || "No immediate red flags detected in your latest session."}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <History className="h-4 w-4" /> Latest Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{latestSession.targetRole || "General Interview"}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {format(new Date(latestSession.createdAt), "MMM d, yyyy")}
            </div>
            <Badge variant="secondary" className="mt-3">Score: {latestSession.overallScore || latestSession.readinessScore || "N/A"}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Planner */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Daily Practice Planner
            </CardTitle>
            <CardDescription>Actionable steps based on your latest performance</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {practiceTasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10 cursor-default">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-relaxed">{task.replace(/^[-*0-9.]+\s*/, '')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rejection Analyzer & Weaknesses */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Areas to Improve
            </CardTitle>
            <CardDescription>Most frequent weaknesses across all sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {topWeaknesses.length > 0 ? (
                topWeaknesses.map((w, i) => (
                  <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1 text-xs">
                    {w}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keep taking interviews to identify patterns.</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Competitive Benchmarking</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '12px'}}
                    />
                    <Legend wrapperStyle={{fontSize: '10px'}} />
                    <Bar dataKey="score" name="Your Score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="industryAverage" name="Industry Avg" fill="#10b981" fillOpacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default PerformanceAnalytics;
