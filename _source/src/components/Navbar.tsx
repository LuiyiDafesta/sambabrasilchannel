import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, Camera, Sparkles, Phone, Lock, ExternalLink } from 'lucide-react';
import { Logo } from './brand/Logo';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Buscar viaje', href: '/buscar' },
    { name: 'Cómo funciona', href: '/#como-funciona' },
    { name: 'Fotos Profesionales', href: 'https://fotos.dreamscda.com.ar', external: true },
    { name: 'Contacto', href: '/#contacto' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, external?: boolean) => {
    if (external) return;
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate(`/${href.replace('/', '')}`);
      } else {
        const el = document.getElementById(targetId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060D19]/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/30 py-3'
          : 'bg-gradient-to-b from-[#060D19]/90 to-transparent py-4 sm:py-5 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Isotype + Single Line Wordmark */}
          <Link to="/" className="flex items-center group transition-transform hover:scale-[1.02]">
            <Logo size="md" variant="full" showOfficialBadge={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
                >
                  <Camera size={14} className="text-[#F8C62B]" />
                  <span>{link.name}</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.external)}
                  className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                    location.pathname === link.href
                      ? 'text-white bg-[#159447]/20 border border-[#159447]/40 shadow-[0_0_15px_rgba(21,148,71,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Right CTA and Admin Access */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
              title="Panel Administrativo"
            >
              <Lock size={14} className="text-[#F8C62B]" />
              <span className="hidden xl:inline">Admin</span>
            </Link>

            <Link
              to="/buscar"
              className="bg-[#159447] hover:bg-[#117739] text-white text-xs xl:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(21,148,71,0.35)] hover:shadow-[0_0_25px_rgba(21,148,71,0.5)] transform hover:-translate-y-0.5"
            >
              <Calendar size={16} />
              <span>Buscar Mi Viaje</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/buscar"
              className="bg-[#159447] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Calendar size={14} />
              <span>Viajes</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#070D18] border-b border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Camera size={16} className="text-[#F8C62B]" />
                    {link.name}
                  </span>
                  <ExternalLink size={14} className="opacity-60" />
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.external)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === link.href
                      ? 'text-white bg-[#159447]/20 border border-[#159447]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/buscar"
              className="w-full bg-[#159447] text-white text-center font-bold py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#159447]/25"
            >
              <Calendar size={16} /> Buscar Mi Viaje
            </Link>

            <Link
              to="/admin"
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-center font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Lock size={14} className="text-[#F8C62B]" /> Acceso Coordinadores / Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
