import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  MousePointer2,
  BarChart3,
  Search,
  Store,
  Trophy,
  Medal,
} from 'lucide-react';
import { formatEnumLabel } from '../../utils/enumLabels.js';
import './AnalyticsPanel.css';

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(16, 8, 28, 0.96)',
  border: '1px solid rgba(196, 181, 253, 0.35)',
  borderRadius: '12px',
  color: '#fff',
  boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
};

const SERIES_ES = {
  altas: 'Altas de usuarios',
  acciones: 'Acciones del sistema',
  value: 'Comercios',
  count: 'Búsquedas',
  visitas: 'Altas de usuarios',
  clicks: 'Acciones del sistema',
};

const CATEGORY_PALETTE = [
  '#a855f7',
  '#ec4899',
  '#22d3ee',
  '#fbbf24',
  '#34d399',
  '#818cf8',
  '#fb7185',
  '#38bdf8',
];

const SEARCH_PALETTE = [
  '#fbbf24',
  '#c4b5fd',
  '#67e8f9',
  '#00d4ff',
  '#38bdf8',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#c084fc',
  '#e879f9',
];

function PandoraTooltip({ active, payload, label, unitLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '0.75rem 0.9rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name} style={{ color: entry.color || '#e9d5ff', fontSize: 13 }}>
          {SERIES_ES[entry.dataKey] || entry.name || entry.dataKey}:{' '}
          <strong>{entry.value}</strong>
          {unitLabel ? ` ${unitLabel}` : ''}
        </div>
      ))}
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="analytics-rank gold"><Trophy size={13} /> 1</span>;
  if (rank === 2) return <span className="analytics-rank silver"><Medal size={13} /> 2</span>;
  if (rank === 3) return <span className="analytics-rank bronze"><Medal size={13} /> 3</span>;
  return <span className="analytics-rank plain">{rank}</span>;
}

const AnalyticsPanel = ({ data, loading, error }) => {
  const [stats, setStats] = useState({
    impressions: 0,
    clicks: 0,
    newUsers: 0,
    ctr: '0%',
  });
  const [activityData, setActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [searchesData, setSearchesData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (data && data.global) {
      setStats(data.global);
      if (data.activity?.length) {
        setActivityData(data.activity.map((row) => ({
          name: row.name,
          altas: row.altas ?? row.visitas ?? 0,
          acciones: row.acciones ?? row.clicks ?? 0,
        })));
      }
      if (data.categories?.length) {
        setCategoryData(data.categories.map((cat, index) => ({
          ...cat,
          name: formatEnumLabel(cat.name, cat.name) || 'Sin categoría',
          color: cat.color || CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
          value: Number(cat.value) || 0,
        })));
      } else {
        setCategoryData([]);
      }
      if (data.searches) {
        setSearchesData(data.searches.map((row) => ({
          ...row,
          term: row.term || '—',
          count: Number(row.count) || 0,
        })));
      }
    }
  }, [data]);

  const categoryTotal = useMemo(
    () => categoryData.reduce((sum, row) => sum + (row.value || 0), 0),
    [categoryData]
  );

  const categoryRanked = useMemo(() => {
    const sorted = [...categoryData].sort((a, b) => (b.value || 0) - (a.value || 0));
    return sorted.map((row, index) => ({
      ...row,
      rank: index + 1,
      percent: categoryTotal > 0 ? Math.round((row.value / categoryTotal) * 100) : 0,
    }));
  }, [categoryData, categoryTotal]);

  const searchesTotal = useMemo(
    () => searchesData.reduce((sum, row) => sum + (row.count || 0), 0),
    [searchesData]
  );

  const searchesMax = useMemo(
    () => Math.max(...searchesData.map((row) => row.count || 0), 1),
    [searchesData]
  );

  const searchesRanked = useMemo(() => {
    const sorted = [...searchesData].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 10);
    return sorted.map((row, index) => ({
      ...row,
      rank: index + 1,
      percent: searchesTotal > 0 ? Math.round((row.count / searchesTotal) * 100) : 0,
      bar: Math.max(8, Math.round(((row.count || 0) / searchesMax) * 100)),
      color: SEARCH_PALETTE[index % SEARCH_PALETTE.length],
    }));
  }, [searchesData, searchesTotal, searchesMax]);

  if (loading) {
    return (
      <div className="analytics-panel loading-state">
        <div className="analytics-header">
          <h2><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px' }} /> Analíticas del Sistema</h2>
        </div>
        <div className="loading-placeholder">Cargando métricas de rendimiento...</div>
      </div>
    );
  }

  if (error) return null;

  const hasActivity = activityData.some((d) => (d.altas || 0) + (d.acciones || 0) > 0);
  const hasCategories = categoryRanked.some((d) => (d.value || 0) > 0);
  const hasSearches = searchesRanked.some((d) => (d.count || 0) > 0);
  const topCategory = categoryRanked[0];
  const topSearch = searchesRanked[0];

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <div className="analytics-title-group">
          <h2><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px' }} /> Rendimiento del sistema</h2>
          <span className="analytics-subtitle">
            KPIs de publicidades (totales) + actividad real de los últimos 7 días
          </span>
        </div>
        <div className="analytics-period">Últimos 7 días · actividad</div>
      </div>

      <div className="analytics-stats-row">
        <div className="stat-card-mini">
          <div className="icon-circ purple"><Eye size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.impressions}</span>
            <span className="label">Impresiones (Ads · total)</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ pink"><MousePointer2 size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.clicks}</span>
            <span className="label">Clics en Ads · total</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ blue"><Users size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.newUsers}</span>
            <span className="label">Nuevos usuarios (7 días)</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="icon-circ yellow"><TrendingUp size={18} /></div>
          <div className="stat-info">
            <span className="value">{stats.ctr}</span>
            <span className="label">CTR promedio (Ads)</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-container-premium main-chart">
          <h3>Actividad semanal</h3>
          <p className="chart-explain">Altas de usuarios y acciones auditadas por día (datos reales, no estimados).</p>
          {hasActivity ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAltas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8a2be2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAcciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2093" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff2093" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                <Tooltip content={<PandoraTooltip />} />
                <Legend formatter={(value) => SERIES_ES[value] || value} />
                <Area type="monotone" dataKey="altas" name="Altas de usuarios" stroke="#8a2be2" fill="url(#colorAltas)" strokeWidth={3} />
                <Area type="monotone" dataKey="acciones" name="Acciones del sistema" stroke="#ff2093" fill="url(#colorAcciones)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Todavía no hay altas ni acciones en los últimos 7 días.</div>
          )}
        </div>

        <div className="chart-container-premium analytics-category-card">
          <div className="analytics-card-head">
            <div>
              <h3><Store size={18} /> Comercios por categoría</h3>
              <p className="chart-explain">Distribución del directorio: cuántos lugares hay en cada rubro.</p>
            </div>
            {topCategory && (
              <div className="analytics-insight-pill">
                Líder: <strong>{topCategory.name}</strong> · {topCategory.percent}%
              </div>
            )}
          </div>

          {hasCategories ? (
            <div className="analytics-category-layout">
              <div className="analytics-donut-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryRanked}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="rgba(8,2,18,0.8)"
                      strokeWidth={2}
                      onMouseEnter={(_, index) => setActiveCategory(categoryRanked[index]?.name || null)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      {categoryRanked.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={!activeCategory || activeCategory === entry.name ? 1 : 0.35}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload;
                        return (
                          <div style={{ ...TOOLTIP_STYLE, padding: '0.75rem 0.9rem' }}>
                            <div style={{ fontWeight: 700 }}>{row.name}</div>
                            <div style={{ marginTop: 4, color: '#e9d5ff' }}>
                              <strong>{row.value}</strong> comercios · {row.percent}%
                            </div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="analytics-donut-center">
                  <strong>{categoryTotal}</strong>
                  <span>comercios</span>
                </div>
              </div>

              <ul className="analytics-rank-list compact">
                {categoryRanked.map((row) => (
                  <li
                    key={row.name}
                    className={`analytics-rank-row ${activeCategory === row.name ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveCategory(row.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <span className="analytics-swatch" style={{ background: row.color }} />
                    <div className="analytics-rank-copy">
                      <div className="analytics-rank-top">
                        <strong>{row.name}</strong>
                        <span>{row.value}</span>
                      </div>
                      <div className="analytics-meter">
                        <span style={{ width: `${row.percent}%`, background: row.color }} />
                      </div>
                      <em>{row.percent}% del directorio</em>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="chart-empty">Sin comercios categorizados todavía.</div>
          )}
        </div>

        <div className="chart-container-premium analytics-search-card full-width">
          <div className="analytics-card-head">
            <div>
              <h3><Search size={18} /> Términos más buscados</h3>
              <p className="chart-explain">
                Ranking de lo que la gente escribe en el buscador. El ancho de cada barra muestra el peso relativo.
              </p>
            </div>
            <div className="analytics-search-summary">
              <div>
                <strong>{searchesTotal}</strong>
                <span>búsquedas totales</span>
              </div>
              {topSearch && (
                <div>
                  <strong>#{1} {topSearch.term}</strong>
                  <span>{topSearch.count} veces · {topSearch.percent}%</span>
                </div>
              )}
            </div>
          </div>

          {hasSearches ? (
            <ol className="analytics-rank-list searches">
              {searchesRanked.map((row) => (
                <li key={`${row.rank}-${row.term}`} className="analytics-rank-row search-row">
                  <RankBadge rank={row.rank} />
                  <div className="analytics-rank-copy">
                    <div className="analytics-rank-top">
                      <strong title={row.term}>{row.term}</strong>
                      <span className="analytics-count-chip" style={{ borderColor: `${row.color}66`, color: row.color }}>
                        {row.count} búsquedas
                      </span>
                    </div>
                    <div className="analytics-meter tall">
                      <span
                        style={{
                          width: `${row.bar}%`,
                          background: `linear-gradient(90deg, ${row.color}, ${row.color}88)`,
                        }}
                      />
                    </div>
                    <em>{row.percent}% del total de búsquedas registradas</em>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="chart-empty">Todavía no hay búsquedas registradas.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
