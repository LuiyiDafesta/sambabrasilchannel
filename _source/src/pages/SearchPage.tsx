import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Plane,
  Bus,
  ArrowRight,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { Vuelta } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected date from query param, defaults to 2026-10-14
  const queryDate = searchParams.get('fecha') || '2026-10-14';
  const [selectedDate, setSelectedDate] = useState(queryDate);
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      const results = await tripService.getTripsByDate(selectedDate);
      setTrips(results);
      setLoading(false);
    }
    loadTrips();
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSearchParams({ fecha: newDate });
  };

  // Helper to format date display e.g. "14 de Octubre de 2026"
  const formatDateTitle = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} de ${monthName} de ${y}`;
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pt-28 pb-20 selection:bg-[#159447] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-[#159447] font-semibold">Búsqueda de Viajes</span>
        </div>

        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F8C62B] bg-[#F8C62B]/10 px-3 py-1 rounded-full border border-[#F8C62B]/20">
            Encontrá Tu Contingente
          </span>
          <h1 className="font-outfit font-black text-3xl sm:text-5xl text-white mt-3 mb-2">
            Viajes del {formatDateTitle(selectedDate)}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Seleccioná tu viaje para ver las fotos oficiales y revivir cada momento.
          </p>
        </div>

        {/* Date Switcher Bar */}
        <div className="max-w-xl mx-auto bg-[#0C1424] border border-white/10 rounded-2xl p-3 mb-12 shadow-xl flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              handleDateChange(d.toISOString().split('T')[0]);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Día anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <Calendar size={18} className="text-[#159447]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-white font-bold text-sm sm:text-base focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              handleDateChange(d.toISOString().split('T')[0]);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Día siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Buscando viajes disponibles...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-[#0C1424] border border-white/15 rounded-3xl overflow-hidden hover:border-[#159447] shadow-xl hover:shadow-[0_0_30px_rgba(21,148,71,0.2)] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Trip Card Cover Image */}
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={trip.cover_image}
                      alt={trip.code}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C1424] via-[#0C1424]/30 to-transparent" />
                    
                    {/* Transport Badge */}
                    <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 text-white border border-white/20">
                      {trip.transport_type === 'airplane' ? (
                        <>
                          <Plane size={16} className="text-[#F8C62B]" />
                          <span>Avión</span>
                        </>
                      ) : (
                        <>
                          <Bus size={16} className="text-[#159447]" />
                          <span>Micro</span>
                        </>
                      )}
                    </div>

                    {/* Photos Count Badge */}
                    <div className="absolute top-4 right-4 bg-[#159447] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                      {trip.photo_count || trip.photos.length} FOTOS
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                        Viaje {trip.code}
                      </h2>
                      <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        {trip.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-6">
                      Coordinador: <strong className="text-white font-semibold">{trip.coordinator_name}</strong>
                    </p>

                    {/* Colegios List */}
                    <div className="bg-[#121D32] border border-white/5 rounded-2xl p-4 mb-6">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Colegios en este viaje ({trip.schools.length}):</span>
                        <span className="text-slate-300 font-mono">{trip.total_pax} pax</span>
                      </div>
                      <ul className="space-y-1.5">
                        {trip.schools.map((sch) => (
                          <li
                            key={sch.id}
                            className="text-xs text-slate-200 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#159447]" />
                              {sch.name}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono">({sch.pax_count} pax)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Button */}
                <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                  <button
                    onClick={() => navigate(`/galeria/${trip.code}`)}
                    className="w-full bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#159447]/30 hover:shadow-[#159447]/50 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>VER FOTOS</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State matching specified prompt wording */
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-[#0C1424] border border-white/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-[#F8C62B]/10 border border-[#F8C62B]/30 flex items-center justify-center text-[#F8C62B] mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-white mb-2">
              Sin viajes registrados
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Todavía no encontramos viajes para esta fecha. Revisá el día seleccionado e intentá nuevamente.
            </p>
            <button
              onClick={() => handleDateChange('2026-10-14')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
            >
              Ver viajes del 14 de Octubre de 2026
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
