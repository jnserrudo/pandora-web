// src/Components/pages/AdminPlansManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Save,
  Trash2,
  DollarSign,
  Tag,
  CheckCircle,
  TrendingUp,
  EyeOff,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getPlans,
  updatePlan,
  getPaymentHistory,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  formatPaymentMethodLabel,
  formatPlanLevelLabel,
} from '../../utils/enumLabels.js';
import {
  COMMERCE_PLAN_CATALOG,
  benefitsToStorage,
  parsePlanBenefits,
} from '../../utils/planCatalog.js';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import './AdminArticlesPage.css';
import './AdminPlansManagement.css';

const AdminPlansManagement = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', expiresAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);

      const baselinePlans = COMMERCE_PLAN_CATALOG.map((p) => ({
        level: p.level,
        name: p.name,
        price: p.price,
        description: p.description,
        benefits: benefitsToStorage(p.benefits),
      }));

      try {
        const plansData = await getPlans(token);
        const mergedPlans = baselinePlans.map((base) => {
          const existing = plansData?.find((p) => p.level === base.level);
          if (existing) {
            const benefitsRaw =
              existing.benefits != null && String(existing.benefits).trim() !== ''
                ? existing.benefits
                : base.benefits;
            return {
              ...base,
              ...existing,
              name: formatPlanLevelLabel(existing.level, base.name),
              description: existing.description || base.description,
              benefits: benefitsToStorage(parsePlanBenefits(benefitsRaw)),
            };
          }
          return { ...base, id: `new-${base.level}` };
        });
        setPlans(mergedPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setPlans(baselinePlans.map((base) => ({ ...base, id: `fallback-${base.level}` })));
      }

      try {
        const historyData = await getPaymentHistory(token);
        setHistory(historyData || []);
      } catch (err) {
        console.error('Error history:', err);
      }

      try {
        const couponsData = await getCoupons(token, true);
        setCoupons(couponsData || []);
      } catch (err) {
        console.error('Error coupons:', err);
      }
    } catch (err) {
      console.error('General fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handlePlanChange = (id, field, value) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSavePlan = async (plan) => {
    setSaving(true);
    try {
      const payload = {
        level: plan.level,
        name: plan.name,
        description: plan.description || '',
        benefits: benefitsToStorage(plan.benefits),
        price: parseFloat(plan.price) || 0,
      };
      await updatePlan(plan.id, payload, token);
      showToast(`Plan ${plan.name} guardado correctamente.`, 'success');
      await fetchData();
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newCoupon,
        discountPercent: parseInt(newCoupon.discountPercent, 10) || 0,
      };
      const created = await createCoupon(payload, token);
      setCoupons([created, ...coupons]);
      setNewCoupon({ code: '', discountPercent: '', expiresAt: '' });
      showToast('Cupón creado con éxito.', 'success');
    } catch (err) {
      if (
        err.message?.includes('Unique constraint failed') ||
        err.message?.includes('Coupon_code_key')
      ) {
        showToast('Este código de cupón ya existe (puede estar desactivado).', 'error');
      } else {
        const msg = err.message || '';
        showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const updated = await updateCoupon(coupon.id, { isActive: !coupon.isActive }, token);
      setCoupons(coupons.map((c) => (c.id === coupon.id ? updated : c)));
      showToast(`Cupón ${updated.isActive ? 'activado' : 'desactivado'}.`, 'info');
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('¿Eliminar este cupón de forma permanente?')) return;
    try {
      await deleteCoupon(id, token);
      setCoupons(coupons.filter((c) => c.id !== id));
      showToast('Cupón eliminado.', 'warning');
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    }
  };

  const filteredCoupons = useMemo(() => {
    const q = couponSearch.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => (c.code || '').toLowerCase().includes(q));
  }, [coupons, couponSearch]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return history.filter((h) => {
      const matchMethod = methodFilter === 'ALL' || (h.method || '') === methodFilter;
      const matchSearch =
        !q ||
        (h.commerce?.name || '').toLowerCase().includes(q) ||
        (h.couponUsed || '').toLowerCase().includes(q) ||
        formatPaymentMethodLabel(h.method).toLowerCase().includes(q);
      return matchMethod && matchSearch;
    });
  }, [history, historySearch, methodFilter]);

  const couponPagination = useAdminPagination(filteredCoupons, 10);
  const historyPagination = useAdminPagination(filteredHistory, 10);

  const methodOptions = useMemo(() => {
    const set = new Set(history.map((h) => h.method).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [history]);

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header-premium">
          <div className="admin-title-group">
            <Link to="/admin/dashboard" className="back-link">
              <ChevronLeft size={20} />
              <span>Volver al Panel</span>
            </Link>
            <h1>Gestión de Negocio</h1>
            <p>Ajustá tarifas, gestioná promociones y auditá ingresos.</p>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Cargando motor de finanzas..." />
        ) : (
          <div className="plans-management-container">
            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h2>Tarifario de niveles</h2>
                    <p>
                      Planes de comercio: Free, Plata, Oro y Platino. Editá nombre, descripción,
                      beneficios (un ítem por línea) y precio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="plans-editor-grid">
                {plans.map((plan) => (
                  <div key={plan.id} className="plan-premium-card">
                    <div className="plan-card-header">
                      <div className="plan-level-tag">
                        Nivel
                        <input
                          type="number"
                          className="level-input-inline"
                          value={plan.level}
                          onChange={(e) =>
                            handlePlanChange(plan.id, 'level', parseInt(e.target.value, 10) || 0)
                          }
                          aria-label={`Nivel del plan ${plan.name}`}
                        />
                        <span className="plan-level-hint">{formatPlanLevelLabel(plan.level)}</span>
                      </div>
                      <input
                        type="text"
                        className="plan-name-input"
                        value={plan.name}
                        onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                        placeholder="Nombre del plan"
                      />
                      <textarea
                        className="plan-desc-input"
                        value={plan.description || ''}
                        onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                        placeholder="Breve descripción..."
                      />
                      <label className="plan-benefits-label" htmlFor={`plan-benefits-${plan.id}`}>
                        Beneficios (un ítem por línea)
                      </label>
                      <textarea
                        id={`plan-benefits-${plan.id}`}
                        className="plan-benefits-input"
                        value={plan.benefits || ''}
                        onChange={(e) => handlePlanChange(plan.id, 'benefits', e.target.value)}
                        placeholder={'1 foto\n1 categoría\n1 sucursal'}
                        rows={5}
                      />
                    </div>

                    <div className="plan-price-editor">
                      <span className="symbol">$</span>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => handlePlanChange(plan.id, 'price', e.target.value)}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePlan(plan)}
                        className="btn-plan-save"
                        disabled={saving}
                        title="Guardar cambios del plan"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2>Cupones de descuento</h2>
                    <p>Creá códigos promocionales para captar nuevos comercios.</p>
                  </div>
                </div>
              </div>

              <div className="coupon-management-area">
                <form onSubmit={handleCreateCoupon} className="coupon-form-premium">
                  <div className="input-group-premium">
                    <label>Código</label>
                    <input
                      type="text"
                      placeholder="PANDORA2026"
                      value={newCoupon.code}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                      }
                      required
                    />
                  </div>
                  <div className="input-group-premium">
                    <label>% Porcentaje</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newCoupon.discountPercent}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, discountPercent: e.target.value })
                      }
                      max="100"
                      min="0"
                      required
                    />
                  </div>
                  <div className="input-group-premium">
                    <label>Expira (opcional)</label>
                    <input
                      type="date"
                      value={newCoupon.expiresAt}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn-create-coupon-premium" disabled={saving}>
                    <Plus size={20} />
                    <span>Crear cupón</span>
                  </button>
                </form>

                <div className="admin-table-wrapper-premium plans-table-block">
                  <div className="table-filters-premium">
                    <div className="search-bar-premium">
                      <Search size={18} />
                      <input
                        type="search"
                        placeholder="Buscar cupón por código..."
                        value={couponSearch}
                        onChange={(e) => setCouponSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="admin-table-premium">
                    <thead>
                      <tr>
                        <th className="col-main">CÓDIGO</th>
                        <th className="col-meta">%</th>
                        <th className="hide-mobile col-date">EXPIRACIÓN</th>
                        <th className="col-status">ESTADO</th>
                        <th className="col-actions text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoupons.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center plans-empty-cell">
                            No hay cupones con ese criterio.
                          </td>
                        </tr>
                      ) : (
                        couponPagination.pageItems.map((c) => (
                          <tr key={c.id} className={!c.isActive ? 'row-disabled' : ''}>
                            <td className="col-main plans-code-cell">{c.code}</td>
                            <td className="col-meta">{c.discountPercent}%</td>
                            <td className="hide-mobile col-date">
                              {c.expiresAt
                                ? new Date(c.expiresAt).toLocaleDateString('es-AR')
                                : 'Sin vencimiento'}
                            </td>
                            <td className="col-status">
                              <span className={`badge-premium ${c.isActive ? 'active' : 'inactive'}`}>
                                {c.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="col-actions text-right">
                              <AdminRowActionsMenu
                                label={`Acciones del cupón ${c.code}`}
                                items={[
                                  {
                                    key: 'toggle',
                                    label: c.isActive ? 'Desactivar cupón' : 'Activar cupón',
                                    icon: c.isActive ? EyeOff : CheckCircle,
                                    tone: c.isActive ? 'info' : 'success',
                                    onClick: () => handleToggleCoupon(c),
                                  },
                                  {
                                    key: 'delete',
                                    label: 'Eliminar cupón',
                                    icon: Trash2,
                                    tone: 'danger',
                                    onClick: () => handleDeleteCoupon(c.id),
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <AdminTablePagination
                    {...couponPagination}
                    onPageSizeChange={couponPagination.setPageSize}
                  />
                </div>
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h2>Auditoría de cobros</h2>
                    <p>Historial de cambios de plan y pagos registrados.</p>
                  </div>
                </div>
              </div>

              <div className="admin-table-wrapper-premium plans-table-block">
                <div className="table-filters-premium">
                  <div className="search-bar-premium">
                    <Search size={18} />
                    <input
                      type="search"
                      placeholder="Buscar comercio, cupón o método..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="plans-method-filter"
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    aria-label="Filtrar por método de pago"
                  >
                    {methodOptions.map((m) => (
                      <option key={m} value={m}>
                        {m === 'ALL' ? 'Todos los métodos' : formatPaymentMethodLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>

                <table className="admin-table-premium">
                  <thead>
                    <tr>
                      <th className="col-main">COMERCIO</th>
                      <th className="col-meta">CAMBIO</th>
                      <th className="col-meta">MONTO</th>
                      <th className="hide-mobile col-status">MÉTODO</th>
                      <th className="hide-tablet col-meta">CUPÓN</th>
                      <th className="hide-tablet col-date">FECHA</th>
                      <th className="col-actions text-right">COMPROBANTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center plans-empty-cell">
                          No hay cobros con ese filtro.
                        </td>
                      </tr>
                    ) : (
                      historyPagination.pageItems.map((h) => (
                        <tr key={h.id}>
                          <td className="col-main row-title">{h.commerce?.name || 'Comercio'}</td>
                          <td className="col-meta">
                            {formatPlanLevelLabel(h.oldLevel)} → {formatPlanLevelLabel(h.newLevel)}
                          </td>
                          <td className="col-meta plans-amount">${h.totalPaid}</td>
                          <td className="hide-mobile col-status">
                            <span className="badge-premium active">
                              {formatPaymentMethodLabel(h.method)}
                            </span>
                          </td>
                          <td className="hide-tablet col-meta">{h.couponUsed || '—'}</td>
                          <td className="hide-tablet col-date">
                            {h.createdAt
                              ? new Date(h.createdAt).toLocaleString('es-AR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="col-actions text-right">
                            {h.paymentProof ? (
                              <AdminRowActionsMenu
                                label={`Comprobante de ${h.commerce?.name || 'cobro'}`}
                                items={[
                                  {
                                    key: 'proof',
                                    label: 'Ver comprobante',
                                    icon: ExternalLink,
                                    href: h.paymentProof,
                                    target: '_blank',
                                    tone: 'info',
                                  },
                                ]}
                              />
                            ) : (
                              <span className="plans-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <AdminTablePagination
                  {...historyPagination}
                  onPageSizeChange={historyPagination.setPageSize}
                />
              </div>
            </section>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPlansManagement;
