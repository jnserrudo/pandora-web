import React, { useState, useEffect } from 'react';
import { getCommerceProducts, getAbsoluteImageUrl } from '../../services/api';
import './CommerceProducts.css';

const CommerceProducts = ({ commerceId, planLevel }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (planLevel < 2) {
                setLoading(false);
                return; // Plan Free does not have products
            }
            try {
                setLoading(true);
                const data = await getCommerceProducts(commerceId);
                setProducts(data);
            } catch (err) {
                console.error("Error loading products:", err);
                setError("No se pudieron cargar los productos en este momento.");
            } finally {
                setLoading(false);
            }
        };

        if (commerceId) {
            fetchProducts();
        }
    }, [commerceId, planLevel]);

    if (planLevel < 2) return null;
    
    if (loading) return <div className="products-loading">Cargando catálogo...</div>;
    if (error) return <div className="products-error">{error}</div>;
    if (!products || products.length === 0) return null; // Ocultar si no hay productos cargados

    return (
        <section className="commerce-products-section">
            <h2 className="products-title">Nuestro Catálogo</h2>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            {product.imageUrl ? (
                                <img 
                                    src={getAbsoluteImageUrl(product.imageUrl)} 
                                    alt={product.name} 
                                    className="product-image"
                                />
                            ) : (
                                <div className="product-image-placeholder">Sin imagen</div>
                            )}
                            {product.price && (
                                <div className="product-price-badge">
                                    ${parseFloat(product.price).toLocaleString('es-AR')}
                                </div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            {product.description && (
                                <p className="product-description">{product.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {planLevel === 2 && products.length === 6 && (
                <div className="products-limit-notice">
                    Mostrando el límite máximo del catálogo (6 ítems).
                </div>
            )}
        </section>
    );
};

export default CommerceProducts;
