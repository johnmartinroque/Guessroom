import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinLobby from "./screens/JoinLobby";
import Header from "./components/Header";
import Game from "./screens/Game";
import GameSummary from "./screens/GameSummary";
import "./App.css"
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading ? (
        <LoadingScreen onLoaded={() => setIsLoading(false)} />
      ) : (
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
      )}
    </>
  );
}

export default App;
