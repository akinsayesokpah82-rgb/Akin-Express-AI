const sendBtn = document.getElementById("send");
const inputBox = document.getElementById("input");
const outputBox = document.getElementById("response");

sendBtn.addEventListener("click", async () => {
  const text = inputBox.value.trim();
  if (!text) return alert("Please type something first!");

  outputBox.textContent = "Thinking... 🧠";

  try {
    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    outputBox.textContent = data.reply || "No response from AI.";
  } catch (err) {
    outputBox.textContent = "Error: " + err.message;
  }
});
