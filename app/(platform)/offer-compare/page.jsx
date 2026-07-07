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
                <ComparisonForm onComparisonGenerated={handleComparisonGenerated} />
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
