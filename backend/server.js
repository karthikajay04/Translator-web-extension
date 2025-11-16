/**
 * SINGLE-FILE BACKEND
 * Contains:
 *  - Language detection (REAL LINGO)
 *  - Text translation (REAL LINGO)
 *  - HTML translation (REAL LINGO)
 *  - Compatibility translate API
 *  - AI text generation using OpenRouter
 */

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

// --------------------------
// Lingo.dev SDK
// --------------------------
const { LingoDotDevEngine } = require("lingo.dev/sdk");

// Validate API key at startup
if (!process.env.LINGODOTDEV_API_KEY) {
  console.error("Error: LINGODOTDEV_API_KEY is not set in environment variables.");
  process.exit(1);
}

const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

/* ---------------------------------------------------
   VALIDATE LOCALE FUNCTION
--------------------------------------------------- */
function validateLocale(locale) {
  if (!locale || typeof locale !== 'string') return false;
  // Basic check for common locale formats (e.g., en, en-US, zh-CN)
  const localeRegex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
  return localeRegex.test(locale);
}

/* ---------------------------------------------------
   CLEANER FOR AI OUTPUT
--------------------------------------------------- */
function cleanAIResponse(text = "") {
  return text
    .replace(/<\/?s>/gi, "")
    .replace(/\[OUT\]|\[\/OUT\]/gi, "")
    .replace(/\[INST\]|\[\/INST\]/gi, "")
    .replace(/<\|.*?\|>/g, "")
    .trim();
}

/* ---------------------------------------------------
   OPENROUTER GENERATE FUNCTION
--------------------------------------------------- */
async function generateWithOpenRouter(prompt, systemPrompt) {
  try {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    console.log("Sending request to OpenRouter with messages:", JSON.stringify(messages, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "ai-hub"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      const text = await response.text();
      console.error("Failed to parse JSON from OpenRouter:", jsonErr.message);
      console.error("Response text:", text);
      throw new Error(`Invalid JSON response from OpenRouter: ${text}`);
    }

    console.log("OpenRouter response status:", response.status);
    console.log("OpenRouter response data:", JSON.stringify(data, null, 2));

    if (response.status !== 200) {
      throw new Error(`OpenRouter API error: ${response.status} - ${data?.error?.message || 'Unknown error'}`);
    }

    if (!data?.choices?.length) {
      console.error("No choices in response, full data:", JSON.stringify(data, null, 2));
      throw new Error(`No response from OpenRouter model: ${JSON.stringify(data)}`);
    }

    const raw = data.choices[0].message?.content || "";
    return cleanAIResponse(raw);

  } catch (err) {
    console.error("OpenRouter API Error:", err.message);
    throw new Error("Failed to generate from OpenRouter");
  }
}

/* ---------------------------------------------------
   SYSTEM PROMPT (BUILT-IN)
--------------------------------------------------- */
const SYSTEM_PROMPT = `
You are an AI content generator inside a Chrome extension.
Your job is to rewrite or generate text based on the user's mood:

- "happy" → joyful, optimistic
- "sad" → emotional, soft, melancholic
- "excited" → energetic, enthusiastic
- "neutral" → simple, balanced, professional

Preserve meaning. Keep responses clean. Do NOT add unrelated info.
`;

/* ---------------------------------------------------
   REAL LANGUAGE DETECT (LINGO)
--------------------------------------------------- */
app.post("/detect", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.json({ language: "" });

    const locale = await lingo.recognizeLocale(text);
    res.json({ language: locale || "" });
  } catch (err) {
    console.error("Detect error:", err);
    res.json({ language: "" });
  }
});

/* ---------------------------------------------------
   REAL TEXT TRANSLATION (LINGO)
--------------------------------------------------- */
app.post("/translateText", async (req, res) => {
  let text = "";
  try {
    const body = req.body || {};
    text = body.text;
    const targetLang = body.targetLang;
    if (!text) return res.status(400).json({ error: "no text" });
    if (!validateLocale(targetLang)) return res.status(400).json({ error: "invalid targetLang" });

    const translated = await lingo.localizeText(text, {
      sourceLocale: null,        // Auto detect
      targetLocale: targetLang,  // Real translation
    });

    res.json({ translated });
  } catch (err) {
    console.error("translateText error:", err);
    
    // Check for API limit errors
    if (err.message && err.message.includes("Maximum number of translated words")) {
      return res.status(402).json({ 
        error: "Translation limit reached",
        message: "Translation limit reached. Please upgrade your Lingo.dev plan.",
        translated: text || ""
      });
    }
    
    res.json({ translated: text || "", error: "Translation failed" });
  }
});

/* ---------------------------------------------------
   REAL HTML TRANSLATION (LINGO)
--------------------------------------------------- */
app.post("/translateHtml", async (req, res) => {
  let html = "";
  try {
    const body = req.body || {};
    html = body.html;
    const targetLang = body.targetLang;
    if (!html) return res.status(400).json({ error: "no html" });
    if (!validateLocale(targetLang)) return res.status(400).json({ error: "invalid targetLang" });

    const translatedHtml = await lingo.localizeHtml(html, {
      sourceLocale: null,
      targetLocale: targetLang,
    });

    res.json({ translatedHtml });

  } catch (err) {
    console.error("translateHtml error:", err);
    
    // Check for API limit errors
    if (err.message && err.message.includes("Maximum number of translated words")) {
      return res.status(402).json({ 
        error: "Translation limit reached",
        message: "Translation limit reached. Please upgrade your Lingo.dev plan.",
        translatedHtml: html || ""
      });
    }
    
    res.json({ translatedHtml: html || "", error: "Translation failed" });
  }
});

/* ---------------------------------------------------
   /translate (Compatibility API) - REAL LINGO
--------------------------------------------------- */
app.post("/translate", async (req, res) => {
  let text = "";
  try {
    const body = req.body || {};
    text = body.text;
    const language = body.language;
    if (!text) return res.status(400).json({ error: "no text" });
    if (!validateLocale(language)) return res.status(400).json({ error: "invalid language" });

    const translated = await lingo.localizeText(text, {
      sourceLocale: null,
      targetLocale: language,
    });

    res.json({ translated });

  } catch (err) {
    console.error("translate error:", err);
    
    // Check for API limit errors
    if (err.message && err.message.includes("Maximum number of translated words")) {
      return res.status(402).json({ 
        error: "Translation limit reached",
        message: "You've reached the free plan limit for translations. Please upgrade your Lingo.dev plan or wait for the limit to reset.",
        translated: text || ""
      });
    }
    
    // Check for other API errors
    if (err.message && (err.message.includes("API") || err.message.includes("limit"))) {
      return res.status(500).json({ 
        error: "Translation service error",
        message: err.message,
        translated: text || ""
      });
    }
    
    res.json({ translated: text || "", error: "Translation failed" });
  }
});

/* ---------------------------------------------------
   /api/generate  (REAL AI VIA OPENROUTER)
--------------------------------------------------- */
app.post("/api/generate", async (req, res) => {
  try {
    const { text, mood } = req.body || {};
    if (!text) return res.status(400).json({ error: "no text" });

    const finalPrompt = `
User Mood: ${mood || "neutral"}
User Input: ${text}

Rewrite or generate text matching the mood. Do not change meaning.
`;

    const aiResponse = await generateWithOpenRouter(finalPrompt, SYSTEM_PROMPT);

    res.json({ generated: aiResponse });

  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "generation failed" });
  }
});

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
