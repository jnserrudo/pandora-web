import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-container">
      <nav className="navbar-content">
        <div className="navbar-logo">
          <a href="/">Pandora</a>
        </div>
        <ul className="navbar-links">
          <li><a href="/eventos">Eventos</a></li>
          <li><a href="/commerces">Comercios</a></li>
          <li><a href="/articulos">Artículos</a></li>
        </ul>
        <div className="navbar-actions">
          <a href="/login" className="action-button login-button">Ingresar</a>
          <a href="/register" className="action-button register-button">Registrarse</a>
        </div>
        {/* Aquí podríamos agregar un botón de menú para móviles en el futuro */}
      </nav>
    </header>
  );
};

export default Navbar;