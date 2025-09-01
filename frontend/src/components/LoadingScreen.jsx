import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onLoaded }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate loading for 3 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // When exit animation ends, notify parent
  const handleAnimationEnd = () => {
    if (isExiting) {
      onLoaded();
    }
  };

  return (
    <div
      className={`loading-container ${isExiting ? 'exit' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="glitch-loader">LOADING...</div>
    </div>
  );
};

export default LoadingScreen;
