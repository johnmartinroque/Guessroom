import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import LobbyList from "../components/LobbyList";

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
      socket.off("lobbyUpdate");
    };
  }, []);

  const joinLobby = () => {
    if (!username || !lobbyName) return;

    // Normalize inputs before emitting
    const normalizedLobbyName = lobbyName.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    socket.emit("joinLobby", {
      lobbyName: normalizedLobbyName,
      username: normalizedUsername,
    });

    socket.once("lobbyUpdate", () => {
      navigate("/game", {
        state: { lobbyName: normalizedLobbyName, username },
      });
    });
  };

  return (
    <div className="container text-center">
      <h1 className="retro-glitch-title">GuessRoom</h1>

      <input
        type="text"
        placeholder="Enter Lobby Name"
        value={lobbyName}
        maxLength={15} // limit input to 15 chars
        onChange={(e) =>
          setLobbyName(e.target.value.toLowerCase().slice(0, 15))
        }
        className="retro-input mt-5"
      />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        maxLength={20} // optional: add a limit for username too
        onChange={(e) => setUsername(e.target.value.slice(0, 20))} // allow any capitalization here
        className="retro-input mt-3"
      />
      <button onClick={joinLobby} className="retro-button mt-5">
        Join Lobby
      </button>

      {error && <p className="text-danger mt-2">{error}</p>}
      <LobbyList username={username} navigate={navigate} />
    </div>
  );
}

export default JoinLobby;
