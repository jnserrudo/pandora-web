// src/pages/ArticlesListPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import { Link } from 'react-router-dom';
import { getArticles, getAbsoluteImageUrl } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useToast } from '../../context/ToastContext';
import { Calendar, User } from 'lucide-react';
import './ArticlesListPage.css';

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();
  const observerTarget = useRef(null);

  const ARTICLES_PER_PAGE = 6;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { articles: fetchedArticles, meta } = await getArticles(1, ARTICLES_PER_PAGE, 'recent');
        setArticles(fetchedArticles);
        setHasMore(meta.page < meta.totalPages);
      } catch (error) {
        setLoadError(true);
        showToast("No se pudieron cargar las noticias. Probá de nuevo.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading]);

  const loadMoreArticles = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const { articles: newArticles, meta } = await getArticles(nextPage, ARTICLES_PER_PAGE, 'recent');
      
      setArticles(prev => [...prev, ...newArticles]);
      setPage(nextPage);
      setHasMore(meta.page < meta.totalPages);
    } catch (error) {
      showToast("No se pudieron cargar más noticias.", 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=500&auto=format&fit=crop';
  };

  if (loading) {
    return <LoadingSpinner fullscreen message="Cargando noticias..." />;
  }

  return (
    <div className="articles-list-page-wrapper">
      <Navbar />
      
      <div className="articles-list-container">
        <header className="articles-list-header">
          <h1>Pandora Magazine</h1>
          <p>Las últimas noticias, entrevistas y artículos de la escena local.</p>
        </header>

        <div className="articles-grid">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <Link
                to={`/article/${article.slug}`}
                key={article.id}
                className={`article-card-link ${index === 0 ? 'featured' : ''}`}
              >
                <div className="article-card">
                  <img
                    src={getAbsoluteImageUrl(article.coverImage)}
                    alt={article.title}
                    className="article-card-image"
                    onError={handleImageError}
                  />
                  <div className="article-card-content">
                    <span className="article-card-category">{getCategoryDisplayName(article.category?.name || article.category)}</span>
                    <h3 className="article-card-title">{article.title}</h3>
                    <p className="article-card-subtitle">{article.subtitle}</p>
                    <div className="article-card-meta">
                      <span>
                        <User size={13} />
                        {article.authorName || 'Redacción Pandora'}
                      </span>
                      {article.createdAt && (
                        <span>
                          <Calendar size={13} />
                          {new Date(article.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : loadError ? (
            <div className="no-results">
              <p>No se pudieron cargar las noticias.</p>
              <Link to="/">Volver al inicio</Link>
            </div>
          ) : (
            <div className="no-results">
              <p>Todavía no hay artículos publicados.</p>
              <Link to="/">Volvé al inicio</Link> para ver comercios y eventos.
            </div>
          )}
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="scroll-trigger">
            {loadingMore && (
              <div className="loading-more">
                <div className="spinner-small"></div>
                <span>Cargando más artículos...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && articles.length > 0 && (
          <div className="end-of-results">
            <p>Has visto todos los artículos disponibles</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ArticlesListPage;