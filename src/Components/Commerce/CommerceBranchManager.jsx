// src/Components/Commerce/CommerceBranchManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../services/api';
import { PlusCircle, MapPin, Phone, Trash2, Home, AlertCircle } from 'lucide-react';
import MapPicker from '../ui/MapPicker';
import ConfirmationModal from '../ui/ConfirmationModal';
import './CommerceBranchManager.css';
import axios from 'axios';

const CommerceBranchManager = ({ commerce }) => {
    const { token } = useAuth();
    const { showToast } = useToast();
    
    const [branches, setBranches] = useState(commerce.branches || []);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        branchId: null,
        isMain: false
    });
    
    // New branch form state
    const [newBranch, setNewBranch] = useState({
        name: '',
        address: '',
        phone: '',
        latitude: null,
        longitude: null,
    });

    const planLimits = {
        1: 1, // Free
        2: 3, // Plata
        3: 999, // Oro
        4: 999  // Platino
    };

    const maxBranches = planLimits[commerce.planLevel] || 1;
    const canAddMore = branches.length < maxBranches;

    const fetchBranches = async () => {
        try {
            const res = await axios.get(`${API_URL}/commerces/${commerce.id}/branches`);
            setBranches(res.data);
        } catch (err) {
            console.error("Error fetching branches:", err);
            showToast("No se pudieron cargar las sucursales actualizadas.", "error");
        }
    };

    // Auto-fetch on mount to ensure fresh data
    useEffect(() => {
        fetchBranches();
    }, [commerce.id]);

    const handleAddBranch = async (e) => {
        e.preventDefault();
        
        if (!newBranch.address.trim()) {
            showToast("La dirección es obligatoria", "error");
            return;
        }

        if (!canAddMore) {
            showToast("Has alcanzado el límite de sucursales de tu plan.", "warning");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/commerces/${commerce.id}/branches`, newBranch, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Sucursal agregada con éxito", "success");
            setNewBranch({ name: '', address: '', phone: '', latitude: null, longitude: null });
            setShowAddForm(false);
            fetchBranches();
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Error al agregar la sucursal", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBranch = (branchId, isMain) => {
        if (isMain) {
            showToast("No puedes eliminar la Casa Central", "warning");
            return;
        }

        setConfirmModal({
            isOpen: true,
            branchId,
            isMain
        });
    };

    const confirmDelete = async () => {
        const { branchId } = confirmModal;
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/branches/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Sucursal eliminada", "success");
            setConfirmModal({ isOpen: false, branchId: null, isMain: false });
            fetchBranches();
        } catch (err) {
            showToast(err.response?.data?.message || "Error al eliminar la sucursal", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="branch-manager-container">
            <div className="branch-manager-header">
                <h3>Vincular Sucursales</h3>
                <div className="branch-stats">
                    <span>{branches.length} / {maxBranches === 999 ? '∞' : maxBranches} Sucursales</span>
                    <div className="progress-bar-mini">
                        <div 
                            className="progress-fill-mini" 
                            style={{width: `${maxBranches === 999 ? 100 : (branches.length / maxBranches) * 100}%`}}
                        ></div>
                    </div>
                </div>
            </div>

            {/* LISTA DE SUCURSALES */}
            <div className="branches-list">
                {branches.map(branch => (
                    <div key={branch.id} className={`branch-card ${branch.isMain ? 'main-branch' : ''}`}>
                        <div className="branch-info">
                            <h4 className="branch-name">
                                {branch.isMain && <Home size={16} className="text-primary mr-2" />}
                                {branch.name || (branch.isMain ? "Casa Central" : "Sucursal")}
                            </h4>
                            <p className="branch-detail"><MapPin size={14} /> {branch.address}</p>
                            {branch.phone && <p className="branch-detail"><Phone size={14} /> {branch.phone}</p>}
                        </div>
                        
                        {!branch.isMain && (
                            <button 
                                onClick={() => handleDeleteBranch(branch.id, branch.isMain)} 
                                className="delete-btn"
                                disabled={loading}
                                aria-label="Eliminar sucursal"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        {branch.isMain && (
                            <span className="main-badge">Matriz</span>
                        )}
                    </div>
                ))}
            </div>

            {/* BOTÓN Y FORMULARIO DE AGREGAR */}
            {canAddMore ? (
                <>
                    {!showAddForm ? (
                        <button 
                            className="btn-add-branch" 
                            onClick={() => setShowAddForm(true)}
                        >
                            <PlusCircle size={18} /> Añadir Nueva Sucursal
                        </button>
                    ) : (
                        <form className="add-branch-form glass-morphism" onSubmit={handleAddBranch}>
                            <h4>Nueva Sucursal</h4>
                            
                            <div className="form-group">
                                <label>Nombre identificador (Opciónal)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Sucursal Terminal" 
                                    value={newBranch.name}
                                    onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Dirección exacta <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Av. Hipolito Yrigoyen 500" 
                                    value={newBranch.address}
                                    required
                                    onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Teléfono directo" 
                                    value={newBranch.phone}
                                    onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ubicación en el Mapa</label>
                                <MapPicker 
                                    initialLat={newBranch.latitude}
                                    initialLng={newBranch.longitude}
                                    onChange={(coords) => setNewBranch({ 
                                        ...newBranch, 
                                        latitude: coords.lat, 
                                        longitude: coords.lng 
                                    })}
                                />
                                {newBranch.latitude && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Coordenadas: {newBranch.latitude.toFixed(6)}, {newBranch.longitude.toFixed(6)}
                                  </p>
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Crear Sucursal'}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            ) : (
                <div className="limit-reached-message">
                    <AlertCircle size={18} />
                    <p>Has alcanzado el límite de {maxBranches} sucursales de tu Plan Actual. 
                       Mejora tu plan para añadir más puntos de venta.</p>
                </div>
            )}

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmDelete}
                loading={loading}
                title="Eliminar Sucursal"
                message="¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default CommerceBranchManager;
