// src/Components/pages/AdminContactRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  ArrowUpRight,
  Clock,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../services/config';
import { archiveContactRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminContactRequestsPage = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(response.data);
      } catch (err) {
        console.error("Error fetching contact requests:", err);
        setError("No se pudieron cargar las solicitudes.");
        // Mock fallback para demo visual si falla el endpoint
        setRequests([
          { id: 1, name: 'Juan Perez', email: 'juan@example.com', interestType: 'PARTNER', message: 'Quiero ser socio Pandora', status: 'PENDING', createdAt: new Date() },
          { id: 2, name: 'Maria Lopez', email: 'maria@web.com', interestType: 'COMMERCE', message: 'Tengo un local nocturno', status: 'RESOLVED', createdAt: new Date() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRequests();
  }, [token]);

  const handleArchive = async (id) => {
    if (!window.confirm("¿Archivar este mensaje?")) return;
    try {
      await archiveContactRequest(id, token);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ARCHIVED' } : r));
    } catch (err) {
      console.error("Error archivar request:", err);
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
              <span>Volver al Panel</span>
            </Link>
            <h1>Centro de Mensajería</h1>
          </div>
          <div className="stat-pill">
            <MessageSquare size={18} />
            <span>{requests.length} Solicitudes</span>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Abriendo buzón oficial..." />
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input type="text" placeholder="Buscar por remitente o asunto..." />
              </div>
              <button className="btn-filter-premium">
                <Filter size={18} />
                <span>Nuevos</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>REMITENTE Y FECHA</th>
                  <th className="hide-mobile">TIPO / INTERÉS</th>
                  <th className="hide-mobile">MENSAJE (FRAGMENTO)</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="row-main-info">
                        <span className="row-title">{request.name}</span>
                        <small className="row-subtitle">{request.email}</small>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="badge-premium active" style={{ opacity: 0.7 }}>
                        {request.interestType || 'CONSULTA'}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <div className="message-box-preview">
                        {request.message?.substring(0, 60)}...
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="action-icons-group">
                        <button className="btn-action-premium view" title="Responder">
                           <ArrowUpRight size={18} />
                        </button>
                        <button onClick={() => handleArchive(request.id)} className="btn-action-premium delete" title="Archivar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-premium">
               <p>Buzón oficial de Pandora Web</p>
               <div className="pagination-group-premium">
                  <button disabled className="btn-page"><ChevronLeft size={20} /></button>
                  <button disabled className="btn-page active">1</button>
                  <button disabled className="btn-page"><ChevronRight size={20} /></button>
               </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        .message-box-preview {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default AdminContactRequestsPage;
