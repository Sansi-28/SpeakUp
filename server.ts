import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * 1. Search-Grounded Tech Briefing
 * Uses gemini-3.8-flash with googleSearch tool to fetch real-time facts,
 * current 2026/recent developments, key architectural trade-offs, and
 * a 3-minute speaking framework.
 */
app.post("/api/gemini/search-brief", async (req, res) => {
  try {
    const { topicTitle, topicCategory, researchQuestion } = req.body;
    if (!topicTitle) {
      return res.status(400).json({ error: "topicTitle is required" });
    }

    const prompt = `Topic: "${topicTitle}" (${topicCategory || "General"})
Guiding Thought: "${researchQuestion || "Key insights"}"

Provide a crisp, approachable briefing for someone preparing to speak for 2-3 minutes.
Keep it concise, engaging, and easy to understand (under 180 words total).

Format strictly as:
• The Big Idea: 1 clear sentence on why this matters.
• 3 Key Talking Points:
  1. 
  2. 
  3. 
• Practical Takeaway: 1 closing thought for everyday life.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const briefText = response.text || "No briefing generated.";
    // Extract search grounding metadata if present
    const searchChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = searchChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({ title: w.title, uri: w.uri }));

    return res.json({
      brief: briefText,
      sources: webSources,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/search-brief:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate search briefing",
    });
  }
});

/**
 * 2. Multi-Turn AI Speech & Tech Coach
 * Uses gemini-3.8-flash to maintain conversation history,
 * help the speaker refine arguments, polish the hook, and anticipate questions.
 */
app.post("/api/gemini/chat-coach", async (req, res) => {
  try {
    const { messages, topicTitle, currentNotes } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const systemInstruction = `You are "Coach Vance", a supportive but rigorous technical speaking coach for senior engineers and engineering leaders.
The user is preparing a daily 2-to-3 minute video journal entry.
Current Topic: "${topicTitle || "General Tech Speech"}"
${currentNotes ? `User's Current Notes/Talking Points:\n${currentNotes}` : ""}

Your Mission:
- Guide the user to speak clearly, concisely, and persuasively in 2 to 3 minutes (approx 300 to 450 words total).
- Critique weak filler phrases, encourage concrete metrics and architectural details, and recommend the "Problem -> Architecture -> Tradeoff" formula.
- Keep answers punchy, actionable, and formatted in clean markdown. Keep coaching responses under 200 words unless asked for an outline.`;

    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || "I am ready to help you rehearse your talk.",
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat-coach:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process coach message",
    });
  }
});

/**
 * 3. AI Topic Expander / Synthesizer
 * Generates fresh batches of unique, non-duplicative topics.
 */
app.post("/api/gemini/generate-topics", async (req, res) => {
  try {
    const { category, count = 20, existingTitles = [] } = req.body;

    const prompt = `Generate ${count} completely unique, advanced, and intriguing tech topics in the category "${category || "Advanced Systems & AI"}".
Each topic should be tailored for a developer to research for 5-10 minutes and speak about for 2-3 minutes.
Do NOT include any of the following existing topics:
${existingTitles.slice(-50).join(", ")}

Return the output strictly in JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Clear topic title" },
              category: { type: Type.STRING, description: "Tech domain category" },
              difficulty: {
                type: Type.STRING,
                description: "Beginner, Intermediate, or Reflective",
              },
              researchQuestion: {
                type: Type.STRING,
                description: "Key guiding question to investigate in 5-10 min",
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 relevant tags",
              },
            },
            required: ["title", "category", "difficulty", "researchQuestion", "keywords"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ topics: parsed });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-topics:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate additional topics",
    });
  }
});

/**
 * 4. Focus Music Generator (Lyria Clip Preview)
 * Generates a 30-second focus audio clip for deep research prep.
 */
app.post("/api/gemini/focus-music", async (req, res) => {
  try {
    const { prompt = "Ambient lo-fi synthwave study music, calm steady pulse, deep focus, warm analog pads, no harsh beats" } = req.body;

    // Use lyria-3-clip-preview streaming API as specified in gemini-api skill
    const responseStream = await ai.models.generateContentStream({
      model: "lyria-3-clip-preview",
      contents: prompt,
    });

    let audioBase64 = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: "No audio data generated" });
    }

    return res.json({
      audioUrl: `data:${mimeType};base64,${audioBase64}`,
      mimeType,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/focus-music:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate focus audio",
    });
  }
});

// Vite middleware mounting in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SpeakUp] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
