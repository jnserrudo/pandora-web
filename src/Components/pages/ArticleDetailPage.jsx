import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticleBySlug, getAbsoluteImageUrl } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { ArrowLeft, Calendar, User, Clock, Share2, Link2, Store, CalendarDays } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import './ArticleDetailPage.css';

function readingMinutes(html) {
  const words = String(html || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function formatArticleDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function extractInternalMentions(html) {
  const matches = [...String(html || '').matchAll(/<a[^>]+href="(\/(?:commerce|event)\/[^"]+)"[^>]*>([^<]*)<\/a>/gi)];
  const seen = new Set();
  return matches.reduce((list, match) => {
    const to = match[1];
    if (seen.has(to)) return list;
    seen.add(to);
    list.push({
      to,
      label: (match[2] || '').trim() || to,
      type: to.startsWith('/event') ? 'event' : 'commerce',
    });
    return list;
  }, []);
}

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleBySlug(slug);
        setArticle(data);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('No se pudo encontrar el artículo.');
        showToast("No se pudo cargar el artículo.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const mentions = useMemo(() => extractInternalMentions(article?.content), [article?.content]);
  const related = article?.related || [];
  const minutes = readingMinutes(article?.content);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.subtitle || article.title,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast("Enlace copiado al portapapeles.", 'success');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Enlace copiado al portapapeles.", 'success');
  };

  if (loading) return <LoadingSpinner fullscreen message="Abriendo Pandora Magazine..." />;

  if (error || !article) {
    return (
      <div className="error-page">
        <Navbar />
        <div className="error-content">
          <h2>{error || "Artículo no encontrado"}</h2>
          <button onClick={() => navigate('/magazine')} className="btn-back-home">Volver al Magazine</button>
        </div>
        <Footer />
      </div>
    );
  }

  const cover = getAbsoluteImageUrl(article.coverImage);

  return (
    <div className="article-page-wrapper">
      <Navbar />
      <button type="button" onClick={() => navigate('/magazine')} className="btn-action-back">
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <main className="article-main-content">
        <header className="article-hero">
          <div className="hero-bg" style={{ backgroundImage: cover ? `url(${cover})` : 'none' }}></div>
          <div className="hero-overlay"></div>

          <div className="hero-container">
            <div className="article-header-info">
              <div className="article-badge">{getCategoryDisplayName(article.category?.name || article.category) || 'Cultura'}</div>
              <h1 className="article-title-reveal">{article.title}</h1>
              {article.subtitle && <p className="article-subtitle-reveal">{article.subtitle}</p>}

              <div className="article-meta-glass">
                <div className="meta-item">
                  <User size={16} />
                  <span>{article.authorName || 'Redacción Pandora'}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formatArticleDate(article.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{minutes} min de lectura</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="article-body-section">
          <div className="article-content-card">
            <div
              className="article-rich-text"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {mentions.length > 0 && (
              <aside className="article-mentions">
                <h3>En esta nota</h3>
                <div className="article-mention-list">
                  {mentions.map((item) => (
                    <Link key={item.to} to={item.to} className="article-mention-card">
                      {item.type === 'event' ? <CalendarDays size={16} /> : <Store size={16} />}
                      <span>
                        <small>{item.type === 'event' ? 'Evento' : 'Comercio'}</small>
                        <strong>{item.label}</strong>
                      </span>
                    </Link>
                  ))}
                </div>
              </aside>
            )}

            <footer className="article-footer-actions">
              <div className="share-box">
                <span>¿Te gustó? Compartilo</span>
                <div className="share-btns">
                  <button type="button" className="share-btn" onClick={handleShare} aria-label="Compartir artículo">
                    <Share2 size={18} />
                    <em>Compartir</em>
                  </button>
                  <button type="button" className="share-btn" onClick={handleCopy} aria-label="Copiar enlace">
                    <Link2 size={18} />
                    <em>Copiar enlace</em>
                  </button>
                </div>
              </div>
            </footer>
          </div>

          {related.length > 0 && (
            <aside className="article-related">
              <h3>Más notas</h3>
              <div className="article-related-grid">
                {related.map((item) => (
                  <Link key={item.id} to={`/article/${item.slug}`} className="article-related-card">
                    <img src={getAbsoluteImageUrl(item.coverImage)} alt="" />
                    <div>
                      <small>{getCategoryDisplayName(item.category?.name || item.category) || 'Revista'}</small>
                      <strong>{item.title}</strong>
                      {item.subtitle && <p>{item.subtitle}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
