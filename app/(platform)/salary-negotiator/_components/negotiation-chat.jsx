"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendNegotiationMessage, finalizeNegotiation } from "@/action/salary-negotiator";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Send, User, Briefcase, Building2, IndianRupee, Loader2, Sparkles, LogOut, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import NegotiationReport from "./negotiation-report";
import useSpeech from "@/hooks/use-speech";
import VoiceIndicator from "@/app/(platform)/interview/coach/_components/voice-indicator";

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

  const [voiceMode, setVoiceMode] = useState(false);
  const [manuallyStopped, setManuallyStopped] = useState(false);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isSupported,
    analytics,
    voices,
    selectedVoiceName,
    changeVoice,
    resetTranscript,
    setTranscriptText
  } = useSpeech();

  // Sync transcript to input when listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  // Speak the recruiter's message when it changes
  useEffect(() => {
    const conversation = session.conversation || [];
    const lastMsg = conversation[conversation.length - 1];
    if (voiceMode && lastMsg && lastMsg.role !== "user" && !isLoading && !isFinishing) {
      speak(lastMsg.message);
    }
  }, [session.conversation, voiceMode, speak, isLoading, isFinishing]);

  // Auto-start listening 2 seconds after AI is done speaking, unless manually paused
  useEffect(() => {
    const conversation = session.conversation || [];
    const lastMsg = conversation[conversation.length - 1];
    const isRecruiterTurn = lastMsg && lastMsg.role !== "user";

    if (voiceMode && isRecruiterTurn && !isSpeaking && !isLoading && !isListening && !manuallyStopped && !isFinishing) {
      const timer = setTimeout(() => {
        startListening();
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [voiceMode, isSpeaking, isLoading, isListening, manuallyStopped, isFinishing, session.conversation, startListening]);

  const toggleVoiceMode = () => {
    if (!isSupported) {
      toast.error("Speech is not supported in your browser.");
      return;
    }
    if (voiceMode) {
      stopListening();
      stopSpeaking();
    } else {
      setManuallyStopped(false);
    }
    setVoiceMode(!voiceMode);
  };

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

    // Stop speaking/listening during transmission
    stopListening();
    stopSpeaking();
    setManuallyStopped(false);
    resetTranscript();

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
    stopListening();
    stopSpeaking();
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
        
        {/* Voice controls and actions */}
        <div className="flex items-center gap-3">
           {voiceMode && voices.length > 0 && (
             <select
               value={selectedVoiceName}
               onChange={(e) => changeVoice(e.target.value)}
               className="h-8 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 text-[10px] font-bold text-zinc-400 outline-none hover:bg-zinc-700/50 hover:text-white transition-all cursor-pointer max-w-[140px] truncate"
               title="Select AI Voice"
             >
               {voices.map((voice) => (
                 <option key={voice.name} value={voice.name} className="bg-[#09090b] text-zinc-300">
                   {voice.name.replace("Microsoft", "MS").replace("Google", "AI")}
                 </option>
               ))}
             </select>
           )}
           <Button 
              variant={voiceMode ? "default" : "outline"} 
              size="sm" 
              onClick={toggleVoiceMode}
              className={`rounded-full px-4 h-8 font-bold transition-all shadow-lg ${voiceMode ? "bg-zinc-800 text-primary border border-primary/50 hover:bg-zinc-700" : "text-muted-foreground"}`}
           >
              {voiceMode ? <Mic className="h-3.5 w-3.5 mr-2 text-primary" /> : <MicOff className="h-3.5 w-3.5 mr-2" />}
              {voiceMode ? "Voice Mode ON" : "Enable Voice"}
           </Button>
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
      </div>

      {/* Voice feedback panel */}
      {voiceMode && (
         <VoiceIndicator 
            isListening={isListening} 
            isSpeaking={isSpeaking} 
            analytics={analytics} 
            isSupported={isSupported} 
         />
      )}

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
            <div className="flex-1 relative flex items-center">
              <Input
                placeholder="Type your counter-argument or response..."
                className="flex-1 bg-background border-primary/10 h-12 pr-24"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setTranscriptText(e.target.value);
                }}
                disabled={isLoading || isFinishing}
              />
              {voiceMode && (
                <Button 
                   type="button"
                   variant="ghost" 
                   size="sm" 
                   className={`absolute right-2 h-8 text-xs font-bold ${isListening ? "bg-red-500 text-white hover:bg-red-600" : "text-primary hover:bg-primary/5"}`}
                   onClick={isListening ? () => { setManuallyStopped(true); stopListening(); } : () => { setManuallyStopped(false); startListening(); }}
                   disabled={isLoading || isFinishing || isSpeaking}
                >
                   {isListening ? "Stop" : "Speak"}
                </Button>
              )}
            </div>
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
