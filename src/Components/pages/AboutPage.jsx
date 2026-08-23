// src/pages/AboutPage.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Store, Shield } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Reveal from '../motion/Reveal';
import './AboutPage.css';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-wrapper">
      <Navbar />
      <div className="about-container">
        <Reveal as="header" className="about-header" variant="up">
          <p className="about-kicker">Guía viva de Salta</p>
          <h1>Sobre Pandora</h1>
          <p className="lead-paragraph">
            Pandora muestra lo que está abierto hoy: comercios con ficha clara, agenda con fechas
            reales y una revista que te lleva del relato al mapa.
          </p>
          <div className="about-hero-actions">
            <Link to="/commerces" className="about-primary-btn">
              Explorar lugares <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/contact" className="about-secondary-btn">
              Sumar mi proyecto
            </Link>
          </div>
        </Reveal>

        <section className="about-section about-split">
          <div className="about-split-copy">
            <h2 className="about-display">Qué encontrás</h2>
            <p>
              Agenda con fechas concretas, locales con foto y mapa, y notas que enlazan lugares
              y noches de la ciudad — sin fichas eternas ni datos inventados.
            </p>
            <ul className="about-plain-list">
              <li>
                <strong>Agenda</strong>
                <span>Eventos programados, con lugar y acceso al detalle.</span>
              </li>
              <li>
                <strong>Comercios</strong>
                <span>Cómo es el lugar, dónde queda y por qué vale la pena abrirlo.</span>
              </li>
              <li>
                <strong>Revista</strong>
                <span>Historias que conectan con la ciudad que está activa.</span>
              </li>
            </ul>
          </div>
          <aside className="about-split-aside" aria-label="En números de producto">
            <div className="about-aside-block">
              <strong>Comercios</strong>
              <span>Fotos, horarios y mapa para decidir a dónde ir.</span>
            </div>
            <div className="about-aside-block">
              <strong>Eventos</strong>
              <span>Calendario vivo, no un afiche eterno.</span>
            </div>
            <div className="about-aside-block">
              <strong>Revista</strong>
              <span>Notas que te llevan a la ficha del local.</span>
            </div>
          </aside>
        </section>

        <section className="about-section">
          <h2 className="about-display">Cómo se mueve</h2>
          <div className="journey-row">
            <article className="journey-card">
              <MapPin size={20} aria-hidden />
              <h3>Visitante</h3>
              <p>Explorá, compará y encontrá lugares con datos útiles, no pantallas vacías.</p>
            </article>
            <article className="journey-card">
              <Store size={20} aria-hidden />
              <h3>Dueño</h3>
              <p>Cargá ficha, fotos y eventos para que el local se vea como es.</p>
            </article>
            <article className="journey-card">
              <Shield size={20} aria-hidden />
              <h3>Equipo Pandora</h3>
              <p>Revisa altas y mantiene visible lo que está listo para la ciudad.</p>
            </article>
          </div>
        </section>

        <section className="about-section about-note-panel">
          <h2 className="about-display">Alcance</h2>
          <p>
            Estamos pensados para descubrir, presentar y validar información local de Salta de
            forma visual y clara. Pedidos a domicilio y checkout no son parte del producto.
          </p>
        </section>

        <section className="about-section contact-section">
          <h2 className="about-display">¿Querés sumarte?</h2>
          <p>Escribinos o empezá cargando tu comercio.</p>
          <div className="about-cta-row">
            <Link to="/contact" className="about-primary-btn">
              Contacto
            </Link>
            <Link to="/commerces/create" className="about-secondary-btn">
              Publicar comercio
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
