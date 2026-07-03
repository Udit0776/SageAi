"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Radar,
  Coins,
  FileText,
  BadgeCheck,
  Target,
  Building2,
  MessageSquare,
  Link2,
  PenTool,
  Rocket,
  Play,
  Star,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";

const faqItems = [
  {
    question: "What makes Sage AI unique as a career development tool?",
    answer:
      "Sage AI is a comprehensive end-to-end career suite. Unlike simple resume builders, we offer AI interview coaching with tone analysis, salary negotiation simulators, company-specific research tools, and a guide assistant.",
  },
  {
    question: "How does the Salary Negotiation Simulator work?",
    answer:
      "Our simulator puts you in a high-stakes conversation with a 'tough recruiter' AI persona. You'll practice handling low-ball offers and learn how to use data-backed arguments to increase your compensation.",
  },
  {
    question: "What is the 'Company Battle Plan' feature?",
    answer:
      "The Battle Plan tool conducts real-time research on any company you're interested in. It identifies their core values, recent news, and the specific interview questions they are likely to ask.",
  },
  {
    question: "Can Sage AI help me with networking and referrals?",
    answer:
      "Yes! Our Referral Generator scans your resume and the target company to draft personalized LinkedIn connection requests and referral emails to busy professionals.",
  },
  {
    question: "How does Sage AI track my career readiness?",
    answer:
      "The platform features a 'Career Readiness Score' on your dashboard. It monitors your progress across all tools—resume building, interview practice, and skill analysis—to give you a real-time preparation indicator.",
  },
  {
    question: "Is my data secure with Sage AI?",
    answer:
      "Absolutely. We use Clerk for secure authentication and industry-standard encryption for all your professional data. Your privacy and security are our top priorities.",
  },
  {
    question: "How does the AI keep up with market trends?",
    answer:
      "Our engine crawls live job boards and social platforms 24/7, processing over 100k data points daily to ensure our salary and skill advice is accurate to the current hour.",
  },
  {
    question: "Can I use Sage AI for non-tech roles?",
    answer:
      "Yes. While our roots are in tech, our Career Engine has modules specialized for Finance, Marketing, Sales, and Executive Leadership across all sectors.",
  },
];

// High-fidelity CSS-based Dashboard Mockup for the Hero Section
function DashboardMockup() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden shadow-2xl text-left select-none text-foreground font-sans border-t border-border">
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-base-300"></div>
          <div className="h-3 w-3 rounded-full bg-base-300"></div>
          <div className="h-3 w-3 rounded-full bg-base-300"></div>
          <span className="text-muted-foreground text-[10px] font-mono ml-2">
            SAGE-APP-V1.0.4
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-md border border-border">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] text-muted-foreground font-mono">
            sync_completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border h-[340px]">
        {/* Sidebar Nav Mockup */}
        <div className="p-4 space-y-3 hidden md:block col-span-1 bg-muted">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest px-2">
            Workspace
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Overview
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
              AI Interview Coach
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
              Resume Tailor
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
              Job Tracker
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="p-5 col-span-2 space-y-4 overflow-y-auto">
          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono mb-1">
                Career Health Score
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  87%
                </span>
                <span className="text-[9px] text-primary font-mono">
                  +4.2% this wk
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono mb-1">
                Applications Tracked
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  14
                </span>
                <span className="text-[9px] text-primary font-mono">
                  3 active cycles
                </span>
              </div>
            </div>
          </div>

          {/* Action Status Panel */}
          <div className="p-4 rounded-xl border border-border bg-muted space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-muted-foreground">
                Next Action Recommendation
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              "Follow up on your Software Engineer application at Meta. The
              interview cycle is active, and our radar shows internal teams are
              sourcing for backend-specific skillsets."
            </p>
          </div>

          {/* Mini Kanban Board */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-muted-foreground">
              Live Application Funnel
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-muted border border-border space-y-1">
                <div className="text-[8px] text-muted-foreground font-mono">
                  APPLIED
                </div>
                <div className="text-[10px] font-semibold text-foreground truncate">
                  Google
                </div>
                <div className="text-[8px] text-muted-foreground">
                  L4 Software Engineer
                </div>
              </div>
              <div className="p-2 rounded bg-muted border border-border space-y-1">
                <div className="text-[8px] text-muted-foreground font-mono">
                  INTERVIEWING
                </div>
                <div className="text-[10px] font-semibold text-foreground truncate">
                  Apple
                </div>
                <div className="text-[8px] text-muted-foreground">Senior Architect</div>
              </div>
              <div className="p-2 rounded bg-primary/10 border border-primary/20 space-y-1">
                <div className="text-[8px] text-primary font-mono">
                  OFFERED
                </div>
                <div className="text-[10px] font-semibold text-primary truncate">
                  Netflix
                </div>
                <div className="text-[8px] text-primary/80">
                  $155,000/yr
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// High-fidelity CSS-based Chat UI for the Interview Intelligence Card
function InterviewMockup() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card overflow-hidden text-left text-muted-foreground text-xs font-sans h-full shadow-lg border-t border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
          <span className="text-foreground text-[10px] font-mono">
            AI_COACH_SESSION #041
          </span>
        </div>
        <div className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono">
          ACTIVE_RECORDING
        </div>
      </div>
      <div className="p-4 space-y-3.5 overflow-hidden">
        {/* Recruiter Message */}
        <div className="space-y-1">
          <div className="text-[9px] text-accent font-mono uppercase">
            Interviewer (AI)
          </div>
          <div className="p-2.5 rounded-lg bg-muted border border-border text-[10px] leading-relaxed text-foreground">
            "Tell me about a time you optimized a slow API endpoint in your
            previous role."
          </div>
        </div>
        {/* User Response */}
        <div className="space-y-1">
          <div className="text-[9px] text-primary font-mono uppercase">
            Your Response
          </div>
          <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-[10px] leading-relaxed text-foreground">
            "I analyzed a slow search endpoint.{" "}
            <span className="bg-primary/10 text-primary px-0.5 rounded font-mono">
              Situation:
            </span>{" "}
            The API latency was over 2.4s.{" "}
            <span className="bg-primary/10 text-primary px-0.5 rounded font-mono">
              Action:
            </span>{" "}
            I introduced Redis caching and consolidated redundant queries.{" "}
            <span className="bg-primary/10 text-primary px-0.5 rounded font-mono">
              Result:
            </span>{" "}
            Latency dropped to 180ms."
          </div>
        </div>
        {/* Real-time Analysis Card */}
        <div className="p-3 rounded-lg border border-border bg-muted grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[8px] text-muted-foreground font-mono">
              STAR METHOD
            </div>
            <div className="text-xs font-bold text-foreground font-mono">92%</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-muted-foreground font-mono">
              FILLER WORDS
            </div>
            <div className="text-xs font-bold text-primary font-mono">
              0 found
            </div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-muted-foreground font-mono">TONE</div>
            <div className="text-xs font-bold text-accent font-mono">
              Confident
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brand Logo Strip (Replaces the "LIVE MARKET" crypto ticker)
function BrandLogos() {
  return (
    <section className="border-y border-border bg-background py-10 relative z-20 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <p className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by professionals at top technology teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-40 grayscale hover:opacity-75 transition-all duration-300">
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Vercel
          </span>
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Stripe
          </span>
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Linear
          </span>
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Figma
          </span>
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Airbnb
          </span>
          <span className="font-extrabold text-foreground text-base tracking-tighter">
            Sentry
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    // Scroll animation reveal handler
    const observerOptions = {
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-8");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".glass-card").forEach((card) => {
      card.classList.add(
        "transition-all",
        "duration-700",
        "opacity-0",
        "translate-y-8",
      );
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen mesh-gradient text-foreground font-sans overflow-x-hidden relative">
      {/* Grid Overlay */}
      <div className="grid-background opacity-35" />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 md:pt-16 pb-12 overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none opacity-40 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-12">
          {/* Left Hero Details */}
          <div className="space-y-6 text-left">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 font-mono text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Platform Version 1.0 Active
            </div> */}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight tracking-tight uppercase">
              <span className="block text-foreground">Accelerate Your</span>
              <span className="block shimmer-text pb-1.5">Career Growth</span>
              <span className="block text-foreground">With AI Coaching</span>
            </h1>

            <p className="text-muted-foreground text-xs sm:text-sm max-w-md leading-relaxed">
              Optimize your professional assets, practice mock interviews in
              real-time, scan job markets, and secure top-tier salary
              negotiation strategies.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-5 rounded-full text-sm hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all cursor-pointer border-0">
                  Get Started Free
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border border-border text-foreground hover:bg-foreground/5 font-semibold px-8 py-5 rounded-full text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* Right Hero Visual (CSS-Built Dashboard Mockup) */}
          <div className="relative group w-full max-w-2xl mx-auto lg:max-w-none">
            <DashboardMockup />
            {/* Ambient shadow glow */}
            <div className="absolute -z-10 -inset-4 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <BrandLogos />

      {/* Bento Capabilities Grid */}
      <section
        id="features"
        className="py-24 px-6 md:px-8 max-w-7xl mx-auto relative z-20 overflow-hidden"
      >
        <div className="mb-16 text-left relative z-10">
          <span className="font-mono text-[10px] text-primary tracking-widest uppercase block mb-3 font-semibold">
            CORE CAPABILITIES
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase leading-tight text-foreground">
            Features designed for modern builders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 items-start">
          {/* Interview intelligence Bento Card */}
          <div className="md:col-span-4 lg:col-span-4 glass-card shadow-xl p-6 rounded-3xl min-h-[360px] flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="z-10">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">
                Interview Intelligence
              </h3>
              <p className="text-muted-foreground text-[11px] max-w-sm leading-relaxed">
                Real-time mock interview sessions with an AI that analyzes your
                response structure, tone, and checks STAR method alignment.
              </p>
            </div>

            {/* Visual element: Live React/CSS Chat UI mockup */}
            <div className="absolute right-0 bottom-0 w-2/3 md:w-1/2 h-2/3 border-t border-l border-border rounded-tl-2xl overflow-hidden shadow-2xl translate-y-3 translate-x-3 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500">
              <InterviewMockup />
            </div>
          </div>

          {/* Market Radar Bento Card */}
          <div className="md:col-span-2 lg:col-span-2 glass-card shadow-xl p-6 rounded-3xl min-h-[360px] flex flex-col justify-between relative group overflow-hidden border border-border hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Radar className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">
                Market Radar
              </h3>
            </div>

            {/* Animated SVG Graphic (Centered) */}
            <div className="relative w-full aspect-square max-h-36 flex items-center justify-center p-2">
              <svg
                className="w-full h-full max-h-[120px] text-muted-foreground"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient
                    id="radar-glow"
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                  >
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 4 Concentric Dashed Rings */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />

                {/* Crosshairs */}
                <line
                  x1="50"
                  y1="5"
                  x2="50"
                  y2="95"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  strokeDasharray="1 4"
                  opacity="0.4"
                />
                <line
                  x1="5"
                  y1="50"
                  x2="95"
                  y2="50"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  strokeDasharray="1 4"
                  opacity="0.4"
                />

                {/* Rotating Sweeper Hand (Leading) and Trail Cone (Trailing) */}
                <g className="animate-radar-sweep">
                  <path
                    d="M50 50 L50 5 A 45 45 0 0 1 81.8 18.2 Z"
                    fill="url(#radar-glow)"
                  />
                  <line
                    x1="50"
                    y1="50"
                    x2="81.8"
                    y2="18.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="81.8" cy="18.2" r="2" fill="currentColor" />
                </g>

                {/* Animated Blips (sweeper passes over clockwise starting at 12 o'clock) */}
                <circle
                  cx="72"
                  cy="28"
                  r="2.5"
                  fill="currentColor"
                  className="animate-radar-blip-default"
                  style={{ animationDelay: "0.75s" }}
                />
                <circle
                  cx="78"
                  cy="68"
                  r="2"
                  fill="currentColor"
                  className="animate-radar-blip-fade"
                  style={{ animationDelay: "2.5s" }}
                />
                <circle
                  cx="25"
                  cy="32"
                  r="2.5"
                  fill="currentColor"
                  className="animate-radar-blip-fade"
                  style={{ animationDelay: "5.25s" }}
                />
              </svg>
            </div>

            <p className="text-muted-foreground text-[10px] sm:text-[11px] leading-relaxed mt-2 text-left">
              Scan live compensation data, hiring volume, and industry growth
              signals directly matching your skill profile.
            </p>
          </div>

          {/* Small bento cards */}
          <div className="md:col-span-2 lg:col-span-2 glass-card shadow-xl p-5 rounded-2xl flex flex-col gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Coins className="h-4.5 w-4.5 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Salary Negotiator</h4>
            <p className="text-muted-foreground text-[10px] sm:text-[11px] leading-relaxed">
              Real-world simulated roleplay simulations with recruiters to build
              confidence and maximize compensation packages.
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-2 glass-card shadow-xl p-5 rounded-2xl flex flex-col gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileText className="h-4.5 w-4.5 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Resume Engine</h4>
            <p className="text-muted-foreground text-[10px] sm:text-[11px] leading-relaxed">
              Tailor and optimize resumes with ATS-compliant keyword models
              explicitly optimized for the hiring filters.
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-2 glass-card shadow-xl p-5 rounded-2xl flex flex-col gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <BadgeCheck className="h-4.5 w-4.5 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Skill Gap Analysis</h4>
            <p className="text-muted-foreground text-[10px] sm:text-[11px] leading-relaxed">
              Instantly compare job descriptions with your active resume to
              discover missing skills and weekly roadmap tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-muted border-y border-border py-8 px-6 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-border">
          <div className="text-center md:px-4">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-1">
              50+
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Industries Covered
            </div>
          </div>
          <div className="text-center md:px-4">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-1">
              1,000+
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Practice Scenarios
            </div>
          </div>
          <div className="text-center md:px-4">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-1">
              95%
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Score Improvement
            </div>
          </div>
          <div className="text-center md:px-4">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-1">
              24/7
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              AI Co-pilot Availability
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 px-6 md:px-8 max-w-7xl mx-auto relative z-20 scroll-mt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Side */}
          <div className="lg:sticky lg:top-28 h-fit space-y-6 text-left">
            <div>
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase block mb-3 font-semibold">
                THE WORKFLOW
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase leading-tight text-foreground">
                Engineering Your Career Path
              </h2>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-md">
              A comprehensive system mapping out your qualifications, refining
              your profiles, practicing mock interviews, and structuring salary
              offers.
            </p>

            {/* Clean CSS Flow Visual Block */}
            <div className="w-full p-6 bg-muted border border-border rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">
                  SYSTEM FLOW DIAGRAM
                </span>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                  Ready
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    01 / PARSE_RESUME
                  </span>
                  <div className="h-1.5 w-16 bg-primary/20 rounded overflow-hidden">
                    <div className="h-full w-full bg-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    02 / FIT_SCORE_MODEL
                  </span>
                  <div className="h-1.5 w-16 bg-primary/20 rounded overflow-hidden">
                    <div className="h-full w-[85%] bg-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    03 / COACH_SIMULATE
                  </span>
                  <div className="h-1.5 w-16 bg-primary/20 rounded overflow-hidden">
                    <div className="h-full w-[60%] bg-primary animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Process Steps */}
          <div className="space-y-12 relative text-left">
            {/* Connective Line */}
            <div className="absolute left-5 top-0 bottom-0 w-px border-l border-dashed border-border z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 pl-16 group">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-background border border-primary flex items-center justify-center font-mono text-xs text-primary group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
                01
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-foreground">
                Initialize Profile
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Import your professional experience. Our engine parses
                historical data to extract highlights, core skillsets, and key
                milestones.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 pl-16 group">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                02
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-foreground">
                Tailor Materials
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Generate tailored, context-specific resumes and cover letters
                targeted exactly to the culture and systems of elite tech
                companies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 pl-16 group">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:border-indigo-400 group-hover:text-indigo-400 transition-all">
                03
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-foreground">
                Simulate Boardrooms
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Practice in simulated high-pressure recruiter rooms. Get
                real-time analysis on tone, phrasing, structure, and STAR
                parameters.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 pl-16 group">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:border-indigo-400 group-hover:text-indigo-400 transition-all">
                04
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-foreground">
                Maximize Compensation
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Utilize our data-backed negotiation matrices and AI roleplay
                tools to secure compensation packages above standard guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 bg-card border-y border-border relative z-20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase block mb-3 font-semibold">
              USER REPORTS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold uppercase text-foreground">
              Tested by competitive professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="glass-card shadow-xl p-6 rounded-3xl flex flex-col justify-between text-left space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                  SJ
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">
                    Sarah Jenkins
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Senior Dev at Google
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                  "Sage AI's salary negotiator helped me land a package 25%
                  higher than I expected. The live scenario exercises were
                  highly realistic."
                </p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-card shadow-xl p-6 rounded-3xl flex flex-col justify-between text-left space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                  MC
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">
                    Marcus Chen
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Product Lead at Stripe
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                  "The mock interview engine evaluates responses precisely. It
                  identified minor vocabulary slips and structural gaps that had
                  gone unnoticed."
                </p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-card shadow-xl p-6 rounded-3xl flex flex-col justify-between text-left space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                  ER
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">
                    Elena Rodriguez
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    UX Researcher at Netflix
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                  "The resume tailoring matches ATS keywords cleanly. I noticed
                  an immediate increase in recruiter callbacks within a week."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-24 px-6 md:px-8 max-w-5xl mx-auto relative z-20"
      >
        <div className="text-left mb-16">
          <span className="font-mono text-[10px] text-primary tracking-widest uppercase block mb-3 font-semibold">
            FAQ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Column 1 */}
          <div className="space-y-4 text-left">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.slice(0, 4).map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card rounded-2xl px-6 py-1.5 border border-border bg-background hover:border-indigo-500/20 transition-all shadow-sm"
                >
                  <AccordionTrigger className="flex justify-between items-center font-bold text-xs text-foreground hover:no-underline select-none">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-[11px] leading-relaxed mt-2 pb-4 cursor-default">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 text-left">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.slice(4, 8).map((faq, index) => (
                <AccordionItem
                  key={index + 4}
                  value={`item-${index + 4}`}
                  className="glass-card rounded-2xl px-6 py-1.5 border border-border bg-background hover:border-indigo-500/20 transition-all shadow-sm"
                >
                  <AccordionTrigger className="flex justify-between items-center font-bold text-xs text-foreground hover:no-underline select-none">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-[11px] leading-relaxed mt-2 pb-4 cursor-default">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:px-8 max-w-5xl mx-auto relative z-20">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card p-10 md:p-16 shadow-2xl border-t border-border text-left">
          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-xl space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-tight tracking-tight text-foreground">
              Accelerate Your Career Trajectory Today
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-lg">
              Set up your profile, optimize your professional assets, and begin
              training with our AI boardroom coach in less than five minutes.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-5 rounded-full text-xs sm:text-sm hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all cursor-pointer flex items-center gap-2 border-0">
                  Build Your Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
