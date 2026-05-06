"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { generatePortfolio, updatePortfolioSettings } from "@/action/portfolio";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { Loader2, Globe, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PortfolioBuilder = ({ initialPortfolio }) => {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customUrl, setCustomUrl] = useState(portfolio?.customUrl || "");
  const [isPublished, setIsPublished] = useState(portfolio?.isPublished || false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await toast.promise(generatePortfolio(), {
        loading: "Generating your AI portfolio...",
        success: (newPortfolio) => {
          setPortfolio(newPortfolio);
          setCustomUrl(newPortfolio.customUrl);
          setIsPublished(newPortfolio.isPublished);
          return "Portfolio generated successfully!";
        },
        error: (err) => err.message || "Failed to generate portfolio",
      });
    } catch (error) {
      // Error handled by toast.promise
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!customUrl) {
      toast.error("Custom URL cannot be empty");
      return;
    }
    
    // Clean custom URL
    const cleanUrl = customUrl.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    try {
      setIsSaving(true);
      await toast.promise(
        updatePortfolioSettings({
          customUrl: cleanUrl,
          isPublished,
        }),
        {
          loading: "Saving settings...",
          success: (updated) => {
            setPortfolio(updated);
            setCustomUrl(updated.customUrl);
            return "Settings saved!";
          },
          error: (err) => err.message || "Failed to save settings",
        }
      );
    } catch (error) {
      // Error handled by toast.promise
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!portfolio?.customUrl) return;
    const url = `${window.location.origin}/p/${portfolio.customUrl}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!portfolio) {
    return (
      <div className="px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center px-4">
            <Globe className="w-10 h-10 md:w-12 md:h-12 mx-auto text-primary mb-4 opacity-50" />
            <CardTitle className="text-xl md:text-2xl">Create Your AI Portfolio</CardTitle>
            <CardDescription className="text-sm md:text-base">
              We will analyze your resume and instantly generate a beautiful, responsive portfolio website for you.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8 px-4">
            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Portfolio...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate My Portfolio
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
    );
  }

  // Parse the content if it exists
  const content = portfolio.content ? JSON.parse(portfolio.content) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Visibility & Link</CardTitle>
            <CardDescription>Manage your public portfolio settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Publish Portfolio</Label>
                <p className="text-xs text-muted-foreground">Make your site visible to anyone</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            <div className="space-y-2">
              <Label>Custom URL</Label>
              <div className="flex rounded-md shadow-sm overflow-hidden">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                  /p/
                </span>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="rounded-l-none focus-visible:ring-0 text-sm h-9 md:h-10"
                  placeholder="your-name"
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {isPublished && portfolio.customUrl && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <Label className="mb-2 block">Your Live Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/p/${portfolio.customUrl}`}
                  className="bg-background text-xs"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Link href={`/p/${portfolio.customUrl}`} target="_blank">
                <Button variant="link" className="w-full mt-2 h-auto py-2">
                  View Live Site ↗
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Panel */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Content Preview</CardTitle>
              <CardDescription>What the AI extracted from your resume</CardDescription>
            </div>
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </Button>
          </CardHeader>
          <CardContent>
            {content ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase">Headline</h3>
                  <p className="text-lg font-medium">{content.headline}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase">About Me</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{content.aboutMe}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.skills?.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                   <div>
                     <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Experience</h3>
                     <div className="text-sm">
                       {content.experience?.length} roles extracted
                     </div>
                   </div>
                   <div>
                     <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Projects</h3>
                     <div className="text-sm">
                       {content.projects?.length} projects extracted
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No content found. Try regenerating.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioBuilder;
