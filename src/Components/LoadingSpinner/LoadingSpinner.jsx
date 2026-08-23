// src/Components/LoadingSpinner/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ fullscreen = false, message = "" }) => {
  return (
    <div className={`loading-spinner-container ${fullscreen ? "fullscreen" : ""}`}>
      <div className="loading-spinner-content">
        <div className="spinner-logo-wrapper">
          <div className="spinner-ring"></div>
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
