import React from "react";
import Header from "@/app/components/header";
import AIAssistantBubble from "@/app/components/ai-assistant-bubble";
import ScrollToTop from "@/app/components/scroll-to-top";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <ScrollToTop />
      <main className="min-h-screen">{children}</main>
      <AIAssistantBubble />
      <footer className="bg-muted/50 py-12 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm font-medium">
            Sage AI © {new Date().getFullYear()} • Guide Your Life
          </p>
          <p className="text-[10px] mt-2 opacity-50 tracking-widest uppercase">
            Built with Passion by Udit Sengar
          </p>
        </div>
      </footer>
    </>
  );
}
