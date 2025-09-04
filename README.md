# 🎵 Guessroom
## [Demo – Click here to try](https://guessroom.vercel.app)
A real-time multiplayer music guessing game built with **Node.js**, **Express**, **Socket.IO**, and **React**. Players can join lobbies with friends, listen to songs, and compete to guess the artist correctly.

---
<p align="center">
  <img src="https://github.com/user-attachments/assets/ebe3b21d-6b60-4d28-99e5-6f45a02e3fd9" width="1000" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/86613f80-9d6c-4e6b-a725-f01d013754e3" width="1000" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/f39b1f79-cd07-4e21-ab58-ba3e16cc57e6" width="1000" />
</p>

---

## 🚀 Features

- Multi-lobby support: Create or join separate game rooms.
- Real-time gameplay: Scores, user actions, and skip votes update instantly.
- Score tracking: Points for every correct guess.
- Round-based music: Songs are randomly selected per round.
- Skip system: Vote to skip songs.
- Game summary: Top 3 players displayed at the end.

---

## 🎮 How to Play

1. Enter a **lobby name** and **username**.
2. Join or create a lobby with your friends.
3. Press **START GAME** to begin.
4. Listen to the current song and **submit your guess** for the artist.
5. Earn points for correct guesses.
6. Vote to skip songs you don’t know.
7. View the **top 3 players** at the end of the game.

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Realtime Communication:** Socket.IO
- **Music Hosting:** Static files served via Express
- **State Management:** In-memory per lobby

---


## 🏃 How to Run
### Installation
1️⃣ Clone the repository
```bash
git clone https://github.com/johnmartinroque/Guessroom.git
cd Guessroom
```

2️⃣ Install dependencies
```bash
#Backend (server)
cd server
npm install

#Frontend (React app)
cd ../frontend
npm install
```

3️⃣ Configure environment variables
```bash
#Inside the frontend folder, create a .env file:
#REACT_APP_SOCKET_URL=http://127.0.0.1:5000
#Use 127.0.0.1 (or localhost) if you’re only playing on your own machine.
#Use your local IP address if you want friends on the same WiFi to join:
#REACT_APP_SOCKET_URL=http://192.168.x.x:5000
```


4️⃣ Start the backend (server)
```bash
#From the server folder:
npm run dev
```

5️⃣ Start the frontend (React app)
```bash
#From the server folder:
npm start
```
