import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { FileText, GraduationCap, LayoutDashboard, PenBox, ChevronDown, Target, Brain, Globe, Building2, IndianRupee, ListTodo, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

// Custom wrappers for Server Components
const SignedIn = ({ userId, children }) => userId ? <>{children}</> : null;
const SignedOut = ({ userId, children }) => !userId ? <>{children}</> : null;

export default async function Header() {
    const { userId } = await auth();
    if (userId) {
        await checkUser();
    }
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 items-center justify-between px-4 md:px-8 w-full max-w-[1920px] mx-auto">
                <nav className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80 cursor-pointer">
                        <Image
                            src="/logo.png"
                            alt="SageAi Logo"
                            width={250}
                            height={60}
                            className="h-14 w-auto object-contain"
                            priority
                        />
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <SignedIn userId={userId}>
                        <div className="hidden md:flex items-center gap-2 lg:gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 font-semibold text-sm hover:bg-muted px-3 py-2 rounded-lg transition-colors cursor-pointer" suppressHydrationWarning>
                                    <PenBox className="h-4 w-4" />
                                    <span>AI Tools</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[520px] p-4 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl ring-1 ring-white/10">
                                    <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-primary mb-3 px-2">Professional Suite</DropdownMenuLabel>
                                    <DropdownMenuGroup className="grid grid-cols-2 gap-1">
                                        {[
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
                                        ].map((tool) => (
                                            <DropdownMenuItem key={tool.href} asChild className="p-0">
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
                    </SignedIn>

                    <SignedOut userId={userId}>
                        <SignInButton><button className="rounded-full bg-black text-white border border-white/20 hover:bg-zinc-900 shadow-md font-medium text-xs px-5 py-1.5 transition-all active:scale-95">Sign In</button></SignInButton>
                    </SignedOut>

                    <SignedIn userId={userId}>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="md:hidden">
                                <Button variant="ghost" size="icon" suppressHydrationWarning className="cursor-pointer">
                                    <LayoutDashboard className="h-5 w-5" />
                                </Button>
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-10 w-10 ring-2 ring-primary/20 transition-all hover:ring-primary/50",
                                        userButtonPopoverCard: "shadow-xl",
                                        userPreviewMainIdentifier: "font-semibold"
                                    }
                                }}
                            />
                        </div>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}