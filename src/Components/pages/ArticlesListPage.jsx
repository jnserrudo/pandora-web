// src/pages/ArticlesListPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ArticlesListPage.css';

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
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
        console.error("Failed to fetch articles", error);
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
      console.error("Failed to load more articles", error);
    } finally {
      setLoadingMore(false);
    }
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
            articles.map(article => (
              <Link to={`/article/${article.slug}`} key={article.id} className="article-card-link">
                <div className="article-card">
                  <img src={article.coverImage} alt={article.title} className="article-card-image" />
                  <div className="article-card-content">
                    <span className="article-card-category">{article.category.name}</span>
                    <h3 className="article-card-title">{article.title}</h3>
                    <p className="article-card-subtitle">{article.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No hay artículos disponibles en este momento.</p>
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
            <p>✨ Has visto todos los artículos disponibles</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ArticlesListPage;