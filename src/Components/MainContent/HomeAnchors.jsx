import React from 'react';
import { Newspaper, CalendarDays } from 'lucide-react';
import './HomeAnchors.css';

const HomeAnchors = () => {
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="home-anchors-section">
      <div className="anchors-row">
        <button className="anchor-btn" onClick={() => scrollToSection('magazine-section')}>
          <Newspaper size={18} />
          Noticias
        </button>
        <button className="anchor-btn" onClick={() => scrollToSection('calendar-section')}>
          <CalendarDays size={18} />
          Calendario
        </button>
      </div>
    </div>
  );
};

export default HomeAnchors;
