import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner'; // Si existe, o usar uno simple

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Puedes reemplazar esto con tu componente de LoadingSpinner real
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0d0218' 
      }}>
        <div className="loader-sm" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado, guardando la ubicación intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos y el usuario no tiene ninguno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    // Normalizamos los roles a mayúsculas para evitar problemas de case-sensitivity
    const userRole = user?.role ? user.role.toUpperCase() : '';
    const hasPermission = allowedRoles.some(role => role.toUpperCase() === userRole);

    if (!hasPermission) {
      // Si no tiene permiso, redirigir a Home o a una página de "No Autorizado"
      // Por ahora mandamos a Home
      return <Navigate to="/" replace />;
    }
  }

  // Si pasa todas las verificaciones, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
