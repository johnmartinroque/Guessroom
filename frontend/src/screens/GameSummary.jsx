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
    <div className="container text-center p-4">
      <h1 className="mb-3">🏆 Game Summary - {lobbyName}</h1>
      <h2>Top 3 Players</h2>
      <ol>
        {topPlayers.map((player, idx) => (
          <li key={idx}>
            {player.username} — <strong>{player.score} pts</strong>
          </li>
        ))}
      </ol>
      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate("/join")}
      >
        Back to Lobby
      </button>
    </div>
  );
}

export default GameSummary;
