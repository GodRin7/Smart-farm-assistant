import { useState, useEffect, useRef } from "react";
import { X, User, Sparkles, Send } from "lucide-react";
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
  postAssistantChat
} from "../api/assistantApi";

/* ─── tiny speech-bubble typing animation ─── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      {/* Farmer avatar */}
      <img
        src={farmerAvatar}
        alt="Farmer"
        className="h-10 w-10 shrink-0 rounded-full border-2 border-amber-300 object-cover shadow-md"
      />
      <div className="relative rounded-2xl rounded-bl-none bg-amber-50 px-4 py-3 shadow dark:bg-amber-900/30">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
        </div>
        {/* tail */}
        <div className="absolute -bottom-[6px] left-3 h-3 w-3 rotate-45 bg-amber-50 dark:bg-amber-900/30" />
      </div>
    </div>
  );
}

/* ─── single message row ─── */
function MessageRow({ msg, farmerAvatarSrc }) {
  const isNpc = msg.sender === "npc";

  return (
    <div className={`flex items-end gap-3 ${isNpc ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      {isNpc ? (
        <img
          src={farmerAvatarSrc}
          alt="Farmer Guide"
          className="h-10 w-10 shrink-0 rounded-full border-2 border-amber-300 object-cover shadow-md"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <User size={16} />
        </div>
      )}

      {/* Bubble + cards */}
      <div className={`max-w-[75%] space-y-2 ${isNpc ? "" : "items-end flex flex-col"}`}>
        {/* Speech bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isNpc
              ? "rounded-bl-none bg-amber-50 text-slate-800 dark:bg-amber-900/20 dark:text-slate-200"
              : "rounded-br-none bg-emerald-600 text-white"
          }`}
        >
          {msg.content}
          {/* bubble tail */}
          {isNpc && (
            <div className="absolute -bottom-[6px] left-3 h-3 w-3 rotate-45 bg-amber-50 dark:bg-amber-900/20" />
          )}
          {!isNpc && (
            <div className="absolute -bottom-[6px] right-3 h-3 w-3 rotate-45 bg-emerald-600" />
          )}
        </div>

        {/* Data cards (NPC only) */}
        {isNpc && msg.items && msg.items.length > 0 && (
          <div className="mt-1 space-y-2 pl-1">
            {msg.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm dark:border-amber-900/30 dark:bg-slate-800/60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.label}
                  </p>
                  {item.detail && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </p>
                  )}
                </div>
                {item.badge && (
                  <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
function FarmerAssistant() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [quickReplyLabels, setQuickReplyLabels] = useState({});
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) fetchGreeting();
  }, [isOpen, lang]);

  const addMessage = (sender, content, items = []) =>
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), sender, content, items },
    ]);

  const fetchGreeting = async () => {
    setLoading(true);
    try {
      const data = await getAssistantGreeting(lang);
      addMessage("npc", data.message, data.items);
      setQuickReplies(data.quickReplies || []);
      setQuickReplyLabels(data.quickReplyLabels || {});
    } catch {
      addMessage("npc", t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action) => {
    const userText = quickReplyLabels[action] || action;
    addMessage("user", userText);
    setLoading(true);
    setQuickReplies([]);
    try {
      const calls = {
        crops: getAssistantCrops,
        activities: getAssistantActivities,
        expenses: getAssistantExpenses,
        harvests: getAssistantHarvests,
        summary: getAssistantSummary,
      };
      const fn = calls[action];
      if (!fn) throw new Error("unknown");
      const data = await fn(lang);
      addMessage("npc", data.message, data.items);
      setQuickReplies(data.quickReplies || []);
      setQuickReplyLabels(data.quickReplyLabels || {});
    } catch {
      addMessage("npc", t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    addMessage("user", userMsg);
    setLoading(true);
    setQuickReplies([]);

    try {
      const data = await postAssistantChat(userMsg, lang);
      addMessage("npc", data.message, data.items);
      setQuickReplies(data.quickReplies || []);
      setQuickReplyLabels(data.quickReplyLabels || {});
    } catch {
      addMessage("npc", t("error"));
    } finally {
      setLoading(false);
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
        {/* pulsing ring */}
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* ─── NPC Dialog Panel ─── */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[2rem] bg-[#fffcf5] shadow-2xl dark:bg-[#0f0e0a] sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[680px] sm:w-[400px] sm:rounded-[2rem]">

        {/* ── Header: farmer portrait strip ── */}
        <div className="relative flex-shrink-0 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 shadow-sm dark:from-amber-700 dark:via-amber-800 dark:to-amber-900 z-10">
          {/* decorative dots */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          />

          <div className="relative flex items-center gap-4">
            {/* Portrait */}
            <div className="relative">
              <img
                src={farmerAvatar}
                alt="Farmer Mando"
                className="h-14 w-14 rounded-full border-[3px] border-white object-cover shadow-lg"
              />
              {/* online dot */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>

            {/* Name + status */}
            <div className="flex-1">
              <h2 className="text-lg font-black tracking-tight text-amber-900 dark:text-amber-100">
                {lang === "tl" ? "Manding Gabay" : "Farmer Mando"}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-300/80">
                {lang === "tl"
                  ? "AI Assistant · Online"
                  : "AI Assistant · Online"}
              </p>
            </div>

            {/* Close */}
            <button
               onClick={() => setIsOpen(false)}
               className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-amber-900 transition hover:bg-white/80 dark:bg-black/20 dark:text-amber-100"
               aria-label="Close"
             >
               <X size={18} />
             </button>
          </div>
        </div>

        {/* ── Conversation area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide" id="farmer-chat-scroll">
          <div className="space-y-5">
            {messages.map((msg) => (
              <MessageRow key={msg.id} msg={msg} farmerAvatarSrc={farmerAvatar} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

        {/* ── UI Footer: Quick actions AND input box ── */}
        <div className="flex-shrink-0 bg-white shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] dark:bg-[#1e293b] z-10">
          {/* Quick Actions (if available) scroll horizontally */}
          {!loading && quickReplies.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3 scrollbar-hide dark:border-slate-800/50">
              <Sparkles size={14} className="shrink-0 text-amber-500" />
              {quickReplies.map((reply) => (
                 <button
                   key={reply}
                   onClick={() => handleActionClick(reply)}
                   className="shrink-0 whitespace-nowrap rounded-full border border-amber-200/60 bg-amber-50/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 shadow-sm transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400"
                 >
                   {quickReplyLabels[reply] || reply}
                 </button>
               ))}
            </div>
          )}

          {/* Chat Input */}
          <form
            onSubmit={handleChatSubmit}
            className="flex items-end gap-2 px-4 py-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={lang === "tl" ? "Magtanong rito..." : "Ask your farm guide..."}
              className="max-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-amber-400 dark:focus:bg-slate-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md transition-all hover:bg-amber-600 disabled:opacity-50 active:scale-95"
            >
              <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}

export default FarmerAssistant;
