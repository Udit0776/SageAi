"use client";

import React, { useEffect, useState } from "react";

export default function HeaderNav() {
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const sections = ["features", "how-it-works", "testimonials", "faq"];
        
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 160; // offset for navbar height + buffer

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Initial run to capture state on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            // Update URL hash cleanly without causing page jumps
            window.history.pushState(null, null, `/#${id}`);
            setActiveSection(id);
        } else {
            // Fallback for navigation when clicking from sub-routes
            window.location.href = `/#${id}`;
        }
    };

    const links = [
        { id: "features", label: "Features" },
        { id: "how-it-works", label: "How It Works" },
        { id: "testimonials", label: "Testimonials" },
        { id: "faq", label: "FAQ" }
    ];

    return (
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => {
                const isActive = activeSection === link.id;
                return (
                    <a
                        key={link.id}
                        href={`/#${link.id}`}
                        onClick={(e) => handleClick(e, link.id)}
                        className={`text-xs uppercase tracking-wider transition-all duration-300 pb-1 border-b-2 font-bold cursor-pointer select-none ${
                            isActive
                                ? "text-indigo-400 border-indigo-400"
                                : "text-zinc-400 border-transparent hover:text-indigo-300"
                        }`}
                    >
                        {link.label}
                    </a>
                );
            })}
        </div>
    );
}
