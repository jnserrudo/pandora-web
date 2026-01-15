// src/Components/LoadingSpinner/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ fullscreen = false, message = "" }) => {
  return (
    <div className={`loading-spinner-container ${fullscreen ? "fullscreen" : ""}`}>
      <div className="loading-spinner-content">
        {/* Animated circles background */}
        <div className="spinner-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>

        {/* Main spinner with logo */}
        <div className="spinner-logo-wrapper">
          <div className="spinner-ring"></div>
          <div className="spinner-ring-secondary"></div>
          <div className="pandora-logo-spin">
            <img src="/logo_pandora.png" alt="Pandora" className="logo-image" />
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>

        {/* Optional message */}
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
