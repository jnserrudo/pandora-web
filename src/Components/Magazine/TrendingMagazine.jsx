import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl } from '../../services/api';
import './TrendingMagazine.css';

const TrendingMagazine = ({ articles }) => {
    const scrollContainer = useRef(null);
    const isPausedRef = useRef(false);

    const scroll = useCallback((direction) => {
        if (scrollContainer.current) {
            const { scrollLeft, clientWidth, scrollWidth } = scrollContainer.current;
            let scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;
            if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
                scrollTo = 0;
            }
            scrollContainer.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPausedRef.current) scroll('right');
        }, 4500);
        return () => clearInterval(timer);
    }, [scroll]);

    return (
        <section className="trending-magazine-section">
            <div className="trending-header">
                <h2>Lo más visto en <span style={{ color: 'var(--color-accent)' }}>Pandora Magazine</span></h2>
            </div>

            {(!articles || articles.length === 0) ? (
                <div className="trending-magazine-empty" style={{ 
                    padding: '3rem', 
                    textAlign: 'center', 
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '1rem',
                    margin: '0 2rem'
                }}>
                    <p>Estamos preparando las mejores noticias para vos.</p>
                    <small style={{ marginTop: '0.5rem', display: 'block' }}>Próximamente contenido exclusivo</small>
                </div>
            ) : (
                <div
                className="trending-carousel-container"
                onMouseEnter={() => { isPausedRef.current = true; }}
                onMouseLeave={() => { isPausedRef.current = false; }}
            >
                    <button className="nav-btn prev" onClick={() => scroll('left')}>
                        <ChevronLeft />
                    </button>

                    <div className="trending-cards-wrapper" ref={scrollContainer}>
                        {articles.map((article) => (
                            <Link 
                                to={`/article/${article.slug}`} 
                                key={article.id} 
                                className="trending-article-card"
                            >
                                <div className="card-media">
                                    <img src={getAbsoluteImageUrl(article.coverImage)} alt={article.title} />
                                </div>
                                <div className="card-info">
                                    <h3>{article.title}</h3>
                                    <p className="card-description">
                                        {article.excerpt || (article.content ? article.content.substring(0, 80) + '...' : '')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <button className="nav-btn next" onClick={() => scroll('right')}>
                        <ChevronRight />
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingMagazine;
