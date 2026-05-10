import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import NavActions from "./nav-actions";

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

                <div className="flex items-center gap-2 md:gap-4">
                    <SignedIn userId={userId}>
                        <NavActions />
                    </SignedIn>

                    <SignedOut userId={userId}>
                        <SignInButton><button className="rounded-full bg-black text-white border border-white/20 hover:bg-zinc-900 shadow-md font-medium text-xs px-5 py-1.5 transition-all active:scale-95">Sign In</button></SignInButton>
                    </SignedOut>

                    <SignedIn userId={userId}>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 md:h-10 md:w-10 ring-2 ring-primary/20 transition-all hover:ring-primary/50",
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-semibold"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}