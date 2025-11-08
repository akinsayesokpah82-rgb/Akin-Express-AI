import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { db } from "./firebaseAdmin.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("backend/public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- API Endpoint ---
app.post("/api", async (req, res) => {
  try {
    const { text, userId } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
    });

    const reply = completion.choices[0].message.content;

    // ✅ Save chat to Firebase
    if (userId) {
      const ref = db.ref(`users/${userId}/chats`).push();
      await ref.set({ question: text, answer: reply, timestamp: Date.now() });
    }

    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/backend/public/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🧠 Akin Express AI backend running on port ${PORT}`));
