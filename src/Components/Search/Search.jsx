import React, { useState } from 'react';
import { searchGlobal } from '../../services/api';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // Para saber si ya se buscó algo

  const handleSearch = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    const data = await searchGlobal(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <section id="search" className="search-section">
      <div className="search-header">
        <h2>¿Buscás algo especial?</h2>
        <p>Encontrá tu próximo evento o lugar favorito en Salta.</p>
      </div>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Rock, Casona, Teatro..."
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      {/* --- SECCIÓN DE RESULTADOS --- */}
      {searched && (
        <div className="search-results">
          {loading ? (
            <div className="loader">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div key={`${item.type}-${item.id}`} className="result-item">
                <span className={`item-type ${item.type}`}>{item.type}</span>
                <h4 className="item-name">{item.name}</h4>
                <p className="item-description">{item.description.substring(0, 100)}...</p>
              </div>
            ))
          ) : (
            <p className="no-results">No se encontraron resultados para "{query}"</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Search;