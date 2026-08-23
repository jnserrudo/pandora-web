import React from 'react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl } from '../../services/api';
import { articleCardBlurb } from '../../utils/htmlToPlainText';
import AutoCarousel from '../motion/AutoCarousel';
import EntityMedia from '../motion/EntityMedia';
import Reveal from '../motion/Reveal';
import './TrendingMagazine.css';

const TrendingMagazine = ({ articles }) => {
  return (
    <Reveal as="section" className="trending-magazine-section" variant="up">
      <div className="trending-header">
        <h2>
          Lo más visto en{' '}
          <span style={{ color: 'var(--color-accent)' }}>Pandora Magazine</span>
        </h2>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="trending-magazine-empty">
          <p>Estamos preparando las mejores noticias para vos.</p>
          <small>Próximamente contenido exclusivo</small>
        </div>
      ) : (
        <AutoCarousel className="trending-carousel-container" intervalMs={4500} scrollRatio={0.5}>
          {articles.map((article) => (
            <Link
              to={`/article/${article.slug}`}
              key={article.id}
              className="trending-article-card"
            >
              <div className="card-media">
                <EntityMedia
                  coverImage={article.coverImage}
                  images={article.galleryImages}
                  alt={article.title}
                  intervalMs={3800 + (article.id % 5) * 200}
                />
              </div>
              <div className="card-info">
                <h3>{article.title}</h3>
                <p className="card-description">{articleCardBlurb(article, 80)}</p>
              </div>
            </Link>
          ))}
        </AutoCarousel>
      )}
    </Reveal>
  );
};

export default TrendingMagazine;
