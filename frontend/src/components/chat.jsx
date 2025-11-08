import React, { useState, useRef, useEffect } from "react";

export default function Chat({ user, messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit(e) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="chat-wrap">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={`message ${user && m.uid === user.uid ? "mine" : ""}`}>
            <div className="meta">
              <img src={m.photoURL || "/avatar.png"} className="msg-avatar" alt="" />
              <strong>{m.name || "Unknown"}</strong>
              <span className="time">{m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleString() : ""}</span>
            </div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <input
          placeholder="Write a message. Mention @akinexpressai to get bot help..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn">Send</button>
      </form>
    </div>
  );
}
