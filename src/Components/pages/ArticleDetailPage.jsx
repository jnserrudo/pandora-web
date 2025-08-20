// src/pages/ArticleDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleBySlug } from '../../services/api';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { slug } = useParams(); // Obtiene el :slug de la URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   // --- 2. OBTENER LA FUNCIÓN navigate ---
   const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        setError('No se pudo encontrar el artículo.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="loader">Cargando artículo...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!article) {
    return null;
  }

  return (
    <div className="article-detail-container">
      <header className="article-detail-header" style={{ backgroundImage: `url(${article.coverImage})` }}>
         {/* --- 3. AÑADIR EL BOTÓN DE VOLVER --- */}
         <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          &larr; {/* Código HTML para una flecha a la izquierda */}
        </button>
        <div className="article-header-overlay">
          <h1>{article.title}</h1>
          <h2>{article.subtitle}</h2>
          <p className="article-author">Por {article.authorName}</p>
        </div>
      </header>
      <main className="article-content">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </main>
    </div>
  );
};

export default ArticleDetailPage;