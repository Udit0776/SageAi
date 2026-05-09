"use client";

import { useState, useRef, useEffect } from "react";
import { sendNegotiationMessage, finalizeNegotiation } from "@/action/salary-negotiator";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Send, User, Briefcase, Building2, IndianRupee, Loader2, Sparkles, LogOut } from "lucide-react";
import { toast } from "sonner";
import NegotiationReport from "./negotiation-report";

export default function NegotiationChat({ session: initialSession }) {
  if (!initialSession?.id) {
    console.error("NegotiationChat started without a session ID", initialSession);
  }
  const [session, setSession] = useState(initialSession);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.conversation]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !session?.id) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const updatedSession = await sendNegotiationMessage(
        session.id,
        userMessage,
        session.conversation
      );
      setSession(updatedSession);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndNegotiation = async () => {
    try {
      setIsFinishing(true);
      const finalSession = await finalizeNegotiation(session.id, session.conversation);
      setSession(finalSession);
      setShowReport(true);
    } catch (error) {
      toast.error("Failed to generate report.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (showReport) {
    return <NegotiationReport session={session} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Session Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-muted backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              {session.company || "Direct Negotiation"}
              <Badge variant="secondary" className="text-[10px] h-4">
                {session.targetRole}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-3">
               <span className="flex items-center gap-1">
                 <IndianRupee className="h-3 w-3" /> Target: ₹{Number(session?.expectedSalary || 0).toLocaleString()}
               </span>
               {session.initialOffer && (
                 <span className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" /> Initial Offer: ₹{Number(session.initialOffer).toLocaleString()}
                 </span>
               )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEndNegotiation} 
          disabled={isFinishing || isLoading}
          className="cursor-pointer"
        >
          {isFinishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
          Finish & Review
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="border-primary/10 shadow-xl min-h-[500px] flex flex-col bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[600px]" ref={scrollRef}>
          {(session.conversation || []).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 text-foreground border border-muted rounded-tl-none"}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-muted/30 border border-muted">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="p-6 border-t border-primary/10 bg-primary/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-4"
          >
            <Input
              placeholder="Type your counter-argument or response..."
              className="flex-1 bg-background border-primary/10 h-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isFinishing}
            />
            <Button 
              type="submit" 
              className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20 cursor-pointer"
              disabled={!input.trim() || isLoading || isFinishing}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
             <Sparkles className="h-3 w-3 text-primary" />
             AI recruiter analyzes your tone, logic, and data points.
          </div>
        </div>
      </Card>
    </div>
  );
}
