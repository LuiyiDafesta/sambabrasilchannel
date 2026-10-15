import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Camera,
  ShoppingBag,
  Users,
  Sparkles,
  ArrowRight,
  Plane,
  Bus,
  CheckCircle2,
  Download,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { MOCK_TRIPS } from '../data/mockTrips';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Date picker state - default to 14 de Octubre de 2026 as shown in reference board
  const [day, setDay] = useState('14');
  const [month, setMonth] = useState('10'); // Octubre
  const [year, setYear] = useState('2026');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    navigate(`/buscar?fecha=${formattedDate}`);
  };

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col selection:bg-[#159447] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex items-center justify-center min-h-[90vh]"
      >
        {/* Background Image with Rio Beach / Friends Celebration */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
            alt="Amigos de viaje en las playas de Brasil"
            className="w-full h-full object-cover object-center filter brightness-[0.42] scale-105 animate-subtleZoom"
          />
          {/* Subtle gradient overlay with tropical tones */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D18] via-[#070D18]/70 to-[#070D18]/40" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#070D18]/90" />
        </div>

        {/* Floating Decorative Carnival Feathers & Glow */}
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-[#159447]/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 rounded-full bg-[#F8C62B]/15 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Carnival Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#F8C62B]/30 backdrop-blur-md text-xs sm:text-sm text-[#F8C62B] mb-6 shadow-[0_0_20px_rgba(248,198,43,0.15)] animate-fadeIn">
            <Sparkles size={16} className="text-[#F8C62B]" />
            <span className="font-bold tracking-wide">Plataforma Oficial de Recuerdos Audiovisuales</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white mb-4 leading-[1.08] drop-shadow-lg">
            Tu viaje. <br className="sm:hidden" />
            <span className="text-[#F8C62B]">Tus amigos.</span> <br />
            <span className="text-[#159447]">Tus recuerdos.</span>
          </h1>

          {/* Secondary Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-medium mb-10 leading-relaxed drop-shadow">
            Encontrá las fotos de tu viaje y volvé a vivir cada momento inolvidable de Samba Brasil.
          </p>

          {/* DATE PICKER SEARCH WIDGET */}
          <div
            id="buscar-viaje"
            className="max-w-3xl mx-auto bg-[#0C1424]/90 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              <Calendar size={16} className="text-[#159447]" />
              <span>Seleccioná la fecha de regreso de tu viaje:</span>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
              {/* Day Selector */}
              <div className="w-full md:w-1/4">
                <label className="block text-[11px] font-semibold text-slate-400 text-left mb-1">Día</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm font-semibold focus:outline-none focus:border-[#159447] cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                    <option key={d} value={d} className="bg-[#0C1424]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="w-full md:w-2/4">
                <label className="block text-[11px] font-semibold text-slate-400 text-left mb-1">Mes</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm font-semibold focus:outline-none focus:border-[#159447] cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value} className="bg-[#0C1424]">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="w-full md:w-1/4">
                <label className="block text-[11px] font-semibold text-slate-400 text-left mb-1">Año</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm font-semibold focus:outline-none focus:border-[#159447] cursor-pointer"
                >
                  <option value="2026" className="bg-[#0C1424]">2026</option>
                  <option value="2025" className="bg-[#0C1424]">2025</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <div className="w-full md:w-auto md:self-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(21,148,71,0.4)] hover:shadow-[0_0_35px_rgba(21,148,71,0.6)] transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>BUSCAR MI VIAJE</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#159447]" /> Descargas en alta resolución
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#159447]" /> Acceso 100% gratuito
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. 4 FEATURED BENEFITS (Exact match to reference mockup) */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Benefit 1: Fotos gratis */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#159447]/50 hover:shadow-[0_0_20px_rgba(21,148,71,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center mx-auto mb-3">
              <Camera size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Fotos gratis <br /> de tu viaje
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Descarga inmediata sin costo</p>
          </div>

          {/* Benefit 2: Más fotos en DreamsCDA */}
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

          {/* Benefit 3: Todos los colegios de tu grupo */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#124DA0]/50 hover:shadow-[0_0_20px_rgba(18,77,160,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#124DA0]/20 border border-[#124DA0]/40 text-[#4082e6] flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Todos los colegios <br /> de tu grupo
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Por vuelo y por micro</p>
          </div>

          {/* Benefit 4: Revive la magia del Carnaval */}
          <div className="bg-[#0A121E]/90 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-[#159447]/50 hover:shadow-[0_0_20px_rgba(21,148,71,0.15)] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="font-outfit font-bold text-white text-sm sm:text-base leading-snug">
              Revive la magia <br /> del Carnaval
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Fiestas y excursiones</p>
          </div>

        </div>
      </section>

      {/* 3. CÓMO ENCONTRAR TU VIAJE EN 3 PASOS */}
      <section id="como-funciona" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159447] bg-[#159447]/10 px-3 py-1 rounded-full border border-[#159447]/20">
            Fácil, Rápido y Seguro
          </span>
          <h2 className="font-outfit font-black text-3xl sm:text-5xl text-white mt-3">
            ¿Cómo encontrar tu viaje?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Seguí estos 3 sencillos pasos para revivir y descargar todas las fotografías oficiales de tu viaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-[#159447]/40 transition-all">
            <div className="text-5xl font-black text-white/5 absolute top-4 right-6 group-hover:text-[#159447]/10 transition-colors">
              01
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#159447]/10 border border-[#159447]/30 flex items-center justify-center text-[#159447] mb-6">
              <Calendar size={26} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-white mb-2">Elegí la Fecha</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ingresá el día exacto en que regresó tu contingente en el selector de fecha superior o desde el buscador.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-[#F8C62B]/40 transition-all">
            <div className="text-5xl font-black text-white/5 absolute top-4 right-6 group-hover:text-[#F8C62B]/10 transition-colors">
              02
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#F8C62B]/10 border border-[#F8C62B]/30 text-[#F8C62B] mb-6 flex items-center justify-center">
              <Users size={26} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-white mb-2">Identificá tu Vuelta</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Buscá tu tarjeta de viaje reconociendo tu colegio, coordinador y medio de transporte (vuelo o micro).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-[#124DA0]/40 transition-all">
            <div className="text-5xl font-black text-white/5 absolute top-4 right-6 group-hover:text-[#124DA0]/10 transition-colors">
              03
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#124DA0]/20 border border-[#124DA0]/40 text-[#4082e6] mb-6 flex items-center justify-center">
              <Download size={26} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-white mb-2">Descargá tus Recuerdos</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Explorá la galería completa, seleccioná las mejores tomas con tus amigos y descargalas en calidad original.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ÚLTIMOS VIAJES DISPONIBLES (Featured Trips Preview) */}
      <section className="py-16 bg-[#050A14] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F8C62B]">
                Temporada 2026 en Vivo
              </span>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white mt-1">
                Últimos Viajes Publicados
              </h2>
            </div>
            <button
              onClick={() => navigate('/buscar?fecha=2026-10-14')}
              className="text-xs font-bold text-[#159447] hover:text-[#19ac53] flex items-center gap-1.5 uppercase tracking-wider"
            >
              <span>Ver viajes del 14 de Octubre</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TRIPS.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="bg-[#0C1424] border border-white/10 rounded-3xl overflow-hidden hover:border-[#159447]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={trip.cover_image}
                      alt={trip.code}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C1424] via-transparent to-transparent" />
                    
                    {/* Badge Transport */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-white border border-white/10">
                      {trip.transport_type === 'airplane' ? (
                        <>
                          <Plane size={14} className="text-[#F8C62B]" /> Avión
                        </>
                      ) : (
                        <>
                          <Bus size={14} className="text-[#159447]" /> Micro
                        </>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 bg-[#159447] px-2.5 py-0.5 rounded-full text-[11px] font-black text-white">
                      {trip.photo_count} fotos
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-outfit font-black text-2xl text-white">
                        Viaje {trip.code}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {trip.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      Coordinación: <strong className="text-slate-200">{trip.coordinator_name}</strong>
                    </p>

                    <div className="space-y-1.5 mb-6">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Colegios participantes ({trip.schools.length}):
                      </div>
                      {trip.schools.map((sch) => (
                        <div key={sch.id} className="text-xs text-slate-300 flex items-center justify-between">
                          <span>&bull; {sch.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{sch.pax_count} pax</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate(`/galeria/${trip.code}`)}
                    className="w-full bg-[#159447] hover:bg-[#117739] text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-[0_0_20px_rgba(21,148,71,0.3)] cursor-pointer"
                  >
                    <span>VER FOTOS</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DREAMSCDA COMMERCIAL PROMO BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0C1524] via-[#102038] to-[#0A1628] border border-[#F8C62B]/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#F8C62B]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8C62B]/20 text-[#F8C62B] text-xs font-bold uppercase tracking-wider mb-4 border border-[#F8C62B]/30">
              <Sparkles size={14} /> Catálogo Oficial DreamsCDA
            </div>
            
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white mb-4 leading-tight">
              ¿Querés descubrir más recuerdos de tu viaje?
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Encontrá las fotos profesionales panorámicas, retratos de fiesta y packs de recuerdos en alta definición disponibles en la tienda oficial de DreamsCDA.
            </p>

            <a
              href="https://fotos.dreamscda.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#F8C62B] hover:bg-[#e4b21e] text-black font-outfit font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-[#F8C62B]/25 transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>VER FOTOS PROFESIONALES</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
