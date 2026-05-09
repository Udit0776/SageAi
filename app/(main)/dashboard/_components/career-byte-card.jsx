"use client";

import { useState, useEffect } from "react";
import { getDailyCareerByte } from "@/action/career-byte";
import { Card, CardContent } from "@/app/components/ui/card";
import { Lightbulb, HelpCircle, TrendingUp, Zap, Sparkles, X } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

export default function CareerByteCard() {
  const [byte, setByte] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchByte = async () => {
      try {
        const data = await getDailyCareerByte();
        setByte(data);
      } catch (error) {
        console.error("Failed to fetch byte");
      }
    };
    fetchByte();
  }, []);

  if (!byte || !isVisible) return null;

  const getIcon = () => {
    switch (byte.type) {
      case "tip": return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "question": return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case "trend": return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "motivation": return <Zap className="h-5 w-5 text-violet-500" />;
      default: return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getBg = () => {
    switch (byte.type) {
      case "tip": return "bg-yellow-500/5 border-yellow-500/10";
      case "question": return "bg-blue-500/5 border-blue-500/10";
      case "trend": return "bg-emerald-500/5 border-emerald-500/10";
      case "motivation": return "bg-violet-500/5 border-violet-500/10";
      default: return "bg-primary/5 border-primary/10";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className={`relative overflow-hidden border shadow-sm ${getBg()}`}>
        <div className="absolute top-0 right-0 p-1">
           <button 
             onClick={() => setIsVisible(false)}
             className="p-1 hover:bg-muted/50 rounded-full transition-colors text-muted-foreground cursor-pointer"
           >
             <X className="h-3 w-3" />
           </button>
        </div>
        <CardContent className="p-4 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-background/50 border border-muted flex items-center justify-center shrink-0 shadow-sm">
            {getIcon()}
          </div>
          <div className="space-y-1 pr-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Byte</span>
                <Badge variant="outline" className="text-[8px] h-3 px-1 uppercase font-bold border-muted-foreground/30 text-muted-foreground">
                   {byte.type}
                </Badge>
             </div>
             <h4 className="text-[13px] font-bold leading-tight">{byte.title}</h4>
             <p className="text-[11px] text-muted-foreground leading-relaxed">{byte.content}</p>
          </div>
        </CardContent>
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      </Card>
    </div>
  );
}
