// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initFirebaseAdmin } from "./firebaseAdmin.js";
import { registerMessageListener, startGospelNotifier } from "./bot.js";

const port = process.env.PORT || 3000;

try {
  initFirebaseAdmin(); // ensure admin is initialized
} catch (err) {
  console.error("Failed to init firebase admin:", err);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Basic health check
app.get("/", (req, res) => {
  res.json({ ok: true, service: "AkinExpressAI backend" });
});

// Optional: allow posting a system announcement via POST (protected by RENDER_SECRET)
app.post("/admin/announce", async (req, res) => {
  const secret = req.headers["x-render-secret"] || req.query.secret;
  if (!secret || secret !== process.env.RENDER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { message } = req.body;
  const admin = await import("./bot.js");
  try {
    await admin.postBotMessage(message);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "failed to post" });
  }
});

// Start background services
registerMessageListener();
startGospelNotifier();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
