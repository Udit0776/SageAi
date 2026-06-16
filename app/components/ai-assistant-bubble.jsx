"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAssistantResponse } from "@/action/ai-assistant";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
  Sparkles, 
  X, 
  MessageCircle, 
  Send, 
  Loader2, 
  User, 
  Bot
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { toast } from "sonner";

export default function AIAssistantBubble() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm Sage. How can I help you with your career journey today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Hide on focused interview pages
  const isHiddenPage = 
    pathname.includes("/interview/coach/session") || 
    pathname.includes("/interview/mock");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (isHiddenPage) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getAssistantResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast.error("Failed to connect to Sage.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {isOpen && (
        <Card className="w-[320px] sm:w-[350px] md:w-[400px] h-[450px] sm:h-[500px] shadow-2xl border border-white/5 bg-[#09090b]/95 backdrop-blur-md flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 duration-300">
          <CardHeader className="bg-zinc-900 border-b border-white/5 p-3 sm:p-4 text-white flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
               <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
               </div>
               <div>
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight">SAGE AI</CardTitle>
                  <p className="text-[9px] sm:text-[10px] opacity-60 font-medium">Your Universal Career Coach</p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-zinc-400 hover:text-white">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </CardHeader>

          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-zinc-950/20"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user" ? "bg-indigo-600 border-indigo-500/20" : "bg-zinc-900 border-white/5"
                }`}>
                  {msg.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />}
                </div>
                <div className={`max-w-[85%] p-2.5 sm:p-3 rounded-2xl text-[10px] sm:text-xs leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-zinc-900 text-zinc-300 rounded-tl-none border border-white/5"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                 <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
                 </div>
                 <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-white/5 rounded-tl-none shadow-sm">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-zinc-500" />
                 </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-2 sm:p-3 border-t border-white/5 bg-[#09090b]">
            <div className="flex w-full gap-2 items-center">
               <Input 
                 placeholder="Ask me anything..." 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 className="h-9 sm:h-10 text-[10px] sm:text-xs bg-zinc-900/60 border-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                 disabled={isTyping}
               />
               <Button 
                 size="icon" 
                 onClick={handleSend} 
                 disabled={isTyping || !input.trim()}
                 className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer shadow-md bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-indigo-500/10"
               >
                 <Send className="h-3 w-3 sm:h-4 sm:w-4" />
               </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`h-11 w-11 sm:h-14 sm:w-14 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto cursor-pointer bg-indigo-600 hover:bg-indigo-500 hover:scale-105 border border-indigo-400/20 text-white shadow-[0_8px_30px_rgba(99,102,241,0.35)] ${
          isOpen ? "hidden" : "scale-100 opacity-100"
        }`}
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
