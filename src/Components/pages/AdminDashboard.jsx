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
        showToast(err?.message || 'Error cargando estadísticas del dashboard.', 'error');
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
    },
    {
      title: 'Auditoría',
      description: 'Historial de transacciones y cambios.',
      link: '/admin/audit',
      icon: <Activity size={32} />,
      color: '#8A2BE2'
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios y su contenido asociado.',
      link: '/admin/users',
      icon: <UserCheck size={32} />,
      color: '#38bdf8'
    }
  ];

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <header className="hub-header">
          <div className="hub-header-content">
            <h1>Panel de administración</h1>
            <p>Comercios, eventos, revista y publicidades desde un solo lugar.</p>
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

        {/* IA Moderation Guard */}
        <section className="admin-section">
          <IAModerationStub />
        </section>

        <div className="hub-grid">
          {adminModules.map((module, index) => (
            <Link to={module.link} key={index} className="hub-card-link">
              <div className="hub-card" style={{ '--accent-color': module.color }}>
                <div className="hub-card-icon">
                  {module.icon}
                </div>
                <div className="hub-card-info">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <div className="hub-card-footer">
                  <span>Entrar</span>
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
          background: none;
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
          overflow: visible;
          padding-top: 4px;
        }

        .hub-header-content {
          overflow: visible;
        }

        .hub-header-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 0.5rem;
          color: #fff;
          background: none;
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
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
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
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
          background: var(--accent-color);
          color: #fff;
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
