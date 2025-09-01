import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

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
    <div className="container text-center p-4">
      <h1 className="mb-4">🎮 Live Lobby</h1>

      <input
        type="text"
        placeholder="Enter Lobby Name"
        value={lobbyName}
        onChange={(e) => setLobbyName(e.target.value)}
        className="form-control d-inline w-auto me-2"
      />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="form-control d-inline w-auto me-2"
      />
      <button onClick={joinLobby} className="btn btn-primary">
        Join Lobby
      </button>

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
}

export default JoinLobby;
