import React, { useState, useEffect } from 'react';
import Turnstile from 'react-turnstile';
import OTPVerification from './OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft } from 'lucide-react';
import '../pages/AuthForm.css';

const AuthFormsContainer = ({ defaultIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  
  // Context and Router
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // URL Params parsing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired') === 'true';
    if (expired) {
      showToast("Tu sesión ha expirado por seguridad. Por favor, ingresa de nuevo.", 'info');
      setError("Sesión expirada. Ingresá tus credenciales.");
    }
  }, [location.search, showToast]);

  // States
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [requireOTP, setRequireOTP] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [debugOTP, setDebugOTP] = useState(null); // Nuevo: OTP de fallback cuando el email falla

  const API_URL = import.meta.env.VITE_API_URL_DEV || import.meta.env.VITE_API_URL_PROD || 'http://localhost:3000/api';

  const submitAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { identifier, password, captchaToken }
        : { email, username, name, dni, password, captchaToken };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
         if (res.status === 429) {
             setError(data.message || 'Demasiadas peticiones. Intenta más tarde.');
             return;
         }
         if (res.status === 403 && data.requireCaptcha) {
             setRequireCaptcha(true);
             setError('Se requieren controles de seguridad extra. Por favor resuelve el captcha.');
             return;
         }
         if (res.status === 403 && data.isVerified === false) {
             setRegisteredEmail(isLogin ? identifier : email);
             setRequireOTP(true);
             return;
         }
         throw new Error(data.message || 'Error en la solicitud');
      }

      if (isLogin) {
          showToast('Logueado en Pandora con éxito!', 'success');
          setAuthData(data.accessToken, data.refreshToken);
          navigate('/');
      } else {
          setRegisteredEmail(email);
          // Manejar el estado del envío de email desde la respuesta del backend
          const wasEmailSent = data.emailSent !== false;
          setEmailSent(wasEmailSent);
          setCanResendOTP(data.canResendOTP === true || !wasEmailSent);
          
          // Guardar OTP de debug si el email falló (fallback de verificación)
          if (!wasEmailSent && data.debugOTP) {
              setDebugOTP(data.debugOTP);
              console.log('🔑 OTP de fallback disponible (email falló):', data.debugOTP);
          } else {
              setDebugOTP(null);
          }
          
          // Mostrar mensaje diferente según si el email se envió o no
          if (!wasEmailSent) {
              showToast('Registro exitoso, pero hubo un problema enviando el email. Usá el código mostrado.', 'warning');
          }
          setRequireOTP(true);
      }
    } catch (err) {
      // Sanitize technical error messages so users never see raw browser errors
      const rawMsg = err.message || '';
      const isNetworkError = rawMsg === 'Failed to fetch' 
        || rawMsg.includes('NetworkError') 
        || rawMsg.includes('ERR_CONNECTION')
        || rawMsg.includes('fetch');
      setError(isNetworkError 
        ? 'No se pudo conectar con el servidor. Verificá tu conexión a internet e intentá de nuevo.' 
        : rawMsg || 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
      try {
          const res = await fetch(`${API_URL}/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: registeredEmail, otp: otpCode })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Código inválido');
          
          showToast('¡Cuenta Verificada! Ahora puedes iniciar sesión.', 'success');
          setRequireOTP(false);
          setIsLogin(true);
      } catch (err) {
          const rawMsg = err.message || '';
          const isNetworkError = rawMsg === 'Failed to fetch' || rawMsg.includes('NetworkError') || rawMsg.includes('ERR_CONNECTION');
          showToast(isNetworkError ? 'No se pudo conectar con el servidor. Intentá de nuevo.' : rawMsg || 'Error inesperado.', 'error');
      }
  };

  if (requireOTP) {
      return (
          <div className="auth-container" style={{ minHeight: '100vh', display: 'flex' }}>
             <OTPVerification 
               email={registeredEmail} 
               onVerify={handleVerifyOTP} 
               initialEmailSent={emailSent}
               canResend={canResendOTP}
               debugOTP={debugOTP}
             />
          </div>
      );
  }

  const isSubmitDisabled = loading || (isLogin 
    ? (!identifier.trim() || !password) 
    : (!name.trim() || !username.trim() || !email.trim() || !password || !dni.trim()));

  return (
    <div className="auth-container">
      <form onSubmit={submitAuth} className="auth-form">
        <h2>{isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta en Pandora'}</h2>
        <p>
          {isLogin 
            ? 'Ingresá para gestionar tu cuenta' 
            : 'Unite a la comunidad y descubrí todo lo que Pandora tiene para ofrecer.'}
        </p>
        
        {error && <p className="error-message">{error}</p>}

        {!isLogin && (
          <>
            <div className="input-group">
              <label htmlFor="name">Nombre Completo</label>
              <input 
                type="text" id="name" required
                value={name} onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="dni">DNI <span style={{ fontSize: '0.8em', color: '#a0a0c0' }}>(requerido)</span></label>
              <input 
                type="text" id="dni" required maxLength={10} inputMode="numeric" placeholder="Ej. 35123456"
                value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ''))} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input 
                type="text" id="username" required
                value={username} onChange={e => setUsername(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" id="email" required
                value={email} onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </>
        )}

        {isLogin && (
          <div className="input-group">
            <label htmlFor="identifier">Email o Usuario</label>
            <input 
              type="text" id="identifier" required
              value={identifier} onChange={e => setIdentifier(e.target.value)} 
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" id="password" required
            value={password} onChange={e => setPassword(e.target.value)} 
          />
        </div>

        {/* Captcha - Aparece obligatoriamente en registro y condicionalmente en Login */}
        {(!isLogin || requireCaptcha) && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
            <Turnstile 
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
              onVerify={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button"
          disabled={isSubmitDisabled}
        >
          {loading ? "Procesando..." : (isLogin ? "Ingresar" : "Crear Cuenta")}
        </button>

        <p className="auth-switch">
          {isLogin ? "¿No tenés una cuenta? " : "¿Ya tenés una cuenta? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); setRequireCaptcha(false); }} 
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', padding: 0 }}
          >
            {isLogin ? "Registrate acá" : "Ingresá acá"}
          </button>
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

export default AuthFormsContainer;
