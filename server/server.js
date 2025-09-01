import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app); // wrap express server with http
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your React frontend
    methods: ["GET", "POST"],
  },
});

let lobbyUsers = []; // in-memory users

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  // Join lobby
  socket.on("joinLobby", (username) => {
    if (!lobbyUsers.includes(username)) {
      lobbyUsers.push(username);
    }
    io.emit("lobbyUpdate", lobbyUsers); // send updated list to everyone
  });

  // Leave lobby
  socket.on("leaveLobby", (username) => {
    lobbyUsers = lobbyUsers.filter((u) => u !== username);
    io.emit("lobbyUpdate", lobbyUsers);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
    // (optional) clean up if you want auto-removal
  });
});

app.get("/", (req, res) => {
  res.send("✅ Lobby server with Socket.IO is running!");
});

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  // Existing lobby logic...
  socket.on("joinLobby", (username) => {
    if (!lobbyUsers.includes(username)) {
      lobbyUsers.push(username);
    }
    io.emit("lobbyUpdate", lobbyUsers);
  });

  socket.on("leaveLobby", (username) => {
    lobbyUsers = lobbyUsers.filter((u) => u !== username);
    io.emit("lobbyUpdate", lobbyUsers);
  });

  // 🔹 New: handle button color toggle
  socket.on("toggleButton", (color) => {
    io.emit("buttonColorUpdate", color); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
