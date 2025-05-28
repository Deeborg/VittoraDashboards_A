import React from 'react';
import { useNavigate } from "react-router-dom";
import './Home.css'; // Import the CSS file

export default function Home() {
  const navigate = useNavigate(); // step 1

  const handleGetStarted = () => {
    navigate("/summary"); // step 2
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Vittora</h1>
        <p className="home-subtitle">
          Your intelligent financial analysis dashboard.
        </p>
        <div className="home-buttons">
          <button className="primary-btn" onClick={handleGetStarted}>
            Immerse
          </button>
          {/* <button className="secondary-btn">Learn More</button> */}
        </div>
      </div>
    </div>
  );
}
