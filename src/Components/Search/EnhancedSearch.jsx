// src/Components/Search/EnhancedSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGlobal } from '../../services/api';
import './EnhancedSearch.css';

const EnhancedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ commerces: [], events: [], articles: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ commerces: [], events: [], articles: [] });
      setShowResults(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchGlobal(query);
        setResults(data);
        setShowResults(true);
        
        // Registrar búsqueda en analíticas (si tiene resultados y es lo suficientemente larga)
        if (query.trim().length >= 3) {
          import('../../services/api').then(m => m.logSearch(query));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setQuery('');
    
    if (type === 'commerce') {
      navigate(`/commerce/${item.id}`);
    } else if (type === 'event') {
      navigate(`/event/${item.id}`);
    } else if (type === 'article') {
      navigate(`/article/${item.slug}`);
    }
  };

  const totalResults = results.commerces.length + results.events.length + results.articles.length;

  return (
    <div className="enhanced-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        
        <input
          type="text"
          className="search-input"
          placeholder="Buscar comercios, eventos, noticias..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
        />
        
        {isSearching && (
          <div className="search-spinner"></div>
        )}
        
        {query && (
          <button 
            className="search-clear"
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && totalResults > 0 && (
        <div className="search-results-dropdown">
          {/* Commerces */}
          {results.commerces.length > 0 && (
            <div className="results-section">
              <h4 className="results-section-title">
                <span className="section-icon">🏪</span>
                Comercios ({results.commerces.length})
              </h4>
              {results.commerces.slice(0, 3).map(commerce => (
                <div
                  key={commerce.id}
                  className="result-item"
                  onClick={() => handleResultClick('commerce', commerce)}
                >
                  <div className="result-info">
                    <span className="result-name">{commerce.name}</span>
                    <span className="result-category">{commerce.category}</span>
                  </div>
                  <svg className="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Events */}
          {results.events.length > 0 && (
            <div className="results-section">
              <h4 className="results-section-title">
                <span className="section-icon">🎉</span>
                Eventos ({results.events.length})
              </h4>
              {results.events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="result-item"
                  onClick={() => handleResultClick('event', event)}
                >
                  <div className="result-info">
                    <span className="result-name">{event.name}</span>
                    <span className="result-category">{event.commerce?.name}</span>
                  </div>
                  <svg className="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Articles */}
          {results.articles.length > 0 && (
            <div className="results-section">
              <h4 className="results-section-title">
                <span className="section-icon">📰</span>
                Noticias ({results.articles.length})
              </h4>
              {results.articles.slice(0, 3).map(article => (
                <div
                  key={article.id}
                  className="result-item"
                  onClick={() => handleResultClick('article', article)}
                >
                  <div className="result-info">
                    <span className="result-name">{article.title}</span>
                    <span className="result-category">{article.category?.name}</span>
                  </div>
                  <svg className="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>
          )}

          <div className="results-footer">
            <p>{totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* No results */}
      {showResults && query.trim().length >= 2 && totalResults === 0 && !isSearching && (
        <div className="search-results-dropdown">
          <div className="no-results">
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
