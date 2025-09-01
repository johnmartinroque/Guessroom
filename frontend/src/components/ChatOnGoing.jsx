import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function ChatOnGoing({ socket, lobbyName, username, guessedUsers }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const messagesEndRef = useRef(null);

  const hasFinished = guessedUsers.includes(username);

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    if (!hasFinished) {
      socket.emit("sendOngoingMessage", {
        lobbyName,
        username,
        message: chatInput,
      });
    }

    setChatInput("");
  };

  useEffect(() => {
    socket.on("receiveOngoingMessage", ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
    });

    return () => {
      socket.off("receiveOngoingMessage");
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (hasFinished) return null; // hide if user finished

  return (
    <div className="chat-container border p-2">
      <h4 className="retro-glitch-text text-start">Ongoing Chat</h4>
      <div
        className="chat-box"
        style={{
          height: "81vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, idx) => (
          <p className="retro-glitch-text text-start" key={idx}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2 d-flex">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="retro-input me-2"
        />
        <button className="retro-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatOnGoing;
