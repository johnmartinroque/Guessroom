// JoinLobby.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinLobby() {
  const [username, setUsername] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const navigate = useNavigate();

  const joinLobby = () => {
    if (!username || !lobbyName) return;
    // Pass lobbyName + username to Game
    navigate("/game", { state: { lobbyName, username } });
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
    </div>
  );
}

export default JoinLobby;
