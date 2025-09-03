import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import LobbyList from "../components/LobbyList";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function JoinLobby() {
  const [username, setUsername] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWakeMessage, setShowWakeMessage] = useState(false);
  const navigate = useNavigate();
  const wakeTimeoutRef = useRef(null);
  useEffect(() => {
    socket.on("joinError", ({ message }) => {
      setError(message);
      setLoading(false);
    });

    return () => {
      socket.off("joinError");
      socket.off("lobbyUpdate");
    };
  }, []);

  const refresh = () => {
    window.location.reload();
  };

  const playClickSound = () => {
    const audio = new Audio("/effects/click.mp3");
    audio.volume = 1;
    audio.play().catch((err) => console.error(err));
  };

  const joinLobby = () => {
    if (!username || !lobbyName) return;

    setLoading(true);

    // ⏱ only show wake message if still loading after 3 seconds
    wakeTimeoutRef.current = setTimeout(() => {
      setShowWakeMessage(true);
    }, 3000);

    // Normalize inputs before emitting
    const normalizedLobbyName = lobbyName.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    socket.emit("joinLobby", {
      lobbyName: normalizedLobbyName,
      username: normalizedUsername,
    });

    setLoading(true);

    socket.on("lobbyUpdate", () => {
      const audio = new Audio("/effects/click.mp3");
      audio.volume = 1;
      audio.play().catch((err) => console.error(err));

      // Wait for sound to finish (or short delay)
      setTimeout(() => {
        setLoading(false);
        setShowWakeMessage(false);
        navigate("/game", {
          state: {
            lobbyName: normalizedLobbyName,
            username: normalizedUsername,
          },
        });
        refresh();
      }, 150);
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
      <button
        onClick={() => {
          playClickSound();
          joinLobby();
        }}
        className="retro-button mt-5"
        disabled={loading} // disable button while loading
      >
        {loading ? "Connecting..." : "Create or Join Lobby"}
      </button>
      {/* Only show this if wake message is triggered */}
      {showWakeMessage && (
        <p className="text-info mt-3">
          The server may be waking up, this can take a few seconds...
        </p>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}
      <LobbyList username={username} navigate={navigate} />
    </div>
  );
}

export default JoinLobby;
