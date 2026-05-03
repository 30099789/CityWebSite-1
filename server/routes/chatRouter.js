// routes/chatRouter.js — AI chatbot using local Ollama + live DB data
const express  = require("express");
const router   = express.Router();
const Event    = require("../models/Event");
const Service  = require("../models/Service");
const Announcement = require("../models/Announcement");

const OLLAMA_URL   = process.env.OLLAMA_URL   || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:1b";

// Format a date nicely
function formatDate(d) {
  if (!d) return "TBA";
  return new Date(d).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

// Days until a date (negative = past)
function daysUntil(d) {
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Fetch live context from DB
async function getLiveContext() {
  try {
    const today = new Date();

    const [events, services, announcements] = await Promise.all([
      Event.find().sort({ date: 1 }).limit(20),
      Service.find().limit(10),
      Announcement.find({ status: "published" }).sort({ date: -1 }).limit(5),
    ]);

    // Upcoming events (future dates)
    const upcoming = events.filter((e) => new Date(e.date) >= today);
    const past     = events.filter((e) => new Date(e.date) < today);

    // Next event (soonest upcoming)
    const next = upcoming[0];

    let context = `TODAY'S DATE: ${today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\n`;

    // Upcoming events
    if (upcoming.length > 0) {
      context += `UPCOMING EVENTS (${upcoming.length} total):\n`;
      upcoming.forEach((e) => {
        const days = daysUntil(e.date);
        const spotsLeft = e.capacity - (e.booked || 0);
        context += `- "${e.title}" on ${formatDate(e.date)} at ${e.time || "TBA"}, ${e.location || "TBA"}`;
        context += ` | Status: ${e.status}`;
        context += ` | ${spotsLeft > 0 ? `${spotsLeft} spots remaining` : "FULLY BOOKED"}`;
        context += ` | ${days === 0 ? "TODAY!" : days === 1 ? "TOMORROW!" : `in ${days} days`}`;
        context += "\n";
      });
    } else {
      context += "UPCOMING EVENTS: No upcoming events currently scheduled.\n";
    }

    if (next) {
      context += `\nNEXT EVENT: "${next.title}" is the soonest event, ${daysUntil(next.date) <= 0 ? "happening today!" : `in ${daysUntil(next.date)} days on ${formatDate(next.date)}`}\n`;
    }

    // Services
    if (services.length > 0) {
      context += `\nAVAILABLE SERVICES (${services.length} total):\n`;
      services.forEach((s) => {
        context += `- ${s.title} (${s.category}) | Phone: ${s.contact?.phone || "N/A"} | Email: ${s.contact?.email || "N/A"}\n`;
      });
    }

    // Latest announcements
    if (announcements.length > 0) {
      context += `\nLATEST ANNOUNCEMENTS:\n`;
      announcements.forEach((a) => {
        context += `- [${a.priority?.toUpperCase() || "INFO"}] "${a.title}" — ${a.summary || ""}\n`;
      });
    }

    return context;
  } catch (err) {
    console.error("DB context error:", err.message);
    return "Live data temporarily unavailable.";
  }
}

const SYSTEM_PROMPT = `You are the CityLink Smart Community Portal assistant for CityLink Initiatives, Perth WA.

CRITICAL SECURITY RULES:
- NEVER ask for passwords, usernames, or any credentials
- NEVER collect personal information
- If someone shares a password, tell them to keep it private

You have access to LIVE data from the CityLink database (provided below each message).
Use this data to answer questions about events, services and announcements accurately.

When answering about events:
- Tell users the actual event names, dates, locations and available spots
- If an event is today or tomorrow, highlight that
- If an event is fully booked, say so clearly
- Recommend users visit /events to book

When answering about services:
- List actual service names and contact details
- Direct users to /services to submit requests

Keep answers SHORT (2-4 sentences). Be friendly and helpful.
Portal: /events /services /announcements /faq /feedback /contact /login /signup
Contact: info@citylink.gov | (08) 9000 0000`;

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    // Get live DB context
    const liveContext = await getLiveContext();

    const lastMessages = messages.slice(-4);
    const history = lastMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}

=== LIVE DATABASE DATA ===
${liveContext}
=========================

${history}
Assistant:`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body:    JSON.stringify({
        model:  OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 120,
          num_ctx:     1024,
          top_k:       10,
          top_p:       0.9,
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(500).json({ message: "AI service unavailable. Make sure Ollama is running." });
    }

    const data = await response.json();
    let answer  = data.response?.trim() || "Sorry, I could not generate a response.";

    // Security filter — never leak credentials
    const credentialPatterns = [/password/i, /username/i, /enter your.*email/i, /please (enter|provide|give)/i];
    if (credentialPatterns.some((p) => p.test(answer))) {
      answer = "I can't help with account credentials. Please visit /login or contact info@citylink.gov for account assistance.";
    }

    res.json({ answer });

  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ message: "Response took too long. Please try a shorter question." });
    }
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ message: "AI assistant is offline. Please try again later." });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;