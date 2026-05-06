"use client";

import { Mic, MicOff, Volume2, VolumeX, Activity, Zap } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

export default function VoiceIndicator({ isListening, isSpeaking, analytics, isSupported }) {
  if (!isSupported) return null;

  const getPaceStatus = (wpm) => {
    if (wpm === 0) return { label: "Waiting...", color: "bg-muted" };
    if (wpm < 100) return { label: "Too Slow", color: "bg-yellow-500" };
    if (wpm > 170) return { label: "Too Fast", color: "bg-yellow-500" };
    return { label: "Perfect Pace", color: "bg-green-500" };
  };

  const pace = getPaceStatus(analytics.speechPace);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/10 p-3 rounded-2xl border border-muted/50 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center relative bg-black border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)] ${isListening ? "ring-2 ring-red-500/50" : isSpeaking ? "ring-2 ring-primary/50" : ""}`}>
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
          )}
          {isListening ? <Mic className="h-4 w-4 text-white" /> : isSpeaking ? <Volume2 className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="space-y-0.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Voice Status</div>
          <div className="text-xs font-bold flex items-center gap-2">
            {isListening ? "Listening..." : isSpeaking ? "AI is Speaking" : "Ready to Listen"}
            {(isListening || isSpeaking) && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-muted hidden sm:block" />

      <div className="flex items-center gap-6">
        <div className="space-y-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" /> Speech Pace
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{analytics.speechPace} <span className="text-[9px] text-muted-foreground">WPM</span></span>
            <Badge className={`${pace.color} text-white border-none text-[9px] h-3.5`}>{pace.label}</Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" /> Fillers
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{analytics.totalFillers}</span>
            {analytics.totalFillers > 5 ? (
               <Badge variant="destructive" className="text-[9px] h-3.5">High</Badge>
            ) : analytics.totalFillers > 0 ? (
               <Badge variant="outline" className="text-[9px] h-3.5">Good</Badge>
            ) : (
               <Badge variant="secondary" className="text-[9px] h-3.5 text-green-500">None</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
