import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Pandora. Todos los derechos reservados.</p>
        <div className="footer-links">
          <Link to="/about">Sobre nosotros</Link>
          <Link to="/pricing">Planes</Link>
          <Link to="/contact">Contacto</Link>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
