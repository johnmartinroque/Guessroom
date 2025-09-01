import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function GameSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { topPlayers, lobbyName } = state || { topPlayers: [] };

  if (!state) {
    navigate("/join");
    return null;
  }

  return (
    <div className="container text-center">
      <h1 className="mb-3 retro-glitch-title">Game Summary - {lobbyName}</h1>
      <h2 className="retro-glitch-text">Top 3 Players</h2>
      <ol>
        {topPlayers.map((player, idx) => (
          <li className="retro-glitch-text" key={idx}>  
            {player.username} — <strong>{player.score} pts</strong>
          </li>
        ))}
      </ol>
      <button className="retro-button mt-3" onClick={() => navigate("/")}>
        Back to Lobby
      </button>
    </div>
  );
}

export default GameSummary;
