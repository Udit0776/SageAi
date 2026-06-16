"use client";

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { compareOffers } from '@/action/offer-compare';
import { Plus, Trash2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ComparisonForm({ onComparisonGenerated }) {
  const [offers, setOffers] = useState([
    { companyName: '', roleTitle: '', baseSalary: '', equityBonus: '', workModel: 'HYBRID', location: '', growthPotential: 3 },
    { companyName: '', roleTitle: '', baseSalary: '', equityBonus: '', workModel: 'REMOTE', location: '', growthPotential: 3 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleFieldChange = (index, field, val) => {
    const updated = [...offers];
    updated[index] = { ...updated[index], [field]: val };
    setOffers(updated);
  };

  const addOfferSlot = () => {
    if (offers.length >= 3) {
      toast.info("You can compare up to 3 offers side-by-side.");
      return;
    }
    setOffers([
      ...offers,
      { companyName: '', roleTitle: '', baseSalary: '', equityBonus: '', workModel: 'HYBRID', location: '', growthPotential: 3 },
    ]);
  };

  const removeOfferSlot = (index) => {
    if (offers.length <= 2) {
      toast.info("You must compare at least 2 offers.");
      return;
    }
    setOffers(offers.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    for (let i = 0; i < offers.length; i++) {
      const off = offers[i];
      if (!off.companyName.trim()) {
        toast.error(`Company name is missing for Offer #${i+1}`);
        return;
      }
      if (!off.roleTitle.trim()) {
        toast.error(`Role title is missing for Offer #${i+1}`);
        return;
      }
      if (!off.baseSalary || isNaN(parseFloat(off.baseSalary)) || parseFloat(off.baseSalary) <= 0) {
        toast.error(`Please provide a valid base salary for Offer #${i+1}`);
        return;
      }
      if (off.equityBonus !== '' && (isNaN(parseFloat(off.equityBonus)) || parseFloat(off.equityBonus) < 0)) {
        toast.error(`Equity/Bonus cannot be negative for Offer #${i+1}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    // Fun loading text changes
    const loadingTexts = [
      "Weighing base salaries and equity weights...",
      "Evaluating work-life flexibility and work models...",
      "Simulating career growth trajectories and growth potential...",
      "Running cost-of-living index offsets...",
      "Consulting Sage AI Negotiator models...",
    ];
    
    let textIdx = 0;
    setLoadingStep(loadingTexts[0]);
    const interval = setInterval(() => {
      textIdx = (textIdx + 1) % loadingTexts.length;
      setLoadingStep(loadingTexts[textIdx]);
    }, 1500);

    try {
      // Parse numbers cleanly before passing to Server Action
      const parsedOffers = offers.map(o => ({
        ...o,
        baseSalary: parseFloat(o.baseSalary),
        equityBonus: parseFloat(o.equityBonus) || 0,
        growthPotential: parseInt(o.growthPotential, 10),
      }));

      const session = await compareOffers(parsedOffers);
      toast.success("AI offer comparison generated successfully!");
      onComparisonGenerated(session);
    } catch (err) {
      toast.error(err.message || "Failed to compare offers. Please try again.");
    } finally {
      clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 p-8 flex flex-col items-center justify-center text-center gap-4 py-16">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <div className="space-y-1">
          <h3 className="font-bold text-white uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
            <Sparkles className="h-4 w-4 text-primary" />
            Analyzing Job Offers
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
            {loadingStep}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {offers.map((offer, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 relative flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/10">
                    {index + 1}
                  </span>
                  Offer {index + 1}
                </CardTitle>
                <CardDescription className="text-[10px]">Enter package criteria below</CardDescription>
              </div>
              {offers.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                  onClick={() => removeOfferSlot(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-1 flex-1">
              {/* Company & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Company</Label>
                  <Input
                    placeholder="e.g. Google"
                    value={offer.companyName}
                    onChange={(e) => handleFieldChange(index, 'companyName', e.target.value)}
                    className="h-8.5 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Role Title</Label>
                  <Input
                    placeholder="e.g. SDE II"
                    value={offer.roleTitle}
                    onChange={(e) => handleFieldChange(index, 'roleTitle', e.target.value)}
                    className="h-8.5 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Salary & Equity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Base Salary (INR/yr)</Label>
                  <Input
                    placeholder="e.g. 1500000"
                    type="number"
                    min="0"
                    value={offer.baseSalary}
                    onChange={(e) => handleFieldChange(index, 'baseSalary', e.target.value)}
                    className="h-8.5 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Equity/Bonus (Optional)</Label>
                  <Input
                    placeholder="e.g. 200000 (Optional)"
                    type="number"
                    min="0"
                    value={offer.equityBonus}
                    onChange={(e) => handleFieldChange(index, 'equityBonus', e.target.value)}
                    className="h-8.5 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Work Model & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Work Model</Label>
                  <Select
                    value={offer.workModel}
                    onValueChange={(val) => handleFieldChange(index, 'workModel', val)}
                  >
                    <SelectTrigger className="h-8.5 text-xs bg-muted/30 border-none focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE" className="text-xs">Remote</SelectItem>
                      <SelectItem value="HYBRID" className="text-xs">Hybrid</SelectItem>
                      <SelectItem value="ONSITE" className="text-xs">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Location</Label>
                  <Input
                    placeholder="e.g. Bangalore"
                    value={offer.location}
                    onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
                    className="h-8.5 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Growth Potential */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
                  <Label className="text-[10px]">Growth Potential</Label>
                  <span className="text-indigo-400 font-black">{offer.growthPotential}/5</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleFieldChange(index, 'growthPotential', num)}
                      className={`flex-1 h-7.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        offer.growthPotential === num
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/30'
                          : 'bg-[#18181b]/30 border-white/5 text-zinc-400 hover:bg-white/[0.02]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Offer Placeholder Card */}
        {offers.length < 3 && (
          <Card 
            type="button"
            onClick={addOfferSlot}
            className="border border-dashed border-primary/20 bg-primary/2 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/45 transition-all duration-300 min-h-[300px]"
          >
            <Plus className="h-8 w-8 text-primary/60 mb-2" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Third Offer</h4>
            <p className="text-[10px] text-muted-foreground max-w-[150px] mt-1 leading-normal">
              Compare 3 jobs concurrently to maximize analysis resolution.
            </p>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-10 px-6 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
        >
          Compare Offers <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
