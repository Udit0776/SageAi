"use client";

import { useEffect, useState } from "react";
import { getInterviewSessions } from "@/action/interview-coach";
import { analyzeCommunicationTrend } from "@/lib/communication-scorer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { format } from "date-fns";
import { Loader2, Mic, TrendingUp, TrendingDown, HelpCircle, Trophy, BarChart3, AlertCircle } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

export default function CommunicationTrends() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInterviewSessions();
        setSessions(data || []);
      } catch (err) {
        setError(err.message || "Failed to load interview sessions.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing communication trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="font-bold text-red-400">Error Loading Data</h3>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </Card>
    );
  }

  // Filter sessions that have communication data
  const validSessions = sessions
    .filter(s => s.averageWPM !== null && s.fillerWordRate !== null)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Chronological order

  if (validSessions.length === 0) {
    return (
      <Card className="border-dashed border-zinc-800 bg-[#09090b]/50 p-12 text-center flex flex-col items-center justify-center">
        <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
          <Mic className="h-8 w-8" />
        </div>
        <CardTitle className="text-lg font-bold">No Speech Analytics Found</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-2 text-xs sm:text-sm">
          You haven't completed any mock interviews using **Voice Mode** yet. 
          Start a new interview, enable your microphone, and speak your answers to see your communication pace and filler words tracked here!
        </CardDescription>
      </Card>
    );
  }

  // Take last 10 sessions with communication data for display
  const chartSessions = validSessions.slice(-10);

  // Call the analytics helper
  const trends = analyzeCommunicationTrend(validSessions);

  // Compile aggregate filler words breakdown from all sessions
  const aggregateBreakdown = {};
  validSessions.forEach(s => {
    if (s.fillerWordBreakdown && typeof s.fillerWordBreakdown === "object") {
      Object.entries(s.fillerWordBreakdown).forEach(([word, count]) => {
        aggregateBreakdown[word] = (aggregateBreakdown[word] || 0) + count;
      });
    }
  });

  const sortedFillers = Object.entries(aggregateBreakdown)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const totalFillerWordsCount = sortedFillers.reduce((sum, item) => sum + item.count, 0);

  // Format chart data
  const data = chartSessions.map((s, idx) => ({
    name: `Session ${idx + 1}`,
    date: format(new Date(s.createdAt), "MMM dd"),
    score: s.communicationScore || 0,
    wpm: s.averageWPM || 0,
    fillerRate: s.fillerWordRate || 0
  }));

  // Calculate percentage improvement for filler words over last 5 sessions
  const last5 = validSessions.slice(-5);
  let fillerTrendText = "Your filler word rate is stable across recent sessions.";
  let fillerTrendDirection = "stable";

  if (last5.length >= 2) {
    const firstRate = last5[0].fillerWordRate;
    const latestRate = last5[last5.length - 1].fillerWordRate;
    const rateDiff = firstRate - latestRate; // positive means reduction (good)
    
    if (trends.fillerTrend === "improving") {
      fillerTrendDirection = "improving";
      const pct = firstRate > 0 ? Math.round((rateDiff / firstRate) * 100) : 0;
      fillerTrendText = pct > 0 
        ? `Your filler word rate has improved by ${pct}% over your last 5 sessions.` 
        : `Your filler word rate has decreased from ${firstRate.toFixed(1)} to ${latestRate.toFixed(1)} fillers/min.`;
    } else if (trends.fillerTrend === "declining") {
      fillerTrendDirection = "declining";
      const pct = firstRate > 0 ? Math.round((Math.abs(rateDiff) / firstRate) * 100) : 0;
      fillerTrendText = pct > 0
        ? `Your filler word rate has increased by ${pct}% over your last 5 sessions. Focus on conscious pausing.`
        : `Your filler word rate has increased from ${firstRate.toFixed(1)} to ${latestRate.toFixed(1)} fillers/min.`;
    }
  }

  // WPM trend text
  let wpmTrendText = "Your speaking pace is stable and controlled.";
  if (trends.wpmTrend === "improving") {
    wpmTrendText = `Your speaking speed is moving closer to the ideal 110-150 WPM range.`;
  } else if (trends.wpmTrend === "declining") {
    wpmTrendText = `Your speaking pace is becoming too ${trends.averageWPM < 110 ? 'slow' : 'fast'} recently.`;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WPM Pace Card */}
        <Card className="bg-card/40 border-primary/10 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Average Speaking Pace</CardDescription>
            <CardTitle className="text-3xl font-black text-blue-400 mt-1">
              {Math.round(trends.averageWPM)} <span className="text-sm font-normal text-muted-foreground">WPM</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>{wpmTrendText}</p>
            <div className="flex items-center gap-1.5 mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded w-fit font-semibold">
              Benchmark: 110 - 150 WPM
            </div>
          </CardContent>
        </Card>

        {/* Filler Words Rate Card */}
        <Card className="bg-card/40 border-primary/10 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Filler Word Rate</CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-400 mt-1">
              {trends.averageFillerRate.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">fillers/min</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-1">
              {fillerTrendDirection === "improving" ? (
                <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : fillerTrendDirection === "declining" ? (
                <TrendingDown className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              ) : null}
              <p>{fillerTrendText}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded w-fit font-semibold">
              Benchmark: &lt; 2.0 / min
            </div>
          </CardContent>
        </Card>

        {/* Communication Score Card */}
        <Card className="bg-card/40 border-primary/10 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Best Performance Score</CardDescription>
            <CardTitle className="text-3xl font-black text-primary mt-1">
              {trends.bestSession ? `${trends.bestSession.communicationScore.toFixed(0)}/100` : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              {trends.bestSession 
                ? `Achieved on ${format(new Date(trends.bestSession.date), "MMM dd, yyyy")}` 
                : "Complete a full session to set your benchmark."}
            </p>
            <div className="flex items-center gap-1.5 mt-2 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded w-fit font-semibold">
              <Trophy className="h-3 w-3" /> Track progress over time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Communication Score Progression */}
        <Card className="bg-card/30 border-primary/10 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Communication Score Trend
            </CardTitle>
            <CardDescription className="text-[10px]">Deterministic scoring over recent coaching sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" domain={[0, 100]} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                  labelStyle={{ color: "#a1a1aa", fontWeight: "bold" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Score"
                  stroke="var(--color-primary, #6366f1)" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                  dot={{ strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: WPM & Filler Rate side-by-side (Dual Axis) */}
        <Card className="bg-card/30 border-primary/10 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Speech Cadence & Fillers
            </CardTitle>
            <CardDescription className="text-[10px]">Speaking Pace (WPM) vs. Filler Words per Minute</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                {/* Left YAxis for WPM */}
                <YAxis yAxisId="left" stroke="#3b82f6" domain={[50, 200]} fontSize={10} />
                {/* Right YAxis for Filler rate */}
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 15]} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                  labelStyle={{ color: "#a1a1aa", fontWeight: "bold" }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="wpm" 
                  name="Speaking Pace (WPM)" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="fillerRate" 
                  name="Filler Rate (fillers/min)" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filler Words Breakdown */}
      <Card className="bg-card/30 border-primary/10 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" /> Filler Words Breakdown
          </CardTitle>
          <CardDescription className="text-[10px]">Ranked frequency list of filler words spoken overall</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedFillers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedFillers.slice(0, 6).map((item) => {
                const percent = totalFillerWordsCount > 0 
                  ? Math.round((item.count / totalFillerWordsCount) * 100) 
                  : 0;
                return (
                  <div key={item.word} className="space-y-1.5 p-3 rounded-lg border border-primary/5 bg-primary/5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <Badge variant="outline" className="bg-[#09090b] text-primary border-primary/20 px-2 py-0.5 capitalize">
                        "{item.word}"
                      </Badge>
                      <span className="text-muted-foreground">{item.count} times ({percent}%)</span>
                    </div>
                    <Progress value={percent} className="h-1" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              No filler words recorded. Keep up the clean speaking!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
