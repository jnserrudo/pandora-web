// src/Components/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Newspaper, 
  Megaphone, 
  Store, 
  Calendar, 
  Mail,
  ArrowRight,
  Settings,
  Activity,
  UserCheck,
  Ticket,
  DollarSign
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AnalyticsPanel from './AnalyticsPanel';
import CategoryConfigPanel from './CategoryConfigPanel';
import IAModerationStub from './IAModerationStub';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import './AdminDashboard.css';
 // Mantenemos la estructura global

const AdminDashboard = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [adminData, setAdminData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchAllAdminData = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const data = await getAdminStats(token);
        setAdminData(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        // The global interceptor handles total failures, but we might want local feedback too
        setStatsError(err?.message || 'Error cargando estadísticas del dashboard.');
        // Avoid toast here if the interceptor is already redirecting or notifying
      } finally {
        setStatsLoading(false);
      }
    };

    if (token) fetchAllAdminData();
  }, [token]);

  const adminModules = [
    {
      title: 'Magazine',
      description: 'Redacción y gestión de artículos digitales.',
      link: '/admin/articles',
      icon: <Newspaper size={32} />,
      color: 'var(--color-primary)'
    },
    {
      title: 'Publicidades',
      description: 'Control de banners y campañas comerciales.',
      link: '/admin/advertisements',
      icon: <Megaphone size={32} />,
      color: '#FF1493'
    },
    {
      title: 'Comercios',
      description: 'Validación y moderación de locales globales.',
      link: '/admin/commerces',
      icon: <Store size={32} />,
      color: '#00D4FF'
    },
    {
      title: 'Eventos',
      description: 'Supervisión de la agenda y presentaciones.',
      link: '/admin/events',
      icon: <Calendar size={32} />,
      color: '#FFD700'
    },
    {
      title: 'Buzón Unificado',
      description: 'Consultas, publicidad y propuestas de revista.',
      link: '/admin/submissions',
      icon: <Ticket size={32} />,
      color: '#2ECC71'
    },
    {
      title: 'Planes y Precios',
      description: 'Gestión de tarifas, ofertas y cupones.',
      link: '/admin/plans',
      icon: <DollarSign size={32} />,
      color: '#FFD700'
    }
  ];

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <header className="hub-header">
          <div className="hub-header-content">
            <div className="hub-badge">
              <Activity size={14} />
              <span>SISTEMA ACTIVO</span>
            </div>
            <h1>Panel Central de Gestión</h1>
            <p>Control total sobre el ecosistema Pandora</p>
          </div>
        </header>

        {/* Panel de Analytics Avanzado */}
        <section className="admin-section">
          <AnalyticsPanel 
            data={adminData} 
            loading={statsLoading} 
            error={statsError} 
          />
        </section>

        {/* Configuración de Categorías Home */}
        <section className="admin-section">
          <CategoryConfigPanel />
        </section>

        {/* IA Moderation Guard (Stub) */}
        <section className="admin-section">
          <IAModerationStub />
        </section>

        <div className="hub-grid">
          {adminModules.map((module, index) => (
            <Link to={module.link} key={index} className="hub-card-link">
              <div className="hub-card" style={{ '--accent-color': module.color }}>
                <div className="hub-card-glow"></div>
                <div className="hub-card-icon">
                  {module.icon}
                </div>
                <div className="hub-card-info">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <div className="hub-card-footer">
                  <span>GESTIONAR</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección de Mini Estadísticas (Visual) */}
        {!statsLoading && adminData?.global && (
          <div className="hub-stats-row">
            <div className="stat-pill">
                <UserCheck size={18} />
                <span>{adminData.global.pendingCommerces || 0} Comercios Pendientes</span>
            </div>
            <div className="stat-pill">
                <Activity size={18} />
                <span>{adminData.global.activeAds || 0} Publicidades Activas</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
      
      <style>{`
        .hub-theme {
          background: radial-gradient(circle at top right, rgba(138, 43, 226, 0.1), transparent),
                      radial-gradient(circle at bottom left, rgba(255, 20, 147, 0.1), transparent);
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
        }

        .hub-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.3);
          border-radius: 50px;
          color: #2ecc71;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .hub-header-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hub-header-content p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.1rem;
        }

        .hub-settings-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hub-settings-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
        }

        .hub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
          margin-bottom: 3rem;
        }

        .hub-card-link {
          text-decoration: none;
        }

        .hub-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .hub-card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, var(--accent-color), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          filter: blur(80px);
        }

        .hub-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(138, 43, 226, 0.1);
        }

        .hub-card:hover .hub-card-glow {
          opacity: 0.1;
        }

        .hub-card-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .hub-card:hover .hub-card-icon {
          transform: scale(1.1) rotate(-5deg);
          background: var(--accent-color);
          color: #fff;
          box-shadow: 0 0 20px var(--accent-color);
        }

        .hub-card-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .hub-card-info p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .hub-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--accent-color);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1px;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .hub-card:hover .hub-card-footer {
          opacity: 1;
        }

        .hub-stats-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .hub-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .hub-header-content h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
