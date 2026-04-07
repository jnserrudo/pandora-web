import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { resendOTP } from '../../services/api';
import '../pages/AuthForm.css';

const OTPVerification = ({ email, onVerify, initialEmailSent = true, canResend = false, debugOTP = null }) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [resendMessage, setResendMessage] = useState('');
  const [emailSent, setEmailSent] = useState(initialEmailSent);
  const navigate = useNavigate();

  const handleChange = (element, index) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const submitOTP = async () => {
    setIsLoading(true);
    await onVerify(otp.join(''));
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setResendStatus(null);
    setResendMessage('');

    try {
      const result = await resendOTP(email);
      setResendStatus('success');
      setResendMessage(result.message || 'Código reenviado exitosamente. Revisá tu email.');
      setEmailSent(true);
    } catch (error) {
      setResendStatus('error');
      setResendMessage(
        error.response?.data?.message || 
        error.message || 
        'No pudimos reenviar el código. Intentá nuevamente en unos momentos.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-form" style={{ padding: '2.5rem', maxWidth: '420px', margin: 'auto' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Verificación Segura
      </h2>
      <p style={{ color: 'var(--color-text-light, #a0a0c0)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Hemos enviado un código maestro de 6 dígitos a <br/>
        <strong style={{ color: 'var(--color-primary)', display: 'block', marginTop: '5px' }}>{email}</strong>
      </p>

      {/* Mensaje de advertencia si el email original falló */}
      {!emailSent && canResend && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.15)',
          border: '1px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} style={{ color: '#ffc107', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#ffc107', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
              No pudimos enviar el email de verificación
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', margin: 0 }}>
              Intentá reenviar el código o contactá soporte si el problema persiste.
            </p>
          </div>
        </div>
      )}

      {/* Fallback deshabilitado para testing normal - se muestra solo el botón de reenvío */}
      {/* 
      {!emailSent && debugOTP && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(255, 20, 147, 0.2) 100%)',
          border: '2px solid var(--color-primary)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '0.9rem', 
            marginBottom: '1rem',
            fontWeight: 500
          }}>
            🔑 Tu código de verificación (fallback):
          </p>
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '1rem 2rem',
            display: 'inline-block',
            border: '1px solid rgba(138, 43, 226, 0.5)'
          }}>
            <span style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              letterSpacing: '0.5rem',
              color: '#fff',
              fontFamily: 'monospace',
              textShadow: '0 0 20px rgba(138, 43, 226, 0.8)'
            }}>
              {debugOTP}
            </span>
          </div>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: '0.8rem', 
            marginTop: '1rem',
            fontStyle: 'italic'
          }}>
            Ingresá este código en los casilleros de abajo
          </p>
        </div>
      )}
      */}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '2rem' }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            style={{ 
               width: '48px', 
               height: '56px', 
               textAlign: 'center', 
               fontSize: '1.5rem', 
               fontWeight: 'bold', 
               backgroundColor: 'rgba(0, 0, 0, 0.4)', 
               color: '#fff', 
               border: '1px solid var(--color-primary)', 
               borderRadius: '12px',
               outline: 'none',
               transition: 'all 0.2s ease-in-out'
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={submitOTP}
        disabled={isLoading || otp.join('').length < 6}
        className="auth-button"
        style={{ padding: '1.2rem', fontWeight: 'bold' }}
      >
        {isLoading ? 'Comprobando Identidad...' : 'Confirmar Código Maestro'}
      </button>

      {/* Botón de reenviar código */}
      {canResend && (
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isResending}
          style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: resendStatus === 'success' ? 'rgba(40, 167, 69, 0.2)' : 'transparent',
            border: resendStatus === 'success' ? '1px solid rgba(40, 167, 69, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            color: resendStatus === 'success' ? '#28a745' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            cursor: isResending ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (!isResending && resendStatus !== 'success') {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isResending && resendStatus !== 'success') {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }
          }}
        >
          {isResending ? (
            <>
              <RefreshCw size={18} className="spin" />
              Enviando código...
            </>
          ) : resendStatus === 'success' ? (
            <>
              <CheckCircle size={18} />
              Código reenviado
            </>
          ) : (
            <>
              <Mail size={18} />
              Reenviar código de verificación
            </>
          )}
        </button>
      )}

      {/* Mensaje de estado del reenvío */}
      {resendStatus && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          background: resendStatus === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          border: `1px solid ${resendStatus === 'success' ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`,
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: resendStatus === 'success' ? '#28a745' : '#dc3545'
          }}>
            {resendMessage}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/login')}
        disabled={isLoading || isResending}
        style={{
          marginTop: '1rem',
          padding: '0.8rem',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.color = 'rgba(255, 255, 255, 0.7)';
        }}
      >
        <ArrowLeft size={18} />
        Volver al Login
      </button>

      {/* Animación CSS para el spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;
