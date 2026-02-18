import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Pandora. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/about">Sobre Nosotros</a>
          <a href="/pricing">Planes</a>
          <a href="/contact">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;