import React from "react";

function SharedButton({ socket, color }) {
  const handleClick = () => {
    const newColor = color === "secondary" ? "success" : "secondary";
    socket.emit("toggleButton", newColor); // tell server to broadcast update
  };

  return (
    <button className={`btn btn-${color}`} onClick={handleClick}>
      Shared Button
    </button>
  );
}

export default SharedButton;
