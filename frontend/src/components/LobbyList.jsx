import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function LobbyList({ username, navigate }) {
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    // Request lobbies on mount
    socket.emit("getLobbies");

    // Listen for updates
    socket.on("lobbyList", (list) => {
      setLobbies(list);
    });

    return () => {
      socket.off("lobbyList");
    };
  }, []);

  const joinLobby = (lobbyName) => {
    if (!username) {
      alert("Please enter a username first!");
      return;
    }

    socket.emit("joinLobby", { lobbyName, username });

    socket.once("lobbyUpdate", () => {
      navigate("/game", { state: { lobbyName, username } });
    });
  };

  return (
    <div className="mt-5">
      <h2 className="retro-glitch-title">Available Lobbies</h2>
      <ul className="list-unstyled mt-3">
        {lobbies.length === 0 ? (
          <p className="retro-glitch-text">No active lobbies yet.</p>
        ) : (
          lobbies.map((lobby, index) => (
            <li key={index} className="retro-glitch-text mb-3">
              <div className="d-flex justify-content-between align-items-center lobby-info-container">
                <span className="lobby-info-text">
                  {lobby.lobbyName} ({lobby.users.length} {lobby.users.length === 1 ? "player" : "players"})
                </span>
                <button
                  className="retro-button"
                  onClick={() => joinLobby(lobby.lobbyName)}
                >
                  Join
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default LobbyList;
