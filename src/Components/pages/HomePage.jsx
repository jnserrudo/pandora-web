import React from 'react';
import Navbar from '../Navbar/Navbar';
import CategoryCircles from '../CategoryCircles/CategoryCircles';
import EnhancedSearch from '../Search/EnhancedSearch';
import HomeAnchors from '../MainContent/HomeAnchors';
import MainContent from '../MainContent/MainContent';
import Footer from '../Footer/Footer';
import Reveal from '../motion/Reveal';
import '../../App.css';
import '../MainContent/MainContent.css';

function HomePage() {
  return (
    <div className="app-wrapper hub-layout">
      <section
        className="initial-viewport"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Navbar />

        <div className="app-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            className="app-layout"
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingBottom: '1.5rem' }}
          >
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Reveal className="top-discovery-section" variant="zoom" delay={80}>
                <CategoryCircles />
              </Reveal>
              <Reveal variant="up" delay={160}>
                <EnhancedSearch />
              </Reveal>
            </div>

            <Reveal style={{ marginTop: 'auto' }} variant="fade" delay={220}>
              <HomeAnchors />
            </Reveal>
          </div>
        </div>
      </section>

      <MainContent />
      <Footer />
    </div>
  );
}

export default HomePage;
