"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight, 
  ChevronRight, Brain, Target, Star, MessageSquare, Clock, 
  Lightbulb, Save, XCircle, Heart, Camera, CameraOff, Mic, MicOff
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { generateInterviewQuestions, analyzeAnswer, generateSessionReport, saveInterviewSession } from "@/action/interview-coach";
import { toast } from "sonner";
import SessionReport from "./session-report";
import useSpeech from "@/hooks/use-speech";
import VoiceIndicator from "./voice-indicator";
import Image from "next/image";

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const userImageUrl = user?.imageUrl || "/ai-coach.png";
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
  const [manuallyStopped, setManuallyStopped] = useState(false);
  const router = useRouter();

  const [isIntro, setIsIntro] = useState(true);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState("/Ai Avatar.jpg");
  
  const videoRef = useRef(null);
  const lastSpokenQuestionIdx = useRef(-1);
  const lastSpokenFeedbackRef = useRef(null);

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
    setTranscriptText,
    hasMicError
  } = useSpeech();

  // Handle Webcam Stream
  useEffect(() => {
    let mediaStream = null;
    if (isCameraOn && !isIntro) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          mediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsCameraOn(false);
          toast.error("Could not access camera. Please check permissions.");
        });
    }
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, isIntro]);

  // Sync transcript to userAnswer when listening
  useEffect(() => {
    if (isListening && transcript) {
      setUserAnswer(transcript);
    }
  }, [isListening, transcript]);

  // Speak question when it changes, but only after intro has played
  useEffect(() => {
    if (voiceMode && questions[currentIdx] && !feedback && !isAnalyzing && hasIntroPlayed) {
      if (lastSpokenQuestionIdx.current !== currentIdx) {
        lastSpokenQuestionIdx.current = currentIdx;
        
        if (currentIdx === 0) {
          speak("Hello! I'm Eesha, your AI interview coach. It's great to meet you, and I'm looking forward to our session today. Let's get started with your first question. " + questions[currentIdx].question);
        } else {
          speak(questions[currentIdx].question);
        }
      }
    }
  }, [currentIdx, questions, voiceMode, feedback, isAnalyzing, speak, hasIntroPlayed]);

  // Speak feedback when it arrives
  useEffect(() => {
    if (voiceMode && feedback && feedback.feedback) {
      if (lastSpokenFeedbackRef.current !== feedback.feedback) {
        lastSpokenFeedbackRef.current = feedback.feedback;
        speak(feedback.feedback);
      }
    }
  }, [feedback, voiceMode, speak]);

  // Auto-start listening 2 seconds after AI is done speaking (or intro), unless manually paused or mic failed
  useEffect(() => {
    if (voiceMode && !isSpeaking && !isAnalyzing && !feedback && !isListening && !manuallyStopped && !hasMicError && hasIntroPlayed) {
      const timer = setTimeout(() => {
        startListening();
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [voiceMode, isSpeaking, isAnalyzing, feedback, isListening, manuallyStopped, hasMicError, startListening, hasIntroPlayed]);

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

    stopListening();
    stopSpeaking();
    setManuallyStopped(false);

    const questionWords = userAnswer.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = questionWords.length;
    const speechStats = {
      fillerWords: voiceMode ? { ...analytics.fillerWords } : {},
      speechPace: voiceMode ? analytics.speechPace : 0,
      totalFillers: voiceMode ? analytics.totalFillers : 0,
      wordCount,
      voiceModeActive: voiceMode
    };

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
        speechStats,
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
      setManuallyStopped(false);
      resetTranscript();
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

      let totalWords = 0;
      let totalFillers = 0;
      const combinedFillerBreakdown = {};
      let totalSpeakingTimeMinutes = 0;

      allResults.forEach(r => {
        const stats = r.speechStats;
        if (stats && stats.voiceModeActive) {
          totalWords += stats.wordCount;
          totalFillers += stats.totalFillers;
          
          if (stats.fillerWords) {
            Object.entries(stats.fillerWords).forEach(([word, count]) => {
              combinedFillerBreakdown[word] = (combinedFillerBreakdown[word] || 0) + count;
            });
          }

          if (stats.speechPace > 0) {
            totalSpeakingTimeMinutes += stats.wordCount / stats.speechPace;
          }
        }
      });

      const fillerWordCount = totalFillers;
      const fillerWordBreakdown = combinedFillerBreakdown;
      let averageWPM = null;
      let fillerWordRate = null;

      if (totalSpeakingTimeMinutes > 0) {
        averageWPM = Math.round(totalWords / totalSpeakingTimeMinutes);
        fillerWordRate = parseFloat((totalFillers / totalSpeakingTimeMinutes).toFixed(2));
      }
      
      await saveInterviewSession({
        type,
        targetRole: role,
        company,
        questions: allResults,
        duration: Math.floor((Date.now() - startTime) / 1000),
        fillerWordCount,
        fillerWordRate,
        averageWPM,
        fillerWordBreakdown,
        ...report
      });
      toast.success("Interview session saved successfully!");
    } catch (error) {
      toast.error("Failed to generate final report.");
    } finally {
      setIsFinishing(false);
    }
  };

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">AI is preparing your personalized questions...</p>
      </div>
    );
  }

  // Final report state
  if (showReport) {
    return <SessionReport data={reportData} results={allResults} type={type} role={role} />;
  }

  // Intro State
  if (isIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-1rem)] gap-8 max-w-lg mx-auto text-center py-8">
         <div className="relative">
           {isSpeaking && (
             <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
           )}
            <div className={`relative w-48 h-48 rounded-full p-1.5 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 ${isSpeaking ? 'scale-105 shadow-2xl shadow-primary/40' : 'shadow-lg'}`}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-background relative bg-zinc-900">
                <img src={avatarSrc} alt="AI Coach" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/ai-coach.png"; }} />
              </div>
            </div>
         </div>
         <div className="space-y-3">
           <h2 className="text-3xl font-bold">Meet Eesha, Your AI Coach.</h2>
           <p className="text-muted-foreground text-sm leading-relaxed">
             Get ready for a realistic interview experience. Eesha will ask you questions tailored to your role at {company || "your target company"}. Enable your camera and microphone for real-time feedback on your speech and expressions.
           </p>
         </div>
         <div className="flex gap-4 w-full">
           <Button 
              variant="outline" 
              onClick={() => {
                setIsIntro(false);
                setHasIntroPlayed(true);
              }} 
              className="flex-1 h-12 rounded-full font-bold"
           >
             Skip Intro
           </Button>
           <Button 
              onClick={() => {
                 setIsIntro(false);
                 setVoiceMode(true);
                 setHasIntroPlayed(true);
              }} 
              className="flex-1 h-12 rounded-full font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
           >
             Start Interview
           </Button>
         </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-1rem)] w-full py-4">
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
        {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="w-full sm:flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
               <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="hidden md:flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50 h-8">
               <Clock className="h-3 w-3 text-primary mr-1" /> Real-time Mode
            </div>
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
               {voiceMode ? "Voice ON" : "Voice OFF"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/interview/coach")} className="shrink-0 text-muted-foreground hover:text-destructive h-8 px-2">
               <XCircle className="h-4 w-4" />
            </Button>
         </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* TOP ROW: Video and Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* AI Avatar Pane */}
           <Card className="bg-card/50 backdrop-blur-sm shadow-xl border-primary/10 overflow-hidden relative flex flex-col h-full">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
             <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                 <div className="relative">
                 {/* Pulsing ring when AI is speaking */}
                 <div className={`absolute -inset-4 bg-primary/20 rounded-full animate-ping transition-opacity duration-300 pointer-events-none ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                 <div className={`relative w-28 h-28 rounded-full p-1 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 ${isSpeaking ? 'scale-105 shadow-xl shadow-primary/30' : ''}`}>
                   <div className="w-full h-full rounded-full overflow-hidden border-4 border-background relative bg-zinc-900">
                     <img src={avatarSrc} alt="AI Coach" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/ai-coach.png"; }} />
                   </div>
                 </div>
               </div>
               <div>
                 <h3 className="font-bold text-lg">Eesha</h3>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">AI Interview Coach</p>
               </div>
               {voiceMode && (
                  <div className="w-full">
                     <VoiceIndicator 
                        isListening={isListening} 
                        isSpeaking={isSpeaking} 
                        analytics={analytics} 
                        isSupported={isSupported} 
                     />
                  </div>
               )}
             </CardContent>
           </Card>

           {/* User Webcam Pane */}
           <Card className="bg-card/50 backdrop-blur-sm shadow-xl border-primary/10 overflow-hidden">
             <CardContent className="p-4 flex flex-col items-center space-y-3">
               <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden relative border border-white/5">
                 {isCameraOn ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                 ) : (
                    <div className="relative w-full h-full flex items-center justify-center text-muted-foreground bg-zinc-900/50">
                       <div className="relative flex items-center justify-center mb-4">
                         {/* Pulsing ring when user is speaking */}
                         <div className={`absolute w-24 h-24 bg-primary/20 rounded-full animate-ping transition-opacity duration-300 pointer-events-none ${isListening ? 'opacity-50' : 'opacity-0'}`} />
                         
                         <div className={`relative z-10 w-20 h-20 rounded-full p-1 bg-gradient-to-r from-primary/50 to-purple-500/50 transition-all duration-300 ${isListening ? 'scale-105 shadow-xl shadow-primary/30' : 'shadow-md opacity-75'}`}>
                           <div className="w-full h-full rounded-full overflow-hidden border-2 border-background relative">
                             <img src={userImageUrl} alt="User" className="w-full h-full object-cover" />
                           </div>
                         </div>
                       </div>
                       <div className="absolute bottom-4 left-0 w-full text-center">
                         <span className="text-[10px] uppercase font-bold tracking-widest">Camera Disabled</span>
                       </div>
                    </div>
                 )}
               </div>
               <div className="flex items-center justify-between w-full px-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Feed</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-colors" onClick={() => setIsCameraOn(!isCameraOn)}>
                    {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
               </div>
             </CardContent>
           </Card>

        </div>

        {/* BOTTOM ROW: Questions & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Question Pane */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-2xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="p-6 sm:p-8 shrink-0">
              <div className="flex items-start justify-between gap-4">
                 <div className="space-y-4 flex-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">
                       {q.category}
                    </Badge>
                    <CardTitle className="text-base sm:text-lg font-bold leading-relaxed">
                      {q.question}
                    </CardTitle>
                 </div>
                 <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 hidden sm:block">
                    <Brain className="h-6 w-6 text-primary" />
                 </div>
              </div>
            </CardHeader>
            {showHint && (
               <CardContent className="px-6 sm:px-8 pb-6">
                 <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm italic text-primary/80 animate-in fade-in duration-300">
                    💡 {q.hints?.[0] || "Focus on being specific and positive."}
                 </div>
               </CardContent>
            )}
          </Card>

          {/* RIGHT: Answer & Feedback Pane */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-2xl relative overflow-hidden h-full flex flex-col">
            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
              <div className="space-y-4 flex-1 flex flex-col">
                 <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Answer</Label>
                     <div className="flex gap-2">
                       {voiceMode && (
                          <Button 
                             variant="outline" 
                             size="sm" 
                             className={`h-7 text-xs font-bold transition-all ${isListening ? "bg-red-500 text-white hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20" : "text-primary hover:bg-primary/5"}`}
                             onClick={isListening ? () => { setManuallyStopped(true); stopListening(); } : () => { setManuallyStopped(false); startListening(); }}
                             disabled={isAnalyzing || feedback || isSpeaking}
                          >
                             {isListening ? "Stop Recording" : "Start Speaking"}
                          </Button>
                       )}
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-7 text-xs text-primary hover:bg-primary/5 font-bold"
                         onClick={() => setShowHint(!showHint)}
                       >
                         <Lightbulb className="h-3 w-3 mr-1" /> {showHint ? "Hide Hint" : "Need a Hint?"}
                       </Button>
                    </div>
                  </div>

                   <Textarea
                    placeholder="Structure your answer using the STAR method..."
                    className="min-h-[160px] text-xs sm:text-sm leading-relaxed bg-muted/20 border-muted focus-visible:ring-primary/50 transition-all resize-none"
                    value={userAnswer}
                    onChange={(e) => {
                       setUserAnswer(e.target.value);
                       setTranscriptText(e.target.value);
                    }}
                    disabled={isAnalyzing || feedback}
                 />
              </div>

              {!feedback ? (
                <div className="mt-auto pt-4 flex justify-end">
                  <Button 
                    onClick={handleSubmit} 
                    className="flex h-10 px-8 text-sm font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] rounded-full"
                    disabled={isAnalyzing || !userAnswer.trim()}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Answer
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {Object.entries(feedback.scores).map(([key, val]) => (
                        <div key={key} className="bg-muted/30 rounded-xl p-3 text-center border border-muted shadow-sm">
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
                                   className={`w-8 h-8 flex items-center justify-center p-0 rounded-lg text-sm font-black ${present ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground opacity-50"}`}
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
                           <p className="text-xs text-muted-foreground leading-relaxed">{feedback.feedback}</p>
                        </div>

                        <div className="p-4 bg-white/50 dark:bg-black/50 rounded-xl border border-primary/10 space-y-2 shadow-inner">
                           <div className="text-sm font-bold text-primary flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Stronger Version
                           </div>
                           <p className="text-xs italic leading-relaxed text-foreground">{feedback.improvedAnswer}</p>
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
                          className={`text-xs font-bold border-none shadow-sm ${
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Confidence', score: feedback.toneAnalysis.confidenceScore, color: 'bg-blue-500' },
                          { label: 'Professionalism', score: feedback.toneAnalysis.professionalismScore, color: 'bg-emerald-500' },
                          { label: 'Empathy', score: feedback.toneAnalysis.empathyScore, color: 'bg-violet-500' },
                        ].map(({ label, score, color }) => (
                          <div key={label} className="space-y-2 bg-background/50 p-3 rounded-lg border border-border/50">
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
                        <p className="text-[11px] text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50">
                          {feedback.toneAnalysis.toneBreakdown}
                        </p>
                      )}

                      {feedback.toneAnalysis.suggestions?.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Tone Tips</div>
                          <ul className="space-y-1.5">
                            {feedback.toneAnalysis.suggestions.map((tip, i) => (
                              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleNext} className="flex h-10 px-8 text-sm font-bold rounded-full shadow-lg" variant="secondary">
                       {currentIdx === questions.length - 1 ? (
                          isFinishing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finalizing...</> : "See Final Report"
                       ) : (
                          <>Next Question <ChevronRight className="h-4 w-4 ml-2" /></>
                       )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}
