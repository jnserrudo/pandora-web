// src/App.jsx
import React from "react";
import { ToastProvider } from "./context/ToastContext";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Components/pages/HomePage";
import LoginPage from "./Components/pages/LoginPage";
import RegisterPage from "./Components/pages/RegisterPage";
import ArticlesListPage from "./Components/pages/ArticlesListPage";
import ArticleDetailPage from "./Components/pages/ArticleDetailPage";
import EventsListPage from './Components/pages/EventsListPage';         
import CommercesListPage from './Components/pages/CommercesListPage'; 
import CommerceDetailPage from './Components/pages/CommerceDetailPage'; 
import EventDetailPage from './Components/pages/EventDetailPage';       
import AboutPage from './Components/pages/AboutPage';
import ContactPage from './Components/pages/ContactPage'; 
import UserProfilePage from './Components/pages/UserProfilePage';
import PricingPage from './Components/pages/PricingPage';
import MySubmissionsPage from './Components/pages/MySubmissionsPage';
import "./App.css";

// --- GESTIÓN Y PROTECCIÓN ---
import ProtectedRoute from "./Components/utils/ProtectedRoute";
import MyCommercesPage from "./Components/pages/MyCommercesPage";
import CommerceFormPage from "./Components/pages/CommerceFormPage";
import EventFormPage from "./Components/pages/EventFormPage"; 
import AdminArticlesPage from "./Components/pages/AdminArticlesPage";
import AdminArticleFormPage from "./Components/pages/AdminArticleFormPage";
import AdminAdvertisementsPage from "./Components/pages/AdminAdvertisementsPage";
import AdminAdvertisementFormPage from "./Components/pages/AdminAdvertisementFormPage";
import AdminDashboard from "./Components/pages/AdminDashboard";
import AdminCommercesPage from "./Components/pages/AdminCommercesPage";
import AdminEventsPage from "./Components/pages/AdminEventsPage";
import AdminSubmissionHub from "./Components/pages/AdminSubmissionHub";
import AdminPlansManagement from "./Components/pages/AdminPlansManagement";
import AdminCommerceDetailPage from "./Components/pages/AdminCommerceDetailPage";

function App() {
  return (
    <ToastProvider>
      <div className="app-wrapper">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/magazine" element={<ArticlesListPage />} />
          <Route path="/article/:slug" element={<ArticleDetailPage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/commerces" element={<CommercesListPage />} /> 
          <Route path="/commerce/:id" element={<CommerceDetailPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route 
            path="/my-submissions" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                <MySubmissionsPage />
              </ProtectedRoute>
            } 
          />

          {/* --- RUTAS PROTEGIDAS --- */}

          {/* 1. USUARIOS (Perfil) - Cualquiera logueado */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* 2. PROPIETARIOS (Gestión de Comercios) */}
          <Route 
            path="/my-commerces" 
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <MyCommercesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/commerces/create" 
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <CommerceFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/commerces/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <CommerceFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/create" 
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <EventFormPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 3. ADMIN */}
          <Route 
            path="/admin/articles" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminArticlesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/articles/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminArticleFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/articles/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminArticleFormPage />
              </ProtectedRoute>
            } 
          />

          {/* 4. ADMIN PUBLICIDADES */}
          <Route 
            path="/admin/advertisements" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAdvertisementsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/advertisements/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAdvertisementFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/advertisements/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAdvertisementFormPage />
              </ProtectedRoute>
            } 
          />

          {/* 5. GESTIÓN GLOBAL ADMIN */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/commerces" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCommercesPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/commerces/:id/detail" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCommerceDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEventsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/submissions" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSubmissionHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/plans" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPlansManagement />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </main>
    </div>
    </ToastProvider>
  );
}

export default App;
