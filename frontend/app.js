import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC7cAN-mrE2PvmlQ11zLKAdHBhN7nUFjHw",
  authDomain: "fir-u-c-students-web.firebaseapp.com",
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com",
  projectId: "fir-u-c-students-web",
  storageBucket: "fir-u-c-students-web.firebasestorage.app",
  messagingSenderId: "113569186739",
  appId: "1:113569186739:web:d8daf21059f43a79e841c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

const loginSection = document.getElementById("loginSection");
const chatSection = document.getElementById("chatSection");
const usernameDisplay = document.getElementById("username");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

let currentUser = null;
const AI_API_URL = "https://akin-express-ai.onrender.com/api/chat"; // your backend URL

googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    usernameDisplay.textContent = user.displayName;
    loginSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    loadMessages();
  } else {
    chatSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  }
});

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  push(ref(db, "messages"), {
    user: currentUser.displayName,
    text,
    timestamp: Date.now()
  });
  messageInput.value = "";

  // If message includes @akinexpressai, send to backend AI
  if (text.toLowerCase().includes("@akinexpressai")) {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    push(ref(db, "messages"), {
      user: "Akin Express AI 🤖",
      text: data.reply,
      timestamp: Date.now()
    });
  }
});

function loadMessages() {
  const messagesRef = ref(db, "messages");
  onValue(messagesRef, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((msgSnap) => {
      const msg = msgSnap.val();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.classList.add(msg.user === currentUser.displayName ? "you" : "ai");
      msgDiv.textContent = `${msg.user}: ${msg.text}`;
      messagesDiv.appendChild(msgDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
