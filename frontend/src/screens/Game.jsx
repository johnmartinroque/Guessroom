import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatFinished from "../components/ChatFinished";
import ChatOnGoing from "../components/ChatOnGoing";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function Game() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lobbyName, username } = state || {};

  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState({});
  const [currentSong, setCurrentSong] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [answer, setAnswer] = useState("");
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [guessedUsers, setGuessedUsers] = useState([]);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const audioRef = useRef(null);
  const feedbackRef = useRef(null);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("volume");
    return saved !== null ? Number(saved) : 100;
  });

  // Apply volume globally to all audio elements
  useEffect(() => {
    const allAudio = document.querySelectorAll("audio");
    allAudio.forEach((audio) => {
      audio.volume = volume / 100;
    });
    localStorage.setItem("volume", volume);
  }, [volume]);

  useEffect(() => {
    const slider = document.getElementById("volume-slider");
    if (slider) {
      slider.style.setProperty("--volume-percent", `${volume}%`);
    }
  }, [volume]);

  const playCorrectSound = () => {
    const audio = new Audio("/effects/correct.mp3");
    audio.volume = volume / 100;
    audio.play().catch((err) => console.error(err));
  };

  const playWrongSound = () => {
    const audio = new Audio("/effects/error.mp3");
    audio.volume = volume / 100;
    audio.play().catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!lobbyName || !username) {
      navigate("/join");
      return;
    }

    socket.emit("joinLobby", { lobbyName, username });

    socket.on("lobbyUpdate", ({ users, scores, guessedUsers }) => {
      setUsers(users);
      setScores(scores);
      setGuessedUsers(guessedUsers || []);
    });

    socket.on(
      "musicUpdate",
      ({ title, albumArt, filename, action, round, artist }) => {
        setRound(round || 0);

        if (action === "play") {
          setCurrentSong({
            title,
            albumArt,
            filename,
            artist: Array.isArray(artist) ? artist : [artist],
          });
          setGuessedUsers([]);
          setFeedback([]);
          setHasGuessedCorrectly(false);

          if (audioRef.current) {
            const audio = audioRef.current;
            audio.pause();
            audio.src = `${process.env.REACT_APP_SOCKET_URL}/music/${filename}`;
            audio.load();

            audio.oncanplaythrough = () => {
              audio.volume = volume / 100;
              audio
                .play()
                .catch((err) => console.error("Audio play error:", err));
            };
          }
        } else if (action === "stop") {
          setCurrentSong(null);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }
    );

    socket.on("skipUpdate", ({ skipVotes, totalUsers }) => {
      setFeedback((prev) => [
        ...prev,
        `⏭ ${skipVotes}/${totalUsers} users voted to skip`,
      ]);
    });

    socket.on("correctAnswer", ({ username: user, scores }) => {
      setScores(scores);
      setGuessedUsers((prev) => [...prev, user]);
      if (user === username) {
        setHasGuessedCorrectly(true);
        setFeedback((prev) => [...prev, "✅ You guessed correctly!"]);
      } else {
        setFeedback((prev) => [...prev, `✅ ${user} has guessed correctly`]);
      }
      playCorrectSound();
    });

    socket.on("wrongAnswer", ({ answer }) => {
      setFeedback((prev) => [...prev, `❌ Wrong guess: ${answer}`]);
      playWrongSound();
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });

    socket.on("gameFinished", ({ topPlayers, correctAnswers }) => {
      navigate("/gamesummary", {
        state: { topPlayers, lobbyName, correctAnswers, username },
      });
    });

    return () => {
      socket.emit("leaveLobby", { lobbyName, username });
      socket.off("gameStarted");
      socket.off("lobbyUpdate");
      socket.off("musicUpdate");
      socket.off("correctAnswer");
      socket.off("wrongAnswer");
      socket.off("skipUpdate");
      socket.off("gameFinished");
    };
  }, [lobbyName, username, navigate, volume]);

  useEffect(() => {
    if (feedbackRef.current) {
      feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight;
    }
  }, [feedback]);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim() || hasGuessedCorrectly) return;
    socket.emit("submitAnswer", { lobbyName, username, answer });
    setAnswer("");
  };

  const startGame = () => {
    socket.emit("startGame", { lobbyName });
    setGameStarted(true);
  };

  const leaveLobby = () => {
    socket.emit("leaveLobby", { lobbyName, username });
    navigate("/");
  };

  const voteSkip = () => {
    socket.emit("voteSkip", { lobbyName, username });
  };

  return (
    <div className="game-layout">
      {/* LEFT SIDEBAR */}
      <div className="sidebar-left">
        <h2 className="retro-glitch-text mb-3">Round: {round}</h2>

        <h2 className="retro-glitch-text text-start mt-2">Current Users:</h2>
        <ul className="list-unstyled">
          {users.map((user, idx) => (
            <li className="retro-glitch-text text-start" key={idx}>
              {user} — <strong>{scores[user] || 0} pts</strong>
              {guessedUsers.includes(user) && <span> ✅</span>}
            </li>
          ))}
        </ul>

        <div className="mt-4 w-100">
          <label
            className="retro-glitch-text d-block mb-1 text-start"
            htmlFor="volume-slider"
          >
            Volume
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ "--volume-percent": `${volume}%` }}
          />
        </div>

        <button onClick={leaveLobby} className="retro-button mt-3 w-100">
          Leave Lobby
        </button>
      </div>

      {/* CENTER GAME CONTENT */}
      <div className="game-container">
        <h1 className="retro-glitch-title mb-2">Lobby: {lobbyName}</h1>
        <h3 className="retro-glitch-text">Lobby Music</h3>

        {currentSong ? (
          <div className="d-flex flex-column align-items-center">
            <p className="retro-glitch-text">
              Now Playing: {currentSong.title} by ???
            </p>
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              style={{
                height: "300px",
                width: "300px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
        ) : (
          <p className="retro-glitch-text">
            {gameStarted ? "Waiting for next song..." : "Press START to begin"}
          </p>
        )}

        {!gameStarted && (
          <button className="retro-button mt-3" onClick={startGame}>
            START GAME
          </button>
        )}

        {gameStarted && (
          <form onSubmit={submitAnswer} className="mt-3 w-100">
            <div className="d-flex flex-wrap gap-2 w-100">
              <label className="retro-glitch-text align-self-center">
                Guess the artist
              </label>

              <input
                className="retro-input flex-grow-1"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={hasGuessedCorrectly}
                autoComplete="off"
                autoFocus
              />

              <button
                className="retro-button-submit"
                type="submit"
                disabled={hasGuessedCorrectly}
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {feedback.length > 0 && (
          <div
            ref={feedbackRef}
            style={{
              maxHeight: "3.2em",
              overflow: "hidden",
              display: "block",
              marginTop: "0.5rem",
            }}
          >
            {feedback.slice(-5).map((msg, idx) => (
              <p
                className="retro-glitch-text"
                key={idx}
                style={{ margin: 0, lineHeight: "1.6em" }}
              >
                {msg}
              </p>
            ))}
          </div>
        )}

        {currentSong && (
          <button className="retro-button mt-2" onClick={voteSkip}>
            Vote to Skip
          </button>
        )}

        <audio ref={audioRef} controls hidden />
      </div>

      {/* RIGHT CHAT SIDEBAR */}
      <div>
        <ChatOnGoing
          socket={socket}
          lobbyName={lobbyName}
          username={username}
          guessedUsers={guessedUsers}
        />
        <ChatFinished
          socket={socket}
          lobbyName={lobbyName}
          username={username}
          guessedUsers={guessedUsers}
        />
      </div>
    </div>
  );
}

export default Game;
