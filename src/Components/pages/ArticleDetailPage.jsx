// src/pages/ArticleDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleBySlug } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleBySlug(slug);
        setArticle(data);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('No se pudo encontrar el artículo.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

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

  return (
    <div className="article-page-wrapper">
      <Navbar />
      
      <main className="article-main-content">
        <header className="article-hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${article.coverImage})` }}></div>
          <div className="hero-overlay"></div>
          
          <div className="hero-container">
            <button onClick={() => navigate(-1)} className="btn-action-back">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            
            <div className="article-header-info">
              <div className="article-badge">{article.category?.name || 'CULTURA'}</div>
              <h1 className="article-title-reveal">{article.title}</h1>
              <p className="article-subtitle-reveal">{article.subtitle}</p>
              
              <div className="article-meta-glass">
                <div className="meta-item">
                  <User size={16} />
                  <span>{article.authorName || 'Redacción Pandora'}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{article.readTime || 5} min lectura</span>
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
            
            <footer className="article-footer-actions">
              <div className="share-box">
                <span>¿Te gustó? Compartilo:</span>
                <div className="share-btns">
                  <button className="share-btn"><Share2 size={18} /></button>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;