// Chatbot.jsx
// Floating AI chat assistant — appears bottom right of every page
// Powered by a local Ollama model (gemma3:1b) via the server route POST /api/chat
// Auto-opens on the home page after 3 seconds, stays closed on all other pages

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

export default function Chatbot() {
  // open — controls whether the chat window is visible
  const [open, setOpen] = useState(false);

  // messages — the full conversation history sent to the AI each time
  // Starts with a greeting from the assistant
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the CityLink AI assistant. How can I help you today?" },
  ]);

  const [input, setInput]     = useState("");      // current text in the input box
  const [loading, setLoading] = useState(false);   // true while waiting for AI response
  const [unread, setUnread]   = useState(0);       // unread count shown on the toggle button
  const [error, setError]     = useState("");      // error message shown in the chat

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
      }, 3000); // 3000ms = 3 seconds
      return () => clearTimeout(timer); // cleanup if user leaves the page before 3 seconds
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

  // Sends a message to the AI
  // Accepts either a typed message (from the input box) or a pre-written suggestion
  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return; // do nothing if input is empty or already waiting

    setInput("");  // clear the input box
    setError("");  // clear any previous error

    // Add the user message to the conversation history
    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send the full conversation history to the server
      // The server fetches live DB data and forwards everything to Ollama
      const res = await fetch(`${BASE_URL}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get response");

      // Add the AI reply to the conversation
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);

      // Increment unread count if the window is closed
      if (!open) setUnread((n) => n + 1);

    } catch (err) {
      // Show the error in the chat and remove the user message that failed
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  // Sends the message when Enter is pressed (Shift+Enter does nothing special)
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Chat window — only rendered when open is true */}
      {open && (
        <div
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "460px" }}>

          {/* Header — shows assistant name, online status and close button */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">CityLink Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"
              className="text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message list — scrollable area showing the full conversation */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>

                {/* AI avatar shown next to each assistant message */}
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 mr-1.5">
                    AI
                  </div>
                )}

                {/* Message bubble — dark for user, white for assistant */}
                <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Bouncing dots shown while waiting for the AI to respond */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 mr-1.5">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error message shown if the AI request fails */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Invisible anchor div — scrollIntoView targets this to jump to the bottom */}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion buttons — only shown before the user sends their first message */}
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

          {/* Input area — text field and send button */}
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything…"
              disabled={loading} // locked while waiting for AI response
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50"
              aria-label="Chat input"
            />
            {/* Send button — disabled if input is empty or AI is thinking */}
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition disabled:opacity-40"
              aria-label="Send message">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button — always visible at bottom right */}
      {/* Shows a red unread badge when messages arrive while the chat is closed */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open AI chat assistant"}
        className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center relative">

        {/* Icon switches between chat bubble (closed) and X (open) */}
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}

        {/* Red badge showing number of unread messages */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}