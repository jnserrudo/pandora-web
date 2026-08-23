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
        
        // Si el backend no devuelve nada aún, usamos el fallback hardcoded para no romper la UI
        if (!data || data.length === 0) {
          setPlans([
            { level: 1, name: "ECO", price: 0, description: "Esencial para aparecer en el mapa.", iconName: "MousePointer2", color: "var(--tier-basic)", features: ["Presencia básica", "Contacto", "Horarios"] },
            { level: 2, name: "BOOST", price: 1500, description: "Diferenciate con una vitrina atractiva.", iconName: "Zap", color: "var(--tier-plus)", features: ["Todo lo de Nivel 1", "5 fotos", "Badge verificado"] },
            { level: 3, name: "PREMIUM", price: 3500, description: "Ideal con eventos y promos.", iconName: "Award", color: "var(--color-primary)", features: ["Todo lo de Nivel 2", "Ofertas", "Push básicas"], featured: true },
            { level: 4, name: "ELITE", price: 6000, description: "Socio Pandora con analíticas.", iconName: "Crown", color: "var(--tier-premium)", features: ["Socio Pandora", "Analíticas", "Soporte 24/7"] }
          ]);
        } else {
          // Adaptar datos del backend (benefits string -> features array)
          const adapted = data.map(p => {
            let features = [];
            if (p.features) {
              features = Array.isArray(p.features) ? p.features : [p.features];
            } else if (p.benefits) {
              // El backend guarda benefits como texto (posiblemente con saltos de línea)
              features = p.benefits.split('\n').map(f => f.trim()).filter(f => f);
            }

            // Asignar Iconos y Colores por defecto si no vienen del DB
            const defaults = {
                1: { icon: "MousePointer2", color: "var(--tier-basic)" },
                2: { icon: "Zap", color: "var(--tier-plus)" },
                3: { icon: "Award", color: "var(--color-primary)", featured: true },
                4: { icon: "Crown", color: "var(--tier-premium)" }
            }[p.level] || { icon: "MousePointer2", color: "var(--color-primary)" };

            return {
              ...p,
              iconName: p.iconName || defaults.icon,
              color: p.color || defaults.color,
              featured: p.featured !== undefined ? p.featured : (defaults.featured || false),
              features: features.length > 0 ? features : ["Sin beneficios especificados"]
            };
          });
          setPlans(adapted);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

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
