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
      {/* Top Bar */}
      <div className="home-top-bar">
        <div className="home-logo">Vittora</div>
        <div className="home-title-center">Finance Digital Twin</div>
      </div>
      {/* Main Content Centered */}
      <div className="home-container glass-container">
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