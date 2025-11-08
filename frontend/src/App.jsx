import React, { useEffect, useState } from "react";
import {
  signInWithGoogle,
  onAuthChange,
  upsertUser,
  sendMessage,
  subscribeToMessages
} from "./firebaseClient";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        await upsertUser(u); // auto join on signup/login
      } else {
        setUser(null);
      }
    });
    const unsubMsgs = subscribeToMessages(setMessages);
    return () => {
      unsubAuth();
      unsubMsgs();
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>University Students Group Chat</h1>
        <p className="tagline">Chat, invite friends, ask <strong>@akinexpressai</strong></p>
        <div>
          {user ? (
            <div className="user-info">
              <img src={user.photoURL} alt="me" className="avatar" />
              <span>{user.displayName}</span>
            </div>
          ) : (
            <button onClick={() => signInWithGoogle()} className="btn">
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main>
        <Chat
          user={user}
          messages={messages}
          onSend={(text) => {
            if (!user) return alert("Sign in first");
            sendMessage({
              uid: user.uid,
              name: user.displayName,
              text,
              photoURL: user.photoURL
            });
          }}
        />
      </main>

      <footer className="footer">Made with ❤️ by Akin AI - LIB</footer>
    </div>
  );
}
