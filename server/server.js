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
  cors: { origin: "*" }, // allow frontend from any IP
});

// In-memory state per lobby
// { lobbyName: { users: [], buttonColor: "secondary", currentSong: null } }
let lobbies = {};

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  // Join a lobby
  socket.on("joinLobby", ({ lobbyName, username }) => {
    socket.join(lobbyName);

    if (!lobbies[lobbyName]) {
      lobbies[lobbyName] = {
        users: [],
        currentSong: null,
      };
    }

    if (!lobbies[lobbyName].users.includes(username)) {
      lobbies[lobbyName].users.push(username);
    }

    // Send updated user list to the lobby
    io.to(lobbyName).emit("lobbyUpdate", lobbies[lobbyName].users);

    if (lobbies[lobbyName].currentSong) {
      socket.emit("musicUpdate", {
        song: lobbies[lobbyName].currentSong,
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

      io.to(lobbyName).emit("lobbyUpdate", lobbies[lobbyName].users);

      // Clean up empty lobbies
      if (lobbies[lobbyName].users.length === 0) {
        delete lobbies[lobbyName];
      }
    }
  });

  // Music play (per lobby)
  socket.on("playMusic", ({ lobbyName }) => {
    if (lobbies[lobbyName]) {
      // Pick a random song from JSON
      const randomSong = songs[Math.floor(Math.random() * songs.length)];

      lobbies[lobbyName].currentSong = randomSong;
      io.to(lobbyName).emit("musicUpdate", {
        ...randomSong,
        action: "play",
      });
    }
  });

  // Music stop (per lobby)
  socket.on("stopMusic", ({ lobbyName }) => {
    if (lobbies[lobbyName]) {
      lobbies[lobbyName].currentSong = null;
      io.to(lobbyName).emit("musicUpdate", {
        song: null,
        action: "stop",
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
    // NOTE: Optional – could also auto-remove from lobbies here if you track socket<->username mapping
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
