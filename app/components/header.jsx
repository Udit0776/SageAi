import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import NavActions from "./nav-actions";
import HeaderNav from "./header-nav";
import ThemeDropdown from "./theme-dropdown";

// Custom wrappers for Server Components
const SignedIn = ({ userId, children }) => userId ? <>{children}</> : null;
const SignedOut = ({ userId, children }) => !userId ? <>{children}</> : null;

export default async function Header() {
    const { userId } = await auth();
    if (userId) {
        await checkUser();
    }
    
    return (
        <header className="sticky top-0 z-50 w-full border-b border-base-content/10 bg-base-100/75 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 md:px-8 w-full max-w-7xl mx-auto relative">
                <div className="flex items-center">
                    <Link href="/" className="font-extrabold text-xl sm:text-2xl text-base-content tracking-tight hover:opacity-85 transition-opacity select-none">
                        Sage AI
                    </Link>
                </div>
                
                {/* Navigation Links - Centered Client Component */}
                <HeaderNav />

                <div className="flex items-center gap-2 md:gap-4">
                    <ThemeDropdown />
                    
                    <SignedIn userId={userId}>
                        <NavActions />
                    </SignedIn>

                    <SignedOut userId={userId}>
                        <div className="flex items-center gap-4">
                            <SignInButton mode="modal"><span><button className="hidden md:block text-base-content/60 hover:text-base-content font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 bg-transparent border-0">Sign In</button></span></SignInButton>
                            <SignUpButton mode="modal"><span><button className="bg-primary text-primary-content font-bold px-6 py-2 rounded-full text-xs uppercase tracking-wider hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer active:scale-95 border-0">Get Started</button></span></SignUpButton>
                        </div>
                    </SignedOut>

                    <SignedIn userId={userId}>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8 ring-2 ring-indigo-500/20 transition-all hover:ring-indigo-500/50",
                                    userButtonPopoverCard: "shadow-xl border border-white/5 bg-[#09090b]",
                                    userPreviewMainIdentifier: "font-semibold text-white",
                                    userPreviewSecondaryIdentifier: "text-muted-foreground"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}