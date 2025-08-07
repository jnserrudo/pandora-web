import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-section-container">
      <h1>
        Todo en un
        <span className="gradient-text"> solo lugar</span>
      </h1>
      <p className="subtitle">
        Descubrí los mejores eventos, la gastronomía más exquisita y la vida
        nocturna de tu ciudad.
      </p>
      <div className="search-bar-wrapper">
        <input type="text" placeholder="Buscá por nombre, artista o lugar..." />
        <button className="search-button">
          {/* Icono SVG de búsqueda */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3l-1.4 1.4ZM9.5 14q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;