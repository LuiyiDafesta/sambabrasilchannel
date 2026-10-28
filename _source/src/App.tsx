import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminControlConsole } from './pages/admin/AdminControlConsole';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminVueltaRedirect() {
  const { code } = useParams<{ code: string }>();
  return <Navigate to={`/admin?galeria=${code || ''}`} replace />;
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
                <AdminControlConsole />
              </ProtectedRoute>
            }
          />

          {/* Backward compatibility and deep-linking redirects */}
          <Route path="/admin/colegios" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/vueltas" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/vueltas/:code" element={<AdminVueltaRedirect />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/fotografias" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/estadisticas" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/coordinadores" element={<Navigate to="/admin" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
