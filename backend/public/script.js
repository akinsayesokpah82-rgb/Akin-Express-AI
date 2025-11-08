const btn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return alert("Please type something!");

  responseBox.textContent = "Thinking... 🤔";

  try {
    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    responseBox.textContent = data.reply || "No response.";
  } catch (err) {
    responseBox.textContent = "Error: " + err.message;
  }
});
