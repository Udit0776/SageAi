import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { FileText, GraduationCap, LayoutDashboard, PenBox, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

// In Clerk v7, SignedIn/SignedOut are moved or changed, so we use this stable pattern
const SignedIn = ({ userId, children }) => userId ? <>{children}</> : null;
const SignedOut = ({ userId, children }) => !userId ? <>{children}</> : null;

export default async function Header() {
    const { userId } = await auth();
    if (userId) {
        await checkUser();
    }
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 items-center justify-between px-8 w-full max-w-[1920px] mx-auto">
                <nav className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
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
                                <Button variant="ghost" className="flex items-center gap-2 font-semibold text-sm">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 font-semibold text-sm hover:bg-muted px-3 py-2 rounded-lg transition-colors">
                                    <PenBox className="h-4 w-4" />
                                    <span>AI Tools</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Build Your Career</DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/resume" className="flex w-full items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span>Build Resume</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/ai-cover-letter" className="flex w-full items-center gap-2">
                                                <PenBox className="h-4 w-4" />
                                                <span>Cover Letter</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/interview" className="flex w-full items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                <span>Interview Preparation</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </SignedIn>

                    <SignedOut userId={userId}>
                        <SignInButton fallbackRedirectUrl="/dashboard"><button className="rounded-full bg-black text-white border border-white/20 hover:bg-zinc-900 shadow-md font-medium text-xs px-5 py-1.5 transition-all active:scale-95">Sign In</button></SignInButton>
                    </SignedOut>

                    <SignedIn userId={userId}>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="md:hidden">
                                <Button variant="ghost" size="icon" suppressHydrationWarning>
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