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
          <p>No active lobbies yet.</p>
        ) : (
          lobbies.map((lobby, index) => (
            <li key={index} className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <strong>{lobby.lobbyName}</strong> ({lobby.users.length}{" "}
                  players)
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
