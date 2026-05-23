// routes/chatRouter.js — AI chatbot using Google Gemini API + live DB data
// Assessment requirement: AI-powered chatbot with live database context
// Replaced local Ollama with Gemini API so chatbot works on deployed version
// API key stored in environment variable GEMINI_API_KEY (never hardcoded)

const express      = require("express");
const router       = express.Router();
const Event        = require("../models/Event");
const Service      = require("../models/Service");
const Announcement = require("../models/Announcement");

// Gemini API endpoint — using gemini-2.0-flash (free tier, fast)
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ── Format helpers ────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "TBA";
  return new Date(d).toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "long", year: "numeric"
  });
}

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

// ── Build live context from MongoDB ──────────────────────────────────
// Fetches upcoming events, services and published announcements
// Sends this data to Gemini as context so it can answer accurately
async function getLiveContext() {
  try {
    const today = new Date();
    const [events, services, announcements] = await Promise.all([
      Event.find().sort({ date: 1 }).limit(20),
      Service.find().limit(10),
      Announcement.find({ status: "Published" }).sort({ date: -1 }).limit(5),
    ]);

    const upcoming = events.filter((e) => new Date(e.date) >= today);
    const next     = upcoming[0];

    let context = `TODAY: ${today.toLocaleDateString("en-AU", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    })}\n\n`;

    if (upcoming.length > 0) {
      context += `UPCOMING EVENTS (${upcoming.length}):\n`;
      upcoming.forEach((e) => {
        const days     = daysUntil(e.date);
        const spotsLeft = e.capacity - (e.booked || 0);
        context += `- "${e.title}" on ${formatDate(e.date)} at ${e.time || "TBA"}, ${e.location || "TBA"}`;
        context += ` | Status: ${e.status}`;
        context += ` | ${spotsLeft > 0 ? `${spotsLeft} spots left` : "FULLY BOOKED"}`;
        context += ` | ${days === 0 ? "TODAY!" : days === 1 ? "TOMORROW!" : `in ${days} days`}`;
        context += "\n";
      });
    } else {
      context += "UPCOMING EVENTS: None currently scheduled.\n";
    }

    if (next) {
      context += `\nNEXT EVENT: "${next.title}" — ${daysUntil(next.date) <= 0 ? "today!" : `in ${daysUntil(next.date)} days on ${formatDate(next.date)}`}\n`;
    }

    if (services.length > 0) {
      context += `\nSERVICES (${services.length}):\n`;
      services.forEach((s) => {
        context += `- ${s.title} (${s.category}) | Phone: ${s.contact?.phone || "N/A"} | Email: ${s.contact?.email || "N/A"}\n`;
      });
    }

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

// ── System prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the CityLink Smart Community Portal assistant for CityLink Initiatives, Perth WA.

SECURITY RULES:
- NEVER ask for passwords, usernames, or any credentials
- NEVER collect personal information
- If someone shares a password, tell them to keep it private

You have access to LIVE data from the CityLink database (provided with each message).
Use this data to answer questions about events, services and announcements accurately.

When answering about events:
- Give actual event names, dates, locations and spots remaining
- Highlight if an event is today or tomorrow
- Say clearly if an event is fully booked
- Direct users to /events to book

When answering about services:
- List actual service names and contact details
- Direct users to /services to submit requests

Keep answers SHORT (2-4 sentences). Be friendly and helpful.
Portal pages: /events /services /announcements /faq /feedback /contact /login /signup
Contact: info@citylink.gov | (08) 9000 0000`;

// ── POST /api/chat ────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: "Chatbot is not configured. Please contact the administrator." });
    }

    // Get live database context
    const liveContext = await getLiveContext();

    // Build conversation history for Gemini
    // Gemini uses { role: "user"/"model", parts: [{ text }] } format
    const lastMessages = messages.slice(-6);
    const history = lastMessages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Add system context as first user message if no history
    const fullPrompt = `${SYSTEM_PROMPT}\n\n=== LIVE DATABASE DATA ===\n${liveContext}\n=========================`;

    // Build Gemini request body
    const geminiBody = {
      contents: [
        // System context as first turn
        { role: "user",  parts: [{ text: fullPrompt }] },
        { role: "model", parts: [{ text: "Understood! I'm ready to help CityLink community members with accurate, live information." }] },
        // Actual conversation
        ...history,
      ],
      generationConfig: {
        temperature:     0.5,
        maxOutputTokens: 200,
        topK:            10,
        topP:            0.9,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    // Call Gemini API
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Gemini API error:", errData);
      return res.status(500).json({ message: "AI service error. Please try again." });
    }

    const data = await response.json();

    // Extract text from Gemini response
    let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return res.status(500).json({ message: "No response from AI. Please try again." });
    }

    // Security filter — never leak credentials
    const credentialPatterns = [
      /password/i,
      /username/i,
      /enter your.*email/i,
      /please (enter|provide|give)/i,
    ];
    if (credentialPatterns.some((p) => p.test(answer))) {
      answer = "I can't help with account credentials. Please visit /login or contact info@citylink.gov for account assistance.";
    }

    res.json({ answer });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;