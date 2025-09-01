import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket", "polling"],
});

function JoinLobby() {
  const [username, setUsername] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("joinError", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off("joinError");
    };
  }, []);

  const joinLobby = () => {
    if (!username || !lobbyName) return;

    // Emit joinLobby to server
    socket.emit("joinLobby", { lobbyName, username });

    // Navigate only if no error (handled in server)
    socket.once("lobbyUpdate", () => {
      navigate("/game", { state: { lobbyName, username } });
    });
  };

  return (
    <div className="container text-center">
      <h1 className="retro-glitch-title">GuessRoom</h1>

      <input
        type="text"
        placeholder="Enter Lobby Name"
        value={lobbyName}
        onChange={(e) => setLobbyName(e.target.value)}
        className="retro-input mt-5"
      />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="retro-input"
      />
      <button onClick={joinLobby} className="retro-button mt-5">
        Join Lobby
      </button>

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
}

export default JoinLobby;
