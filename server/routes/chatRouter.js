// routes/chatRouter.js — AI chatbot using local Ollama (optimised for speed)
const express = require("express");
const router  = express.Router();

const OLLAMA_URL   = process.env.OLLAMA_URL   || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:1b";

const SYSTEM_PROMPT = `You are the CityLink community portal assistant.

CRITICAL SECURITY RULES - NEVER break these:
- NEVER ask for passwords, usernames, email addresses or any credentials
- NEVER collect or request personal information
- If someone shares a password, tell them to keep it private and never share it
- Direct all login issues to the Login page at /login

Your role: Answer questions about the CityLink portal only.
Topics: events, bookings, services, announcements, FAQ, feedback, contact, accessibility.
Portal pages: /events /services /announcements /faq /feedback /contact /login /signup
Contact: info@citylink.gov | (08) 9000 0000

Rules:
- Keep answers to 2-3 sentences
- Never ask for personal details
- For account help, direct to /login or /signup
- Be friendly and helpful`;

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const lastMessages = messages.slice(-4);
    const history = lastMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}\n\n${history}\nAssistant:`;

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
          num_predict: 80,
          num_ctx:     512,
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

    // Post-process: if AI still asks for credentials, override
    const credentialPatterns = [
      /password/i, /username/i, /enter your.*email/i, /please (enter|provide|give)/i
    ];
    if (credentialPatterns.some((p) => p.test(answer))) {
      answer = "I can't help with account credentials. Please visit the Login page at /login or contact us at info@citylink.gov for account assistance.";
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