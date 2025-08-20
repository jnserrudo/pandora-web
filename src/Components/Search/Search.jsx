// src/components/Search/Search.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Asumiendo que usas React Router para la navegación
import { searchGlobal } from "../../services/api";
import "./Search.css";

// --- NUEVO COMPONENTE HIJO PARA RENDERIZAR CADA RESULTADO ---
const ResultItem = ({ item }) => {
  // Valores por defecto para evitar errores
  let title = item.name || item.title || "Sin título";
  let description = item.description || item.subtitle || "Sin descripción";
  let linkTo = "/";
  let typeLabel = item.type;

  // Lógica para personalizar cada tipo de resultado
  switch (item.type) {
    case "commerce":
      typeLabel = "Comercio";
      linkTo = `/commerce/${item.id}`; // Asume una ruta como /commerce/:id
      break;
    case "event":
      typeLabel = "Evento";
      linkTo = `/event/${item.id}`; // Asume una ruta como /event/:id
      break;
    case "article":
      typeLabel = "Noticia";
      linkTo = `/article/${item.slug}`; // Los artículos usan slug para la URL
      break;
    default:
      typeLabel = "Resultado";
      break;
  }

  return (
    <Link to={linkTo} className="result-item-link">
      <div className="result-item">
        <div className={`item-type ${item.type}`}>{typeLabel}</div>
        <h4 className="item-name">{title}</h4>
        <p className="item-description">{description.substring(0, 120)}...</p>
        <span className="item-cta">Ver más →</span>
      </div>
    </Link>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
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
        <p>Encontrá tu próximo evento, lugar o noticia en Salta.</p>
      </div>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Rock, Casona, Teatro, Triatlón..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* --- SECCIÓN DE RESULTADOS MEJORADA --- */}
      {searched && (
        <div className="search-results">
          {loading ? (
            <div className="loader">Cargando resultados...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              // Usamos el nuevo componente ResultItem
              <ResultItem
                key={`${item.type}-${item.id || item.slug}`}
                item={item}
              />
            ))
          ) : (
            <p className="no-results">
              No se encontraron resultados para "{query}"
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default Search;
