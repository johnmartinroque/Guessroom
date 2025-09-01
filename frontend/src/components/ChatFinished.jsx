import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function ChatFinished({ socket, lobbyName, username, guessedUsers }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const messagesEndRef = useRef(null);

  const hasFinished = guessedUsers.includes(username);

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    if (hasFinished) {
      socket.emit("sendFinishedMessage", {
        lobbyName,
        username,
        message: chatInput,
      });
    }

    setChatInput("");
  };

  useEffect(() => {
    socket.on("receiveFinishedMessage", ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
    });

    return () => {
      socket.off("receiveFinishedMessage");
    };
  }, []);

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!hasFinished) return null; // hide if user hasn't finished

  return (
    <div className="chat-container">
    <h1 className="retro-glitch-text text-start">Finished Chat</h1>
    <div className="chat-box">
        {messages.map((msg, idx) => (
          <p className="retro-glitch-text text-start" 
          key={idx}
          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
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

export default ChatFinished;
