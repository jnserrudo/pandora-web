import './Search.css';

export const Search = () => {
  return (
    <section className="search-container">
      <div className="search-column">
        <h2>¿Buscás algo especial?</h2>
        <div className="search-bar">
          <input type="text" placeholder="Qué estás buscando..." />
          {/* Un SVG simple para el icono de búsqueda */}
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
          </svg>
        </div>
      </div>
      <div className="find-event-column">
        <h2>Encontrá tu evento</h2>
      </div>
    </section>
  );
};