import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Sparkles, Sprout, ListFilter, TrendingDown, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import farmerAvatar from "../assets/farmer_npc.png";
import {
  getAssistantGreeting,
  getAssistantCrops,
  getAssistantActivities,
  getAssistantExpenses,
  getAssistantHarvests,
  getAssistantSummary,
  getAssistantUpcomingHarvests,
  getAssistantHighestExpenses,
  postAssistantChat
} from "../api/assistantApi";

/* ─── Typewriter text effect for classic RPG feel ─── */
function TypewriterText({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  
  // Need a ref to track the absolute latest text prop in case it changes fast
  const textRef = useRef(text);
  
  useEffect(() => {
    textRef.current = text;
    setDisplayedText("");
    setIsFinished(false);
    
    if (!text) {
      setIsFinished(true);
      if (onComplete) onComplete();
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(textRef.current.slice(0, i + 1));
      i++;
      if (i >= textRef.current.length) {
        clearInterval(interval);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, 25); // Speed of the RPG typing
    
    return () => clearInterval(interval);
  }, [text, onComplete]);

  // If use clicks the text early, slam the whole text out instantly
  const completeTyping = () => {
    if (!isFinished) {
      setDisplayedText(textRef.current);
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div onClick={completeTyping} className="cursor-pointer">
      {displayedText}
      {!isFinished && (
        <span className="animate-blink-caret inline-block ml-1 h-5 w-2.5 bg-amber-600 dark:bg-amber-400 align-middle rounded-sm"></span>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
function FarmerAssistant() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Current Conversation State
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [quickReplyLabels, setQuickReplyLabels] = useState({});
  const [inputText, setInputText] = useState("");
  const [messageFinished, setMessageFinished] = useState(false);

  const [viewportHeight, setViewportHeight] = useState("100dvh");
  
  // Name
  const npcName = lang === "tl" ? "Tiyong Mando" : "Farmer Mando";

  // Fit to screen overlay keyboard handlers
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const updateHeight = () => {
      setViewportHeight(`${window.visualViewport.height}px`);
    };
    window.visualViewport.addEventListener("resize", updateHeight);
    updateHeight();
    return () => window.visualViewport.removeEventListener("resize", updateHeight);
  }, []);

  const handleMessageComplete = useCallback(() => {
    setMessageFinished(true);
  }, []);

  useEffect(() => {
    if (isOpen && !currentMessage) fetchGreeting();
  }, [isOpen, lang]);

  const updateDialog = (data) => {
    setMessageFinished(false);
    setCurrentMessage(data.message || t("error"));
    setCurrentItems(data.items || []);
    setQuickReplies(data.quickReplies || []);
    setQuickReplyLabels(data.quickReplyLabels || {});
    setLoading(false);
  };

  const fetchGreeting = async () => {
    setLoading(true);
    setCurrentItems([]);
    setQuickReplies([]);
    setMessageFinished(false);
    setCurrentMessage("...");
    try {
      const data = await getAssistantGreeting(lang);
      updateDialog(data);
    } catch {
      updateDialog({ message: t("error") });
    }
  };

  const handleActionClick = async (action) => {
    setLoading(true);
    setCurrentItems([]);
    setQuickReplies([]);
    setMessageFinished(false);
    // Visual feedback
    setCurrentMessage("..."); 
    try {
      const calls = {
        crops: getAssistantCrops,
        activities: getAssistantActivities,
        expenses: getAssistantExpenses,
        harvests: getAssistantHarvests,
        summary: getAssistantSummary,
        upcoming_harvests: getAssistantUpcomingHarvests,
        highest_expenses: getAssistantHighestExpenses,
      };
      const fn = calls[action];
      if (!fn) throw new Error("unknown");
      const data = await fn(lang);
      updateDialog(data);
    } catch {
      updateDialog({ message: t("error") });
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    
    setLoading(true);
    setCurrentItems([]);
    setQuickReplies([]);
    setMessageFinished(false);
    setCurrentMessage("...");
    
    try {
      const data = await postAssistantChat(userMsg, lang);
      updateDialog(data);
    } catch {
      updateDialog({ message: t("error") });
    }
  };

  /* ─── FAB ─── */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-[0_4px_24px_rgba(251,191,36,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_32px_rgba(251,191,36,0.7)] active:scale-95 dark:bg-amber-500"
        aria-label="Open Farmer Guide"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-30 dark:bg-amber-500" />
        <img
          src={farmerAvatar}
          alt="Farmer Guide"
          className="relative h-12 w-12 rounded-full object-cover"
        />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-x-0 bottom-0 top-0 z-[100] flex flex-col justify-end bg-black/50 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out sm:p-6"
      style={{ height: viewportHeight }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />

      <div className="relative z-10 mx-auto w-full max-w-2xl sm:max-h-[85vh] flex flex-col justify-end sm:justify-center h-full pointer-events-none">
        {/* ─── NPC Character Area ─── */}
        <div className="relative z-20 w-full flex justify-center translate-y-6 animate-slide-up pointer-events-auto mt-auto">
          <img
            src={farmerAvatar}
            alt="Farmer Guide"
            className="h-44 w-44 object-cover animate-float-breathe drop-shadow-2xl sm:h-52 sm:w-52"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.5))" }}
          />
        </div>

        {/* ─── Dialog Box ─── */}
        <div className="relative z-30 flex w-full flex-col bg-[#fffbf5] dark:bg-[#151310] border-t-[6px] border-amber-600 rounded-t-[2rem] shadow-[0_-15px_40px_-5px_rgba(0,0,0,0.3)] animate-slide-up sm:rounded-[2rem] sm:border-4 pointer-events-auto">
          
          {/* Name Plate */}
          <div className="absolute -top-6 left-6 rounded-lg bg-amber-600 px-5 py-2 text-white shadow-xl">
            <h2 className="text-lg font-black tracking-widest uppercase">{npcName}</h2>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-700 hover:bg-rose-100 hover:text-rose-700 transition dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-rose-900/40"
          >
            <X size={24} />
          </button>

          {/* Text Container */}
          <div className="pt-10 px-6 pb-2 min-h-[4rem]">
            <div className="text-[19px] leading-[1.6] font-medium text-amber-950 dark:text-amber-50">
              {loading ? (
                <span className="flex items-center gap-1.5 opacity-60">
                  <span className="animate-pulse">...</span>
                </span>
              ) : (
                <TypewriterText text={currentMessage} onComplete={handleMessageComplete} />
              )}
            </div>
          </div>

          {/* Interactive Middle Area (Cards & Data) */}
          {!loading && currentItems.length > 0 && messageFinished && (
            <div className="px-5 pb-4 max-h-[35vh] overflow-y-auto w-full animate-slide-up scrollbar-hide">
              <div className="space-y-3 pt-2">
                {currentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col rounded-xl border-2 border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/40 dark:bg-[#1c1917]"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="overflow-hidden">
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100 truncate">
                          {item.label}
                        </p>
                        {item.detail && (
                          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
                            {item.detail}
                          </p>
                        )}
                      </div>
                      {item.badge && (
                        <span className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1 font-black uppercase text-[10px] tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-sm mt-1">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Area: Quick Prompts or Text Input */}
          <div className="p-4 w-full bg-amber-50/50 dark:bg-[#1f1a14] rounded-t-[2rem] sm:rounded-b-[1.5rem] border-t border-amber-200/50 dark:border-amber-900/30">
            
            {/* Quick choices (appear when typing is done) */}
            {!loading && quickReplies.length > 0 && messageFinished && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 animate-slide-up">
                 {quickReplies.map((reply) => (
                   <button
                     key={reply}
                     onClick={() => handleActionClick(reply)}
                     className="flex items-center justify-between w-full h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 px-5 text-left font-bold text-amber-900 shadow-sm transition-all hover:bg-amber-500 hover:text-white dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-600 dark:hover:text-white active:scale-95"
                   >
                     <span className="flex items-center gap-2">
                       <Sparkles size={18} className="opacity-70" />
                       <span className="truncate">{quickReplyLabels[reply] || reply}</span>
                     </span>
                     <ArrowRight size={18} className="opacity-50 shrink-0" />
                   </button>
                 ))}
               </div>
            )}

            {/* Simple Text Fallback Input */}
            <form
              onSubmit={handleChatSubmit}
              className="flex items-end gap-3 w-full"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={lang === "tl" ? "Magtanong pa rito..." : "Type custom question..."}
                className="h-14 w-full rounded-2xl border-2 border-slate-200/80 bg-white px-5 text-base font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 dark:border-slate-800 dark:bg-[#14120e] dark:text-slate-200 dark:focus:border-amber-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-lg transition-all hover:bg-black disabled:opacity-40 disabled:scale-100 active:scale-90 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                <Send size={22} className="translate-x-[2px] translate-y-[-1px]" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerAssistant;
