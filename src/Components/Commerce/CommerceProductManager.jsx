import React, { useState, useEffect } from 'react';
import { 
    getCommerceProducts, 
    createCommerceProduct, 
    deleteCommerceProduct, 
    uploadImage,
    getAbsoluteImageUrl 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import './CommerceProductManager.css';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

const CommerceProductManager = ({ commerceId, planLevel }) => {
    const { token } = useAuth();
    const { showToast } = useToast();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });

    const maxProducts = planLevel === 2 ? 6 : null; // Plata: 6, Oro/Platino: ilimitado
    const canAddProduct = !maxProducts || products.length < maxProducts;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getCommerceProducts(commerceId);
            setProducts(data);
        } catch (error) {
            showToast("Error al cargar los productos.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (commerceId && planLevel >= 2) {
            fetchProducts();
        }
    }, [commerceId, planLevel]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = await uploadImage(file, token);
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
            showToast("Imagen subida con éxito", "success");
        } catch (error) {
            showToast("Error al subir la imagen", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!canAddProduct) {
            showToast("Has alcanzado el límite de productos para tu plan.", "error");
            return;
        }

        if (!formData.name || !formData.price || !formData.imageUrl) {
            showToast("Nombre, precio e imagen son obligatorios.", "error");
            return;
        }

        try {
            setLoading(true);
            const productData = {
                ...formData,
                price: parseFloat(formData.price)
            };
            await createCommerceProduct(commerceId, productData, token);
            showToast("Producto agregado exitosamente.", "success");
            setFormData({ name: '', description: '', price: '', imageUrl: '' });
            await fetchProducts();
        } catch (error) {
            showToast(error.message || "Error al agregar el producto", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
        
        try {
            setLoading(true);
            await deleteCommerceProduct(commerceId, productId, token);
            showToast("Producto eliminado.", "success");
            await fetchProducts();
        } catch (error) {
            showToast("Error al eliminar el producto.", "error");
            setLoading(false);
        }
    };

    if (planLevel < 2) {
        return (
            <div className="product-manager-locked glass-panel">
                <h3>Catálogo Bloqueado</h3>
                <p>El catálogo de productos es exclusivo para Planes Plata, Oro y Platino.</p>
                <p>Actualiza tu plan para comenzar a cargar tus artículos.</p>
            </div>
        );
    }

    return (
        <div className="commerce-product-manager">
            <div className="product-manager-grid">
                
                {/* FORMULARIO DE AGREGAR */}
                <div className="add-product-panel glass-panel">
                    <h3>Agregar Nuevo Producto</h3>
                    
                    {maxProducts && (
                        <div className={`limit-badge ${!canAddProduct ? 'limit-reached' : ''}`}>
                            Productos: {products.length} / {maxProducts}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label>Imagen del Producto *</label>
                            <div className="image-upload-area">
                                {formData.imageUrl ? (
                                    <ImageOverlayPreview
                                        imageUrl={getAbsoluteImageUrl(formData.imageUrl)}
                                        onUploadChange={handleImageUpload}
                                        onRemove={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                        uploading={uploading}
                                    />
                                ) : (
                                    <label className="upload-placeholder">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={!canAddProduct || uploading} />
                                        {uploading ? <Loader2 className="animate-spin text-purple-500" size={24} /> : <ImageIcon size={24} />}
                                        <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nombre *</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej: Hamburguesa Completa"
                                disabled={!canAddProduct || loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Precio *</label>
                            <input 
                                type="number" 
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="Ej: 8500"
                                disabled={!canAddProduct || loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción corta</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Ingredientes, detalles..."
                                rows="3"
                                disabled={!canAddProduct || loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-neo-primary" 
                            disabled={!canAddProduct || loading || uploading}
                        >
                            <Plus size={18} />
                            {loading ? 'Guardando...' : 'Agregar al Catálogo'}
                        </button>
                    </form>
                </div>

                {/* LISTA DE PRODUCTOS */}
                <div className="products-list-panel glass-panel">
                    <h3>Mi Catálogo Actual</h3>
                    
                    {loading && products.length === 0 ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin text-purple-500" size={32} />
                            <p>Cargando productos...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <p>Aún no tienes productos registrados.</p>
                        </div>
                    ) : (
                        <div className="owner-products-grid">
                            {products.map(product => (
                                <div key={product.id} className="owner-product-card">
                                    <img src={getAbsoluteImageUrl(product.imageUrl)} alt={product.name} />
                                    <div className="product-details">
                                        <h4>{product.name}</h4>
                                        <span className="product-price">${parseFloat(product.price).toLocaleString('es-AR')}</span>
                                    </div>
                                    <button 
                                        className="btn-delete-product"
                                        onClick={() => handleDelete(product.id)}
                                        title="Eliminar producto"
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommerceProductManager;
