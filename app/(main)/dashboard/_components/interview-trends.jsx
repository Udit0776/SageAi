"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { format } from "date-fns";
import { Brain, TrendingUp } from "lucide-react";

export default function InterviewTrends({ sessions }) {
  if (!sessions || sessions.length === 0) return null;

  const data = sessions
    .map((s) => ({
      date: s.createdAt && !isNaN(new Date(s.createdAt)) ? format(new Date(s.createdAt), "MMM d") : "N/A",
      score: s.overallScore || 0,
      confidence: s.questions?.[0]?.toneAnalysis?.confidenceScore * 10 || 0,
    }))
    .reverse();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl p-3 shadow-2xl ring-1 ring-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Interview Performance Trends
        </CardTitle>
        <CardDescription className="text-[10px]">Your progress across multiple practice sessions.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Overall Score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              name="Confidence"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 4, fill: "#fbbf24", strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
