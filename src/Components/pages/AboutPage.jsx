// src/pages/AboutPage.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Newspaper, ShieldCheck, Sparkles, Store } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './AboutPage.css';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-wrapper">
      <Navbar />
      <div className="about-container">
        <header className="about-header">
          <div className="about-kicker">Guia local de Salta</div>
          <h1>Sobre Pandora</h1>
          <p className="lead-paragraph">
            Pandora conecta comercios, agenda y revista para mostrar lo que realmente esta activo
            en la ciudad, con fichas claras y recorridos faciles de entender.
          </p>
          <div className="about-hero-actions">
            <Link to="/commerces" className="about-primary-btn">
              Explorar lugares <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="about-secondary-btn">
              Quiero sumar mi proyecto
            </Link>
          </div>
          <div className="about-stats">
            <div className="about-stat-card">
              <strong>Comercios</strong>
              <span>Fotos, horarios, mapa y datos utiles para decidir adonde ir.</span>
            </div>
            <div className="about-stat-card">
              <strong>Eventos</strong>
              <span>Agenda viva con fechas, lugar, organizador y acceso rapido al detalle.</span>
            </div>
            <div className="about-stat-card">
              <strong>Revista</strong>
              <span>Notas que enlazan lugares y actividades para seguir recorriendo.</span>
            </div>
          </div>
        </header>

        <section className="about-section">
          <h2>Que encontras en Pandora</h2>
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon"><CalendarDays size={26} /></div>
              <h3>Agenda activa</h3>
              <p>Eventos programados con informacion concreta, sin fichas vacias ni vueltas innecesarias.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><Store size={26} /></div>
              <h3>Comercios con contexto</h3>
              <p>No es solo un nombre: cada lugar busca mostrar como es, donde queda y por que vale la pena abrirlo.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><Newspaper size={26} /></div>
              <h3>Revista conectada</h3>
              <p>Las historias del magazine se conectan con la ciudad real mediante enlaces a comercios y eventos.</p>
            </article>
          </div>
        </section>

        <section className="about-section">
          <h2>Como se mueve Pandora</h2>
          <div className="journey-grid">
            <article className="journey-card">
              <Sparkles size={22} />
              <h3>Visitante</h3>
              <p>Explora, compara y encuentra lugares sin perderse entre pantallas basicas o datos incompletos.</p>
            </article>
            <article className="journey-card">
              <Store size={22} />
              <h3>Dueno</h3>
              <p>Carga su ficha, sus fotos y sus eventos para que el lugar se vea mejor y con mas informacion real.</p>
            </article>
            <article className="journey-card">
              <ShieldCheck size={22} />
              <h3>Admin</h3>
              <p>Ordena el contenido, revisa altas y usa AI Guard para mantener visible lo que esta listo.</p>
            </article>
          </div>
        </section>

        <section className="about-section about-note-panel">
          <h2>Que no es Pandora</h2>
          <p>
            Pandora no es un e-commerce ni una app de pedidos. Esta pensada para descubrir, presentar
            y validar informacion local de una forma visual, clara y atractiva.
          </p>
        </section>

        <section className="about-section contact-section">
          <h2>Sumate al ecosistema</h2>
          <p>
            Si tenes un comercio, organizas un evento o queres proponer una nota para la revista,
            esta armado para que tu proyecto se vea mejor.
          </p>
          <div className="about-cta-row">
            <Link to="/contact" className="contact-button">
              Ir a contacto
            </Link>
            <Link to="/events" className="about-inline-link">
              Ver agenda primero
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
