import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Camera,
  BarChart3,
  ExternalLink,
  Menu,
  X,
  UploadCloud,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Vueltas', href: '/admin/vueltas', icon: Compass },
    { name: 'Colegios', href: '/admin/colegios', icon: GraduationCap },
    { name: 'Fotografías', href: '/admin/fotografias', icon: Camera },
    { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart3 },
  ];

  const adminEmail = user?.email || 'lsnetinformatica2024@gmail.com';
  const initial = adminEmail.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col selection:bg-[#159447] selection:text-white">
      {/* Top Admin Header */}
      <header className="h-16 bg-[#0A111F] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" variant="isotype" />
            <div className="hidden sm:flex flex-col">
              <span className="font-outfit font-black text-sm tracking-tight text-white leading-none">
                Samba Brasil <span className="text-[#159447]">Channel</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Panel de Administración
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <span>Ver sitio público</span>
            <ExternalLink size={12} />
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#159447] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#159447]/30">
                {initial}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-white leading-none truncate max-w-[170px]" title={adminEmail}>
                  {adminEmail}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={11} /> Admin Imágenes
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-30 w-64 bg-[#090F1B] border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Gestión General
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#124DA0] text-white shadow-md shadow-[#124DA0]/30 border border-[#4082e6]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#F8C62B]' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-3">
            {/* Quick Storage Status */}
            <div className="bg-[#0C1524] border border-white/5 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold">
                <span className="flex items-center gap-1.5">
                  <UploadCloud size={14} className="text-[#159447]" /> Storage B2
                </span>
                <span className="text-[10px] text-emerald-400">Activo</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bucket: <code className="text-slate-300">SambaBrasil</code> <br />
                CDN: <code className="text-[#F8C62B]">Cloudflare 0% egress</code>
              </p>
            </div>

            {/* Logout button in sidebar */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all font-semibold"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
