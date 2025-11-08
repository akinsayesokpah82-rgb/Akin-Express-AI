import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Firebase Admin Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
  console.log("✅ Firebase Admin Initialized");
} catch (err) {
  console.error("⚠️ Firebase Admin Error:", err.message);
}

// --- AI Chat Endpoint ---
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t process that.";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({ error: "AI service unavailable." });
  }
});

// --- Default route ---
app.get("/", (req, res) => {
  res.send("🧠 Akin Express AI backend is running successfully!");
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
