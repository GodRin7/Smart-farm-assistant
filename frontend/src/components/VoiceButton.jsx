import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader } from "lucide-react";

/**
 * VoiceButton — A reusable voice-to-text button using the native Web Speech API.
 * No API key required. Works on Chrome (Android/Desktop) and Safari (iOS 14.5+).
 *
 * Props:
 *   onResult(text)  — called with the final transcript string
 *   lang            — BCP-47 language tag: "en-US" or "fil-PH"
 *   className       — extra classes for the button wrapper
 */
function VoiceButton({ onResult, lang = "en-US", className = "" }) {
  const [status, setStatus] = useState("idle"); // idle | listening | error
  const recognitionRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setStatus("error");
      return;
    }

    // Clean up any existing session
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setStatus("idle");
    };

    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => setStatus(prev => prev === "listening" ? "idle" : prev);

    recognition.start();
  }, [isSupported, lang, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus("idle");
  }, []);

  if (!isSupported) return null; // Hide on unsupported browsers silently

  return (
    <button
      type="button"
      onPointerDown={startListening}
      onPointerUp={stopListening}
      onPointerLeave={stopListening}
      title={status === "listening" ? "Listening..." : "Hold to speak"}
      className={`relative flex items-center justify-center rounded-full transition-all duration-200 select-none ${
        status === "listening"
          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110"
          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
      } ${className}`}
    >
      {status === "listening" ? (
        <>
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-full bg-rose-400 opacity-40 animate-ping" />
          <MicOff size={18} className="relative z-10" />
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}

export default VoiceButton;
