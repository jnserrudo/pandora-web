// src/Components/Commerce/CommerceFeedbackManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL, replyToCommerceComment } from '../../services/api';
import { MessageSquare, Star, ReplyAll, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './CommerceFeedbackManager.css';
import axios from 'axios';

const CommerceFeedbackManager = ({ commerce }) => {
    const { token } = useAuth();
    const { showToast } = useToast();
    
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const canReply = commerce.planLevel >= 2; // Plata, Oro, Platino

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // En el frontend actual, el admin usa el mismo endpoint publico si no hay uno especifico para el owner,
                // Pero lo optimo es consumir GET /api/commerces/:id/comments. 
                // Dado que este endpoint hoy está bloqueado solo a ADMIN en el backend, 
                // usaremos el approach de consultar todos los comentarios asociados al comercio y filtrarlos.
                // NOTA: Para producción real, se debería abrir un endpoint OWNER para leer sus comentarios.
                
                // Hacemos un workaround porque GET /commerces/:id/comments es solo ADMIN actualmente
                // Consultaremos el comercio y poblaremos sus comentarios si el endpoint público o la info los trae.
                // Idealmente deberías pedir al arquitecto backend que habilite un GET /api/commerces/:id/my-comments para dueños.
                // Por ahora, enviaremos la peticion a /api/commerces/:id que devuelve los comentarios publicos.
                
                const res = await axios.get(`${API_URL}/commerces/${commerce.id}`);
                // Aseguramos que los comentarios vengan ordenados por fecha
                const sortedComments = (res.data.comments || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(sortedComments);
            } catch (err) {
                console.error("Error fetching comments:", err);
                showToast("No se pudieron cargar las reseñas.", "error");
            } finally {
                setLoading(false);
            }
        };

        if (commerce?.id) fetchComments();
    }, [commerce.id, showToast]);

    const handleSendReply = async (commentId) => {
        if (!replyText.trim()) return;

        try {
            await replyToCommerceComment(commentId, replyText, token);
            
            showToast("Respuesta enviada correctamente", "success");
            
            // Actualizar el estado local
            setComments(comments.map(c => 
                c.id === commentId ? { ...c, commerceReply: replyText } : c
            ));
            
            setReplyingTo(null);
            setReplyText("");
        } catch (err) {
            console.error(err);
            showToast(err.message || "Error al enviar la respuesta", "error");
        }
    };

    const renderStars = (rating) => {
        if (!rating) return <span className="no-rating">Sin puntuación</span>;
        return (
            <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} opacity={i < rating ? 1 : 0.3} />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="feedback-manager-loading">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p>Cargando bandeja de reseñas...</p>
            </div>
        );
    }

    return (
        <div className="feedback-manager-container">
            <div className="feedback-manager-header">
                <h3>Reseñas de Clientes</h3>
                <div className="feedback-stats">
                    <div className="stat-pill">
                        <MessageSquare size={16} />
                        <span>{comments.length} Totales</span>
                    </div>
                    {comments.length > 0 && commerce.averageRating && (
                        <div className="stat-pill highlight">
                            <Star size={16} fill="currentColor" />
                            <span>{commerce.averageRating.toFixed(1)} Promedio</span>
                        </div>
                    )}
                </div>
            </div>

            {!canReply && (
                <div className="upgrade-notice-feedback">
                    <AlertCircle size={20} className="text-yellow-500" />
                    <div>
                        <strong>Función Premium Requerida</strong>
                        <p>Para poder responder públicamente a las reseñas de tus clientes y gestionar tu reputación online, necesitas al menos el Plan Plata.</p>
                    </div>
                </div>
            )}

            {comments.length === 0 ? (
                <div className="empty-feedback-state glass-morphism">
                    <MessageSquare size={48} className="text-muted" />
                    <h4>Aún no tienes reseñas</h4>
                    <p>Comparte tu perfil público de Pandora con tus clientes para empezar a recibir feedback.</p>
                </div>
            ) : (
                <div className="comments-list-owner">
                    {comments.map(comment => (
                        <div key={comment.id} className="comment-owner-card neo-glass-panel">
                             <div className="comment-body">
                                {commerce.planLevel >= 2 ? (
                                    <p>"{comment.comment}"</p>
                                ) : (
                                    <div className="comment-blocked-content">
                                        <p className="blurred-text">{"•".repeat(comment.comment.length > 50 ? 50 : comment.comment.length)}</p>
                                        <div className="upsell-overlay">
                                            <AlertCircle size={16} />
                                            <span>Feedback bloqueado en Plan Free</span>
                                        </div>
                                    </div>
                                )}
                             </div>

                            <div className="comment-reply-section">
                                {comment.commerceReply ? (
                                    <div className="existing-reply">
                                        <div className="reply-header">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <strong>Tu respuesta pública:</strong>
                                        </div>
                                        <p>{comment.commerceReply}</p>
                                        
                                        {canReply && replyingTo !== comment.id && (
                                            <button onClick={() => {
                                                setReplyingTo(comment.id);
                                                setReplyText(comment.commerceReply);
                                            }} className="btn-edit-reply">
                                                Editar respuesta
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    canReply && replyingTo !== comment.id && (
                                        <button 
                                            onClick={() => {
                                                setReplyingTo(comment.id);
                                                setReplyText("");
                                            }}
                                            className="btn-init-reply"
                                        >
                                            <ReplyAll size={16} /> Enviar respuesta oficial
                                        </button>
                                    )
                                )}

                                {replyingTo === comment.id && (
                                    <div className="reply-form-container glass-morphism active">
                                        <label>Tu respuesta visible al público:</label>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Agradece el comentario u ofrece una solución comercial..."
                                            rows="3"
                                            className="reply-textarea"
                                        />
                                        <div className="reply-form-actions">
                                            <button 
                                                className="btn-cancel" 
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyText("");
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                className="btn-submit" 
                                                onClick={() => handleSendReply(comment.id)}
                                                disabled={!replyText.trim()}
                                            >
                                                Publicar Respuesta
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommerceFeedbackManager;
