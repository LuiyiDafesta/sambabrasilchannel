import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVueltas } from './pages/admin/AdminVueltas';
import { AdminVueltaDetail } from './pages/admin/AdminVueltaDetail';
import { AdminColegios } from './pages/admin/AdminColegios';
import { AdminCoordinadores } from './pages/admin/AdminCoordinadores';
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

        {/* Administration Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="vueltas" element={<AdminVueltas />} />
          <Route path="vueltas/:code" element={<AdminVueltaDetail />} />
          <Route path="colegios" element={<AdminColegios />} />
          <Route path="coordinadores" element={<AdminCoordinadores />} />
          <Route path="fotografias" element={<AdminFotografias />} />
          <Route path="estadisticas" element={<AdminEstadisticas />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
