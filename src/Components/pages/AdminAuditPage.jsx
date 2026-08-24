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
  History,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuditLogs } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { formatEnumLabel } from '../../utils/enumLabels.js';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import './AdminAuditPage.css';
import './AdminArticlesPage.css'; 

const AdminAuditPage = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogins, setShowLogins] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await getAuditLogs(token, page, pageSize);
                setLogs(data.logs || []);
                setPagination(data.meta || { page, limit: pageSize, total: 0, totalPages: 1 });
            } catch (error) {
                showToast("No se pudo cargar la auditoría.", 'error');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLogs();
    }, [token, page, pageSize]);

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
                <div className="admin-sticky-back">
                    <Link to="/admin/dashboard" className="back-link">
                        <ChevronLeft size={20} />
                        <span>Volver al Panel</span>
                    </Link>
                </div>
                <header className="admin-header-premium">
                    <div className="admin-title-group">
                        <p className="admin-kicker">Auditoría</p>
                        <h1>Historial del sistema</h1>
                        <p>Registro de cambios, altas y acciones en la plataforma.</p>
                    </div>
                </header>

                {loading ? (
                    <LoadingSpinner message="Cargando historial..." />
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
                            <span className="results-count">
                              Página {pagination.page || page} · {pagination.total || filteredLogs.length} registros
                            </span>
                        </div>

                        <div className="admin-panel-card">
                            <div className="admin-table-wrapper-premium">
                                <table className="admin-table-premium">
                                    <thead>
                                        <tr>
                                            <th className="col-date">FECHA</th>
                                            <th className="col-main">USUARIO</th>
                                            <th className="col-status">ACCIÓN</th>
                                            <th className="hide-tablet col-meta">ENTIDAD</th>
                                            <th className="hide-mobile col-meta">ORIGEN</th>
                                            <th className="col-actions text-right">DETALLES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6}>No hay registros con este filtro.</td>
                                            </tr>
                                        ) : filteredLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="col-date text-sm opacity-70">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="col-main">
                                                    <div className="user-info-inline">
                                                        <User size={14} className="opacity-50" />
                                                        <span>{log.user?.username || 'Sistema'}</span>
                                                    </div>
                                                </td>
                                                <td className="col-status">
                                                    <span className={getActionBadgeClass(log.action)}>
                                                        {formatEnumLabel(log.action)}
                                                    </span>
                                                </td>
                                                <td className="hide-tablet col-meta">
                                                    <div className="entity-tag">
                                                        <Database size={14} />
                                                        <span>{formatEnumLabel(log.resourceType)}: {log.resourceId}</span>
                                                    </div>
                                                </td>
                                                <td className="hide-mobile col-meta">
                                                    <span
                                                      className={`badge-premium ${
                                                        log.clientSource === 'MOBILE'
                                                          ? 'draft'
                                                          : log.clientSource === 'WEB'
                                                            ? 'active'
                                                            : 'inactive'
                                                      }`}
                                                      title={log.clientSource || 'UNKNOWN'}
                                                    >
                                                      {log.clientSource === 'MOBILE'
                                                        ? 'App'
                                                        : log.clientSource === 'WEB'
                                                          ? 'Web'
                                                          : '—'}
                                                    </span>
                                                </td>
                                                <td className="col-actions text-right">
                                                    <AdminRowActionsMenu
                                                        label={`Detalle del log ${log.id}`}
                                                        items={[
                                                            {
                                                                key: 'view',
                                                                label: 'Ver detalle',
                                                                icon: Eye,
                                                                tone: 'info',
                                                                onClick: () => setSelectedLog(log),
                                                            },
                                                        ]}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="table-footer-premium admin-pagination-bar">
                                  <div className="admin-pagination-meta">
                                    <span>
                                      Mostrando página {pagination.page || page} de {pagination.totalPages || 1}
                                    </span>
                                    <label className="admin-page-size">
                                      Por página
                                      <select
                                        value={pageSize}
                                        onChange={(e) => {
                                          setPageSize(Number(e.target.value));
                                          setPage(1);
                                        }}
                                      >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                      </select>
                                    </label>
                                  </div>
                                  <div className="pagination-group-premium">
                                    <button
                                      type="button"
                                      className="btn-page"
                                      disabled={(pagination.page || page) <= 1}
                                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                      Anterior
                                    </button>
                                    <button type="button" className="btn-page active" disabled>
                                      {pagination.page || page}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-page"
                                      disabled={(pagination.page || page) >= (pagination.totalPages || 1)}
                                      onClick={() => setPage((p) => p + 1)}
                                    >
                                      Siguiente
                                    </button>
                                  </div>
                                </div>
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
                                                    <span>{formatEnumLabel(selectedLog.resourceType)} (ID: {selectedLog.resourceId})</span>
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
                                                <div className="meta-icon"><Monitor size={16} /></div>
                                                <div className="meta-content">
                                                    <label>Origen</label>
                                                    <span>
                                                      {selectedLog.clientSource === 'MOBILE'
                                                        ? 'App móvil'
                                                        : selectedLog.clientSource === 'WEB'
                                                          ? 'Web'
                                                          : selectedLog.clientSource || 'Desconocido'}
                                                    </span>
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
