import React from "react";

const LobbyUsers = ({ users, scores }) => {
  return (
    <div>
      <h2>Current Users:</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>
            {user} — <strong>{scores[user] || 0} pts</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyUsers;
