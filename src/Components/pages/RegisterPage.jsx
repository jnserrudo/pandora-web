// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css'; // Usamos el mismo CSS que el login

const RegisterPage = () => {
  // Estados para cada campo del formulario
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    try {
      // Pasamos todos los campos a la función de registro
      await register(name, username, email, password);
      // Después de un registro exitoso, lo enviamos a la página de login
      navigate('/login'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Creá tu cuenta en Pandora</h2>
        <p>Unite a la comunidad y descubrí todo lo que Salta tiene para ofrecer.</p>
        {error && <p className="error-message">{error}</p>}

        {/* --- CAMPOS DEL FORMULARIO DE REGISTRO --- */}
        <div className="input-group">
          <label htmlFor="name">Nombre Completo</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
        <p className="auth-switch">¿Ya tenés una cuenta? <Link to="/login">Ingresá acá</Link></p>
      </form>
    </div>
  );
};

export default RegisterPage;