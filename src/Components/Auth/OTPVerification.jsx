import React, { useState } from 'react';

// Assuming you have components like this from react-bits, or standard tailwind otherwise.
// If you don't have them yet, these map to standard div transitions.
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
    <div className="flex flex-col items-center bg-zinc-900 border border-zinc-800 p-10 rounded-2xl shadow-2xl max-w-md mx-auto transition-all duration-700 ease-in-out opacity-100">
      <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
        Verificación Segura
      </h2>
      <p className="text-zinc-400 mb-8 text-center text-sm leading-relaxed">
        Hemos enviado un código maestro a <br/>
        <span className="text-blue-400 font-medium">{email}</span>
      </p>

      <div className="flex gap-3 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            className="w-12 h-14 text-center text-2xl font-bold bg-black text-white rounded-xl border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
          />
        ))}
      </div>

      <button
        onClick={submitOTP}
        disabled={isLoading || otp.join('').length < 6}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
      >
        {isLoading ? 'Comprobando Identidad...' : 'Confirmar Código'}
      </button>
    </div>
  );
};

export default OTPVerification;
