import React, { useState, useEffect } from 'react';
import Turnstile from 'react-turnstile';
import OTPVerification from './OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import {
  getPasswordChecks,
  isPasswordValid,
  formatPasswordError,
  PASSWORD_RULES_HINT,
} from '../../utils/passwordRules';
import '../pages/AuthForm.css';

const AuthFormsContainer = ({ defaultIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired') === 'true';
    if (expired) {
      showToast("Tu sesión ha expirado por seguridad. Por favor, ingresa de nuevo.", 'info');
      setError("Sesión expirada. Ingresá tus credenciales.");
    }
  }, [location.search, showToast]);

  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [requireOTP, setRequireOTP] = useState(false);
  const skipCaptcha = import.meta.env.VITE_E2E === 'true';
  const [captchaToken, setCaptchaToken] = useState(skipCaptcha ? 'test_token_for_automated_testing' : '');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [canResendOTP, setCanResendOTP] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL_DEV || import.meta.env.VITE_API_URL_PROD || 'http://localhost:3000/api';

  const passwordChecks = getPasswordChecks(password);
  const passwordOk = isLogin || isPasswordValid(password);

  const resetCaptcha = (extraMessage) => {
    if (skipCaptcha) return;
    setCaptchaToken('');
    setCaptchaKey((k) => k + 1);
    if (extraMessage) {
      showToast(extraMessage, 'warning');
    }
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !isPasswordValid(password)) {
      const msg = `La contraseña no cumple los requisitos. ${PASSWORD_RULES_HINT}`;
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!skipCaptcha && !captchaToken) {
      const msg = isLogin
        ? 'Completá el captcha para entrar.'
        : 'Completá el captcha para registrarte.';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }

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
         const failMessage = formatPasswordError(
           data.message || 'No se pudo completar la solicitud.'
         );
         if (res.status === 429) {
             setError(failMessage);
             showToast(failMessage, 'error');
             resetCaptcha();
             return;
         }
         if ((res.status === 403 || res.status === 400) && data.requireCaptcha) {
             setError('Completá el captcha para entrar.');
             showToast('Completá el captcha para entrar.', 'warning');
             resetCaptcha();
             return;
         }
         if (res.status === 403 && data.isVerified === false) {
             setRegisteredEmail(isLogin ? identifier : email);
             setRequireOTP(true);
             return;
         }
         setError(failMessage);
         showToast(failMessage, 'error');
         // Token de un solo uso: renovar tras cualquier error
         resetCaptcha(
           /captcha/i.test(data.message || '')
             ? 'Completá el captcha de nuevo antes de reintentar.'
             : 'Por seguridad, completá el captcha otra vez antes de reintentar.'
         );
         return;
      }

        if (isLogin) {
          showToast('Sesión iniciada. Ya podés explorar y gestionar tu cuenta.', 'success');
          setAuthData(data.accessToken, data.refreshToken);
          navigate('/');
      } else {
          setRegisteredEmail(email);
          const wasEmailSent = data.emailSent !== false;
          setEmailSent(wasEmailSent);
          setCanResendOTP(data.canResendOTP === true || !wasEmailSent);

          if (!wasEmailSent) {
              showToast('Registro exitoso, pero no pudimos enviar el email. Usá reenviar código o contactá a un admin.', 'warning');
          }
          setRequireOTP(true);
      }
    } catch (err) {
      const rawMsg = err.message || '';
      const isNetworkError = rawMsg === 'Failed to fetch' 
        || rawMsg.includes('NetworkError') 
        || rawMsg.includes('ERR_CONNECTION')
        || rawMsg.includes('fetch');
      const friendly = isNetworkError 
        ? 'No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo.' 
        : rawMsg || 'Ocurrió un error inesperado. Intentá de nuevo.';
      setError(friendly);
      showToast(friendly, 'error');
      resetCaptcha('Por seguridad, completá el captcha otra vez antes de reintentar.');
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
             />
          </div>
      );
  }

  const isSubmitDisabled = loading || (isLogin 
    ? (!identifier.trim() || !password || (!skipCaptcha && !captchaToken)) 
    : (!name.trim() || !username.trim() || !email.trim() || !password || !dni.trim() || !passwordOk || (!skipCaptcha && !captchaToken)));

  const checkItems = [
    { ok: passwordChecks.minLength, label: 'Al menos 8 caracteres' },
    { ok: passwordChecks.upper, label: 'Una mayúscula' },
    { ok: passwordChecks.lower, label: 'Una minúscula' },
    { ok: passwordChecks.number, label: 'Un número' },
    { ok: passwordChecks.special, label: 'Un símbolo: @ $ ! % * ? &' },
    { ok: passwordChecks.onlyAllowed, label: 'Sin otros símbolos (ej. guion -)' },
  ];

  return (
    <div className="auth-container">
      <form onSubmit={submitAuth} className="auth-form">
        <h2>{isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta en Pandora'}</h2>
        <p>
          {isLogin 
            ? 'Usá tu email o tu nombre de usuario. Las dos formas son válidas.' 
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
            <label htmlFor="identifier">Email o usuario</label>
            <input 
              type="text" id="identifier" required autoComplete="username"
              placeholder="admin@pandora.com o admin"
              value={identifier} onChange={e => setIdentifier(e.target.value)} 
            />
            <small className="input-hint">Podés entrar con el correo o con el usuario, da igual.</small>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-field">
            <input 
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)} 
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {!isLogin && (
            <>
              <small className="input-hint">{PASSWORD_RULES_HINT}</small>
              <ul className="password-checklist" aria-live="polite">
                {checkItems.map((item) => (
                  <li key={item.label} className={item.ok ? 'ok' : ''}>
                    {item.ok ? '✓' : '○'} {item.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {!skipCaptcha && (
          <div className="captcha-wrap">
            <Turnstile
              key={captchaKey}
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken('')}
              onError={() => {
                setCaptchaToken('');
                showToast('No se pudo cargar el captcha. Recargá o intentá de nuevo.', 'error');
              }}
              theme="dark"
            />
            <small className="input-hint captcha-hint">
              Completá el captcha para {isLogin ? 'entrar' : 'registrarte'}. Si falla, se renueva solo (es de un solo uso).
            </small>
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button"
          data-testid="auth-submit"
          disabled={isSubmitDisabled}
        >
          {loading ? "Procesando..." : (isLogin ? "Ingresar" : "Crear Cuenta")}
        </button>

        <p className="auth-switch">
          {isLogin ? "¿No tenés una cuenta? " : "¿Ya tenés una cuenta? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setCaptchaToken(skipCaptcha ? 'test_token_for_automated_testing' : '');
              setCaptchaKey((k) => k + 1);
            }} 
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
