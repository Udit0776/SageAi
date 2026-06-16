"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/app/components/ui/card";

export const PerformanceChart = ({ assessments }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (assessments?.length) {
            const formattedData = assessments.map((assessment) => ({
                date: format(new Date(assessment.createdAt), "MMM dd"),
                score: assessment.quizScore,
            }));
            setChartData(formattedData);
        }
    }, [assessments]);

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
            <CardHeader>
                <CardTitle className="gradient-title text-2xl font-bold">
                    Performance Trends
                </CardTitle>
                <CardDescription>Your quiz scores over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                domain={[0, 100]}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload?.length) {
                                        return (
                                            <div className="bg-background border border-border p-2 rounded-lg shadow-md">
                                                <p className="text-sm font-bold text-primary">
                                                    Score: {payload[0].value}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payload[0].payload.date}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{
                                    fill: "#22c55e",
                                    strokeWidth: 2,
                                    r: 4,
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 6,
                                    style: { fill: "#22c55e", opacity: 0.8 }
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};