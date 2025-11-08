const backendUrl = "https://akin-express-ai.onrender.com/api/chat"; // update if needed

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  addMessage("bot", "⏳ Thinking...");

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    chatBox.lastChild.textContent = data.reply;
  } catch (err) {
    chatBox.lastChild.textContent = "⚠️ Something went wrong. Please try again.";
  }
});

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
