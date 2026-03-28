import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Recommendation Endpoint
    app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { budget, preferences, guestCount } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please set it in your environment variables." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const prompt = `You are an AI assistant for HotelIQ. Based on the following user preferences, suggest the best room types and provide a short, welcoming recommendation message.
      - Budget: $${budget} per night
      - Preferences: ${preferences}
      - Guests: ${guestCount}

      Available Room Types:
      1. Single: $100/night, 1 guest
      2. Double: $180/night, 2 guests
      3. Deluxe: $300/night, 3 guests
      4. Suite: $500/night, 4 guests

      Respond in JSON format:
      {
        "recommendation": "string",
        "suggestedRoomTypes": ["string"]
      }`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { 
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("AI failed to generate a response.");
      }

      // Clean the response text in case it contains markdown markers
      const cleanedText = text.replace(/```json\n?|```/g, "").trim();
      
      try {
        const parsedData = JSON.parse(cleanedText);
        res.json(parsedData);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Original Text:", text);
        res.status(500).json({ error: "Failed to parse AI response." });
      }
    } catch (error: any) {
      console.error("AI Recommendation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
