import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Music2,
  Utensils,
  Theater,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCategories, updateHomeCategories } from '../../services/api';
import './CategoryConfigPanel.css';

const ICON_BY_SLUG = {
  VIDA_NOCTURNA: Music2,
  GASTRONOMIA: Utensils,
  SALAS_Y_TEATRO: Theater,
};

function categoryIcon(slug) {
  const Icon = ICON_BY_SLUG[String(slug || '').toUpperCase()] || Tag;
  return <Icon size={24} />;
}

const CategoryConfigPanel = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      const list = Array.isArray(data) ? data : [];
      setCategories(
        [...list]
          .sort((a, b) => (a.homeOrder ?? 0) - (b.homeOrder ?? 0) || a.name.localeCompare(b.name))
          .map((cat) => ({
            ...cat,
            showOnHome: cat.showOnHome !== false,
          }))
      );
    } catch (err) {
      showToast('No se pudieron cargar las categorías.', 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const toggleFeatured = (id) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, showOnHome: !cat.showOnHome } : cat))
    );
  };

  const onDragStart = (e, index) => {
    setDraggedItem(categories[index]);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (!draggedItem) return;
    const draggedOverItem = categories[index];
    if (draggedItem === draggedOverItem) return;

    const items = categories.filter((item) => item !== draggedItem);
    items.splice(index, 0, draggedItem);
    setCategories(items);
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleSave = async () => {
    if (!token) {
      showToast('Tenés que iniciar sesión como admin.', 'error');
      return;
    }
    setSaving(true);
    try {
      const items = categories.map((cat, index) => ({
        id: cat.id,
        showOnHome: Boolean(cat.showOnHome),
        homeOrder: index + 1,
      }));
      const updated = await updateHomeCategories(items, token);
      setCategories(
        [...updated].sort(
          (a, b) => (a.homeOrder ?? 0) - (b.homeOrder ?? 0) || a.name.localeCompare(b.name)
        )
      );
      showToast('Orden y visibilidad de la Home guardados.', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="category-config-panel">
      <div className="panel-header-premium">
        <div className="title-group">
          <Settings2 size={24} className="accent-glow" />
          <div className="text">
            <h3>Gestión de Categorías Home</h3>
            <p>Arrastrá para ordenar y marcá cuáles se ven en la Home. Guardar persiste en el servidor.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-save-glow"
          onClick={handleSave}
          disabled={saving || loading || categories.length === 0}
        >
          {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
          <span>{saving ? 'Guardando…' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {loading ? (
        <div className="categories-loading">
          <Loader2 size={28} className="spin" />
          <span>Cargando categorías…</span>
        </div>
      ) : categories.length === 0 ? (
        <p className="categories-empty">No hay categorías activas en la base.</p>
      ) : (
        <div className="categories-draggables">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`category-row-premium ${cat.showOnHome ? 'featured' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
            >
              <div className="drag-handle">
                <GripVertical size={20} />
              </div>
              <div className="cat-icon">{categoryIcon(cat.slug)}</div>
              <div className="cat-details">
                <span className="cat-name">{cat.name}</span>
                <span className="cat-slug">{cat.slug}</span>
              </div>
              <div className="cat-actions">
                <button
                  type="button"
                  className={`action-toggle ${cat.showOnHome ? 'active' : ''}`}
                  onClick={() => toggleFeatured(cat.id)}
                  title={cat.showOnHome ? 'Quitar de Home' : 'Mostrar en Home'}
                >
                  {cat.showOnHome ? <Eye size={18} /> : <EyeOff size={18} />}
                  <span>{cat.showOnHome ? 'Visible' : 'Oculto'}</span>
                </button>
                <div className="feature-badge">
                  <Star size={14} fill={cat.showOnHome ? 'currentColor' : 'none'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel-footer-note">
        <p>Tip: Las primeras categorías visibles tienen más impacto visual en la Home.</p>
      </div>
    </div>
  );
};

export default CategoryConfigPanel;
