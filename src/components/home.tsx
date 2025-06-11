import React from 'react';
import { useNavigate } from "react-router-dom";
import './Home.css';
import MoneyFlowBackground from './MoneyFlowBackground';

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/summary");
  };

  return (
    <div className="home-background">
      <MoneyFlowBackground />
      {/* Glassmorphism Header Container */}
      <div className="home-header-glass">
        <div className="home-top-bar">
          <img
            className="home-top-left-image"
            src=".\asset\vittora_white.png" // Change this path to your image
            alt="Top Left"
          />          

          {/* <div className="home-title-center">Finance Digital Twin</div> */}
          <img
            className="home-top-image"
            src=".\asset\ajalabs.png" // Change this path to your image
            alt="Top Right"
          />          
        </div>
      </div>
      {/* Main Content Centered */}
      <div className="home-container glass-container">
      </div>
      <div className="home-container glass-container">
        <div className="center-glass-pane">
          <span className="center-glass-text">Meet your Finance Digital Twin</span>
        </div>
      </div>      
      {/* Bottom Right Animated Button */}
      <div className="home-immerse-btn-wrapper">
        <button className="immerse-btn" onClick={handleGetStarted}>
          <span className="immerse-btn-text">Immerse</span>
          <span className="immerse-btn-ring"></span>
        </button>
      </div>
    </div>
  );
}