"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
    const imageRef = useRef(null);

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 500;

            if (scrollPosition <= scrollThreshold) {
                // Smoothly interpolate from 20deg to 0deg
                const rotation = 20 - (scrollPosition / scrollThreshold) * 20;
                imageElement.style.transform = `rotateX(${rotation}deg) scale(1)`;
            } else {
                // Ensure it stays at 0deg when scrolled past the threshold
                imageElement.style.transform = `rotateX(0deg) scale(1)`;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <section className="w-full pt-12 md:pt-20 pb-10">
            <div className="space-y-6 text-center">
                <div className="space-y-6 mx-auto">
                    <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
                        Your AI Coach for
                        <br />
                        Professional Success
                    </h1>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                        Gain a personal mentor, career advisor, and AI powered tools for job
                        Success.
                    </p>
                </div>

                <div className="flex justify-center gap-4 relative z-20">
                    <Button
                        asChild
                        size="lg"
                        className="h-12 px-8 text-lg rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href="/dashboard">Get Started</Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="h-12 px-8 text-lg rounded-full font-semibold border-2 transition-all hover:bg-muted active:scale-95"
                    >
                        <Link href="/#how-it-works">Learn More</Link>
                    </Button>
                </div>

                <div className="hero-image-wrapper mt-5 md:mt-6">
                    <div ref={imageRef} className="hero-image">
                        <Image
                            src={"/banner.png"}
                            alt="Banner Sage AI"
                            width={1280}
                            height={720}
                            className="rounded-lg shadow-2xl border mx-auto"
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;