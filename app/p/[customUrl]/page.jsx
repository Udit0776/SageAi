import React from "react";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import { Github, Linkedin, Mail, Code2, Briefcase, GraduationCap, ArrowRight } from "lucide-react";

export async function generateMetadata({ params }) {
  const { customUrl } = await params;
  const portfolio = await db.portfolio.findUnique({
    where: { customUrl },
    include: { user: true }
  });

  if (!portfolio || !portfolio.isPublished) {
    return { title: "Portfolio Not Found" };
  }

  return {
    title: `${portfolio.user.name && portfolio.user.name !== "null null" ? portfolio.user.name : "Portfolio"} | Sage AI`,
    description: "Generated with Sage AI",
  };
}

export default async function PublicPortfolioPage({ params }) {
  const { customUrl } = await params;

  const portfolio = await db.portfolio.findUnique({
    where: { customUrl },
    include: { user: true }
  });

  if (!portfolio || !portfolio.isPublished) {
    notFound();
  }

  const content = portfolio.content ? JSON.parse(portfolio.content) : null;

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h1 className="text-2xl font-bold">Portfolio is empty.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
            {portfolio.user.name && portfolio.user.name !== "null null" ? portfolio.user.name : "Portfolio"}
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`mailto:${content.contactEmail || portfolio.user.email}`}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Mail className="w-4 h-4 mr-2" /> Contact Me
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="rounded-full">Build Yours <ArrowRight className="w-3 h-3 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-24 space-y-24">
        
        {/* Hero Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 py-1.5 px-4 rounded-full">
            Available for new opportunities
          </Badge>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight lg:leading-[1.1]">
            {content.headline}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {content.aboutMe}
          </p>
          <div className="flex items-center gap-4 pt-4">
            {content.contactEmail && (
              <Link href={`mailto:${content.contactEmail}`}>
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/25">
                  Get in touch
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Technical Arsenal</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {content.skills?.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm bg-secondary/50 hover:bg-secondary/80 transition-colors border border-border/50 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        {content.experience && content.experience.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Experience</h2>
            </div>
            <div className="space-y-10">
              {content.experience.map((exp, index) => (
                <div key={index} className="relative pl-6 sm:pl-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{exp.role}</h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded w-fit">
                      {exp.duration}
                    </span>
                  </div>
                  <div className="text-lg text-primary/80 font-medium mb-3">{exp.company}</div>
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {content.projects && content.projects.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {content.projects.map((project, index) => (
                <div 
                  key={index} 
                  className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                >
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-10 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {portfolio.user.name && portfolio.user.name !== "null null" ? portfolio.user.name : "Sage AI User"}. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built with <Link href="/" className="text-primary hover:underline font-medium">Sage AI</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
