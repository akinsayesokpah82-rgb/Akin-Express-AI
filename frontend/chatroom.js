// chatroom.js
import { db, ref, push, onChildAdded, signInWithGoogle, logout, watchAuthState } from "./firebase.js";

const messagesRef = ref(db, "messages");
const messagesList = document.getElementById("messages");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");
const authBtn = document.getElementById("authBtn");
const userDisplay = document.getElementById("userDisplay");

let currentUser = null;

// --- AUTH SECTION ---
watchAuthState((user) => {
  if (user) {
    currentUser = user;
    userDisplay.textContent = `Welcome, ${user.displayName}`;
    authBtn.textContent = "Logout";
  } else {
    currentUser = null;
    userDisplay.textContent = "Not signed in";
    authBtn.textContent = "Login with Google";
  }
});

authBtn.addEventListener("click", async () => {
  if (currentUser) {
    await logout();
  } else {
    await signInWithGoogle();
  }
});

// --- MESSAGES SECTION ---
sendBtn.addEventListener("click", async () => {
  const text = inputBox.value.trim();
  if (text === "") return;

  const msg = {
    text,
    sender: currentUser ? currentUser.displayName : "Anonymous",
    time: new Date().toLocaleTimeString(),
  };

  push(messagesRef, msg);
  inputBox.value = "";

  // send message to backend AI (optional)
  try {
    const res = await fetch("https://akin-express-ai.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    push(messagesRef, { text: data.reply, sender: "Akin AI 🤖", time: new Date().toLocaleTimeString() });
  } catch (err) {
    console.error("AI Error:", err);
  }
});

onChildAdded(messagesRef, (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text} <span class="time">${msg.time}</span>`;
  messagesList.appendChild(div);
  messagesList.scrollTop = messagesList.scrollHeight;
});
