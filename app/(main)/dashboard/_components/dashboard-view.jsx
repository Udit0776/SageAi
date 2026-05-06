"use client";

import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import PerformanceAnalytics from './performance-analytics';
import {
  TrendingUp,
  TrendingDown,
  LineChart,
  Briefcase,
  Brain,
} from 'lucide-react';
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from "@/app/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const DashboardView = ({ insights, interviewSessions }) => {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }))

  const getDemandLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getDemandLevelBg = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const { icon: OutlookIcon, color: outlookColor } = getMarketOutlookInfo(
    insights.marketOutlook
  );

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  )

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold gradient-title tracking-tight">
          Industry Insights
        </h1>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 h-auto py-1.5 px-4">
            Last Updated: {lastUpdatedDate}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="insights">Industry Insights</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-5 w-5 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className={`text-xl font-bold tracking-tight ${outlookColor}`}>
                {insights.marketOutlook}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Next update {nextUpdateDistance}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className={`text-xl font-bold tracking-tight ${outlookColor}`}>
                {insights.growthRate.toFixed(1)}%
              </div>
              <Progress value={insights.growthRate} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Demand Level
            </CardTitle>
            <Briefcase className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className={`text-xl font-bold tracking-tight ${getDemandLevelColor(insights.demandLevel)}`}>
                {insights.demandLevel}
              </div>
              <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getDemandLevelBg(insights.demandLevel)}`}
                  style={{
                    width: insights.demandLevel.toLowerCase() === 'high' ? '100%' :
                      insights.demandLevel.toLowerCase() === 'medium' ? '50%' : '25%'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Top Skills
            </CardTitle>
            <Brain className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.topSkills.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {insights.topSkills.length > 2 && (
                <>
                  <Badge variant="outline" className="group-hover/card:hidden">
                    +{insights.topSkills.length - 2} more
                  </Badge>
                  {insights.topSkills.slice(2).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="hidden group-hover/card:flex"
                    >
                      {skill}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300 my-10">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salary (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={salaryData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="name" fontSize={12} tick={{ fill: "#94a3b8" }} />
                <PolarRadiusAxis angle={30} domain={[0, "auto"]} fontSize={10} tick={{ fill: "#64748b" }} />
                <Radar
                  name="Min Salary"
                  dataKey="min"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Median Salary"
                  dataKey="median"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Max Salary"
                  dataKey="max"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.4}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-2xl ring-1 ring-white/10">
                          <p className="font-bold text-foreground mb-2 border-b border-primary/10 pb-1">
                            {label}
                          </p>
                          <div className="space-y-1.5">
                            {payload.map((item) => (
                              <div key={item.name} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-xs text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  ${item.value}K
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Key Industry Trends</CardTitle>
            <CardDescription className="text-xs">
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                  <span className="text-xs text-foreground leading-relaxed font-medium">
                    {trend}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recommended Skills</CardTitle>
            <CardDescription className="text-xs">
              Skills to improve your chances of getting a job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors py-2 px-4 text-xs h-auto"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <PerformanceAnalytics sessions={interviewSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );

};

export default DashboardView;
