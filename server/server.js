import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Needed to use __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const songs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "songs.json"), "utf-8")
);

const app = express();
app.use(cors());

// Serve static music files
app.use("/music", express.static(path.join(__dirname, "music")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://guessroom.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
// In-memory state per lobby
// { lobbyName: { users: [], currentSong: null } }
let lobbies = {};
let socketUserMap = {};

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  function broadcastLobbies() {
    const lobbyList = Object.keys(lobbies).map((lobbyName) => ({
      lobbyName,
      users: lobbies[lobbyName].users,
    }));
    io.emit("lobbyList", lobbyList); // broadcast to all clients
  }

  socket.on("getLobbies", () => {
    broadcastLobbies(); // still allow manual request
  });

  // Join a lobby
  socket.on("joinLobby", ({ lobbyName, username }) => {
    socket.join(lobbyName);

    if (!lobbies[lobbyName]) {
      lobbies[lobbyName] = {
        users: [],
        scores: {},
        currentSong: null,
        round: 0,
        guessed: [],
        playedSongs: [],
        skipVotes: [],
      };
    }

    if (lobbies[lobbyName].users.includes(username)) {
      socket.emit("joinError", {
        message: "Username already taken in this lobby!",
      });
      return;
    }

    lobbies[lobbyName].users.push(username);
    lobbies[lobbyName].scores[username] = 0;

    socketUserMap[socket.id] = { lobbyName, username };
    console.log(`👥 Lobby [${lobbyName}] Users:`, lobbies[lobbyName].users);

    io.to(lobbyName).emit("lobbyUpdate", {
      users: lobbies[lobbyName].users,
      scores: lobbies[lobbyName].scores,
    });

    // 🔹 Now broadcast updated lobby list to all
    broadcastLobbies();

    if (lobbies[lobbyName].currentSong) {
      socket.emit("musicUpdate", {
        ...lobbies[lobbyName].currentSong,
        round: lobbies[lobbyName].round,
        action: "play",
      });
    }
  });

  // Leave a lobby
  socket.on("leaveLobby", ({ lobbyName, username }) => {
    socket.leave(lobbyName);

    if (lobbies[lobbyName]) {
      lobbies[lobbyName].users = lobbies[lobbyName].users.filter(
        (u) => u !== username
      );
      delete lobbies[lobbyName].scores[username];

      io.to(lobbyName).emit("lobbyUpdate", {
        users: lobbies[lobbyName].users,
        scores: lobbies[lobbyName].scores,
      });

      if (lobbies[lobbyName].users.length === 0) {
        delete lobbies[lobbyName];
      }

      // 🔹 Update lobby list for all
      broadcastLobbies();
    }
  });

  socket.on("voteSkip", ({ lobbyName, username }) => {
    if (
      lobbies[lobbyName] &&
      !lobbies[lobbyName].skipVotes.includes(username)
    ) {
      lobbies[lobbyName].skipVotes.push(username);

      // Notify lobby about current skip votes
      io.to(lobbyName).emit("skipUpdate", {
        skipVotes: lobbies[lobbyName].skipVotes.length,
        totalUsers: lobbies[lobbyName].users.length,
      });

      // If all users voted → next song
      if (
        lobbies[lobbyName].skipVotes.length === lobbies[lobbyName].users.length
      ) {
        lobbies[lobbyName].skipVotes = [];
        nextRound(lobbyName);
      }
    }
  });

  // Start the game (first round)
  socket.on("startGame", ({ lobbyName }) => {
    if (lobbies[lobbyName] && !lobbies[lobbyName].gameStarted) {
      lobbies[lobbyName].gameStarted = true;
      lobbies[lobbyName].round = 1;
      playRandomSong(lobbyName);

      // Broadcast to all users that the game has started
      io.to(lobbyName).emit("gameStarted");
    }
  });

  // Handle guesses
  socket.on("submitAnswer", ({ lobbyName, username, answer }) => {
    if (lobbies[lobbyName] && lobbies[lobbyName].currentSong) {
      const correctArtist = lobbies[lobbyName].currentSong.artist.toLowerCase();
      const guess = answer.trim().toLowerCase();

      if (guess === correctArtist) {
        if (!lobbies[lobbyName].guessed.includes(username)) {
          lobbies[lobbyName].guessed.push(username);
          lobbies[lobbyName].scores[username] += 1;
        }

        io.to(lobbyName).emit("correctAnswer", {
          username,
          answer,
          scores: lobbies[lobbyName].scores,
        });

        // If all users guessed correctly → next round
        if (
          lobbies[lobbyName].guessed.length === lobbies[lobbyName].users.length
        ) {
          nextRound(lobbyName);
        }
      } else {
        socket.emit("wrongAnswer", { answer });
      }
    }
  });

  function playRandomSong(lobbyName) {
    const lobby = lobbies[lobbyName];
    if (!lobby) return;

    // Filter songs that haven't been played yet
    const availableSongs = songs.filter(
      (s) => !lobby.playedSongs.includes(s.filename)
    );

    // If all songs played, reset the list
    if (availableSongs.length === 0) {
      lobby.playedSongs = [];
    }

    const randomSong =
      availableSongs[Math.floor(Math.random() * availableSongs.length)];

    lobby.currentSong = randomSong;
    lobby.guessed = [];
    lobby.skipVotes = [];
    lobby.playedSongs.push(randomSong.filename); // mark as played

    io.to(lobbyName).emit("musicUpdate", {
      ...randomSong,
      round: lobby.round,
      action: "play",
    });
  }

  const MAX_ROUNDS = 9;

  function nextRound(lobbyName) {
    if (!lobbies[lobbyName]) return;

    if (lobbies[lobbyName].round >= MAX_ROUNDS) {
      // Game finished → emit game summary
      const scores = lobbies[lobbyName].scores;
      // Sort top 3
      const topPlayers = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([username, score]) => ({ username, score }));

      const correctAnswers = lobbies[lobbyName].playedSongs.map((filename) => {
        const song = songs.find((s) => s.filename === filename);
        return {
          title: song.title,
          artist: song.artist,
          albumArt: song.albumArt,
        };
      });

      io.to(lobbyName).emit("gameFinished", { topPlayers, correctAnswers });
      return;
    }

    lobbies[lobbyName].round += 1;
    playRandomSong(lobbyName);
  }

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);

    const userData = socketUserMap[socket.id];
    if (userData) {
      const { lobbyName, username } = userData;
      delete socketUserMap[socket.id];

      if (lobbies[lobbyName]) {
        lobbies[lobbyName].users = lobbies[lobbyName].users.filter(
          (u) => u !== username
        );
        delete lobbies[lobbyName].scores[username];

        io.to(lobbyName).emit("lobbyUpdate", {
          users: lobbies[lobbyName].users,
          scores: lobbies[lobbyName].scores,
        });

        if (lobbies[lobbyName].users.length === 0) {
          delete lobbies[lobbyName];
          console.log(`🗑️ Deleted empty lobby: ${lobbyName}`);
        }

        // 🔹 Update lobby list for all
        broadcastLobbies();
      }
    }
  });

  socket.on("sendOngoingMessage", ({ lobbyName, username, message }) => {
    const lobby = lobbies[lobbyName];
    if (!lobby) return;

    // Only allow users who haven't guessed correctly yet
    if (!lobby.guessed.includes(username)) {
      io.to(lobbyName).emit("receiveOngoingMessage", {
        username,
        message,
      });
    }
  });

  // Handle finished chat
  socket.on("sendFinishedMessage", ({ lobbyName, username, message }) => {
    const lobby = lobbies[lobbyName];
    if (!lobby) return;

    // Only allow users who have guessed correctly
    if (lobby.guessed.includes(username)) {
      io.to(lobbyName).emit("receiveFinishedMessage", {
        username,
        message,
      });
    }
  });
});

// Simple test route
app.get("/", (req, res) => {
  res.send("✅ Multi-lobby server with Socket.IO and Music is running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
);
