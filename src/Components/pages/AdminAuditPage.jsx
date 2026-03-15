// src/Components/pages/AdminAuditPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Activity, 
  User, 
  Database, 
  Eye, 
  Clock, 
  FileText,
  AlertCircle,
  History,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuditLogs } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminAuditPage.css'; 

const AdminAuditPage = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogins, setShowLogins] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await getAuditLogs(token);
                setLogs(data.logs);
                setPagination(data.meta);
            } catch (error) {
                console.error("Error loading logs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLogs();
    }, [token]);

    const filteredLogs = logs.filter(log => showLogins || log.action !== 'LOGIN');

    const getActionBadgeClass = (action) => {
        switch (action) {
            case 'CREATE': return 'badge-premium active';
            case 'UPDATE': return 'badge-premium warning';
            case 'DELETE': return 'badge-premium urgent';
            case 'STATUS_CHANGE': return 'badge-premium info';
            case 'LOGIN': return 'badge-premium success';
            default: return 'badge-premium';
        }
    };

    const formatData = (data) => {
        if (!data) return "N/A";
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return "Datos no legibles";
        }
    };

    return (
        <div className="admin-wrapper hub-theme">
            <Navbar />
            <div className="admin-container">
                <header className="admin-header-premium">
                    <div className="admin-title-group">
                        <Link to="/admin/dashboard" className="back-link">
                            <ChevronLeft size={20} />
                            <span>Volver al Panel</span>
                        </Link>
                        <div className="hub-badge">
                            <History size={14} />
                            <span>AUDITORÍA GLOBAL</span>
                        </div>
                        <h1>Historial del Sistema</h1>
                        <p>Seguimiento detallado de todas las transacciones y cambios de datos.</p>
                    </div>
                </header>

                {loading ? (
                    <LoadingSpinner message="Reconstruyendo historial..." />
                ) : (
                    <div className="admin-audit-layout">
                        <div className="audit-controls">
                            <label className="toggle-glass">
                                <input 
                                    type="checkbox" 
                                    checked={showLogins} 
                                    onChange={(e) => setShowLogins(e.target.checked)} 
                                />
                                <span className="toggle-label">Mostrar Logins de Usuarios</span>
                            </label>
                            <span className="results-count">Mostrando {filteredLogs.length} transacciones</span>
                        </div>

                        <div className="admin-panel-card">
                            <div className="admin-table-wrapper-premium">
                                <table className="admin-table-premium">
                                    <thead>
                                        <tr>
                                            <th>FECHA</th>
                                            <th>USUARIO</th>
                                            <th>ACCIÓN</th>
                                            <th>ENTIDAD</th>
                                            <th className="text-right">DETALLES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="text-sm opacity-70">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div className="user-info-inline">
                                                        <User size={14} className="opacity-50" />
                                                        <span>{log.user?.username || 'Sistema'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getActionBadgeClass(log.action)}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="entity-tag">
                                                        <Database size={14} />
                                                        <span>{log.resourceType}: {log.resourceId}</span>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button 
                                                        className="btn-action-premium view"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedLog && (
                            <div className="audit-detail-overlay" onClick={() => setSelectedLog(null)}>
                                <div className="audit-detail-modal" onClick={e => e.stopPropagation()}>
                                    <header className="modal-header-premium">
                                        <div className="modal-title">
                                            <Activity size={20} />
                                            <h3>Transacción #{selectedLog.id}</h3>
                                        </div>
                                        <button className="close-btn" onClick={() => setSelectedLog(null)}>&times;</button>
                                    </header>
                                    
                                    <div className="modal-body scrollable">
                                        {selectedLog.action === 'LOGIN' ? (
                                            <div className="simple-event-view">
                                                <div className="event-icon success">
                                                    <User size={40} />
                                                </div>
                                                <h4>Inicio de Sesión Exitoso</h4>
                                                <p>El usuario <strong>{selectedLog.user?.username || 'Sistema'}</strong> accedió al sistema.</p>
                                            </div>
                                        ) : (
                                            <div className="diff-container">
                                                <div className="diff-panel">
                                                    <h4><History size={14} /> Datos Anteriores</h4>
                                                    <pre className="json-viewer">
                                                        {formatData(selectedLog.oldData)}
                                                    </pre>
                                                </div>
                                                <div className="diff-arrow">
                                                    <ChevronLeft className="rotate-180" />
                                                </div>
                                                <div className="diff-panel">
                                                    <h4><Activity size={14} /> Datos Nuevos</h4>
                                                    <pre className="json-viewer">
                                                        {formatData(selectedLog.newData)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="audit-meta-grid">
                                            <div className="meta-item">
                                                <div className="meta-icon"><Clock size={16} /></div>
                                                <div className="meta-content">
                                                    <label>Timestamp</label>
                                                    <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon"><Database size={16} /></div>
                                                <div className="meta-content">
                                                    <label>Recurso Afectado</label>
                                                    <span>{selectedLog.resourceType} (ID: {selectedLog.resourceId})</span>
                                                </div>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon"><Activity size={16} /></div>
                                                <div className="meta-content">
                                                    <label>Dirección IP</label>
                                                    <span>{selectedLog.ipAddress || '127.0.0.1'}</span>
                                                </div>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon"><User size={16} /></div>
                                                <div className="meta-content">
                                                    <label>Operador</label>
                                                    <span>{selectedLog.user?.username || 'Sistema'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminAuditPage;
