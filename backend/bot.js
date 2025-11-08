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
      const
