"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { deleteOfferComparison } from '@/action/offer-compare';
import { Trophy, Calendar, Eye, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ComparisonHistory({ history, activeId, onSelect, onDeleteSuccess }) {
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this comparison?")) return;
    try {
      await deleteOfferComparison(id);
      toast.success("Comparison deleted successfully.");
      onDeleteSuccess(id);
    } catch (err) {
      toast.error("Failed to delete comparison.");
    }
  };

  if (!history || history.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 p-6 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary/30" />
        <p className="text-xs">No past comparisons found. Generate one above!</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-primary" />
          Comparison History
        </CardTitle>
        <CardDescription className="text-[10px]">Revisit your past offer evaluations</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        {history.map((session) => {
          const result = session.comparisonData;
          const isSelected = activeId === session.id;
          const dateStr = session.createdAt && !isNaN(new Date(session.createdAt)) 
            ? format(new Date(session.createdAt), "dd MMM yyyy")
            : "Recently";

          // Get names of companies compared
          const comparedCompanies = session.offers.map(o => o.companyName).join(" vs ");

          return (
            <div
              key={session.id}
              onClick={() => onSelect(session)}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-600/10 border-indigo-500/35 shadow-sm shadow-indigo-650/5'
                  : 'bg-[#18181b]/20 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">
                  {comparedCompanies}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span className="text-indigo-400 font-bold">Winner: {result.winner}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white rounded-lg cursor-pointer hover:bg-white/5"
                  onClick={() => onSelect(session)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-500 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-rose-500/10"
                  onClick={(e) => handleDelete(session.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
