import React from 'react';
import './CallToAction.css';
import playStore from '../../assets/play_store.png'; // 1. Importa la imagen
import appStore from '../../assets/app_store.jfif'; // 1. Importa la imagen

const CallToAction = () => {
  return (
    <section id="download" className="cta-section">
      <div className="cta-content">
        <h2>Llevá la experiencia Pandora con vos</h2>
        <p>Disponible para Android y iOS. Descargá gratis y empezá a descubrir.</p>
        <div className="store-buttons">
          <a href="#" className="store-button">
            {/* Aquí iría el logo de Google Play */}
            <div className="store-logo">
              <img src={playStore} alt="Google Play" />
            </div>
            <div className="button-text">
              <span>DISPONIBLE EN</span>
              <strong>Google Play</strong>
            </div>
          </a>
          <a href="#" className="store-button">
            {/* Aquí iría el logo de App Store */}
            <div className="store-logo">
              <img src={appStore} alt="App Store" />
            </div>
            <div className="button-text">
              <span>Descargalo en la</span>
              <strong>App Store</strong>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;