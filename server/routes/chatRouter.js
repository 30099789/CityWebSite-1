// routes/chatRouter.js
// AI chatbot powered by Google Gemini API (gemini-2.0-flash-lite)
// Assessment requirement: AI-powered chatbot with live database context
// Fetches live events, services and announcements from MongoDB
// and sends them as context to Gemini so it can answer accurately
// Rate limited to 10 requests per minute per IP to protect Gemini free tier quota
// API key stored in GEMINI_API_KEY environment variable — never hardcoded

const express      = require("express");
const router       = express.Router();
const Event        = require("../models/Event");
const Service      = require("../models/Service");
const Announcement = require("../models/Announcement");

// ── Gemini API config ─────────────────────────────────────────────────
// gemini-2.0-flash-lite — free tier: 1,500 req/day, 30 RPM (most generous free model)
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ── Rate limiting ─────────────────────────────────────────────────────
// Simple in-memory rate limiter — no extra npm packages needed
// Limits each IP address to 8 chat requests per minute (conservative buffer below Gemini's 30 RPM)
// Map stores { count, start } per IP — resets after 1 minute window
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now    = Date.now();
  const window = 60 * 1000; // 1 minute in milliseconds
  const limit  = 8;         // stay well under Gemini's 30 RPM free tier limit

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  const entry = rateLimitMap.get(ip);

  // Reset the window if 1 minute has passed since first request
  if (now - entry.start > window) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  // Increment request count and check against limit
  entry.count++;
  return entry.count > limit;
}

// ── Retry helper ──────────────────────────────────────────────────────
// If Gemini returns 429 (quota), waits retryDelay ms and tries again
// Gives up after maxRetries attempts and throws so the route returns a clean error
async function fetchWithRetry(url, options, maxRetries = 2, retryDelay = 5000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    // Success — return immediately
    if (response.ok) return response;

    // 429 quota hit — wait and retry (unless this was the last attempt)
    if (response.status === 429 && attempt < maxRetries) {
      console.warn(`Gemini 429 — attempt ${attempt + 1}/${maxRetries + 1}, retrying in ${retryDelay / 1000}s…`);
      await new Promise((r) => setTimeout(r, retryDelay));
      continue;
    }

    // Other error or retries exhausted — return the response so caller can handle it
    return response;
  }
}

// ── Date helpers ──────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "TBA";
  return new Date(d).toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "long", year: "numeric"
  });
}

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

// ── Live database context ─────────────────────────────────────────────
// Assessment requirement: chatbot reads live data from MongoDB
// Fetches upcoming events, available services and published announcements
// This context is sent to Gemini with every request so answers are accurate
// Only reads public data — no user passwords or personal data exposed
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

    // Add upcoming events with spot availability and urgency
    if (upcoming.length > 0) {
      context += `UPCOMING EVENTS (${upcoming.length} total):\n`;
      upcoming.forEach((e) => {
        const days      = daysUntil(e.date);
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

    // Add available services with contact details
    if (services.length > 0) {
      context += `\nAVAILABLE SERVICES (${services.length} total):\n`;
      services.forEach((s) => {
        context += `- ${s.title} (${s.category}) | Phone: ${s.contact?.phone || "N/A"} | Email: ${s.contact?.email || "N/A"}\n`;
      });
    }

    // Add latest published announcements
    if (announcements.length > 0) {
      context += `\nLATEST ANNOUNCEMENTS:\n`;
      announcements.forEach((a) => {
        context += `- [${a.priority?.toUpperCase() || "INFO"}] "${a.title}" — ${a.summary || ""}\n`;
      });
    }

    return context;
  } catch (err) {
    console.error("Gemini context DB error:", err.message);
    return "Live data temporarily unavailable.";
  }
}

// ── System prompt ─────────────────────────────────────────────────────
// Tells Gemini how to behave as the CityLink assistant
// Sets security rules, tone, response length and portal navigation links
const SYSTEM_PROMPT = `You are the CityLink Smart Community Portal assistant for CityLink Initiatives, Perth WA.

SECURITY RULES:
- NEVER ask for passwords, usernames, or any credentials
- NEVER collect or store personal information
- If someone shares a password, tell them to keep it private and not share it

You have access to LIVE data from the CityLink database (provided below each message).
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
// Receives conversation history from Chatbot.jsx
// Fetches live DB context, builds Gemini request, returns AI response
// Assessment requirement: AI chatbot using external API with live data
router.post("/", async (req, res) => {
  try {
    // Rate limit check — returns 429 if IP exceeds 8 requests/minute
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
      return res.status(429).json({
        message: "Too many requests. Please wait a minute before sending another message."
      });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    // Check Gemini API key is configured in environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: "Chatbot is not configured. Please contact the administrator." });
    }

    // Get live data from MongoDB to give Gemini accurate context
    const liveContext = await getLiveContext();

    // Build Gemini conversation history
    // Gemini format: { role: "user"/"model", parts: [{ text }] }
    // Only send last 6 messages to avoid exceeding token limits
    const lastMessages = messages.slice(-6);
    const history = lastMessages.map((m) => ({
      role:  m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Combine system prompt with live database context
    const fullPrompt = `${SYSTEM_PROMPT}\n\n=== LIVE DATABASE DATA ===\n${liveContext}\n=========================`;

    // Build Gemini API request body
    const geminiBody = {
      contents: [
        // System context as opening turn (user then model confirms understanding)
        { role: "user",  parts: [{ text: fullPrompt }] },
        { role: "model", parts: [{ text: "Understood! I'm ready to help CityLink community members with accurate, live information." }] },
        // Actual conversation history
        ...history,
      ],
      generationConfig: {
        temperature:     0.5,  // balanced — not too creative, not too rigid
        maxOutputTokens: 200,  // keep responses short (fewer tokens = fewer quota hits)
        topK:            10,
        topP:            0.9,
      },
      // Safety filters — blocks harmful content from Gemini responses
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    // Call Gemini API with automatic retry on 429 quota errors
    const response = await fetchWithRetry(
      `${GEMINI_URL}?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(geminiBody),
      },
      2,     // retry up to 2 times
      5000   // wait 5 seconds between retries
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errData);

      // Return friendly 429 message so Chatbot.jsx can display it nicely
      if (response.status === 429) {
        return res.status(429).json({ message: "AI is busy right now. Please wait a moment and try again." });
      }

      return res.status(500).json({ message: "AI service error. Please try again." });
    }

    const data = await response.json();

    // Extract text from Gemini response structure
    let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return res.status(500).json({ message: "No response from AI. Please try again." });
    }

    // Security filter — extra protection against credential-related responses
    // Even if Gemini ignores the system prompt, this catches credential requests
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
    console.error("Chat route error:", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;