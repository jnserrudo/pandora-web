import React, { useState } from 'react';
import { 
  Save,
  Music2,
  Utensils,
  Theater,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './CategoryConfigPanel.css';

const CategoryConfigPanel = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Vida Nocturna', enum: 'VIDA_NOCTURNA', isFeatured: true, order: 1, icon: <Music2 size={24} /> },
    { id: 2, name: 'Gastronomía', enum: 'GASTRONOMIA', isFeatured: true, order: 2, icon: <Utensils size={24} /> },
    { id: 3, name: 'Salas y Teatro', enum: 'SALAS_Y_TEATRO', isFeatured: true, order: 3, icon: <Theater size={24} /> },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);

  const toggleFeatured = (id) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, isFeatured: !cat.isFeatured } : cat
    ));
  };

  const onDragStart = (e, index) => {
    setDraggedItem(categories[index]);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    const draggedOverItem = categories[index];

    // If the item is dragged over itself, do nothing
    if (draggedItem === draggedOverItem) return;

    // Filter out the currently dragged item
    let items = categories.filter(item => item !== draggedItem);

    // Add the dragged item after the dragged over item
    items.splice(index, 0, draggedItem);

    setCategories(items);
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleSave = () => {
    showToast("Configuración de categorías guardada correctamente.", 'success');
  };

  return (
    <div className="category-config-panel">
      <div className="panel-header-premium">
        <div className="title-group">
          <Settings2 size={24} className="accent-glow" />
          <div className="text">
            <h3>Gestión de Categorías Home</h3>
            <p>Define el orden y visibilidad en la pantalla principal</p>
          </div>
        </div>
        <button className="btn-save-glow" onClick={handleSave}>
          <Save size={18} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="categories-draggables">
        {categories.map((cat, index) => (
          <div 
            key={cat.id} 
            className={`category-row-premium ${cat.isFeatured ? 'featured' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
          >
            <div className="drag-handle">
              <GripVertical size={20} />
            </div>
            <div className="cat-icon">{cat.icon}</div>
            <div className="cat-details">
              <span className="cat-name">{cat.name}</span>
            </div>
            <div className="cat-actions">
              <button 
                className={`action-toggle ${cat.isFeatured ? 'active' : ''}`}
                onClick={() => toggleFeatured(cat.id)}
                title={cat.isFeatured ? "Quitar de Home" : "Mostrar en Home"}
              >
                {cat.isFeatured ? <Eye size={18} /> : <EyeOff size={18} />}
                <span>{cat.isFeatured ? 'Visible' : 'Oculto'}</span>
              </button>
              <div className="feature-badge">
                 <Star size={14} fill={cat.isFeatured ? "currentColor" : "none"} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-footer-note">
        <p>Tip: Las primeras 4 categorías visibles tendrán mayor impacto visual en la Home.</p>
      </div>
    </div>
  );
};

export default CategoryConfigPanel;
