"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Paintbrush, Check, Sparkles, Layout, Eye, Info } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const themes = [
  { 
    id: "dark", 
    name: "Sage Dark", 
    desc: "Our custom premium dark slate & indigo theme", 
    isDark: true, 
    colors: { primary: "#6366f1", secondary: "#4f46e5", accent: "#818cf8", bg: "#08080c", text: "#f3f4f6" } 
  },
  { 
    id: "light", 
    name: "Classic Light", 
    desc: "Clean, crisp, and professional light theme", 
    isDark: false, 
    colors: { primary: "#0f172a", secondary: "#475569", accent: "#3b82f6", bg: "#ffffff", text: "#0f172a" } 
  },
  { 
    id: "cupcake", 
    name: "Cupcake", 
    desc: "Sweet pastel pinks, teases, and soft blues", 
    isDark: false, 
    colors: { primary: "#65c3c8", secondary: "#ef9fbc", accent: "#eeaf3a", bg: "#faf7f5", text: "#291334" } 
  },
  { 
    id: "bumblebee", 
    name: "Bumblebee", 
    desc: "Vibrant yellow and deep dark contrast", 
    isDark: false, 
    colors: { primary: "#e0a82e", secondary: "#f9d72f", accent: "#18182f", bg: "#ffffff", text: "#18182f" } 
  },
  { 
    id: "emerald", 
    name: "Emerald", 
    desc: "Deep emerald greens and fresh tones", 
    isDark: false, 
    colors: { primary: "#66cc8a", secondary: "#377cfb", accent: "#ea5234", bg: "#ffffff", text: "#333333" } 
  },
  { 
    id: "synthwave", 
    name: "Synthwave", 
    desc: "Retro-futuristic neon and dark purple", 
    isDark: true, 
    colors: { primary: "#e779c1", secondary: "#58c7fa", accent: "#53c1f5", bg: "#1a103c", text: "#f3f4f6" } 
  },
  { 
    id: "retro", 
    name: "Retro", 
    desc: "Warm vintage sand and amber hues", 
    isDark: false, 
    colors: { primary: "#ef9fbc", secondary: "#dfa573", accent: "#495670", bg: "#ece3ca", text: "#282425" } 
  },
  { 
    id: "cyberpunk", 
    name: "Cyberpunk", 
    desc: "High-tech, low-life yellow and hot pink", 
    isDark: false, 
    colors: { primary: "#ff007f", secondary: "#00f0ff", accent: "#ffe600", bg: "#efe81c", text: "#000000" } 
  },
  { 
    id: "valentine", 
    name: "Valentine", 
    desc: "Romantic pinks and warm roses", 
    isDark: false, 
    colors: { primary: "#e96d7b", secondary: "#a991f7", accent: "#88c0d0", bg: "#fae7cb", text: "#5d3640" } 
  },
  { 
    id: "aqua", 
    name: "Aqua", 
    desc: "Calming deep ocean blues and sandy tones", 
    isDark: false, 
    colors: { primary: "#09ecf3", secondary: "#966fb3", accent: "#ffe999", bg: "#3b8ac4", text: "#ffffff" } 
  },
  { 
    id: "dracula", 
    name: "Dracula", 
    desc: "Classic dark vampire palette with pink accents", 
    isDark: true, 
    colors: { primary: "#ff79c6", secondary: "#bd93f9", accent: "#8be9fd", bg: "#282a36", text: "#f8f8f2" } 
  },
  { 
    id: "nord", 
    name: "Nord", 
    desc: "Cool arctic blues and clean winter grays", 
    isDark: false, 
    colors: { primary: "#5e81ac", secondary: "#81a1c1", accent: "#8fbcbb", bg: "#d8dee9", text: "#2e3440" } 
  },
  { 
    id: "sunset", 
    name: "Sunset", 
    desc: "Warm golden hour gradients and dark night sky", 
    isDark: true, 
    colors: { primary: "#ff8c00", secondary: "#ff4500", accent: "#ffd700", bg: "#1a0d00", text: "#f3f4f6" } 
  },
];

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-primary animate-pulse" />
            <span>Theme Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Personalize your workspace. Select from a variety of light, dark, and vibrant themes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-semibold border border-border shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Active: <strong className="text-foreground capitalize">{currentTheme.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Theme Grid List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold tracking-wide flex items-center gap-2 text-muted-foreground">
            <Layout className="h-4 w-4" />
            <span>Available Themes</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                    isSelected
                      ? "bg-card/40 border-primary shadow-lg scale-[1.01]"
                      : "bg-card/10 border-border/50 hover:border-border hover:bg-card/20"
                  }`}
                  style={{
                    boxShadow: isSelected 
                      ? `0 10px 25px -10px ${t.colors.primary}20, 0 0 15px -3px ${t.colors.primary}10` 
                      : undefined
                  }}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md animate-in zoom-in duration-200">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{t.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        t.isDark 
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700/50" 
                          : "bg-zinc-100 text-zinc-700 border border-zinc-300/50"
                      }`}>
                        {t.isDark ? "Dark" : "Light"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {t.desc}
                    </p>

                    {/* Color Preview strip */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <div className="w-4 h-4 rounded-full border border-foreground/10" style={{ backgroundColor: t.colors.primary }} title="Primary" />
                      <div className="w-4 h-4 rounded-full border border-foreground/10" style={{ backgroundColor: t.colors.secondary }} title="Secondary" />
                      <div className="w-4 h-4 rounded-full border border-foreground/10" style={{ backgroundColor: t.colors.bg }} title="Background" />
                      <div className="w-4 h-4 rounded-full border border-foreground/10" style={{ backgroundColor: t.colors.text }} title="Text" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Workspace Preview Card */}
        <div className="space-y-4">
          <h2 className="text-base font-bold tracking-wide flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>Live Workspace Preview</span>
          </h2>

          <div className="sticky top-16 border border-border/60 rounded-2xl bg-card p-6 shadow-xl space-y-6 transition-all duration-300">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Preview Window</span>
            </div>

            {/* Simulated Workspace Dashboard */}
            <div className="space-y-4">
              {/* Header bar mock */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                <span className="text-xs font-black">Sage AI Dashboard</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">
                  PRO MEMBER
                </span>
              </div>

              {/* Grid content mock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Interviews</span>
                  <div className="text-lg font-extrabold text-foreground">14 / 20</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Match Score</span>
                  <div className="text-lg font-extrabold text-primary">94%</div>
                </div>
              </div>

              {/* Progress bar mock */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="text-muted-foreground">Resume Optimization</span>
                  <span className="text-primary font-bold">85% Complete</span>
                </div>
                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "85%" }} />
                </div>
              </div>

              {/* Form Input mock */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Copilot Prompt</label>
                <input 
                  type="text" 
                  disabled
                  placeholder="Tailor my resume for Google..." 
                  className="w-full text-xs px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none"
                />
              </div>

              {/* Buttons mock */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 text-xs font-bold py-1.5 h-auto">
                  Primary Action
                </Button>
                <Button variant="outline" className="flex-1 text-xs font-bold py-1.5 h-auto bg-transparent">
                  Secondary
                </Button>
              </div>

              {/* Alert box mock */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2 text-[11px] text-foreground">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  The theme is dynamically mapped to both <strong>DaisyUI</strong> components and <strong>Shadcn UI</strong> styling tokens.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
