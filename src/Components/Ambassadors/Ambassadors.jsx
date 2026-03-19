import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Ambassadors.css';

const ambassadors = [
  {
    id: 1,
    name: 'Valentina Torres',
    role: 'Embajadora Gastronómica',
    description: 'Foodie apasionada, recorre cada rincón de Salta descubriendo sabores únicos.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Matías Rueda',
    role: 'Embajador Cultural',
    description: 'Artista y promotor cultural, conecta la escena artística salteña con el mundo.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Luciana Paz',
    role: 'Embajadora de Vida Nocturna',
    description: 'DJ y organizadora de eventos, conoce cada escenario y espacio nocturno de la ciudad.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Santiago Molina',
    role: 'Embajador de Turismo',
    description: 'Guía local experto, comparte los secretos y rincones escondidos de Salta.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Camila Reyes',
    role: 'Embajadora Digital',
    description: 'Content creator y micro-influencer, difunde la esencia de Pandora en redes sociales.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  },
];

const Ambassadors = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="ambassadors-section">
      <div className="ambassadors-header">
        <h2>Nuestros <span className="text-accent">Embajadores</span></h2>
        <p>Las voces que representan la esencia de Pandora en Salta</p>
      </div>

      <div className="ambassadors-carousel-wrapper">
        <button className="amb-nav-btn prev" onClick={() => scroll('left')}>
          <ChevronLeft size={20} />
        </button>

        <div className="ambassadors-scroll" ref={scrollRef}>
          {ambassadors.map((amb) => (
            <div key={amb.id} className="ambassador-card">
              <div className="ambassador-avatar-wrapper">
                <img src={amb.avatar} alt={amb.name} className="ambassador-avatar" />
                <div className="ambassador-avatar-ring" />
              </div>
              <div className="ambassador-info">
                <h3>{amb.name}</h3>
                <span className="ambassador-role">{amb.role}</span>
                <p className="ambassador-desc">{amb.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="amb-nav-btn next" onClick={() => scroll('right')}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default Ambassadors;
