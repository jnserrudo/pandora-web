// src/pages/ArticlesListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../../services/api';
import './ArticlesListPage.css';

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const data = await getArticles();
      setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  if (loading) {
    return <div className="loader">Cargando noticias...</div>;
  }

  return (
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
    </div>
  );
};

export default ArticlesListPage;