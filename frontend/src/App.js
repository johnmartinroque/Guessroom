import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinLobby from "./screens/JoinLobby";
import Home from "./screens/Home";
import Header from "./components/Header";
import Game from "./screens/Game";
import GameSummary from "./screens/GameSummary";
import "./App.css"
function App() {
  return (
    <div>
      <Router>
        {/* <Header /> */}
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<JoinLobby />} />
          <Route path="/game" element={<Game />} />
          <Route path="/gamesummary" element={<GameSummary />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
