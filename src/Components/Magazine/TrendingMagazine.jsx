import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl } from '../../services/api';
import './TrendingMagazine.css';

const TrendingMagazine = ({ articles }) => {
    const scrollContainer = React.useRef(null);

    const scroll = (direction) => {
        if (scrollContainer.current) {
            const { scrollLeft, clientWidth } = scrollContainer.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth / 2 
                : scrollLeft + clientWidth / 2;
            scrollContainer.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!articles || articles.length === 0) return null;

    return (
        <section className="trending-magazine-section">
            <div className="trending-header">
                <h2>Lo más visto esta semana</h2>
            </div>

            <div className="trending-carousel-container">
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
        </section>
    );
};

export default TrendingMagazine;
