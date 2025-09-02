import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to your server (adjust env variable or URL as needed)
const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000");

const LobbyUsers = ({ lobbyName }) => {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!lobbyName) return;

    // Request initial lobby data
    socket.emit("getLobbies");

    // Listen for updates specific to this lobby
    const handleLobbyUpdate = (data) => {
      if (data.users) {
        setUsers(data.users);
        setScores(data.scores || {});
      }
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);

    // Optional: update when the lobby list changes
    const handleLobbyList = (lobbies) => {
      const lobby = lobbies.find((l) => l.lobbyName === lobbyName);
      if (lobby) setUsers(lobby.users);
    };
    socket.on("lobbyList", handleLobbyList);

    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("lobbyList", handleLobbyList);
    };
  }, [lobbyName]);

  return (
    <div>
      <h2>Lobby: {lobbyName}</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>
            {user} {scores[user] !== undefined && `- Score: ${scores[user]}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyUsers;
