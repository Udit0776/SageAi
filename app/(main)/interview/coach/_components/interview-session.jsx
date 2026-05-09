"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight, 
  ChevronRight, Brain, Target, Star, MessageSquare, Clock, 
  Lightbulb, Save, XCircle, Heart
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";
import { generateInterviewQuestions, analyzeAnswer, generateSessionReport, saveInterviewSession } from "@/action/interview-coach";
import { toast } from "sonner";
import SessionReport from "./session-report";
import useSpeech from "@/hooks/use-speech";
import VoiceIndicator from "./voice-indicator";
import { Mic, MicOff } from "lucide-react";

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "mixed";
  const role = searchParams.get("role") || "";
  const company = searchParams.get("company") || "";

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const router = useRouter();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isSupported,
    analytics
  } = useSpeech();

  // Sync transcript to userAnswer when listening
  useEffect(() => {
    if (isListening && transcript) {
      setUserAnswer(transcript);
    }
  }, [isListening, transcript]);

  // Speak question when it changes
  useEffect(() => {
    if (voiceMode && questions[currentIdx] && !feedback && !isAnalyzing) {
      speak(questions[currentIdx].question);
    }
  }, [currentIdx, questions, voiceMode, feedback, isAnalyzing, speak]);

  const toggleVoiceMode = () => {
    if (!isSupported) {
      toast.error("Speech is not supported in your browser.");
      return;
    }
    if (voiceMode) {
      stopListening();
      stopSpeaking();
    } else {
      // Auto-start listening if we're enabling voice and AI isn't speaking
      setTimeout(() => {
        if (!isSpeaking) startListening();
      }, 500);
    }
    setVoiceMode(!voiceMode);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const qs = await generateInterviewQuestions(type, role, company);
      setQuestions(qs);
    } catch (error) {
      toast.error("Failed to load questions. Returning to setup.");
      router.push("/interview/coach");
    }
  }, [type, role, company, router]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAnswer(
        questions[currentIdx].question,
        userAnswer,
        questions[currentIdx].category
      );
      setFeedback(result);
      setAllResults(prev => [...prev, {
        question: questions[currentIdx].question,
        userAnswer,
        ...result
      }]);
    } catch (error) {
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer("");
      setFeedback(null);
      setShowHint(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const report = await generateSessionReport(allResults);
      setReportData(report);
      setShowReport(true);
      
      // Auto-save to DB
      await saveInterviewSession({
        type,
        targetRole: role,
        company,
        questions: allResults,
        duration: Math.floor((Date.now() - startTime) / 1000),
        ...report
      });
      toast.success("Interview session saved successfully!");
    } catch (error) {
      toast.error("Failed to generate final report.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">AI is preparing your personalized questions...</p>
      </div>
    );
  }

  if (showReport) {
    return <SessionReport data={reportData} results={allResults} type={type} role={role} />;
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="w-full sm:flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
               <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="hidden md:flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50 h-8 flex items-center">
               <Clock className="h-3 w-3 text-primary mr-1" /> Real-time Mode
            </div>
            <Button 
               variant={voiceMode ? "default" : "outline"} 
               size="sm" 
               onClick={toggleVoiceMode}
               className={`rounded-full px-4 h-8 font-bold transition-all shadow-lg ${voiceMode ? "bg-zinc-800 text-primary border border-primary/50 hover:bg-zinc-700" : "text-muted-foreground"}`}
            >
               {voiceMode ? <Mic className="h-3.5 w-3.5 mr-2 text-primary" /> : <MicOff className="h-3.5 w-3.5 mr-2" />}
               {voiceMode ? "Voice Mode ON" : "Enable Voice"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/interview/coach")} className="shrink-0 text-muted-foreground hover:text-destructive h-8 px-2">
               <XCircle className="h-4 w-4" />
            </Button>
         </div>
      </div>

      {voiceMode && (
         <VoiceIndicator 
            isListening={isListening} 
            isSpeaking={isSpeaking} 
            analytics={analytics} 
            isSupported={isSupported} 
         />
      )}

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="p-8">
            <div className="flex items-start justify-between gap-4">
               <div className="space-y-4 flex-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">
                     {q.category}
                  </Badge>
                  <CardTitle className="text-base sm:text-lg font-bold leading-tight">
                    {q.question}
                  </CardTitle>
               </div>
               <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 hidden sm:block">
                  <Brain className="h-6 w-6 text-primary" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Answer</Label>
                  <div className="flex gap-2">
                     {voiceMode && (
                        <Button 
                           variant="outline" 
                           size="sm" 
                           className={`h-7 text-xs ${isListening ? "bg-red-500 text-white hover:bg-red-600" : "text-primary hover:bg-primary/5"}`}
                           onClick={isListening ? stopListening : startListening}
                           disabled={isAnalyzing || feedback || isSpeaking}
                        >
                           {isListening ? "Stop Listening" : "Start Speaking"}
                        </Button>
                     )}
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-7 text-xs text-primary hover:bg-primary/5"
                       onClick={() => setShowHint(!showHint)}
                     >
                       <Lightbulb className="h-3 w-3 mr-1" /> {showHint ? "Hide Hint" : "Need a Hint?"}
                     </Button>
                  </div>
               </div>
               
               {showHint && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm italic text-primary/80 animate-in fade-in slide-in-from-top-2 duration-300">
                     💡 {q.hints?.[0] || "Focus on being specific and positive."}
                  </div>
               )}

                 <Textarea
                  placeholder="Structure your answer using the STAR method..."
                  className="min-h-[120px] text-[10px] sm:text-xs leading-relaxed bg-muted/20 border-muted focus-visible:ring-primary/50 transition-all"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isAnalyzing || feedback}
               />
            </div>

            {!feedback ? (
              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 text-sm sm:text-base font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={isAnalyzing || !userAnswer.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    AI Coach is Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze & Continue
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   {Object.entries(feedback.scores).map(([key, val]) => (
                      <div key={key} className="bg-muted/30 rounded-xl p-3 text-center border border-muted">
                         <div className="text-[10px] uppercase font-bold text-muted-foreground">{key}</div>
                         <div className="text-xl font-bold">{val}<span className="text-xs text-muted-foreground">/10</span></div>
                      </div>
                   ))}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-6">
                   <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                      <div className="flex items-center gap-2 font-bold text-primary">
                         <Star className="h-5 w-5" />
                         STAR Analysis
                      </div>
                      <div className="flex gap-1">
                         {['S', 'T', 'A', 'R'].map((char, i) => {
                            const keys = ['situation', 'task', 'action', 'result'];
                            const present = feedback.starAnalysis[keys[i]];
                            return (
                               <Badge 
                                 key={char} 
                                 variant={present ? "default" : "outline"} 
                                 className={`w-8 h-8 flex items-center justify-center p-0 rounded-lg text-sm font-black ${present ? "bg-primary" : "text-muted-foreground"}`}
                               >
                                  {char}
                               </Badge>
                            );
                         })}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <div className="text-sm font-bold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Coach's Feedback
                         </div>
                         <p className="text-[10px] text-muted-foreground leading-relaxed">{feedback.feedback}</p>
                      </div>

                      <div className="p-4 bg-white/50 dark:bg-black/50 rounded-xl border border-primary/10 space-y-2">
                         <div className="text-sm font-bold text-primary flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Stronger Version
                         </div>
                         <p className="text-[10px] italic leading-relaxed text-foreground">{feedback.improvedAnswer}</p>
                      </div>
                   </div>
                </div>

                {/* EQ Feedback Section */}
                {feedback.toneAnalysis && (
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-violet-500/10 pb-4">
                      <div className="flex items-center gap-2 font-bold text-violet-400">
                        <Heart className="h-5 w-5" />
                        Emotional Intelligence
                      </div>
                      <Badge 
                        className={`text-xs font-bold border-none ${
                          feedback.toneAnalysis.overallTone === 'confident' || feedback.toneAnalysis.overallTone === 'balanced'
                            ? 'bg-green-500/20 text-green-400'
                            : feedback.toneAnalysis.overallTone === 'passive' || feedback.toneAnalysis.overallTone === 'nervous'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {feedback.toneAnalysis.overallTone}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Confidence', score: feedback.toneAnalysis.confidenceScore, color: 'bg-blue-500' },
                        { label: 'Professionalism', score: feedback.toneAnalysis.professionalismScore, color: 'bg-emerald-500' },
                        { label: 'Empathy', score: feedback.toneAnalysis.empathyScore, color: 'bg-violet-500' },
                      ].map(({ label, score, color }) => (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>
                            <span className="text-xs font-bold">{score}/10</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(score / 10) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {feedback.toneAnalysis.toneBreakdown && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{feedback.toneAnalysis.toneBreakdown}</p>
                    )}

                    {feedback.toneAnalysis.suggestions?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-violet-400">💡 Tone Tips</div>
                        <ul className="space-y-1">
                          {feedback.toneAnalysis.suggestions.map((tip, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-2">
                              <span className="text-violet-400 mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleNext} className="w-full h-12 text-sm sm:text-base font-bold" variant="secondary">
                   {currentIdx === questions.length - 1 ? (
                      isFinishing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finalizing...</> : "See Final Report"
                   ) : (
                      <>Next Question <ChevronRight className="h-4 w-4 ml-2" /></>
                   )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
