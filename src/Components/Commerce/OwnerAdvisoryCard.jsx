import React, { useState } from 'react';
import { 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    BarChart2, 
    ArrowRight,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './OwnerAdvisoryCard.css';

const OwnerAdvisoryCard = ({ advisory, onUpdateStatus }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleMarkImplemented = async (e) => {
        e.stopPropagation();
        setIsUpdating(true);
        try {
            await onUpdateStatus(advisory.id, 'IMPLEMENTED');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusInfo = (status) => {
        switch(status) {
            case 'IMPLEMENTED':
                return { label: 'Implementada', class: 'implemented', icon: <CheckCircle size={16} /> };
            case 'READ':
                return { label: 'Leída', class: 'read', icon: <Clock size={16} /> };
            default:
                return { label: 'Nueva', class: 'sent', icon: <AlertCircle size={16} /> };
        }
    };

    const statusInfo = getStatusInfo(advisory.status);
    const metrics = advisory.metricsSnapshot || {};

    return (
        <div 
            className={`owner-advisory-card glass-panel ${advisory.status.toLowerCase()} ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="advisory-main-header">
                <div className="advisory-title-group">
                    <span className={`advisory-status-badge ${statusInfo.class}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                    <h4 className="advisory-card-title">{advisory.title}</h4>
                </div>
                <div className="advisory-meta-group">
                    <span className="advisory-date">
                        {format(new Date(advisory.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                    </span>
                </div>
            </div>

            <div className="advisory-brief">
                <p>{advisory.content.substring(0, 120)}{advisory.content.length > 120 ? '...' : ''}</p>
            </div>

            {isExpanded && (
                <div className="advisory-details-expanded" onClick={e => e.stopPropagation()}>
                    <div className="details-section">
                        <h5><BarChart2 size={16} /> Análisis de Situación</h5>
                        <p>{advisory.content}</p>
                    </div>

                    <div className="details-section">
                        <h5><AlertCircle size={16} /> Recomendaciones de Pandora</h5>
                        <div className="recommendations-list">
                            {advisory.recommendations.split('\n').map((rec, i) => (
                                rec.trim() && (
                                    <div key={i} className="recommendation-item">
                                        <ArrowRight size={14} />
                                        <span>{rec.trim()}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    <div className="metrics-snapshot-view">
                        <div className="snapshot-item">
                            <span className="label">CTR</span>
                            <span className="value">{metrics.ctr}%</span>
                        </div>
                        <div className="snapshot-item">
                            <span className="label">Rating</span>
                            <span className="value">{metrics.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="snapshot-item">
                            <span className="label">Feedback</span>
                            <span className="value">{metrics.totalComments} op.</span>
                        </div>
                    </div>

                    {advisory.status !== 'IMPLEMENTED' && (
                        <div className="advisory-actions">
                            <button 
                                className="btn-mark-implemented"
                                onClick={handleMarkImplemented}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Marcar como Implementada
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {advisory.status === 'IMPLEMENTED' && advisory.implementedAt && (
                        <div className="implementation-notice">
                            <CheckCircle size={16} />
                            Logrado el {format(new Date(advisory.implementedAt), "d 'de' MMMM", { locale: es })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OwnerAdvisoryCard;
