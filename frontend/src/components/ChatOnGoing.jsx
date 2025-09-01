import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function ChatOnGoing({ socket, lobbyName, username, guessedUsers }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

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

  if (hasFinished) return null; // hide if user finished

  return (
    <div className="chat-section mt-4 border p-2">
      <h4>Ongoing Chat</h4>
      <div
        className="chat-box"
        style={{ maxHeight: "200px", overflowY: "auto" }}
      >
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
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
          className="form-control me-2"
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatOnGoing;
