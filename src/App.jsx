// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Components/pages/HomePage";
import LoginPage from "./Components/pages/LoginPage";
import RegisterPage from "./Components/pages/RegisterPage";
import "./App.css";

function App() {
  return (
    <div className="app-wrapper">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
