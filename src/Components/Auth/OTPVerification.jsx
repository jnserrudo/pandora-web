import React, { useState } from 'react';
import '../pages/AuthForm.css';

const OTPVerification = ({ email, onVerify }) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="auth-form" style={{ padding: '2.5rem', maxWidth: '420px', margin: 'auto' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Verificación Segura
      </h2>
      <p style={{ color: 'var(--color-text-light, #a0a0c0)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Hemos enviado un código maestro de 6 dígitos a <br/>
        <strong style={{ color: 'var(--color-primary)', display: 'block', marginTop: '5px' }}>{email}</strong>
      </p>

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
    </div>
  );
};

export default OTPVerification;
