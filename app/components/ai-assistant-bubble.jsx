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
      const response = await getAssistantResponse([...messages, userMessage]);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast.error("Sage is currently analyzing a high volume of requests. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {isOpen && (
        <Card className="w-[320px] sm:w-[350px] md:w-[400px] h-[450px] sm:h-[500px] shadow-2xl border border-border bg-base-100/95 backdrop-blur-md flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 duration-300">
          <CardHeader className="bg-base-200 border-b border-border p-3 sm:p-4 text-base-content flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
               <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
               </div>
               <div>
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight">SAGE AI</CardTitle>
                  <p className="text-[9px] sm:text-[10px] opacity-60 font-medium">Your Universal Career Coach</p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-base-300 rounded-full transition-colors cursor-pointer text-base-content/60 hover:text-base-content">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </CardHeader>

          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-base-100/50"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user" ? "bg-primary border-primary/20" : "bg-base-200 border-border"
                }`}>
                  {msg.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-content" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
                </div>
                <div className={`max-w-[85%] p-2.5 sm:p-3 rounded-2xl text-[10px] sm:text-xs leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-content rounded-tr-none" 
                    : "bg-base-200 text-base-content rounded-tl-none border border-border"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                 <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-base-200 border border-border flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                 </div>
                 <div className="p-2.5 sm:p-3 rounded-2xl bg-base-200 border border-border rounded-tl-none shadow-sm">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-base-content/50" />
                 </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-2 sm:p-3 border-t border-border bg-base-100">
            <div className="flex w-full gap-2 items-center">
               <Input 
                 placeholder="Ask me anything..." 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 className="h-9 sm:h-10 text-[10px] sm:text-xs bg-base-200 border-none focus-visible:ring-1 focus-visible:ring-primary"
                 disabled={isTyping}
               />
               <Button 
                 size="icon" 
                 onClick={handleSend} 
                 disabled={isTyping || !input.trim()}
                 className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer shadow-md bg-primary hover:brightness-110 text-primary-content border-0 shadow-primary/20"
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
        className={`h-11 w-11 sm:h-14 sm:w-14 rounded-full shadow-lg shadow-primary/30 transition-all duration-300 pointer-events-auto cursor-pointer bg-primary hover:brightness-110 hover:scale-105 border border-primary/20 text-primary-content ${
          isOpen ? "hidden" : "scale-100 opacity-100"
        }`}
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
