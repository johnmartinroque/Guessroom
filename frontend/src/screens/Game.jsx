import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://192.168.100.33:5000");

function Game() {
  const [answer, setAnswer] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lobbyName, username } = state || {};

  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState({});

  const [currentSong, setCurrentSong] = useState(null);
  const [feedback, setFeedback] = useState("");
  const audioRef = useRef(null);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    socket.emit("submitAnswer", { lobbyName, username, answer });
    setAnswer("");
  };

  useEffect(() => {
    if (!lobbyName || !username) {
      navigate("/join");
      return;
    }

    socket.emit("joinLobby", { lobbyName, username });

    socket.on("lobbyUpdate", ({ users, scores }) => {
      setUsers(users);
      setScores(scores);
    });

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

    socket.on("correctAnswer", ({ username, answer, scores }) => {
      setScores(scores);
      setFeedback(`✅ ${username} guessed correctly: ${answer}`);
    });

    socket.on("wrongAnswer", ({ answer }) => {
      setFeedback(`❌ Wrong guess: ${answer}`);
    });

    return () => {
      socket.emit("leaveLobby", { lobbyName, username });
      socket.off("lobbyUpdate");
      socket.off("musicUpdate");
      socket.off("correctAnswer");
      socket.off("wrongAnswer");
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
          <li key={idx}>
            {user} — <strong>{scores[user] || 0} pts</strong>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h3>Lobby Music</h3>
        {currentSong ? (
          <div>
            <p>Now Playing: {currentSong.title} by ???</p>
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

        <form onSubmit={submitAnswer} className="mt-3">
          <label>Guess the artist</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>

        {feedback && <p className="mt-2">{feedback}</p>}

        <audio ref={audioRef} controls hidden />
      </div>
    </div>
  );
}

export default Game;
