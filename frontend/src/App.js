import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SharedButton from "./SharedButton";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [buttonColor, setButtonColor] = useState("secondary"); // Bootstrap color

  useEffect(() => {
    // Listen for lobby updates
    socket.on("lobbyUpdate", (lobbyUsers) => {
      setUsers(lobbyUsers);
    });

    // Listen for button color updates
    socket.on("buttonColorUpdate", (color) => {
      setButtonColor(color);
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("buttonColorUpdate");
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
    </div>
  );
}

export default App;
