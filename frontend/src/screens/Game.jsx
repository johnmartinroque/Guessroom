// Game.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://192.168.100.33:5000"); // adjust IP if needed

function Game() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lobbyName, username } = state || {};

  const [users, setUsers] = useState([]);

  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!lobbyName || !username) {
      navigate("/join"); // redirect if no info
      return;
    }

    // Join lobby
    socket.emit("joinLobby", { lobbyName, username });

    // Listeners
    socket.on("lobbyUpdate", (lobbyUsers) => setUsers(lobbyUsers));
    socket.on(
      "musicUpdate",
      ({ title, artist, albumArt, filename, action }) => {
        if (action === "play") {
          setCurrentSong({ title, artist, albumArt, filename });
          audioRef.current.src = `http://192.168.100.33:5000/music/${filename}`;
          audioRef.current.play().catch((err) => console.log(err));
        } else if (action === "stop") {
          setCurrentSong(null);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    );

    return () => {
      socket.emit("leaveLobby", { lobbyName, username });
      socket.off("lobbyUpdate");

      socket.off("musicUpdate");
    };
  }, [lobbyName, username, navigate]);

  const playMusic = () => {
    socket.emit("playMusic", { lobbyName });
  };

  const stopMusic = () => {
    socket.emit("stopMusic", { lobbyName });
  };

  const leaveLobby = () => {
    socket.emit("leaveLobby", { lobbyName, username });
    navigate("/join");
  };

  return (
    <div className="container text-center p-4">
      <h1 className="mb-4">🎮 Lobby: {lobbyName}</h1>
      <button onClick={leaveLobby} className="btn btn-danger mb-3">
        Leave Lobby
      </button>

      <h2>Current Users:</h2>
      <ul className="list-unstyled">
        {users.map((user, idx) => (
          <li key={idx}>{user}</li>
        ))}
      </ul>

      {/* 🎵 Music Controls */}
      <div className="mt-4">
        <h3>Lobby Music</h3>
        {currentSong ? (
          <div>
            <p>
              Now Playing: {currentSong.title} by {currentSong.artist}
            </p>
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              width="150"
            />
          </div>
        ) : (
          <p>No song playing</p>
        )}
        <button className="btn btn-success me-2" onClick={playMusic}>
          ▶ Play
        </button>
        <button className="btn btn-danger" onClick={stopMusic}>
          ⏹ Stop
        </button>
        <audio ref={audioRef} controls hidden />
      </div>
    </div>
  );
}

export default Game;
