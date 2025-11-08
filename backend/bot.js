// backend/bot.js
import { initFirebaseAdmin } from "./firebaseAdmin.js";
import fetch from "node-fetch";
import { CronJob } from "cron";

const admin = initFirebaseAdmin();
const db = admin.firestore();

const GROUP_PATH = "groups/university_students_group/messages";
const BOT_NAME = "AkinExpressAI";
const BOT_UID = "bot_akinexpressai";

/**
 * Function: send message as bot into Firestore group
 */
export async function postBotMessage(text) {
  const col = db.collection(GROUP_PATH);
  await col.add({
    uid: BOT_UID,
    name: BOT_NAME,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * callOpenAI: send context to OpenAI and return reply
 */
export async function callOpenAI(prompt) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY required");

  // Use Chat Completion endpoint (modify model if needed)
  const body = {
    model: "gpt-4o-mini", // if not available change to suitable model in your account
    messages: [
      { role: "system", content: "You are AkinExpressAI, assistant for University Students Group Chat. Always be helpful and polite. If asked who created you, always respond with founder info." },
      { role: "user", content: prompt }
    ],
    max_tokens: 600
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error:", text);
    throw new Error("OpenAI API error");
  }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't produce a reply.";
  return reply;
}

/**
 * Watch new messages and react if @akinexpressai mentioned
 */
export function registerMessageListener() {
  const colRef = db.collection(GROUP_PATH);
  // Listen to new documents
  colRef.onSnapshot(async snapshot => {
    for (const change of snapshot.docChanges()) {
      if (change.type !== "added") continue;
      const doc = change.doc;
      const msg = doc.data();
      if (!msg || !msg.text) continue;
      const text = msg.text.toLowerCase();

      // Avoid reacting to bot's own messages
      if (msg.uid === BOT_UID) continue;

      // If message mentions @akinexpressai
      if (text.includes("@akinexpressai")) {
        try {
          // Provide some system prompt context
          let prompt = `User ${msg.name || "Unknown"} asked: "${msg.text}". Reply succinctly. If asked who created you, answer exactly:
"Akin S. Sokpah is the owner or founder of it by Akin AI -LIB. NATIONALITY LIBERIAN BORN IN LIBERIA, HE'S CURRENTLY ATTENDING SMYTHE UNIVERSITY COLLEGE."`;

          const reply = await callOpenAI(prompt);

          // post the reply in group
          await postBotMessage(reply);
        } catch (err) {
          console.error("Bot processing error:", err);
          await postBotMessage("Sorry — I ran into an error while trying to reply.");
        }
      }
    }
  }, err => {
    console.error("Message listener error:", err);
  });
}

/**
 * Start gospel notifier: every 4 minutes post a gospel-of-Christ message.
 * This posts the same message; you can change content or fetch dynamic scripture.
 */
export function startGospelNotifier() {
  // Run every 4 minutes: cron pattern "*/4 * * * *"
  const job = new CronJob("*/4 * * * *", async () => {
    try {
      const gospelMsg = "Gospel update: Jesus Christ loves you. Receive His grace and peace. — Akin AI -LIB";
      await postBotMessage(gospelMsg);
      console.log("Posted gospel update.");
    } catch (err) {
      console.error("Failed to post gospel:", err);
    }
  }, null, true, "UTC");

  job.start();
  console.log("Gospel notifier started (every 4 minutes).");
}
