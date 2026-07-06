"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Voices selection
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  
  // Analytics
  const [fillerWords, setFillerWords] = useState({});
  const [speechPace, setSpeechPace] = useState(0); // Words per minute
  
  const recognitionRef = useRef(null);
  const recognitionStateRef = useRef("IDLE"); // IDLE, STARTING, LISTENING, STOPPING
  const startTimeRef = useRef(null);
  const wordCountRef = useRef(0);
  const currentTranscriptRef = useRef("");
  const cumulativeTranscriptRef = useRef("");
  const micErrorRef = useRef(false); // Tracks mic permission/hardware failures to prevent auto-restart loops

  const fillerList = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"];

  const logEvent = (eventName, data = {}) => {
    const timestamp = new Date().toISOString();
    const networkStatus = navigator.onLine ? "online" : "offline";
    console.log(`[SpeechRecognition][${timestamp}] ${eventName}:`, {
      ...data,
      networkStatus,
      internalState: recognitionStateRef.current,
      isListening,
      userAgent: navigator.userAgent
    });
  };

  const updateVoicesList = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for English voices
      const englishVoices = allVoices.filter(v => v.lang.startsWith("en"));
      setVoices(englishVoices);

      // Auto-select voice
      const savedVoice = localStorage.getItem("selected-voice-name");
      if (savedVoice && englishVoices.some(v => v.name === savedVoice)) {
        setSelectedVoiceName(savedVoice);
      } else if (englishVoices.length > 0) {
        const bestVoice = 
          englishVoices.find(v => v.name.toLowerCase().includes("hazel")) ||
          englishVoices.find(v => v.name.includes("Google US English")) ||
          englishVoices.find(v => v.name.includes("Google UK English")) ||
          englishVoices.find(v => v.name.includes("Natural")) ||
          englishVoices.find(v => v.name.includes("Zira")) ||
          englishVoices.find(v => v.name.includes("Samantha")) ||
          englishVoices.find(v => v.name.includes("Google")) ||
          englishVoices[0];
        
        setSelectedVoiceName(bestVoice.name);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      updateVoicesList();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoicesList;
      }
    }
  }, [updateVoicesList]);

  const changeVoice = useCallback((voiceName) => {
    setSelectedVoiceName(voiceName);
    localStorage.setItem("selected-voice-name", voiceName);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    currentTranscriptRef.current = "";
    cumulativeTranscriptRef.current = "";
  }, []);

  const setTranscriptText = useCallback((text) => {
    setTranscript(text);
    cumulativeTranscriptRef.current = text;
    currentTranscriptRef.current = "";
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-IN";

      recognition.onstart = () => {
        logEvent("onstart");
        recognitionStateRef.current = "LISTENING";
        setIsListening(true);
      };

      recognition.onaudiostart = () => logEvent("onaudiostart");
      recognition.onspeechstart = () => logEvent("onspeechstart");
      
      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        currentTranscriptRef.current = finalTranscript;
        
        // Append current session transcript to historical cumulative transcript
        const fullText = (cumulativeTranscriptRef.current + " " + finalTranscript).trim();
        setTranscript(fullText);
        
        const words = fullText.toLowerCase().split(/\s+/);
        const fillers = {};
        words.forEach(word => {
          if (fillerList.includes(word)) {
            fillers[word] = (fillers[word] || 0) + 1;
          }
        });
        setFillerWords(fillers);

        if (startTimeRef.current) {
          const durationMinutes = (Date.now() - startTimeRef.current) / 60000;
          if (durationMinutes > 0) {
            setSpeechPace(Math.round(words.length / durationMinutes));
          }
        }
      };

      recognition.onend = () => {
        logEvent("onend");
        
        // Append this session's text to the cumulative history
        if (currentTranscriptRef.current) {
          cumulativeTranscriptRef.current = (cumulativeTranscriptRef.current + " " + currentTranscriptRef.current).trim();
          currentTranscriptRef.current = "";
        }

        // If recognitionStateRef is still LISTENING, the browser stopped it automatically
        // (e.g. timeout on silent pause), so we restart it.
        if (recognitionStateRef.current === "LISTENING") {
          logEvent("onend_auto_restart");
          try {
            recognitionRef.current.start();
          } catch (e) {
            logEvent("onend_auto_restart_failed", { error: e.message });
            recognitionStateRef.current = "IDLE";
            setIsListening(false);
          }
        } else {
          recognitionStateRef.current = "IDLE";
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        logEvent("onerror", { error: event.error, message: event.message });
        
        const errorType = event.error;
        if (errorType === 'not-allowed') {
          toast.error("Microphone access was denied. Please check your browser and system settings.");
          recognitionStateRef.current = "IDLE";
          setIsListening(false);
        } else if (errorType === 'network') {
          toast.error("Speech Recognition Network Error", {
            description: "The browser's speech service is unreachable. This is common in Brave, Firefox, or restricted networks.",
            duration: 6000
          });
          recognitionStateRef.current = "IDLE";
          setIsListening(false);
        } else if (errorType === 'audio-capture') {
          toast.error("Microphone Capture Error", {
            description: "No microphone was found, or microphone is already in use by another application. Please check your system settings.",
            duration: 6000
          });
          recognitionStateRef.current = "IDLE";
          micErrorRef.current = true; // Prevent auto-restart loops
          setIsListening(false);
        } else if (errorType === 'aborted') {
          // 'aborted' happens normally when we stop the recognition engine, so ignore it
          logEvent("onerror_aborted_ignored");
        } else {
          toast.error(`Speech Recognition Error: ${errorType}`);
          recognitionStateRef.current = "IDLE";
          setIsListening(false);
        }
      };

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;
    if (recognitionStateRef.current !== "IDLE") {
      logEvent("startListening_ignored", { reason: "Already in progress" });
      return;
    }

    if (!navigator.onLine) {
      toast.error("You are offline. Native speech recognition requires an internet connection.");
      return;
    }

    try {
      logEvent("startListening_init");
      recognitionStateRef.current = "STARTING";
      micErrorRef.current = false; // Reset mic error flag on manual start
      setFillerWords({});
      setSpeechPace(0);
      startTimeRef.current = Date.now();

      // Pre-check microphone device access and trigger permissions window
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop stream tracks so SpeechRecognition can acquire the device
          stream.getTracks().forEach(track => track.stop());
          // Wait for the OS to fully release the mic device before SpeechRecognition acquires it
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          logEvent("microphone_access_error", { name: err.name, message: err.message });
          recognitionStateRef.current = "IDLE";
          micErrorRef.current = true; // Flag to prevent auto-restart loops
          setIsListening(false);

          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            toast.error("Microphone Access Denied", {
              description: "Please allow microphone access in your browser site settings and OS settings."
            });
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            toast.error("No Microphone Found", {
              description: "Please connect a working microphone to your device."
            });
          } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            toast.error("Microphone is Busy", {
              description: "Your microphone is already in use by another app (e.g. Teams, Discord, Zoom) or is muted."
            });
          } else {
            toast.error("Microphone Access Error", {
              description: err.message || "Failed to initialize microphone device."
            });
          }
          return;
        }
      }
      
      recognitionRef.current.start();
    } catch (error) {
      logEvent("startListening_error", { error: error.message });
      recognitionStateRef.current = "IDLE";
      if (error.name === 'InvalidStateError') {
        recognitionRef.current.abort();
        setTimeout(() => {
          if (recognitionStateRef.current === "IDLE") {
            recognitionRef.current.start();
          }
        }, 200);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && recognitionStateRef.current === "LISTENING") {
      logEvent("stopListening_init");
      recognitionStateRef.current = "STOPPING";
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      const allVoices = window.speechSynthesis.getVoices();
      const preferredVoice = allVoices.find(v => v.name === selectedVoiceName) || 
                             allVoices.find(v => v.name.toLowerCase().includes("hazel")) ||
                             allVoices.find(v => v.name.includes("Google US English")) ||
                             allVoices.find(v => v.name.includes("Google UK English")) ||
                             allVoices.find(v => v.name.includes("Natural")) ||
                             allVoices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.95; // Slightly slower is more professional and easy to understand
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedVoiceName]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isSupported,
    voices,
    selectedVoiceName,
    changeVoice,
    resetTranscript,
    setTranscriptText,
    hasMicError: micErrorRef.current,
    analytics: {
      fillerWords,
      speechPace,
      totalFillers: Object.values(fillerWords).reduce((a, b) => a + b, 0)
    }
  };
}
