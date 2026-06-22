"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from "@/app/components/ui/progress";
import { Badge } from '@/app/components/ui/badge';
import { calculateCareerHealthScore } from '@/action/career-health';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Heart, RefreshCw, Sparkles, TrendingUp, ChevronRight, Activity, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CareerHealthWidget({ latestScore: initialScore, history: initialHistory }) {
  const [score, setScore] = useState(initialScore);
  const [history, setHistory] = useState(initialHistory || []);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'trend'

  const radarData = [
    { subject: 'Resume ATS', value: score?.atsScoreWeight || 0 },
    { subject: 'Interview Prep', value: score?.readinessWeight || 0 },
    { subject: 'Skill Coverage', value: score?.skillGapWeight || 0 },
    { subject: 'Job Search Activity', value: score?.kanbanWeight || 0 },
  ];

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const newScore = await calculateCareerHealthScore();
      setScore(newScore);
      setHistory(prev => [...prev.slice(-9), newScore]); // keep last 10
      toast.success('Career health score updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to recalculate score.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    if (val >= 50) return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
  };

  const trendData = history.map((item, idx) => ({
    date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: item.score,
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/20 animate-pulse" />
            Career Health Score
          </CardTitle>
          <CardDescription className="text-[10px]">Composite index of your market readiness</CardDescription>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="h-7 w-7 border-primary/20 hover:bg-primary/5 cursor-pointer shrink-0"
            title="Recalculate Score"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          </Button>
          <div className="flex bg-muted/50 rounded-lg p-0.5 border border-white/5 shrink-0">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                activeTab === 'radar' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                activeTab === 'trend' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Trend
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-4">
        {/* Visual Chart Area */}
        <div className="h-[180px] w-full flex items-center justify-center relative my-1">
          {activeTab === 'radar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="55%" data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  fontSize={8} 
                  tick={{ fill: "#a1a1aa", fontWeight: 650 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Health Score"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {trendData.length > 1 ? (
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" fontSize={8} tick={{ fill: "#71717a" }} stroke="#27272a" />
                  <YAxis domain={[0, 100]} fontSize={8} tick={{ fill: "#71717a" }} stroke="#27272a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#1f1f23',
                      fontSize: '10px',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    dot={{ fill: '#8b5cf6', r: 3 }} 
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-[10px] text-muted-foreground">Historical trend will appear after future updates</p>
                </div>
              )}
            </ResponsiveContainer>
          )}

          {/* Central score indicator on radar chart */}
          {activeTab === 'radar' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-3xl font-black text-white leading-none tracking-tighter">
                {score?.score || 0}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">
                HEALTH
              </span>
            </div>
          )}
        </div>

        {/* Breakdown sub-scores (reformatted for horizontal space) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-muted-foreground uppercase tracking-wider text-[8px] flex items-center gap-1 justify-center">
              Resume ATS
              {score?.resumeTrend === "improving" ? (
                <span className="text-emerald-500 font-extrabold text-[10px]">↑</span>
              ) : score?.resumeTrend === "declining" ? (
                <span className="text-rose-500 font-extrabold text-[10px]">↓</span>
              ) : (
                <span className="text-zinc-500 font-extrabold text-[10px]">→</span>
              )}
            </span>
            <span className="text-xs font-black text-white mt-0.5">{score?.atsScoreWeight || 0}%</span>
            
            {/* Inline ATS Sparkline */}
            {score?.atsScoreHistory && score.atsScoreHistory.length > 1 && (
              <div className="h-4 w-12 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={score.atsScoreHistory.map((val, i) => ({ val, i }))}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={score.resumeTrend === "improving" ? "#10b981" : score.resumeTrend === "declining" ? "#ef4444" : "#71717a"} 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="flex flex-col border-l border-white/5 justify-center">
            <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Interview Prep</span>
            <span className="text-xs font-black text-white mt-0.5">{score?.readinessWeight || 0}%</span>
          </div>
          <div className="flex flex-col border-l border-white/5 sm:border-l justify-center">
            <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Skill Match</span>
            <span className="text-xs font-black text-white mt-0.5">{score?.skillGapWeight || 0}%</span>
          </div>
          <div className="flex flex-col border-l border-white/5 justify-center">
            <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Kanban Act.</span>
            <span className="text-xs font-black text-white mt-0.5">{score?.kanbanWeight || 0}%</span>
          </div>
        </div>

        {/* ATS Trend insight */}
        {score?.resumeTrendInsight && (
          <p className="text-[10px] text-zinc-400 bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-left flex items-start gap-1.5 leading-relaxed font-medium">
            {score.resumeTrend === "improving" ? (
              <span className="text-emerald-500 shrink-0 font-extrabold text-[12px] leading-none">↑</span>
            ) : score.resumeTrend === "declining" ? (
              <span className="text-rose-500 shrink-0 font-extrabold text-[12px] leading-none">↓</span>
            ) : (
              <span className="text-zinc-500 shrink-0 font-extrabold text-[12px] leading-none">→</span>
            )}
            <span>{score.resumeTrendInsight}</span>
          </p>
        )}

        {/* AI Insight banner */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 flex gap-2.5 items-start">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              Sage AI Commentary
              <Badge variant="outline" className={`text-[8px] px-1 py-0 h-3.5 uppercase ${getScoreColor(score?.score)}`}>
                {score?.score >= 80 ? 'EXCELLENT' : score?.score >= 50 ? 'GOOD' : 'CRITICAL'}
              </Badge>
            </h4>
            <p className="text-[10px] text-zinc-350 leading-relaxed font-medium">
              {score?.commentary || "Build your profile, upload a resume, or complete mock interviews to generate insights."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
