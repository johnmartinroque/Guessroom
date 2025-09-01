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
  const audioRef = useRef(null);

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

    socket.on("musicUpdate", ({ title, albumArt, filename, action, round }) => {
      setRound(round || 0);

      if (action === "play") {
        setCurrentSong({ title, albumArt, filename });
        setGuessedUsers([]); // reset guessed users for new song
        setFeedback([]);
        audioRef.current.src = `${process.env.REACT_APP_SOCKET_URL}/music/${filename}`;
        audioRef.current.play().catch((err) => console.log(err));
      } else if (action === "stop") {
        setCurrentSong(null);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

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
        setFeedback((prev) => [...prev, "✅ You guessed correctly!"]);
      } else {
        setFeedback((prev) => [...prev, `✅ ${user} has guessed correctly`]);
      }
    });

    socket.on("wrongAnswer", ({ answer }) => {
      setFeedback((prev) => [...prev, `❌ Wrong guess: ${answer}`]);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });

    socket.on("gameFinished", ({ topPlayers }) => {
      // Send topPlayers to the summary page via state
      navigate("/gamesummary", { state: { topPlayers, lobbyName } });
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
  }, [lobbyName, username, navigate]);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
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
    <div className="container">
      <h1 className="retro-glitch-title mb-2">Lobby: {lobbyName}</h1>
      <h1 className="retro-glitch-text mb-3">Round: {round}</h1>
      <button onClick={leaveLobby} className="retro-button mb-3">
        Leave Lobby
      </button>

      <h2 className="retro-glitch-text">Current Users:</h2>
      <ul className="list-unstyled">
        {users.map((user, idx) => (
          <li className="retro-glitch-text" key={idx}>
            {user} — <strong>{scores[user] || 0} pts</strong>
            {guessedUsers.includes(user) && <span> ✅</span>}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h3 className="retro-glitch-text">Lobby Music</h3>
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
          <form onSubmit={submitAnswer} className="mt-3">
            <label>Guess the artist</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button className="retro-button" type="submit">Submit</button>
          </form>
        )}

        {feedback.length > 0 && (
          <div className="mt-2">
            {feedback.map((msg, idx) => (
              <p key={idx}>{msg}</p>
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
  );
}

export default Game;
