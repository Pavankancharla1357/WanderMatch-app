import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  console.log("Environment Variables Debug:");
  Object.keys(process.env).forEach(key => {
    if (key.startsWith("GEMINI") || key.startsWith("VITE")) {
      const val = process.env[key];
      console.log(`${key}: ${val ? `Present (length: ${val.length}, starts with: ${val.substring(0, 4)})` : "Missing"}`);
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "WanderMatch API is healthy" });
  });

  // Auth & User API placeholders (to be expanded)
  app.post("/api/auth/register", (req, res) => {
    // Logic for registration
    res.status(201).json({ message: "User registered" });
  });

  app.post("/api/auth/login", (req, res) => {
    // Logic for login
    res.json({ token: "fake-jwt-token" });
  });

  // AI Suggestions API
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { destination, travelStyle, existingActivities } = req.body;
      // Use the new key first, then fallback to the original one
      const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey.length < 10) {
        const envKeys = Object.keys(process.env).filter(k => k.startsWith("GEMINI") || k.startsWith("VITE"));
        return res.status(500).json({ 
          error: `Gemini API Key is missing or too short (length: ${apiKey?.length || 0}). 
          Available environment variables: ${envKeys.join(", ")}. 
          Please ensure you have clicked 'Apply changes' in the Secrets panel after adding GEMINI_API_KEY_1.` 
        });
      }

      const { GoogleGenAI, ThinkingLevel } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Suggest 5 unique and exciting travel activities for a trip to ${destination}.
        Travel Style: ${travelStyle}
        Already planned activities: ${existingActivities.join(", ")}
        
        Return a JSON array of suggestions. Each suggestion should include:
        - title: string
        - description: string (short and engaging)
        - category: string (e.g., Adventure, Food, Culture, Relaxation)
        - estimatedCost: string (e.g., "₹1500 - ₹3000", "Free")
        - duration: string (e.g., "2 hours", "Full day")
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = result.text;
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error in /api/ai/suggestions:", error);
      res.status(500).json({ error: error.message || "Failed to get AI suggestions" });
    }
  });

  // Full Itinerary Generation API
  app.post("/api/ai/itinerary", async (req, res) => {
    try {
      const { destination, days, budget, style, startLocation } = req.body;
      const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey.length < 10) {
        return res.status(500).json({ error: "Gemini API Key is missing or invalid." });
      }

      const { GoogleGenAI, ThinkingLevel } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert travel planner.
        Create a detailed travel itinerary based on the user's input.

        User Input:
        - Destination: ${destination}
        - Number of days: ${days}
        - Budget: ₹${budget} (Indian Rupees)
        - Travel style: ${style} (budget/luxury/adventure/relaxed)
        - Starting location: ${startLocation}

        Instructions:
        - Create a day-wise itinerary
        - Include places to visit, timing, and short descriptions
        - Suggest local food and experiences
        - Estimate daily cost in Indian Rupees (₹)
        - Keep total cost within budget
        - Make it realistic (distance + travel time considered)

        Output format (STRICT JSON ONLY):
        {
          "destination": "",
          "total_estimated_budget": "",
          "days": [
            {
              "day": 1,
              "plan": [
                {
                  "time": "",
                  "activity": "",
                  "location": "",
                  "cost_estimate": ""
                }
              ]
            }
          ],
          "tips": [],
          "packing_suggestions": []
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = result.text;
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error in /api/ai/itinerary:", error);
      res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  });

  // Soulmate Matching API
  app.post("/api/ai/soulmate", async (req, res) => {
    try {
      const { currentUser, otherUsers } = req.body;
      const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey.length < 10) {
        return res.status(500).json({ error: "Gemini API Key is missing or invalid." });
      }

      const { GoogleGenAI, ThinkingLevel } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // Prepare the data for Gemini
      const othersData = otherUsers.map((u: any) => ({
        uid: u.uid,
        name: u.name || "Anonymous",
        age: u.age,
        style: u.travel_style,
        interests: Array.isArray(u.interests) ? u.interests.join(", ") : u.interests,
        bio: u.bio
      }));

      const prompt = `
        You are an expert travel matchmaker. I will give you a user's travel preferences and a list of other potential travel buddies.
        Your task is to find the single BEST "Travel Soulmate" for the user from the list.

        USER PREFERENCES:
        - Budget: ${currentUser.budget} INR
        - Style: ${currentUser.style}
        - Personality: ${currentUser.personality}
        - Interests: ${currentUser.interests}

        POTENTIAL BUDDIES:
        ${JSON.stringify(othersData, null, 2)}

        Analyze compatibility based on:
        1. Budget alignment (similar or complementary).
        2. Travel style synergy.
        3. Interest overlap.
        4. Personality balance.

        Return the result in JSON format:
        {
          "soulmate_uid": "the uid of the best match",
          "soulmate_name": "the name of the best match",
          "compatibility_score": number (0-100),
          "match_summary": "a short, engaging explanation of why they are soulmates",
          "common_interests": ["interest 1", "interest 2"],
          "differences": ["difference 1"],
          "suggested_trip_type": "a specific trip idea for them",
          "confidence_level": "high" | "medium" | "low"
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = result.text;
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error in /api/ai/soulmate:", error);
      res.status(500).json({ error: error.message || "Failed to find soulmate" });
    }
  });

  // Match Travelers API
  app.post("/api/ai/match", async (req, res) => {
    try {
      const { userA, userB } = req.body;
      const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey.length < 10) {
        return res.status(500).json({ error: "Gemini API Key is missing or invalid." });
      }

      const { GoogleGenAI, ThinkingLevel } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an intelligent travel compatibility matcher.
        Match two users based on their travel preferences and personality.

        User A:
        - Budget: ${userA.budget}
        - Travel style: ${userA.style}
        - Interests: ${userA.interests}
        - Personality: ${userA.personality}

        User B:
        - Budget: ${userB.budget}
        - Travel style: ${userB.style}
        - Interests: ${userB.interests}
        - Personality: ${userB.personality}

        Instructions:
        - Calculate compatibility score (0–100)
        - Explain why they match
        - Highlight similarities and differences
        - Suggest what kind of trip they can enjoy together

        Output format (STRICT JSON ONLY):
        {
          "compatibility_score": 0,
          "match_summary": "",
          "common_interests": [],
          "differences": [],
          "suggested_trip_type": "",
          "confidence_level": "low/medium/high"
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = result.text;
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error in /api/ai/match:", error);
      res.status(500).json({ error: error.message || "Failed to match travelers" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
