// Chatbot.jsx — Simple FAQ chatbot, bottom right
// Answers questions using FAQ XML data + common portal keywords
import { useState, useRef, useEffect } from "react";

const FAQ_DATA = [
  {
    keywords: ["what is", "citylink", "portal", "about"],
    answer: "The CityLink Smart Community Portal is a digital platform to help community members access local government services online — events, announcements, feedback, service bookings and more.",
  },
  {
    keywords: ["who can use", "who can", "use the portal"],
    answer: "The portal is available to all community members. You can browse public content without an account. To book events or submit feedback you'll need to register for a free account.",
  },
  {
    keywords: ["free", "cost", "charge", "fee"],
    answer: "Yes — the portal is completely free for all community members. There are no subscription fees or charges for any public-facing features.",
  },
  {
    keywords: ["create account", "sign up", "register"],
    answer: "Click 'Sign Up' in the top navigation bar. Fill in your name, email and a password. Once registered you can log in and access all portal features.",
  },
  {
    keywords: ["forgot password", "reset password", "password"],
    answer: "Click 'Log In' then select 'Forgot Password?' on the login page. Enter your email and we'll send you a secure reset link.",
  },
  {
    keywords: ["update profile", "profile", "change name", "edit profile"],
    answer: "Log in and click your name in the top navigation bar, then select 'My Profile'. From there you can update your display name and contact preferences.",
  },
  {
    keywords: ["book event", "booking", "book", "reserve"],
    answer: "Go to the Events page, click on an event you're interested in, then click 'Book My Spot'. You must be logged in to make a booking.",
  },
  {
    keywords: ["cancel booking", "cancel", "change booking"],
    answer: "Log in and go to 'My Profile', then the 'Bookings' tab. Click to cancel next to the event you wish to cancel.",
  },
  {
    keywords: ["event full", "fully booked", "no spots", "sold out"],
    answer: "Each event shows the number of spots remaining. If an event is full, the button will show 'Event Full'. Check back later as cancellations sometimes free up spots.",
  },
  {
    keywords: ["privacy", "personal information", "data", "protect"],
    answer: "CityLink handles all personal information in accordance with the Australian Privacy Principles (APPs). We only collect necessary information and never sell it to third parties.",
  },
  {
    keywords: ["accessibility", "disability", "wcag", "screen reader", "accessible"],
    answer: "Yes — the portal meets WCAG 2.1 Level AA accessibility standards, including keyboard navigation, screen reader compatibility and sufficient colour contrast.",
  },
  {
    keywords: ["browser", "device", "phone", "mobile", "support", "compatible"],
    answer: "The portal works on Chrome, Firefox, Safari and Edge (latest versions) and is fully responsive on desktops, tablets and smartphones.",
  },
  {
    keywords: ["service", "services", "request service", "request"],
    answer: "Go to the Services page to browse all available council services. Click 'Request Service' on any card to submit a request — you must be logged in.",
  },
  {
    keywords: ["feedback", "complaint", "suggestion"],
    answer: "Go to the Feedback page from the navigation menu. Select a category, give a star rating and write your message. Feedback is reviewed by our team.",
  },
  {
    keywords: ["contact", "phone", "email", "reach"],
    answer: "You can reach us via the Contact page. Office hours are Monday to Friday, 9:00 AM – 5:00 PM. Phone: (08) 9000 0000, Email: info@citylink.gov",
  },
  {
    keywords: ["announcement", "news", "notice", "update"],
    answer: "Visit the Announcements page to stay up to date with the latest news and notices from CityLink Initiatives.",
  },
  {
    keywords: ["faq", "help", "question", "how"],
    answer: "You can find answers to common questions on our FAQ page. You can also ask me anything about the portal!",
  },
  {
    keywords: ["hello", "hi", "hey", "g'day"],
    answer: "Hi there! 👋 I'm the CityLink assistant. Ask me anything about the portal — events, bookings, services, your account, or accessibility.",
  },
  {
    keywords: ["thanks", "thank you", "cheers"],
    answer: "You're welcome! Is there anything else I can help you with?",
  },
  {
    keywords: ["bye", "goodbye", "done"],
    answer: "Thanks for using CityLink! Have a great day. 😊",
  },
];

function getAnswer(input) {
  const lower = input.toLowerCase();
  for (const item of FAQ_DATA) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  return "I'm not sure about that one. Try asking about events, bookings, services, your account, or accessibility — or visit our FAQ page for more help.";
}

const SUGGESTIONS = [
  "How do I book an event?",
  "How do I create an account?",
  "What services are available?",
  "Is the portal free?",
];

export default function Chatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm the CityLink assistant. How can I help you today?" },
  ]);
  const [input, setInput]       = useState("");
  const [unread, setUnread]     = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages]);

  function send(text) {
    const q = text || input.trim();
    if (!q) return;
    const answer = getAnswer(q);
    setMessages((m) => [
      ...m,
      { from: "user", text: q },
      { from: "bot",  text: answer },
    ]);
    setInput("");
    if (!open) setUnread((n) => n + 1);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Chat window */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "440px" }}>

          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">CL</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">CityLink Assistant</p>
                <p className="text-slate-400 text-xs">Always online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === "user"
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything…"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              aria-label="Chat input"
            />
            <button onClick={() => send()}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition disabled:opacity-40"
              aria-label="Send message">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
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