"use client";

import React, { useState, useEffect } from 'react';
import { getOfferComparisons } from '@/action/offer-compare';
import ComparisonForm from './_components/comparison-form';
import ComparisonResult from './_components/comparison-result';
import ComparisonHistory from './_components/comparison-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Sparkles, Loader2, IndianRupee, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function OfferComparePage() {
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await getOfferComparisons();
      setHistory(data);
    } catch (err) {
      toast.error("Failed to load past comparisons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleComparisonGenerated = (newSession) => {
    setActiveSession(newSession);
    setHistory(prev => [newSession, ...prev]);
  };

  const handleDeleteSuccess = (deletedId) => {
    setHistory(prev => prev.filter(s => s.id !== deletedId));
    if (activeSession?.id === deletedId) {
      setActiveSession(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-6xl space-y-8 select-none">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-xl sm:text-2xl font-bold gradient-title flex items-center gap-2">
          <IndianRupee className="h-6 w-6 text-indigo-500" />
          Salary & Offer Comparison Tool
        </h1>
        <p className="text-muted-foreground text-sm">
          Input multiple offers to score, weight, and identify the optimal career blueprint package.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Retrieving past comparisons data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {activeSession ? (
              <ComparisonResult 
                session={activeSession} 
                onBack={() => setActiveSession(null)} 
              />
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10 shrink-0">
                    <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">New Offer Assessment</CardTitle>
                    <CardDescription className="text-[10px]">Add details of 2 or 3 active job offers to compare</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ComparisonForm onComparisonGenerated={handleComparisonGenerated} />
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <ComparisonHistory 
              history={history} 
              activeId={activeSession?.id}
              onSelect={setActiveSession}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
