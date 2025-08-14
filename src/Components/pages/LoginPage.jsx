// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css"; // Crearemos un CSS reutilizable

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/"); // Redirige a la home
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Bienvenido de vuelta</h2>
        <p>Ingresá para gestionar tu cuenta</p>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="identifier">Email o Usuario</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="auth-switch">
          ¿No tenés una cuenta? <Link to="/register">Registrate acá</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
