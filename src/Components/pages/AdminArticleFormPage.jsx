// src/Components/pages/AdminArticleFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
// NOTA: Recuerda agregar createArticle, updateArticle, getArticleById a api.js si no existen
import { getArticleBySlug, uploadImage, createCommerce } from '../../services/api'; 
// Usaremos axios directo para los endpoints de admin que quizás aún no están en api.js
import axios from 'axios';
import { API_URL } from '../../services/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CommerceFormPage.css'; // Reutilizamos estilos

const AdminArticleFormPage = () => {
  const { id } = useParams(); // ID (o slug) para editar
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '', // Idealmente un Rich Text Editor, por ahora textarea
    category: 'CULTURA',
    coverImage: '',
    readTime: 5,
    active: true // Publicado por defecto
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        setLoading(true);
        try {
          // Asumimos que tenemos un endpoint para obtener por ID para admin
          // O usamos el público getArticleBySlug si 'id' es slug.
          // Para simplificar, haremos un GET directo
          const response = await axios.get(`${API_URL}/articles/${id}`);
          const data = response.data;
          
          setFormData({
            title: data.title || '',
            content: data.content || '',
            category: (typeof data.category === 'object' ? data.category.name : data.category) || 'CULTURA',
            coverImage: data.coverImage || '',
            readTime: data.readTime || 5,
            active: data.active !== undefined ? data.active : true
          });
        } catch (error) {
          console.error("Error loading article:", error);
          showToast("Error cargando noticia.", 'error');
        } finally {
          setLoading(false);
        }
      };
      
      fetchArticle();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: result.url }));
    } catch (err) {
      console.error(err);
      showToast("Error subiendo imagen.", 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isEditMode) {
        // PUT /articles/:id
        await axios.put(`${API_URL}/articles/${id}`, formData, { headers });
        showToast("Noticia actualizada correctamente.", 'success');
      } else {
        // POST /articles
        await axios.post(`${API_URL}/articles`, formData, { headers });
        showToast("Noticia creada con éxito.", 'success');
      }
      navigate('/admin/articles');
    } catch (error) {
      console.error("Error saving article:", error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <LoadingSpinner />;

  return (
    <div className="commerce-form-wrapper">
      <Navbar />
      <div className="commerce-form-container">
        <div className="form-header">
           <h1 style={{color: 'var(--color-primary)'}}>
             {isEditMode ? 'Editar Noticia' : 'Redactar Nueva Noticia'}
           </h1>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Título</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="form-control" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-control">
              <option value="CULTURA">Cultura</option>
              <option value="NOVEDADES">Novedades</option>
              <option value="ARTE">Arte</option>
              <option value="MUSICA">Música</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contenido (Markdown o HTML simple)</label>
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              className="form-control" 
              style={{ minHeight: '300px' }} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Imagen de Portada</label>
             <div className="image-upload-section">
                <input type="file" onChange={handleImageUpload} style={{display:'none'}} id="news-img" />
                <label htmlFor="news-img" style={{cursor:'pointer'}}>
                  {uploading ? 'Subiendo...' : (formData.coverImage ? 'Cambiar Imagen' : '📸 Seleccionar Foto')}
                </label>
             </div>
             {formData.coverImage && (
               <img src={formData.coverImage} alt="Preview" style={{width:'100%', borderRadius:'8px', marginTop:'1rem'}} />
             )}
          </div>
          
          <div className="form-group" style={{display:'flex', gap:'1rem', alignItems:'center'}}>
             <label style={{marginBottom:0}}>Publicado:</label>
             <input 
               type="checkbox" 
               name="active" 
               checked={formData.active} 
               onChange={handleChange} 
               style={{transform:'scale(1.5)'}}
             />
          </div>

          <div className="form-actions">
            <Link to="/admin/articles" className="cancel-btn">Cancelar</Link>
            <button type="submit" className="submit-btn" disabled={loading}>
              {isEditMode ? 'Actualizar Noticia' : 'Publicar Noticia'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminArticleFormPage;
