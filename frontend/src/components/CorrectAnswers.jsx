import React from "react";

function CorrectAnswers({ correctAnswers }) {
  if (!correctAnswers || correctAnswers.length === 0) {
    return <p className="retro-glitch-text">No songs played.</p>;
  }

  return (
    <div className="mt-4">
      <h2 className="retro-glitch-text">Correct Answers</h2>
      <div className="d-flex flex-wrap justify-content-center gap-3">
        {correctAnswers.map((song, idx) => (
          <div
            key={idx}
            className="p-2 text-center"
            style={{ maxWidth: "200px" }}
          >
            <img
              src={song.albumArt}
              alt={song.title}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                boxShadow: "0px 0px 8px rgba(0,0,0,0.4)",
              }}
            />
            <p className="retro-glitch-text mt-2 mb-0">{song.title}</p>
            <p className="retro-glitch-text">
              <strong>{song.artist}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CorrectAnswers;
