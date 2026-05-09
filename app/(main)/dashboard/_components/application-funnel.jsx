"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { ListTodo, PieChart } from "lucide-react";

export default function ApplicationFunnel({ applications }) {
  if (!applications || applications.length === 0) return null;

  const statusCounts = {
    APPLIED: 0,
    INTERVIEWING: 0,
    OFFERED: 0,
    REJECTED: 0,
  };

  applications.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  });

  const data = [
    { name: "Applied", value: statusCounts.APPLIED, color: "#3b82f6" },
    { name: "Interviewing", value: statusCounts.INTERVIEWING, color: "#eab308" },
    { name: "Offered", value: statusCounts.OFFERED, color: "#22c55e" },
    { name: "Rejected", value: statusCounts.REJECTED, color: "#ef4444" },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl p-3 shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{name}</p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {value} {value === 1 ? 'Application' : 'Applications'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          Application Funnel
        </CardTitle>
        <CardDescription className="text-[10px]">Your current job application distribution.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
            <XAxis 
              dataKey="name" 
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
