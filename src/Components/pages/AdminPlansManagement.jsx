// src/Components/pages/AdminPlansManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Settings, 
  Plus, 
  Save, 
  Ticket, 
  Trash2,
  DollarSign,
  Tag,
  XCircle,
  CheckCircle,
  TrendingUp,
  Eye,
  EyeOff,
  Save as InfoIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getPlans, 
  updatePlan, 
  getPaymentHistory,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Pre-definimos los 4 niveles base para asegurar que siempre se vean (y se puedan crear vía upsert)
      const baselinePlans = [
        { level: 1, name: "ECO", price: 0, description: "Básico y esencial" },
        { level: 2, name: "BOOST", price: 1500, description: "Visibilidad mejorada" },
        { level: 3, name: "PREMIUM", price: 3500, description: "Bestseller profesional" },
        { level: 4, name: "ELITE", price: 6000, description: "Socio estratégico" }
      ];

      try {
        const plansData = await getPlans(token);
        
        // Mapeamos los niveles base, pero si ya existen en la DB (plansData), usamos esos datos (ID, precio real, etc)
        const mergedPlans = baselinePlans.map(base => {
          const existing = plansData?.find(p => p.level === base.level);
          return existing ? { ...base, ...existing } : { ...base, id: `new-${base.level}` };
        });

        setPlans(mergedPlans);
      } catch (err) {
        console.error("Error fetching plans:", err);
        // Si falla la API por completo, al menos mostramos la plantilla para que el admin intente guardar/crear
        setPlans(baselinePlans.map(base => ({ ...base, id: `fallback-${base.level}` })));
      }

      // Other data
      try {
        const historyData = await getPaymentHistory(token);
        setHistory(historyData || []);
      } catch (err) { console.error("Error history:", err); }

      try {
        const couponsData = await getCoupons(token, true);
        setCoupons(couponsData || []);
      } catch (err) { console.error("Error coupons:", err); }

    } catch (err) {
      console.error("General fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handlePlanChange = (id, field, value) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSavePlan = async (plan) => {
    setSaving(true);
    try {
      const payload = { ...plan, price: parseFloat(plan.price) || 0 };
      await updatePlan(plan.id, payload, token);
      showToast(`Plan ${plan.name} actualizado correctamente.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
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
        discountPercent: parseInt(newCoupon.discountPercent) || 0 
      };
      const created = await createCoupon(payload, token);
      setCoupons([created, ...coupons]);
      setNewCoupon({ code: '', discountPercent: '', expiresAt: '' });
      showToast("Cupón creado con éxito.", 'success');
    } catch (err) {
      // Manejo amigable de errores de base de datos (Unique Constraint)
      if (err.message.includes("Unique constraint failed") || err.message.includes("Coupon_code_key")) {
        showToast("Este código de cupón ya existe en el sistema (puede estar desactivado).", 'error');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const updated = await updateCoupon(coupon.id, { isActive: !coupon.isActive }, token);
      setCoupons(coupons.map(c => c.id === coupon.id ? updated : c));
      showToast(`Cupón ${updated.isActive ? 'activado' : 'desactivado'}.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("¿Eliminar este cupón permanentemente?")) return;
    try {
      await deleteCoupon(id, token);
      setCoupons(coupons.filter(c => c.id !== id));
      showToast("Cupón eliminado.", 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header-premium">
          <div className="admin-title-group">
            <Link to="/admin/dashboard" className="back-link">
              <ChevronLeft size={20} />
              <span>Volver al Panel Administrativo</span>
            </Link>
            <h1>Gestión de Negocio</h1>
            <p>Ajustá tarifas, gestioná promociones y auditá ingresos globales.</p>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Cargando motor de finanzas..." />
        ) : (
          <div className="plans-management-container">
            
            {/* 1. Gestión de Precios */}
            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h2>Tarifario de Niveles</h2>
                    <p>Actualizá los precios mensuales de cada plan de comercio.</p>
                  </div>
                </div>
              </div>

              <div className="plans-editor-grid">
                {plans.map(plan => (
                  <div key={plan.id} className="plan-premium-card">
                    <div className="plan-card-header">
                       <div className="plan-level-tag">
                          Nivel 
                          <input 
                            type="number" 
                            className="level-input-inline"
                            value={plan.level} 
                            onChange={(e) => handlePlanChange(plan.id, 'level', parseInt(e.target.value) || 0)}
                          />
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
                         value={plan.description} 
                         onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                         placeholder="Breve descripción..."
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
                        onClick={() => handleSavePlan(plan)} 
                        className="btn-plan-save" 
                        disabled={saving}
                        title="Guardar cambios (Upsert)"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Cupones y Descuentos */}
            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2>Cupones de Descuento</h2>
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
                      placeholder="PANDORA2025" 
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      required
                    />
                  </div>
                  <div className="input-group-premium">
                    <label>% Porcentaje</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newCoupon.discountPercent}
                      onChange={(e) => setNewCoupon({...newCoupon, discountPercent: e.target.value})}
                      max="100" min="0"
                      required
                    />
                  </div>
                  <div className="input-group-premium">
                    <label>Expira (Opcional)</label>
                    <input 
                      type="date" 
                      value={newCoupon.expiresAt}
                      onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn-create-coupon-premium" disabled={saving}>
                    <Plus size={20} />
                    <span>Crear Cupón</span>
                  </button>
                </form>

                <div className="admin-table-wrapper-premium">
                  <table className="admin-table-premium">
                    <thead>
                      <tr>
                        <th>CÓDIGO</th>
                        <th>%</th>
                        <th>EXPIRACIÓN</th>
                        <th className="text-right">ESTADO / ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr><td colSpan="4" className="text-center" style={{opacity: 0.5, padding: '3rem'}}>No hay cupones registrados.</td></tr>
                      ) : (
                        coupons.map((c) => (
                          <tr key={c.id} className={!c.isActive ? 'row-disabled' : ''}>
                            <td style={{fontWeight: 800, color: c.isActive ? 'var(--color-primary)' : 'inherit'}}>
                              {c.code}
                            </td>
                            <td>{c.discountPercent}%</td>
                            <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '∞'}</td>
                            <td className="text-right">
                              <div className="action-icons-group">
                                <button 
                                  onClick={() => handleToggleCoupon(c)} 
                                  className={`btn-action-premium ${c.isActive ? 'edit' : 'view'}`}
                                  title={c.isActive ? 'Desactivar' : 'Activar'}
                                >
                                  {c.isActive ? <EyeOff size={16} /> : <CheckCircle size={16} />}
                                </button>
                                <button onClick={() => handleDeleteCoupon(c.id)} className="btn-action-premium delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. Auditoría de Cobros */}
            <section className="admin-panel-card">
              <div className="panel-header-premium">
                <div className="panel-title-group">
                  <div className="panel-icon-box">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h2>Auditoría de Cobros</h2>
                    <p>Registro histórico de transacciones realizadas en la plataforma.</p>
                  </div>
                </div>
              </div>

              <div className="admin-table-wrapper-premium">
                <table className="admin-table-premium">
                  <thead>
                    <tr>
                      <th>COMERCIO</th>
                      <th>PLAN DESTINO</th>
                      <th>MONTO</th>
                      <th>MÉTODO DE PAGO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan="4" className="text-center" style={{opacity: 0.5, padding: '3rem'}}>No se registran transacciones.</td></tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id}>
                          <td className="row-title">{h.commerce?.name || 'Comercio'}</td>
                          <td>Nivel {h.newLevel}</td>
                          <td style={{color: '#2ecc71', fontWeight: 800}}>${h.totalPaid}</td>
                          <td>
                            <span className="badge-premium active">{h.method}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
