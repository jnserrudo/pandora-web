import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer2,
  BarChart3,
  Search
} from 'lucide-react';
import { getAdminStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect } from 'react';
import './AnalyticsPanel.css';

const AnalyticsPanel = ({ data, loading, error }) => {
  const [stats, setStats] = useState({
    impressions: 0,
    clicks: 0,
    newUsers: 0,
    ctr: "0%"
  });
  const [activityData, setActivityData] = useState([
    { name: 'Lun', visitas: 0, clicks: 0 },
    { name: 'Mar', visitas: 0, clicks: 0 },
    { name: 'Mie', visitas: 0, clicks: 0 },
    { name: 'Jue', visitas: 0, clicks: 0 },
    { name: 'Vie', visitas: 0, clicks: 0 },
    { name: 'Sab', visitas: 0, clicks: 0 },
    { name: 'Dom', visitas: 0, clicks: 0 },
  ]);
  const [categoryData, setCategoryData] = useState([
    { name: 'Gastro', value: 0, color: '#8a2be2' },
    { name: 'Eventos', value: 0, color: '#ff2093' },
    { name: 'Tiendas', value: 0, color: '#00d4ff' },
    { name: 'Magazine', value: 0, color: '#ffbd39' },
  ]);
  const [searchesData, setSearchesData] = useState([]);

  useEffect(() => {
    if (data && data.global) {
      setStats(data.global);
      if (data.activity && data.activity.length > 0) setActivityData(data.activity);
      if (data.categories && data.categories.length > 0) setCategoryData(data.categories);
      if (data.searches) setSearchesData(data.searches);
    }
  }, [data]);

  if (loading) return (
    <div className="analytics-panel loading-state">
      <div className="analytics-header">
        <h2><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px' }} /> Analíticas del Sistema</h2>
      </div>
      <div className="loading-placeholder">Cargando métricas de rendimiento...</div>
    </div>
  );

  if (error) return null; // No mostrar nada si hay error (Dashboard manejará el error global)
  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <div className="analytics-title-group">
          <h2><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px' }} /> Rendimiento de Publicidades</h2>
          <span className="analytics-subtitle">Métricas del sistema de anuncios</span>
        </div>
        <div className="analytics-period">Últimos 7 días</div>
      </div>

      <div className="analytics-stats-row">
        <div className="stat-card-mini">
          <div className="icon-circ purple"><Eye size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.impressions}</span>
            <span className="label">Impresiones (Ads)</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ pink"><MousePointer2 size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.clicks}</span>
            <span className="label">Clics en Ads</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ blue"><Users size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.newUsers}</span>
            <span className="label">Nuevos Usuarios</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ yellow"><TrendingUp size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.ctr}</span>
            <span className="label">CTR Promedio (Ads)</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-container-premium main-chart">
          <h3>Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8a2be2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 10, 30, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="visitas" 
                stroke="#8a2be2" 
                fillOpacity={1} 
                fill="url(#colorVisitas)" 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stroke="#ff2093" 
                fill="transparent" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container-premium">
          <h3>Interés por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container-premium full-width" style={{ gridColumn: 'span 2' }}>
          <h3><Search size={18} style={{ display: 'inline-block', marginRight: '8px' }} /> Términos más buscados (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={searchesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" />
              <YAxis dataKey="term" type="category" stroke="rgba(255,255,255,0.3)" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 10, 30, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="count" fill="#00d4ff" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
