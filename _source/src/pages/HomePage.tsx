import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Camera,
  ShoppingBag,
  Users,
  Sparkles,
  ArrowRight,
  Plane,
  CheckCircle2,
  Download,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Heart,
  Award,
} from 'lucide-react';
import { TripCalendarSearch } from '../components/search/TripCalendarSearch';
import { surveyService } from '../services/surveyService';

export const HomePage: React.FC = () => {
  const [dreamscdaEnabled, setDreamscdaEnabled] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await surveyService.getSettings();
        setDreamscdaEnabled(settings?.dreamscda_banner?.enabled ?? true);
      } catch (e) {
        console.warn('Could not load dreamscda settings:', e);
      }
    }
    loadSettings();
  }, []);
  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col selection:bg-[#159447] selection:text-white">
      
      {/* 1. HERO SECTION WITH RIO / CAMBORIU AMBIENCE */}
      <section
        id="hero"
        className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden flex flex-col items-center justify-center min-h-[92vh]"
      >
        {/* Background Image: Friends celebrating tropical graduation trip */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
            alt="Amigos de viaje en Camboriú Brasil"
            className="w-full h-full object-cover object-center filter brightness-[0.38] scale-105 animate-subtleZoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D18] via-[#070D18]/70 to-[#070D18]/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#070D18]/90" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-[#159447]/15 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-[#F8C62B]/15 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center w-full">
          
          {/* Official Emblem Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#F8C62B]/40 backdrop-blur-md text-xs sm:text-sm text-[#F8C62B] mb-6 shadow-[0_0_20px_rgba(248,198,43,0.2)] animate-fadeIn">
            <Sparkles size={16} className="text-[#F8C62B]" />
            <span className="font-bold tracking-wide">
              Exclusivo Camboriú &bull; Vuelos Privados Oficiales
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white mb-4 leading-[1.06] drop-shadow-lg">
            Tu viaje. <br className="sm:hidden" />
            <span className="text-[#F8C62B]">Tus amigos.</span> <br />
            <span className="text-[#159447]">Tus recuerdos.</span>
          </h1>

          {/* Secondary Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-medium mb-10 leading-relaxed drop-shadow">
            Encontrá las fotos de tu viaje y volvé a vivir cada momento de Samba Brasil en Camboriú.
          </p>

          {/* INTERACTIVE MONTH & CALENDAR SEARCH COMPONENT (Nov / Dic / Ene) */}
          <div id="buscador-calendario" className="w-full text-left pt-2">
            <TripCalendarSearch />
          </div>

        </div>
      </section>

      {/* 2. 4 FEATURED BENEFITS (Exact match to reference mockup) */}
      <section className="relative z-10 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Benefit 1 */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#159447]/50 hover:shadow-[0_0_20px_rgba(21,148,71,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center mx-auto mb-3">
              <Camera size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Fotos gratis <br /> de tu viaje
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Descarga directa para tu colegio</p>
          </div>

          {/* Benefit 2 */}
          <a
            href="https://fotos.dreamscda.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#F8C62B]/50 hover:shadow-[0_0_20px_rgba(248,198,43,0.15)] transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F8C62B]/15 border border-[#F8C62B]/30 text-[#F8C62B] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug group-hover:text-[#F8C62B] transition-colors">
              Más fotos en <br /> DreamsCDA
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Packs profesionales HD</p>
          </a>

          {/* Benefit 3 */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#124DA0]/50 hover:shadow-[0_0_20px_rgba(18,77,160,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#124DA0]/20 border border-[#124DA0]/40 text-[#4082e6] flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Todos los colegios <br /> de tu grupo
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Álbum unificado por vuelo</p>
          </div>

          {/* Benefit 4 */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#159447]/50 hover:shadow-[0_0_20px_rgba(21,148,71,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Revive la magia <br /> del Carnaval
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Playas de Camboriú</p>
          </div>

        </div>
      </section>

      {/* 3. SECCIÓN NOSOTROS / QUIÉNES SOMOS */}
      <div id="nosotros" />
      <section id="quienes-somos" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#159447]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#159447] bg-[#159447]/10 px-3.5 py-1 rounded-full border border-[#159447]/30">
                Samba Brasil Oficial &bull; by Travel Rock
              </span>
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-white mt-4 mb-5 leading-tight">
                La experiencia audiovisual más emocionante de tu viaje.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                <strong>Samba Brasil Channel</strong> es la plataforma oficial de fotografía y contenido digital de los viajes de egresados a <strong>Camboriú</strong>. Operamos en exclusiva con vuelos privados para que cada grupo llegue directo a la magia del carnaval, las playas de Santa Catarina y las mejores fiestas.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
                Las fotografías se organizan por contingente de vuelo: <strong>todos los colegios que compartieron ese viaje acceden al mismo álbum completo</strong>, para que nadie se pierda ninguna anécdota, fiesta temática ni recuerdo grupal.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                  <Plane size={20} className="text-[#F8C62B] mb-2" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">Vuelos Exclusivos</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Operación de vuelos privados directa a Brasil.</p>
                </div>
                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                  <MapPin size={20} className="text-[#159447] mb-2" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">Solo Camboriú</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Playa Brava, Laranjeiras y fiestas.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
                  alt="Samba Brasil Carnaval"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-[#070D18]/95 border border-[#159447] p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#159447]/20 flex items-center justify-center text-[#159447]">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-white font-bold text-xs">Temporada Oficial 2026 / 2027</div>
                  <div className="text-[#F8C62B] text-[10px] font-semibold">Noviembre &bull; Diciembre &bull; Enero</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CÓMO ENCONTRAR TU VIAJE EN 3 PASOS */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159447] bg-[#159447]/10 px-3 py-1 rounded-full border border-[#159447]/20">
            Paso a Paso
          </span>
          <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white mt-3">
            ¿Cómo encontrar las fotos de tu colegio?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <span className="text-4xl font-black text-white/5 absolute top-3 right-5">01</span>
            <div className="w-12 h-12 rounded-xl bg-[#159447]/15 text-[#159447] flex items-center justify-center mb-4">
              <Calendar size={22} />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white mb-2">1. Elegí el Mes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seleccioná Noviembre, Diciembre o Enero en el selector superior para abrir el calendario de vuelos.
            </p>
          </div>

          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <span className="text-4xl font-black text-white/5 absolute top-3 right-5">02</span>
            <div className="w-12 h-12 rounded-xl bg-[#F8C62B]/15 text-[#F8C62B] flex items-center justify-center mb-4">
              <Users size={22} />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white mb-2">2. Marcá el Día de Ingreso y tu Colegio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hacé clic en el día de ingreso a Camboriú destacado en verde para ver el recuadro con los colegios que integran ese vuelo.
            </p>
          </div>

          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <span className="text-4xl font-black text-white/5 absolute top-3 right-5">03</span>
            <div className="w-12 h-12 rounded-xl bg-[#124DA0]/20 text-[#4082e6] flex items-center justify-center mb-4">
              <Download size={22} />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white mb-2">3. Descargá tus Recuerdos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresá al álbum unificado del grupo y descargá gratis las mejores fotos de tus amigos en Camboriú.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DREAMSCDA PROMO BANNER (Controlled by Admin Switch) */}
      {dreamscdaEnabled && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0C1524] via-[#102038] to-[#0A1628] border border-[#F8C62B]/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8C62B]/20 text-[#F8C62B] text-xs font-bold uppercase tracking-wider mb-4 border border-[#F8C62B]/30">
                <Sparkles size={14} /> Catálogo Oficial DreamsCDA
              </div>
              
              <h2 className="font-outfit font-black text-2xl sm:text-4xl text-white mb-4 leading-tight">
                ¿Querés descubrir más recuerdos de tu viaje?
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-base leading-relaxed mb-8">
                Encontrá las fotos profesionales panorámicas, fotos de fiesta y packs de recuerdos en alta definición disponibles en la tienda de DreamsCDA.
              </p>

              <a
                href="https://fotos.dreamscda.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#F8C62B] hover:bg-[#e4b21e] text-black font-outfit font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-[#F8C62B]/25 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>VER FOTOS PROFESIONALES</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Anchor for footer contact scroll */}
      <div id="contacto" />

    </div>
  );
};
