import React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-background text-center relative overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Floating Icon */}
                <div className="mb-6 p-4 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]">
                    <Ghost className="w-10 h-10 text-primary animate-pulse" />
                </div>

                {/* Title */}
                <h1 className="text-6xl font-extrabold tracking-tighter gradient-title mb-4 drop-shadow-sm">
                    404
                </h1>

                {/* Subtitle */}
                <h2 className="text-2xl font-bold mb-4 tracking-tight">
                    Lost in the digital void
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-base max-w-[400px] mb-8 leading-relaxed">
                    Oops! It looks like the page you are looking for has vanished, been moved, or never existed in the first place.
                </p>

                {/* Action Button */}
                <Link href="/">
                    <Button className="h-10 px-6 font-semibold rounded-full group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Return to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}