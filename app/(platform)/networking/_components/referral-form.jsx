"use client";

import { useState, useEffect } from "react";
import { generateReferralMessage } from "@/action/networking";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { 
  Send, 
  Globe, 
  Mail, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  ArrowLeft,
  Users,
  MessageSquare,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

export default function ReferralForm() {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    contactName: "",
    contactRole: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  const handleGenerate = async () => {
    if (!formData.company || !formData.role) {
      toast.error("Company and Role are required.");
      return;
    }

    try {
      setIsGenerating(true);
      const data = await generateReferralMessage(formData);
      setResult(data);
      toast.success("Networking messages generated!");
    } catch (error) {
      toast.error("Failed to generate messages.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generator
          </Button>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
             Ready for Outreach
          </Badge>
        </div>

        <Tabs defaultValue="linkedin" className="w-full">
          <TabsList className="mb-6 h-12 p-1 bg-muted/50 w-full md:w-auto">
            <TabsTrigger value="linkedin" className="flex-1 md:flex-none gap-2 px-6">
              <Globe className="h-4 w-4" /> LinkedIn Invite
            </TabsTrigger>
            <TabsTrigger value="full" className="flex-1 md:flex-none gap-2 px-6">
              <MessageSquare className="h-4 w-4" /> Full Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin">
            <Card className="border-primary/10 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between py-4">
                <div className="space-y-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    LinkedIn Connection Invite
                  </CardTitle>
                  <CardDescription className="text-[10px]">Short version (under 300 chars).</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleCopy(result.linkedinInvite, 'inv')} className="h-8 cursor-pointer">
                  {copiedType === 'inv' ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                  Copy
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="p-4 rounded-xl bg-muted/30 border border-muted font-medium text-sm leading-relaxed">
                   {result.linkedinInvite}
                 </div>
                 <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Character Count: {result.linkedinInvite.length}/300
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="full">
            <Card className="border-primary/10 shadow-xl overflow-hidden">
               <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between py-4">
                <div className="space-y-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Networking / Referral Email
                  </CardTitle>
                  <CardDescription className="text-[10px]">Detailed outreach message.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleCopy(result.fullMessage, 'full')} className="h-8 cursor-pointer">
                  {copiedType === 'full' ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                  Copy
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Subject Line:</span>
                    <div className="p-2 px-3 rounded-lg bg-muted/50 border border-muted text-xs font-bold">{result.subjectLine}</div>
                 </div>
                 <div className="p-5 rounded-xl bg-muted/30 border border-muted text-sm leading-relaxed whitespace-pre-wrap">
                   {result.fullMessage}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-primary/5 border-primary/10">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xs flex items-center gap-2 text-primary uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> Why this works
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {result.tips.map((tip, i) => (
                   <div key={i} className="text-xs flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {tip}
                   </div>
                 ))}
              </CardContent>
           </Card>
           <Card className="bg-muted/10 border-muted">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest">Outreach Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                 {[
                   "Customize the [Name] placeholders",
                   "Check for tone consistency",
                   "Follow up in 5-7 business days",
                 ].map((item, i) => (
                   <div key={i} className="text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {item}
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 shadow-sm border border-primary/20">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold gradient-title">Referral Generator</h1>
        <p className="text-muted-foreground">
          Get the perfect message to land a referral or start a professional conversation.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-lg">Target Contact Details</CardTitle>
          <CardDescription>Enter information about the person and company you're reaching out to.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input 
                  id="company" 
                  placeholder="e.g. Netflix" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  disabled={isGenerating}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="role">Target Role *</Label>
                <Input 
                  id="role" 
                  placeholder="e.g. Product Designer" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={isGenerating}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="name">Contact Name (Optional)</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  disabled={isGenerating}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="crole">Contact Role (Optional)</Label>
                <Input 
                  id="crole" 
                  placeholder="e.g. Engineering Manager" 
                  value={formData.contactRole}
                  onChange={(e) => setFormData({...formData, contactRole: e.target.value})}
                  disabled={isGenerating}
                />
             </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.company || !formData.role}
              className="w-auto px-10 h-12 text-base font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Drafting Networking Message...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Messages
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl bg-muted/30 border border-muted flex items-start gap-3">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-xs text-muted-foreground leading-relaxed">
           The generator uses your current **Resume** to personalize the outreach. Ensure your resume is up-to-date in the Resume section for the best results.
         </p>
      </div>
    </div>
  );
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
