"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Award, Sparkles, Check, X, ShieldAlert, ArrowLeft, RefreshCw, Landmark, Briefcase, MapPin } from 'lucide-react';

export default function ComparisonResult({ session, onBack }) {
  const result = session.comparisonData;
  const originalOffers = session.offers;

  if (!result || !result.scores) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 p-6 text-center text-muted-foreground flex flex-col items-center gap-3">
        <ShieldAlert className="h-10 w-10 text-rose-500/50" />
        <p className="text-xs">No valid comparison scores were found for this session.</p>
        <Button onClick={onBack} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer">
          Go Back
        </Button>
      </Card>
    );
  }

  // Construct chart data
  // Subject axes: Base Salary, Flexibility, Growth Potential, Location, Overall
  const subjects = [
    { key: 'salaryScore', label: 'Compensation' },
    { key: 'flexibilityScore', label: 'Flexibility' },
    { key: 'growthScore', label: 'Growth' },
    { key: 'locationScore', label: 'Location' },
    { key: 'overallScore', label: 'Overall Rating' },
  ];

  const radarData = subjects.map((subj) => {
    const row = { subject: subj.label };
    Object.keys(result.scores).forEach((company) => {
      row[company] = result.scores[company][subj.key] || 0;
    });
    return row;
  });

  const colors = ["#6366f1", "#10b981", "#f59e0b"];

  const formatCurrency = (val) => {
    if (!val) return "N/A";
    const num = parseFloat(val);
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L/yr`;
    }
    return `₹${num.toLocaleString()}/yr`;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Back button link */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="text-xs text-muted-foreground hover:text-white cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to comparisons
        </Button>
        <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] py-1 px-3 flex items-center gap-1">
          <Sparkles className="h-3 w-3 animate-pulse" />
          AI Analysis Complete
        </Badge>
      </div>

      {/* Recommended Winner Banner Card */}
      <Card className="bg-gradient-to-br from-indigo-900/10 to-indigo-950/20 border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              AI Recommendation
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Sage AI Recommends: <span className="text-indigo-400">{result.winner}</span>
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {result.reasoning}
            </p>
          </div>
          <div className="h-16 w-full md:w-px bg-white/5 shrink-0" />
          <div className="text-center shrink-0 w-full md:w-auto bg-white/[0.02] border border-white/5 p-4 px-6 rounded-2xl">
            <span className="text-4xl font-black text-indigo-400 tracking-tighter">
              {result.scores[result.winner]?.overallScore || 0}
            </span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono block mt-1">
              WINNER SCORE
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Radar Comparison Chart and Quick Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Recharts Radar Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              Comparative Ratings
            </CardTitle>
            <CardDescription className="text-[10px]">Radar breakdown of all offer sub-scores</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" fontSize={8} tick={{ fill: "#a1a1aa", fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                
                {Object.keys(result.scores).map((company, idx) => (
                  <Radar
                    key={company}
                    name={company}
                    dataKey={company}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.15}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#1f1f23',
                    fontSize: '10px',
                    borderRadius: '8px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Original offer parameters side-by-side list */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-primary" />
              Package Overview
            </CardTitle>
            <CardDescription className="text-[10px]">Comparing original raw parameters inputs</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-center gap-3">
            {originalOffers.map((off, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border flex items-center justify-between gap-4 ${
                  off.companyName === result.winner 
                    ? 'bg-indigo-600/5 border-indigo-500/20' 
                    : 'bg-[#18181b]/20 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8.5 w-8.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                    <Landmark className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      {off.companyName}
                      {off.companyName === result.winner && (
                        <Badge variant="secondary" className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0 h-3.5">
                          Winner
                        </Badge>
                      )}
                    </h4>
                    <p className="text-[10px] text-zinc-400 truncate">{off.roleTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white">{formatCurrency(off.baseSalary)}</span>
                    <span className="text-[8px] text-zinc-550 uppercase font-mono mt-0.5">Base</span>
                  </div>
                  <div className="h-5 w-px bg-white/5" />
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-0.5 justify-end">
                      <MapPin className="h-2.5 w-2.5" /> {off.location || "N/A"}
                    </span>
                    <span className="text-[8px] text-zinc-550 uppercase font-mono mt-0.5">{off.workModel}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pros & Cons Columns for each Offer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.keys(result.scores).map((company, idx) => {
          const scoreObj = result.scores[company];
          return (
            <Card key={company} className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-white">{company} Analysis</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">Overall:</span>
                    <span className="text-xs font-black text-white px-2 py-0.5 bg-white/5 border border-white/5 rounded-md">
                      {scoreObj.overallScore}/100
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Pros */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black tracking-wider text-emerald-450 uppercase flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    Strengths & Pros
                  </h4>
                  <ul className="space-y-2">
                    {scoreObj.pros.map((pro, pIdx) => (
                      <li key={pIdx} className="text-xs text-zinc-300 bg-emerald-500/2 border border-emerald-500/5 p-2 px-3 rounded-xl flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span className="leading-relaxed font-medium">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black tracking-wider text-rose-450 uppercase flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5 stroke-[3]" />
                    Weaknesses & Cons
                  </h4>
                  <ul className="space-y-2">
                    {scoreObj.cons.map((con, cIdx) => (
                      <li key={cIdx} className="text-xs text-zinc-300 bg-rose-500/2 border border-rose-500/5 p-2 px-3 rounded-xl flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span className="leading-relaxed font-medium">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
