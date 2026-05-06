"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Analytics
  const [fillerWords, setFillerWords] = useState({});
  const [speechPace, setSpeechPace] = useState(0); // Words per minute
  
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const wordCountRef = useRef(0);

  const fillerList = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
        
        // Analyze fillers
        const words = finalTranscript.toLowerCase().split(/\s+/);
        const fillers = {};
        words.forEach(word => {
          if (fillerList.includes(word)) {
            fillers[word] = (fillers[word] || 0) + 1;
          }
        });
        setFillerWords(fillers);

        // Analyze pace
        if (startTimeRef.current) {
          const durationMinutes = (Date.now() - startTimeRef.current) / 60000;
          if (durationMinutes > 0) {
            setSpeechPace(Math.round(words.length / durationMinutes));
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access was denied. Please check your browser settings.");
        } else if (event.error === 'network') {
          toast.error("Network Error: Google Speech Servers are unreachable. Try using a mobile hotspot or check your firewall.", {
            description: "Chrome requires a stable internet connection to process voice data.",
            duration: 6000
          });
        }
        setIsListening(false);
      };
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        setTranscript("");
        setFillerWords({});
        setSpeechPace(0);
        startTimeRef.current = Date.now();
        
        // Ensure we abort any previous session before starting new one
        recognitionRef.current.abort();
        
        // Use a small timeout to allow abort to finish
        setTimeout(() => {
          recognitionRef.current.lang = "en-IN"; // Try Indian English for better local routing
          recognitionRef.current.start();
        }, 100);
        
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        if (error.name === 'InvalidStateError') {
           recognitionRef.current.abort();
           setTimeout(() => recognitionRef.current.start(), 200);
        }
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Select a natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
    analytics: {
      fillerWords,
      speechPace,
      totalFillers: Object.values(fillerWords).reduce((a, b) => a + b, 0)
    }
  };
}
