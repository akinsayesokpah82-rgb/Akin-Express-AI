import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import admin from "./firebaseAdmin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Root route
app.get("/", (req, res) => {
  res.send("🧠 Akin Express AI backend is running successfully!");
});

// POST route for chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Very basic AI reply (you can upgrade to GPT/OpenAI API)
    let reply = "";

    if (message.toLowerCase().includes("hello")) {
      reply = "Hi there 👋! I'm Akin Express AI. How can I help you today?";
    } else if (message.toLowerCase().includes("how are you")) {
      reply = "I'm doing great! Thanks for asking 😄";
    } else if (message.toLowerCase().includes("who created you")) {
      reply = "I was created by Akin Saye Sokpah ❤️ using Firebase and Express!";
    } else {
      reply = "Interesting 🤔... I'm learning from your messages.";
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
