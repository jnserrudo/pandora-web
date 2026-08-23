import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { getPlans, applyCoupon } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Check, 
  Zap, 
  Award, 
  Crown, 
  ArrowRight,
  MousePointer2,
  Ticket,
  MapPin,
  Headphones
} from 'lucide-react';
import Reveal from '../motion/Reveal';
import { COMMERCE_PLAN_CATALOG, parsePlanBenefits } from '../../utils/planCatalog';
import { formatPlanLevelLabel } from '../../utils/enumLabels';
import './PricingPage.css';

const PricingPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans(token);

        if (!data || data.length === 0) {
          setPlans(
            COMMERCE_PLAN_CATALOG.map((p) => ({
              ...p,
              features: p.benefits,
            }))
          );
        } else {
          const adapted = data.map((p) => {
            const catalog = COMMERCE_PLAN_CATALOG.find((c) => c.level === p.level);
            let features = parsePlanBenefits(p.features || p.benefits);
            if (features.length === 0 && catalog?.benefits) {
              features = catalog.benefits;
            }

            return {
              ...p,
              name: formatPlanLevelLabel(p.level, p.name || catalog?.name || `Nivel ${p.level}`),
              description: p.description || catalog?.description || '',
              iconName: p.iconName || catalog?.iconName || 'MousePointer2',
              color: p.color || catalog?.color || 'var(--color-primary)',
              featured: p.featured !== undefined ? p.featured : Boolean(catalog?.featured),
              features,
            };
          });
          setPlans(adapted);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setPlans(
          COMMERCE_PLAN_CATALOG.map((p) => ({
            ...p,
            features: p.benefits,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplying(true);
    setCouponError(null);
    try {
      const coupon = await applyCoupon(couponCode, token);
      setActiveCoupon(coupon);
      showToast(`¡Cupón aplicado! ${coupon.discountPercent}% de descuento.`, 'success');
    } catch (err) {
      const msg = err.message || '';
      setCouponError(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg);
      setActiveCoupon(null);
    } finally {
      setApplying(false);
    }
  };

  const calculatePrice = (originalPrice) => {
    if (!activeCoupon) return originalPrice === 0 ? "Gratis" : `$${originalPrice}`;
    if (originalPrice === 0) return "Gratis";
    
    const discounted = originalPrice * (1 - activeCoupon.discountPercent / 100);
    return discounted === 0 ? "Gratis" : `$${discounted.toFixed(0)}`;
  };

  const getIcon = (name) => {
    switch(name) {
      case 'Zap': return <Zap size={32} />;
      case 'Award': return <Award size={32} />;
      case 'Crown': return <Crown size={32} />;
      default: return <MousePointer2 size={32} />;
    }
  };

  if (loading) return <LoadingSpinner fullscreen message="Actualizando tarifario..." />;

  return (
    <div className="pricing-page-wrapper">
      <Navbar />
      
      <main className="pricing-main-content">
        <Reveal as="header" className="pricing-hero" variant="up">
          <div className="pricing-glow-orb"></div>
          <div className="pricing-hero-text">
            <span className="pricing-badge">PLANES PANDORA</span>
            <h1>Potenciá tu <span className="highlight">alcance</span></h1>
            <p>Elegí el nivel de visibilidad ideal para tu comercio y conectá con miles de personas.</p>
          </div>
        </Reveal>

        {/* Sección de Cupón */}
        <Reveal as="section" className="coupon-section" variant="up" delay={80}>
          <div className="coupon-container glass-morphism">
            <div className="coupon-info">
              <Ticket className="coupon-icon" />
              <div>
                <h3>¿Tenés un código de descuento?</h3>
                <p>Ingresalo para obtener beneficios exclusivos de lanzamiento.</p>
              </div>
            </div>
            <div className="coupon-input-group">
              <input 
                type="text" 
                placeholder="PROMOQUERIDA20" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={applying || !couponCode}
              >
                {applying ? 'Validando...' : 'Aplicar'}
              </button>
            </div>
            {couponError && <span className="coupon-error">{couponError}</span>}
            {activeCoupon && <span className="coupon-success">¡Cupón {activeCoupon.code} ACTIVADO!</span>}
          </div>
        </Reveal>

        <section className="pricing-grid-container">
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <Reveal
                key={plan.level}
                className={`pricing-card ${plan.featured ? 'featured' : ''}`}
                style={{ '--accent-color': plan.color || 'var(--color-primary)' }}
                delay={Math.min(i, 5) * 70}
                variant="up"
              >
                {plan.featured && <div className="featured-badge" role="status">Recomendado</div>}
                <div className="card-top">
                  <div className="plan-icon">{getIcon(plan.iconName)}</div>
                  <h3 className="plan-name">Nivel {plan.level}: {plan.name}</h3>
                  <div className="plan-price-group">
                    {activeCoupon && plan.price > 0 && (
                      <span className="old-price">${plan.price}</span>
                    )}
                    <div className="plan-price">{calculatePrice(plan.price)}</div>
                  </div>
                  <p className="plan-desc">{plan.description}</p>
                </div>
                
                <div className="plan-features">
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <div className="check-box">
                        <Check size={14} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="plan-footer">
                  <Link to="/commerces/create" className="plan-cta">
                    {plan.level === 1 ? 'Publicar Comercio Gratis' : `Mejorar a ${plan.name}`}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pricing-extra-info">
          <div className="info-card">
            <MapPin size={36} className="info-icon" aria-hidden />
            <h3>Más visible en Salta</h3>
            <p>Los planes altos priorizan tu ficha en listados, mapa y destacados de la ciudad.</p>
          </div>
          <div className="info-card">
            <Headphones size={36} className="info-icon" aria-hidden />
            <h3>Acompañamiento real</h3>
            <p>Escribinos desde Contacto si necesitás ayuda para armar o mejorar tu perfil.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
