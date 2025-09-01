import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import SharedButton from "./SharedButton";

const socket = io("http://192.168.100.33:5000"); // change IP to your PC's LAN IP

function App() {
  const [username, setUsername] = useState("");
  const [lobbyName, setLobbyName] = useState("");

  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [buttonColor, setButtonColor] = useState("secondary");
  const [currentSong, setCurrentSong] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("lobbyUpdate", (lobbyUsers) => {
      setUsers(lobbyUsers);
    });

    socket.on("buttonColorUpdate", (color) => {
      setButtonColor(color);
    });

    socket.on("musicUpdate", ({ song, action }) => {
      if (action === "play") {
        setCurrentSong(song);
        audioRef.current.src = `http://192.168.100.33:5000/music/${song}`;
        audioRef.current
          .play()
          .catch((err) => console.log("⚠️ Play blocked:", err));
      } else if (action === "stop") {
        setCurrentSong(null);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("buttonColorUpdate");
      socket.off("musicUpdate");
    };
  }, []);

  const joinLobby = () => {
    if (!username || !lobbyName) return;
    socket.emit("joinLobby", { lobbyName, username });
    setJoined(true);
  };

  const leaveLobby = () => {
    socket.emit("leaveLobby", { lobbyName, username });
    setJoined(false);
    setUsername("");
    setLobbyName("");
  };

  const playMusic = () => {
    socket.emit("playMusic", { lobbyName, songName: "lebron.mp3" });
  };

  const stopMusic = () => {
    socket.emit("stopMusic", { lobbyName });
  };

  return (
    <div className="container text-center p-4">
      <h1 className="mb-4">🎮 Live Lobby</h1>

      {!joined ? (
        <div className="mb-3">
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

      {/* 🎵 Music Controls */}
      <div className="mt-4">
        <h3>Lobby Music</h3>
        {currentSong ? (
          <p>Now Playing: {currentSong}</p>
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

export default App;
