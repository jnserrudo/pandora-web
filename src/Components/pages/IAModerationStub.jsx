import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Search, 
  CheckCircle, 
  XCircle,
  Cpu
} from 'lucide-react';
import './IAModerationStub.css';

const IAModerationStub = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const mockFindings = [
    { id: 1, type: 'text', content: 'Contenido verificado. Sin lenguaje ofensivo.', status: 'safe' },
    { id: 2, type: 'image', content: 'Metadatos de imagen consistentes.', status: 'safe' },
    { id: 3, type: 'user', content: 'Reputación del autor: Alta.', status: 'safe' },
  ];

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setLogs(['Iniciando motor neuronal...', 'Cargando modelos de visión...', 'Analizando patrones de comportamiento...']);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress === 40) setLogs(prev => [...prev, 'Escaneando imágenes de galería...']);
      if (progress === 70) setLogs(prev => [...prev, 'Verificando cumplimiento de políticas...']);
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setLogs(prev => [...prev, 'Análisis completado: SISTEMA SEGURO']);
      }
    }, 300);
  };

  return (
    <div className="ia-moderation-stub">
      <div className="ia-header">
        <div className="ia-logo">
          <Cpu className="cpu-icon" />
          <div className="ia-title">
            <h3>PANDORA <span className="ai-tag">AI GUARD</span></h3>
            <p>Motor de Moderación Predictiva</p>
          </div>
        </div>
        <div className={`status-indicator ${isScanning ? 'scanning' : 'idle'}`}>
          {isScanning ? 'PROCESANDO' : 'STANDBY'}
        </div>
      </div>

      <div className="ia-main-grid">
        <div className="ia-terminal">
          <div className="terminal-header">LOGS DEL SISTEMA v4.0</div>
          <div className="terminal-content">
            {logs.map((log, i) => (
              <div key={i} className="log-line">
                <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="message">{log}</span>
              </div>
            ))}
            {isScanning && <div className="cursor-blink">_</div>}
          </div>
        </div>

        <div className="ia-stats-panel">
          <div className="scan-control">
            <button 
              className={`scan-btn ${isScanning ? 'disabled' : ''}`}
              onClick={startScan}
              disabled={isScanning}
            >
              {isScanning ? <Zap className="spinning" /> : <ShieldCheck />}
              <span>{isScanning ? 'Escaneando...' : 'Iniciar Auditoría IA'}</span>
            </button>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${scanProgress}%` }}></div>
            </div>
          </div>

          <div className="findings-list">
            <h4>HALLAZGOS RECIENTES</h4>
            {mockFindings.map(f => (
              <div key={f.id} className="finding-item">
                {f.status === 'safe' ? <CheckCircle className="safe-icon" size={16} /> : <ShieldAlert className="alert-icon" size={16} />}
                <span>{f.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ia-footer-note">
        <ShieldCheck size={14} />
        <span>Protección activa con Redes Neuronales de Convolución (STUB)</span>
      </div>
    </div>
  );
};

export default IAModerationStub;
