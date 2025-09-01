import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import SharedButton from "./SharedButton";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [buttonColor, setButtonColor] = useState("secondary");
  const [currentSong, setCurrentSong] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("lobbyUpdate", (lobbyUsers) => setUsers(lobbyUsers));
    socket.on("buttonColorUpdate", (color) => setButtonColor(color));

    // 🔹 Music events
    socket.on("playMusic", (song) => {
      setCurrentSong(song);
      if (audioRef.current) {
        audioRef.current.src = `http://localhost:5000/music/${song}`;
        audioRef.current
          .play()
          .catch((err) =>
            console.log("Autoplay blocked, user interaction needed:", err)
          );
      }
    });

    socket.on("stopMusic", () => {
      setCurrentSong(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("buttonColorUpdate");
      socket.off("playMusic");
      socket.off("stopMusic");
    };
  }, []);

  const joinLobby = () => {
    if (!username) return;
    socket.emit("joinLobby", username);
    setJoined(true);
  };

  const leaveLobby = () => {
    socket.emit("leaveLobby", username);
    setJoined(false);
    setUsername("");
  };

  // 🔹 Music controls
  const handlePlayMusic = () => {
    socket.emit("playMusic", "lebron.mp3"); // tell everyone to play
  };

  const handleStopMusic = () => {
    socket.emit("stopMusic");
  };

  return (
    <div className="container text-center p-4">
      <h1 className="mb-4">🎮 Live Lobby</h1>

      {!joined ? (
        <div className="mb-3">
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
      ) : (
        <button onClick={leaveLobby} className="btn btn-danger mb-3">
          Leave Lobby
        </button>
      )}

      <h2>Current Users:</h2>
      <ul className="list-unstyled">
        {users.map((user, idx) => (
          <li key={idx}>{user}</li>
        ))}
      </ul>

      {/* 🔹 Shared Button */}
      <div className="mt-4">
        <SharedButton socket={socket} color={buttonColor} />
      </div>

      {/* 🔹 Music Controls */}
      <div className="mt-5">
        <h3>🎵 Lobby Music</h3>
        {currentSong ? (
          <p>Now Playing: {currentSong}</p>
        ) : (
          <p>No song playing</p>
        )}
        <button onClick={handlePlayMusic} className="btn btn-success me-2">
          ▶ Play Music
        </button>
        <button onClick={handleStopMusic} className="btn btn-danger">
          ⏹ Stop Music
        </button>

        {/* Hidden audio element */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}

export default App;
