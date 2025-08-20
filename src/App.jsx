// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Components/pages/HomePage";
import LoginPage from "./Components/pages/LoginPage";
import RegisterPage from "./Components/pages/RegisterPage";
import ArticlesListPage from "./Components/pages/ArticlesListPage";
import ArticleDetailPage from "./Components/pages/ArticleDetailPage";
import EventsListPage from './Components/pages/EventsListPage';         // <-- IMPORTAR
import CommerceDetailPage from './Components/pages/CommerceDetailPage'; // <-- IMPORTAR
import EventDetailPage from './Components/pages/EventDetailPage';       // <-- IMPORTAR
import AboutPage from './Components/pages/AboutPage'; 
import "./App.css";

function App() {
  return (
    <div className="app-wrapper">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* --- AÑADIR ESTAS DOS RUTAS --- */}
          <Route path="/magazine" element={<ArticlesListPage />} />
          <Route path="/article/:slug" element={<ArticleDetailPage />} />
          <Route path="/events" element={<EventsListPage />} />
        <Route path="/commerce/:id" element={<CommerceDetailPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;
