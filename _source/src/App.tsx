import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVueltas } from './pages/admin/AdminVueltas';
import { AdminVueltaDetail } from './pages/admin/AdminVueltaDetail';
import { AdminColegios } from './pages/admin/AdminColegios';
import { AdminFotografias } from './pages/admin/AdminFotografias';
import { AdminEstadisticas } from './pages/admin/AdminEstadisticas';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/buscar"
            element={
              <PublicLayout>
                <SearchPage />
              </PublicLayout>
            }
          />
          <Route
            path="/galeria/:code"
            element={
              <PublicLayout>
                <GalleryPage />
              </PublicLayout>
            }
          />

          {/* Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Administration Portal Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vueltas" element={<AdminVueltas />} />
            <Route path="vueltas/:code" element={<AdminVueltaDetail />} />
            <Route path="colegios" element={<AdminColegios />} />
            <Route path="fotografias" element={<AdminFotografias />} />
            <Route path="estadisticas" element={<AdminEstadisticas />} />
            {/* Backward-compatibility redirect for coordinadores */}
            <Route path="coordinadores" element={<Navigate to="/admin/vueltas" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
