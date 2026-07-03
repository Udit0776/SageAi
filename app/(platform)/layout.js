"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, FileText, Globe, Target, PenBox, GraduationCap, 
  Building2, Brain, IndianRupee, Share2, ListTodo, Users, 
  Menu, X, GitCompare, Palette
} from "lucide-react";
import AIAssistantBubble from "@/app/components/ai-assistant-bubble";

export default function PlatformLayout({ children }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load sidebar preference from local storage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center">
        {/* Empty state during initial mount to prevent layout shift */}
      </div>
    );
  }

  const isOnboarding = pathname === "/onboarding";

  // If onboarding, show a clean centered layout without the sidebar/header shell
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/75 backdrop-blur-md">
          <div className="flex h-12 items-center justify-between px-4 md:px-8 w-full max-w-7xl mx-auto text-xs uppercase font-semibold">
            <Link href="/" className="font-bold text-sm text-white tracking-tight hover:opacity-85 transition-opacity">
              Sage AI
            </Link>
            {isLoaded && user && (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7 ring-2 ring-indigo-500/20",
                  }
                }}
              />
            )}
          </div>
        </header>
        <main className="flex-1 flex flex-col bg-background">
          {children}
        </main>
        <AIAssistantBubble />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resume", label: "Build Resume", icon: FileText },
    { href: "/portfolio", label: "Portfolio Builder", icon: Globe },
    { href: "/ai-tailor", label: "Job Tailor", icon: Target },
    { href: "/ai-cover-letter", label: "Cover Letter", icon: PenBox },
    { href: "/interview", label: "Interview Prep", icon: GraduationCap },
    { href: "/company-intel", label: "Company Intel", icon: Building2 },
    { href: "/skill-gap", label: "Skill Gap Analysis", icon: Brain },
    { href: "/salary-negotiator", label: "Salary Negotiator", icon: IndianRupee },
    { href: "/offer-compare", label: "Compare Offers", icon: GitCompare },
    { href: "/linkedin-optimizer", label: "LinkedIn SEO", icon: Share2 },
    { href: "/job-tracker", label: "AI Job Tracker", icon: ListTodo },
    { href: "/networking", label: "Referral Gen", icon: Users },
    { href: "/theme", label: "Theme Settings", icon: Palette },
  ];

  // Helper to check active state
  const isItemActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Build Breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const breadcrumbMap = {
      dashboard: "Dashboard",
      resume: "Resume Builder",
      portfolio: "Portfolio",
      "ai-tailor": "Job Tailor",
      "ai-cover-letter": "Cover Letter",
      interview: "Interview Prep",
      coach: "AI Coach",
      mock: "Mock Interview",
      "company-intel": "Company Intel",
      "skill-gap": "Skill Gap",
      "salary-negotiator": "Salary Negotiator",
      "linkedin-optimizer": "LinkedIn SEO",
      "job-tracker": "Job Tracker",
      networking: "Referral Generator",
      "offer-compare": "Compare Offers",
      theme: "Theme Settings",
    };

    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const title = breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
      const href = "/" + parts.slice(0, index + 1).join("/");

      return (
        <span key={href} className="flex items-center">
          {index > 0 && <span className="mx-1 text-zinc-650">/</span>}
          {isLast ? (
            <span className="text-zinc-200 font-semibold">{title}</span>
          ) : (
            <Link href={href} className="text-zinc-400 hover:text-zinc-200 transition-colors">
              {title}
            </Link>
          )}
        </span>
      );
    });
  };

  const currentTitle = navItems.find(item => isItemActive(item.href))?.label || "Workspace";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-x-hidden">
      
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border z-40 transition-all duration-300 overflow-x-hidden select-none ${
        isCollapsed ? "w-12" : "w-48"
      }`}>
        {/* Brand Header */}
        <div className={`h-10 flex items-center border-b border-sidebar-border overflow-x-hidden ${
          isCollapsed ? "justify-center px-0" : "justify-between px-3"
        }`}>
          {isCollapsed ? (
            <button 
              onClick={toggleSidebar}
              className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer transition-colors"
              title="Expand Sidebar"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-1.5 select-none font-extrabold text-foreground tracking-tight hover:opacity-85 transition-opacity">
                <span className="h-4.5 w-4.5 rounded-md bg-primary flex items-center justify-center text-[9px] font-black text-primary-foreground shadow-md shrink-0">S</span>
                <span className="text-xs font-bold">Sage AI</span>
              </Link>
              <button 
                onClick={toggleSidebar}
                className="p-0.5 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer transition-colors"
                title="Collapse Sidebar"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-200 group relative ${
                  active 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  active ? "text-primary scale-105" : "text-sidebar-foreground/60 group-hover:scale-105 group-hover:text-sidebar-foreground"
                }`} />
                {!isCollapsed && <span className="text-[12px] tracking-wide truncate">{item.label}</span>}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded bg-popover border border-border text-[9px] text-popover-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 2. Mobile Sidebar Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* 3. Mobile Sidebar Drawer Panel */}
      <aside className={`fixed top-0 left-0 h-screen w-48 bg-sidebar border-r border-sidebar-border z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out overflow-x-hidden select-none ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-10 flex items-center justify-between px-3 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-1.5 font-extrabold text-foreground tracking-tight">
            <span className="h-4.5 w-4.5 rounded-md bg-primary flex items-center justify-center text-[9px] font-black text-primary-foreground">S</span>
            <span className="text-xs font-bold">Sage AI</span>
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-sidebar-foreground/75 hover:text-sidebar-foreground rounded-lg cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <nav className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors duration-200 ${
                  active 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span className="text-[12px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 4. Main Page Right Outlet Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? "md:pl-12" : "md:pl-48"
      }`}>
        
        {/* Top Header Bar */}
        <header className="h-10 border-b border-sidebar-border bg-background/70 backdrop-blur-md sticky top-0 z-30 px-3 flex items-center justify-between relative select-none">
          {/* Left: Mobile hamburger */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted -ml-1 cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* Center: Title / Breadcrumbs (Centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <nav className="hidden sm:flex items-center text-[11px] tracking-wide uppercase font-bold text-muted-foreground font-mono">
              {getBreadcrumbs()}
            </nav>
            <span className="sm:hidden text-xs font-extrabold text-foreground tracking-tight">
              {currentTitle}
            </span>
          </div>
          
          {/* Right: user profile button */}
          <div className="flex items-center gap-2">
            {isLoaded && user && (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-6 w-6 ring-2 ring-primary/20 hover:ring-primary/50 transition-all",
                    userButtonPopoverCard: "shadow-xl border border-border bg-popover text-popover-foreground",
                    userPreviewMainIdentifier: "font-semibold text-xs text-foreground",
                    userPreviewSecondaryIdentifier: "text-[10px] text-muted-foreground"
                  }
                }}
              />
            )}
          </div>
        </header>

        {/* Content Pane Outlet wrapped in platform-container */}
        <main className="flex-1 w-full relative platform-container">
          {children}
        </main>
      </div>
      <AIAssistantBubble />
    </div>
  );
}
