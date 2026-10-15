import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'inicio' | 'quienes-somos' | 'contacto'>('inicio');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      if (location.pathname === '/') {
        const quienesEl = document.getElementById('quienes-somos');
        const contactoEl = document.getElementById('contacto');
        const scrollPos = window.scrollY + 250;

        if (contactoEl && scrollPos >= contactoEl.offsetTop) {
          setActiveSection('contacto');
        } else if (quienesEl && scrollPos >= quienesEl.offsetTop) {
          setActiveSection('quienes-somos');
        } else {
          setActiveSection('inicio');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string, sectionKey?: 'inicio' | 'quienes-somos' | 'contacto') => {
    setIsOpen(false);
    if (sectionKey) setActiveSection(sectionKey);

    const performScroll = () => {
      const el = document.getElementById(id);
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
          ? 'bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-[#070B12]/90 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      {/* Subtle brand ambiance glow underneath the header */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-[#159447]/15 blur-lg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          
          {/* Logo on the left: Pure Wordmark SAMBABRASILCHANNEL in single line */}
          <Link
            to="/"
            onClick={() => {
              setActiveSection('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center group transition-transform hover:scale-[1.01]"
          >
            <span
              className="font-outfit font-black text-xl sm:text-2xl md:text-[25px] uppercase tracking-tight select-none whitespace-nowrap leading-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-white">SAMBA</span>
              <span className="text-[#159447]">BRASIL</span>
              <span className="text-white">CHANNEL</span>
            </span>
          </Link>

          {/* Navigation Links: INICIO | QUIÉNES SOMOS | CONTACTO (matching TRC layout) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {/* INICIO */}
            <button
              type="button"
              onClick={() => scrollToSection('hero', 'inicio')}
              className={`text-xs lg:text-sm font-outfit font-extrabold uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'inicio' ? 'text-[#159447]' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>INICIO</span>
              {activeSection === 'inicio' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>

            {/* QUIÉNES SOMOS */}
            <button
              type="button"
              onClick={() => scrollToSection('quienes-somos', 'quienes-somos')}
              className={`text-xs lg:text-sm font-outfit font-extrabold uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'quienes-somos' ? 'text-[#159447]' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>QUIÉNES SOMOS</span>
              {activeSection === 'quienes-somos' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>

            {/* CONTACTO */}
            <button
              type="button"
              onClick={() => scrollToSection('contacto', 'contacto')}
              className={`text-xs lg:text-sm font-outfit font-extrabold uppercase tracking-wider relative py-2 cursor-pointer transition-colors ${
                activeSection === 'contacto' ? 'text-[#159447]' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>CONTACTO</span>
              {activeSection === 'contacto' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#159447] rounded-full shadow-[0_0_10px_#159447]" />
              )}
            </button>
          </nav>

          {/* Right Action Button: EXPERIENCIA SAMBA BRASIL CHANNEL (Pill button like TRC) */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={() => scrollToSection('buscador-calendario')}
              className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs lg:text-sm uppercase tracking-wider px-5 lg:px-7 py-2.5 rounded-full shadow-[0_0_22px_rgba(21,148,71,0.45)] hover:shadow-[0_0_32px_rgba(21,148,71,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="hidden xl:inline">EXPERIENCIA SAMBA BRASIL CHANNEL</span>
              <span className="inline xl:hidden">EXPERIENCIA SAMBA BRASIL</span>
            </button>
          </div>

          {/* Mobile Menu Toggle & Compact Pill */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollToSection('buscador-calendario')}
              className="bg-[#159447] text-white text-[11px] font-outfit font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md shadow-[#159447]/30"
            >
              EXPERIENCIA
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0E18] border-b border-white/10 px-6 pt-4 pb-6 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => scrollToSection('hero', 'inicio')}
              className={`text-left py-2.5 text-sm font-outfit font-extrabold uppercase tracking-wider border-b border-white/5 transition-colors ${
                activeSection === 'inicio' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              INICIO
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('quienes-somos', 'quienes-somos')}
              className={`text-left py-2.5 text-sm font-outfit font-extrabold uppercase tracking-wider border-b border-white/5 transition-colors ${
                activeSection === 'quienes-somos' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              QUIÉNES SOMOS
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contacto', 'contacto')}
              className={`text-left py-2.5 text-sm font-outfit font-extrabold uppercase tracking-wider transition-colors ${
                activeSection === 'contacto' ? 'text-[#159447]' : 'text-slate-200'
              }`}
            >
              CONTACTO
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => scrollToSection('buscador-calendario')}
              className="w-full bg-[#159447] hover:bg-[#117739] text-white text-center font-outfit font-black py-3 rounded-full uppercase tracking-wider text-xs shadow-lg shadow-[#159447]/30 transition-all"
            >
              EXPERIENCIA SAMBA BRASIL CHANNEL
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
