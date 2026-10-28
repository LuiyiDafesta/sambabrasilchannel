import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'inicio' | 'nosotros' | 'contacto'>('inicio');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      if (location.pathname === '/') {
        const quienesEl = document.getElementById('quienes-somos') || document.getElementById('nosotros');
        const contactoEl = document.getElementById('contacto');
        const scrollPos = window.scrollY + 250;

        if (contactoEl && scrollPos >= contactoEl.offsetTop) {
          setActiveSection('contacto');
        } else if (quienesEl && scrollPos >= quienesEl.offsetTop) {
          setActiveSection('nosotros');
        } else {
          setActiveSection('inicio');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string, sectionKey?: 'inicio' | 'nosotros' | 'contacto') => {
    setIsOpen(false);
    if (sectionKey) setActiveSection(sectionKey);

    const performScroll = () => {
      const el = document.getElementById(id) || (id === 'nosotros' ? document.getElementById('quienes-somos') : null);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(performScroll, 120);
    } else {
      performScroll();
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B12]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-[#070B12]/90 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      {/* Subtle brand ambiance glow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-[#159447]/15 blur-lg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          
          {/* Logo on the left: SAMBA BRASIL CHANNEL (with green accent) */}
          <Link
            to="/"
            onClick={() => {
              setActiveSection('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center group transition-transform hover:scale-[1.01]"
          >
            <span
              className="font-outfit font-black text-xl sm:text-2xl md:text-[26px] uppercase tracking-tight select-none whitespace-nowrap leading-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-white">SAMBA</span>
              <span className="text-[#159447] mx-0.5">BRASIL</span>
              <span className="text-white">CHANNEL</span>
            </span>
          </Link>

          {/* Navigation Links: INICIO | NOSOTROS | CONTACTO (matching reference layout) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {/* INICIO */}
            <button
              type="button"
              onClick={() => {
                setActiveSection('inicio');
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`text-xs lg:text-sm font-outfit font-black uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'inicio' ? 'text-[#159447]' : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>INICIO</span>
              {activeSection === 'inicio' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>

            {/* NOSOTROS */}
            <button
              type="button"
              onClick={() => scrollToSection('quienes-somos', 'nosotros')}
              className={`text-xs lg:text-sm font-outfit font-black uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'nosotros' ? 'text-[#159447]' : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>NOSOTROS</span>
              {activeSection === 'nosotros' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>

            {/* CONTACTO */}
            <button
              type="button"
              onClick={() => scrollToSection('contacto', 'contacto')}
              className={`text-xs lg:text-sm font-outfit font-black uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'contacto' ? 'text-[#159447]' : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>CONTACTO</span>
              {activeSection === 'contacto' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>
          </nav>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0E18] border-b border-white/10 px-6 pt-4 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveSection('inicio');
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`text-left py-3 text-sm font-outfit font-black uppercase tracking-wider border-b border-white/5 transition-colors ${
                activeSection === 'inicio' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              INICIO
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('quienes-somos', 'nosotros')}
              className={`text-left py-3 text-sm font-outfit font-black uppercase tracking-wider border-b border-white/5 transition-colors ${
                activeSection === 'nosotros' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              NOSOTROS
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contacto', 'contacto')}
              className={`text-left py-3 text-sm font-outfit font-black uppercase tracking-wider transition-colors ${
                activeSection === 'contacto' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              CONTACTO
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
