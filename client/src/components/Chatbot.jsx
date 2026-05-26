// Chatbot.jsx
// Floating AI chat assistant — appears bottom right of every page
// Powered by Google Gemini API (gemini-1.5-flash) via the server route POST /api/chat
// Auto-opens on the home page after 3 seconds, stays closed on all other pages
// Client-side rate limiting: max 5 messages per session, 10 second cooldown between messages

import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BASE_URL from "../services/api";

// Quick suggestion buttons shown when the chat first opens
// Clicking one sends that question immediately without typing
const SUGGESTIONS = [
  "How do I book an event?",
  "What services are available?",
  "How do I create an account?",
  "Is the portal free?",
];

// Client-side rate limiting constants
// Prevents users from exhausting the Gemini free tier quota
const MAX_MESSAGES    = 5;  // max messages per session before showing limit warning
const COOLDOWN_SECS   = 10; // seconds to wait between messages

export default function Chatbot() {
  // open — controls whether the chat window is visible
  const [open, setOpen] = useState(false);

  // messages — the full conversation history sent to the AI each time
  // Starts with a greeting from the assistant
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the CityLink AI assistant. How can I help you today?" },
  ]);

  const [input, setInput]       = useState("");     // current text in the input box
  const [loading, setLoading]   = useState(false);  // true while waiting for AI response
  const [unread, setUnread]     = useState(0);      // unread count shown on the toggle button
  const [error, setError]       = useState("");     // error message shown in the chat

  // Client-side rate limiting state
  const [msgCount, setMsgCount]     = useState(0);  // number of messages sent this session
  const [cooldown, setCooldown]     = useState(0);  // seconds remaining in cooldown
  const cooldownRef                 = useRef(null); // timer reference for cooldown countdown

  // hasAutoOpened — prevents the chat from auto-opening more than once per session
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const bottomRef = useRef(null);  // reference to the invisible div at the bottom of messages
  const location  = useLocation(); // used to check what page the user is on

  // Auto-opens the chat 3 seconds after landing on the home page
  // Only triggers once — hasAutoOpened prevents it from firing again
  useEffect(() => {
    if (location.pathname === "/" && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasAutoOpened(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Scrolls to the bottom of the message list whenever new messages arrive
  // Also clears the unread badge when the chat is opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // ── Start cooldown timer ──────────────────────────────────────────
  // Counts down from COOLDOWN_SECS to 0 after each message
  // Prevents rapid-fire requests to the Gemini API
  function startCooldown() {
    setCooldown(COOLDOWN_SECS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ── Send message ──────────────────────────────────────────────────
  // Accepts either a typed message (from the input box) or a pre-written suggestion
  // Client-side rate limiting applied before sending to server
  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;

    // Client-side rate limit — max messages per session
    if (msgCount >= MAX_MESSAGES) {
      setError(`You've reached the limit of ${MAX_MESSAGES} messages per session. Please refresh the page to start a new session.`);
      return;
    }

    // Client-side cooldown — wait between messages
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before sending another message.`);
      return;
    }

    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);
    setMsgCount((n) => n + 1); // increment session message count

    try {
      // Send conversation history to server
      // Server fetches live DB data and forwards to Gemini API
      const res = await fetch(`${BASE_URL}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      // Handle server-side rate limit (429) or quota exceeded
      if (res.status === 429) {
        setError("AI is busy right now. Please wait a moment and try again.");
        setMessages((prev) => prev.slice(0, -1));
        setMsgCount((n) => n - 1);
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to get response");

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      if (!open) setUnread((n) => n + 1);

      // Start cooldown after successful message
      startCooldown();

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setMsgCount((n) => n - 1);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Input is disabled if: loading, in cooldown, or session limit reached
  const inputDisabled = loading || cooldown > 0 || msgCount >= MAX_MESSAGES;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Chat window */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "460px" }}>

          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">CityLink Assistant</p>
                {/* Show message count remaining */}
                <p className="text-slate-400 text-xs">
                  {msgCount >= MAX_MESSAGES ? "Session limit reached" : `${MAX_MESSAGES - msgCount} messages remaining`}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"
              className="text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 mr-1.5">
                    AI
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 mr-1.5">AI</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Session limit reached message */}
            {msgCount >= MAX_MESSAGES && !error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                Session limit reached. Refresh the page to start a new conversation.
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion buttons */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                msgCount >= MAX_MESSAGES ? "Session limit reached" :
                cooldown > 0 ? `Wait ${cooldown}s…` :
                "Ask me anything…"
              }
              disabled={inputDisabled}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:bg-slate-50"
              aria-label="Chat input"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || inputDisabled}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition disabled:opacity-40"
              aria-label="Send message">
              {/* Cooldown countdown shown inside send button */}
              {cooldown > 0 ? (
                <span className="text-xs font-bold">{cooldown}</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open AI chat assistant"}
        className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center relative">
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}