"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { 
  FileText, GraduationCap, LayoutDashboard, PenBox, ChevronDown, 
  Target, Brain, Globe, Building2, IndianRupee, ListTodo, Users 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

export default function NavActions() {
  const tools = [
    { href: "/resume", icon: FileText, title: "Build Resume", desc: "AI-powered resume builder" },
    { href: "/portfolio", icon: Globe, title: "Portfolio Builder", desc: "Turn resume into a website" },
    { href: "/ai-tailor", icon: Target, title: "Job Tailor", desc: "Match resume to job desc" },
    { href: "/ai-cover-letter", icon: PenBox, title: "Cover Letter", desc: "Custom letters in seconds" },
    { href: "/interview", icon: GraduationCap, title: "Interview Prep", desc: "Practice with AI feedback" },
    { href: "/interview/coach", icon: Brain, title: "Interview Coach", desc: "Real-time AI coaching" },
    { href: "/company-intel", icon: Building2, title: "Company Intel", desc: "Get insider information" },
    { href: "/skill-gap", icon: Target, title: "Skill Gap", desc: "Identify what to learn" },
    { href: "/salary-negotiator", icon: IndianRupee, title: "Salary Negotiator", desc: "Practice tough negotiations" },
    { href: "/linkedin-optimizer", icon: Globe, title: "LinkedIn SEO", desc: "Rank higher for recruiters" },
    { href: "/job-tracker", icon: ListTodo, title: "AI Job Tracker", desc: "Manage your applications" },
    { href: "/networking", icon: Users, title: "Referral Generator", desc: "Perfect outreach messages" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 font-semibold text-sm hover:bg-muted px-3 py-2 rounded-lg transition-colors cursor-pointer outline-none">
            <PenBox className="h-4 w-4" />
            <span>AI Tools</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[520px] p-4 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl ring-1 ring-white/10">
            <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-primary mb-3 px-2">Professional Suite</DropdownMenuLabel>
            <DropdownMenuGroup className="grid grid-cols-2 gap-1">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild className="p-0 focus:bg-transparent">
                  <Link href={tool.href} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-primary/10 group cursor-pointer border border-transparent hover:border-primary/20">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <tool.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold leading-none">{tool.title}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{tool.desc}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Navigation (Icons Only) */}
      <div className="flex md:hidden items-center gap-1">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <PenBox className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-[400px] p-2 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 px-2">Professional Suite</DropdownMenuLabel>
            <DropdownMenuGroup className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild className="p-0">
                  <Link href={tool.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 group cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <tool.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs font-bold">{tool.title}</div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
