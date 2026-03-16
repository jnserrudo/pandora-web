// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { ArrowLeft } from "lucide-react";
import "./AuthForm.css"; // Crearemos un CSS reutilizable

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Detectar sesión expirada desde la URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired') === 'true';
    const forbidden = params.get('auth_error') === 'forbidden';

    if (expired) {
      showToast("Tu sesión ha expirado por seguridad. Por favor, ingresa de nuevo.", 'info');
      setError("Sesión expirada. Ingresá tus credenciales.");
    } else if (forbidden) {
      showToast("No tienes permisos para acceder a esa sección.", 'error');
    }
  }, [location.search, showToast]);

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
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading || !identifier.trim() || !password}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="auth-switch">
          ¿No tenés una cuenta? <Link to="/register">Registrate acá</Link>
        </p>
        
        <div className="auth-footer-nav">
          <Link to="/" className="back-home-link">
            <ArrowLeft size={16} />
            Volver a la Página Principal
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
