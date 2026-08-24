// src/pages/CommerceDetailPage.jsx

import React, { useState, useEffect } from "react";
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommerceById, getAbsoluteImageUrl, getCommerceFAQs, toggleFavorite, getMyFavorites } from "../../services/api";
import { commerceAttributes } from "../../constants/commerceAttributes";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Share2, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageCircle,
  ArrowLeft, 
  Calendar,  
  HelpCircle,
  Heart
} from 'lucide-react';
import CommerceCommentForm from '../Commerce/CommerceCommentForm';
import CommerceProducts from '../Commerce/CommerceProducts';
import MapView from '../ui/MapView';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import EntityMedia from '../motion/EntityMedia';
import Reveal from '../motion/Reveal';
import "./CommerceDetailPage.css";

const CommerceDetailPage = () => {
  const { id } = useParams(); // Obtiene el :id de la URL
  const [commerce, setCommerce] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0); // Sube al inicio de la página al cargar
    const fetchCommerce = async () => {
      try {
        setLoading(true);
        const data = await getCommerceById(id);
        setCommerce(data);
        
        if (data && data.planLevel >= 3) {
          try {
            const faqsData = await getCommerceFAQs(id);
            setFaqs(faqsData);
          } catch (err) {
            console.error("Error cargando FAQs:", err);
          }
        }
        if (token) {
          try {
            const favs = await getMyFavorites(token);
            setIsFavorite((favs || []).some((f) => String(f.resourceId) === String(id) && String(f.resourceType).toLowerCase() === 'commerce'));
          } catch {
            /* no bloquea el detalle */
          }
        }
      } catch (err) {
        setError("No se pudo encontrar el comercio.");
        showToast("No se pudo cargar el comercio.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCommerce();
  }, [id, token]);

  if (loading) return <LoadingSpinner fullscreen message="Cargando comercio..." />;
  if (error) {
    return (
      <div className="detail-page-container">
        <Navbar />
        <div className="page-error-message">{error}</div>
        <Footer />
      </div>
    );
  }
  if (!commerce) return null;

  // Lógica para determinar la imagen de portada
  const coverImage =
    commerce.coverImage ||
    (commerce.galleryImages && commerce.galleryImages.length > 0
      ? commerce.galleryImages[0]
      : null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: commerce.name,
          text: `Mirá este comercio en Pandora: ${commerce.name}`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          showToast("No se pudo compartir. Copiamos el enlace.", 'info');
          navigator.clipboard.writeText(window.location.href);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Enlace copiado al portapapeles", "success");
    }
  };

  const handleFavorite = async () => {
    if (!token) {
      showToast("Iniciá sesión para guardar favoritos.", 'info');
      return;
    }
    try {
      const result = await toggleFavorite(id, 'commerce', token);
      setIsFavorite(Boolean(result.favorited));
      showToast(result.favorited ? "Guardado en favoritos." : "Quitado de favoritos.", 'success');
    } catch (err) {
      showToast(err.message || "No se pudo actualizar el favorito.", 'error');
    }
  };

  return (
    <div className="detail-page-container">
      <Navbar />
      <button type="button" onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
        <ArrowLeft size={18} />
      </button>
      <header className="detail-header">
        <EntityMedia
          className="detail-header-media"
          coverImage={coverImage}
          images={commerce.galleryImages}
          alt={commerce.name}
          intervalMs={5000}
          hoverZoom={false}
        />
        <div className="header-overlay">
          <div className="flex gap-2 mb-2 flex-wrap">
            {commerce.categories && commerce.categories.length > 0 ? (
               commerce.categories.map(cat => (
                 <p key={cat.id} className="header-category" style={{margin:0}}>
                   {getCategoryDisplayName(cat.name)}
                 </p>
               ))
            ) : (
               <p className="header-category" style={{margin:0}}>
                 {getCategoryDisplayName(commerce.category)}
               </p>
            )}
          </div>
          <h1>{commerce.name}</h1>
        </div>
      </header>

      <main className="detail-content">
        <Reveal as="section" className="info-section" variant="up">
          <h2>Sobre el Lugar</h2>
          <p>{commerce.description}</p>
          <div className="info-grid">
            {commerce.branches && commerce.branches.length > 0 ? (
               commerce.branches.map(branch => (
                 <div key={branch.id} className={`info-item-branch ${branch.isMain ? 'main-branch-card' : ''}`}>
                    <div className="branch-name-row">
                       <MapPin size={16} className="text-primary" />
                       <strong>{branch.name || (branch.isMain ? 'Casa Central' : 'Sucursal')}</strong>
                    </div>
                    <p className="branch-address">{branch.address}</p>
                    {branch.phone && (
                       <div className="branch-phone-row">
                          <Phone size={14} className="text-dim" />
                          <span>{branch.phone}</span>
                       </div>
                    )}
                 </div>
               ))
            ) : (
               <div className="info-item">
                 <strong>Dirección:</strong> {commerce.address}
               </div>
            )}
            {!commerce.branches?.length && (
              <div className="info-item">
                <strong>Teléfono:</strong> {commerce.phone || "No especificado"}
              </div>
            )}
          </div>

          <div className="commerce-action-buttons">
            <button type="button" onClick={handleShare} className="btn-pandora-secondary">
              <Share2 size={18} /> Compartir
            </button>
            <button
              type="button"
              onClick={handleFavorite}
              className={`btn-pandora-secondary ${isFavorite ? 'is-fav' : ''}`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'En favoritos' : 'Guardar'}
            </button>
            {commerce.phone && commerce.planLevel >= 2 && (
              <a 
                href={`https://wa.me/${commerce.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-pandora commerce-wa-btn"
              >
                <MessageCircle size={18} /> Escribir por WhatsApp
              </a>
            )}
            {commerce.externalLink && commerce.planLevel >= 2 && (
              <a 
                href={commerce.externalLink.startsWith('http') ? commerce.externalLink : `https://${commerce.externalLink}`}
                target="_blank"
                rel="noreferrer"
                className="btn-pandora"
              >
                <Globe size={18} /> Ver menú / Sitio web
              </a>
            )}
          </div>
          
          {commerce.attributes && commerce.attributes.length > 0 && (
            <div className="commerce-attributes-section" style={{ marginTop: '2.5rem' }}>
              <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem', color: '#fff' }}>Características Destacadas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {commerce.attributes.map(attrId => {
                  const attrDef = commerceAttributes[attrId];
                  if (!attrDef) return null;
                  const Icon = attrDef.icon;
                  return (
                    <div key={attrId} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(255, 0, 200, 0.08)', border: '1px solid var(--color-accent)', borderRadius: '50px', color: '#fff', fontSize: '0.85rem' }}>
                      <Icon size={16} color="var(--color-accent)" />
                      <span>{attrDef.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {commerce.latitude && commerce.longitude && (
            <div className="commerce-detail-map" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={24} className="text-primary" /> Ubicación
              </h3>
              
              {commerce.branches && commerce.branches.length > 1 && (
                <p style={{marginBottom:'1rem', fontSize:'0.9rem', color:'#aaa'}}>Mapa apuntando a Casa Central. Consulta las otras sucursales en la sección de Direcciones.</p>
              )}
              
              <MapView latitude={commerce.latitude} longitude={commerce.longitude} />
            </div>
          )}
        </Reveal>

        {commerce.galleryImages && commerce.galleryImages.length > 0 && (
          <Reveal as="section" className="gallery-section" variant="up">
            <h2>Galería</h2>
            <div className="gallery-grid">
              {commerce.galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={getAbsoluteImageUrl(img)}
                  alt={`${commerce.name} galeria ${index + 1}`}
                />
              ))}
            </div>
          </Reveal>
        )}

        {/* --- CATÁLOGO DE PRODUCTOS (PLATA O SUPERIOR) --- */}
        {commerce.planLevel >= 2 && (
          <CommerceProducts commerceId={id} planLevel={commerce.planLevel} />
        )}

        {commerce.events && commerce.events.length > 0 && (
          <section className="related-events-section">
            <h2>Próximos Eventos en {commerce.name}</h2>
            <div className="events-list">
              {commerce.events.map((event) => {
                const date = new Date(event.startDate);
                const day = date.toLocaleDateString("es-ES", {
                  day: "2-digit",
                });
                const month = date
                  .toLocaleDateString("es-ES", { month: "short" })
                  .replace(".", "")
                  .toUpperCase();
                return (
                  <Link
                    to={`/event/${event.id}`}
                    key={event.id}
                    className="event-item-link"
                  >
                    <div className="event-item">
                      <div className="event-date">
                        <span className="event-day">{day}</span>
                        <span className="event-month">{month}</span>
                      </div>
                      <div className="event-info">
                        <h3 className="related-event-title">{event.name}</h3>
                        <p className="event-location">
                          {event.address || commerce.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {commerce.planLevel >= 3 && faqs.length > 0 && (
          <section className="commerce-faqs-section" style={{ marginTop: '3rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={24} className="text-primary" /> Preguntas Frecuentes
            </h2>
            <div className="faqs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {faqs.map(faq => (
                <div key={faq.id} className="faq-item" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '600' }}>{faq.question}</h3>
                  <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <div className="section-container" style={{ marginTop: '3rem' }}>
            <CommerceCommentForm 
                commerceId={id} 
                commerceName={commerce.name} 
                ownerId={commerce.ownerId}
            />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommerceDetailPage;
