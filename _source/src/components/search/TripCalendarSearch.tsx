import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plane,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Search,
  MapPin,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { Vuelta } from '../../types';

interface TripCalendarSearchProps {
  initialMonth?: '2026-11' | '2026-12' | '2027-01';
  initialDate?: string;
  onSelectTrip?: (trip: Vuelta) => void;
  className?: string;
}

export const TripCalendarSearch: React.FC<TripCalendarSearchProps> = ({
  initialMonth = '2026-11',
  initialDate,
  onSelectTrip,
  className = '',
}) => {
  const navigate = useNavigate();

  // Season restricted strictly to Noviembre, Diciembre, Enero
  const availableMonths = [
    { key: '2026-11', label: 'Noviembre 2026', shortLabel: 'Nov 2026', year: 2026, month: 11, daysCount: 30, startDayOfWeek: 7 }, // 1 Nov 2026 is Domingo (7)
    { key: '2026-12', label: 'Diciembre 2026', shortLabel: 'Dic 2026', year: 2026, month: 12, daysCount: 31, startDayOfWeek: 2 }, // 1 Dic 2026 is Martes (2)
    { key: '2027-01', label: 'Enero 2027', shortLabel: 'Ene 2027', year: 2027, month: 1, daysCount: 31, startDayOfWeek: 5 }, // 1 Ene 2027 is Viernes (5)
  ] as const;

  const [allTrips, setAllTrips] = useState<Vuelta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(initialMonth);
  // Default selected date if within current month, or the first trip of that month
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    if (initialDate) {
      const parts = initialDate.split('-');
      return parseInt(parts[2], 10);
    }
    return 12; // 12 Noviembre default
  });

  // School name filter
  const [schoolFilter, setSchoolFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    tripService.getAllTrips().then((data) => {
      if (isMounted) {
        setAllTrips(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentMonthData = availableMonths.find((m) => m.key === selectedMonthKey) || availableMonths[0];

  // Map trips loaded for this month from real database trips
  const tripsThisMonth = allTrips.filter((t) => t.date.startsWith(selectedMonthKey));

  // Find trips for selected day
  const formattedSelectedDate = selectedDay
    ? `${selectedMonthKey}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const tripsOnSelectedDay = tripsThisMonth.filter((t) => t.date === formattedSelectedDate);

  // Trips matching school search filter
  const schoolFilteredTrips = schoolFilter.trim()
    ? allTrips.filter((t) =>
        t.schools.some((s) => s.name.toLowerCase().includes(schoolFilter.toLowerCase()))
      )
    : [];

  const handleSelectTrip = (trip: Vuelta) => {
    if (onSelectTrip) {
      onSelectTrip(trip);
    } else {
      navigate(`/galeria/${trip.code}`);
    }
  };

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    // Find first trip of this month
    const firstTrip = allTrips.find((t) => t.date.startsWith(monthKey));
    if (firstTrip) {
      const dayNum = parseInt(firstTrip.date.split('-')[2], 10);
      setSelectedDay(dayNum);
    } else {
      setSelectedDay(null);
    }
  };

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  return (
    <div className={`bg-[#0C1424]/95 border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl ${className}`}>
      
      {/* Destination & Season Badge Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#159447]/20 border border-[#159447]/40 flex items-center justify-center text-[#159447]">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8C62B]">
              Destino Oficial Exclusivo
            </span>
            <h3 className="font-outfit font-black text-lg text-white flex items-center gap-2">
              Camboriú, Brasil
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#124DA0]/40 text-sky-300 border border-[#124DA0]">
                Vuelos Privados
              </span>
            </h3>
          </div>
        </div>

        {/* Quick School Finder Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            placeholder="Buscá tu colegio directamente..."
            className="w-full bg-[#121D32] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447] transition-all"
          />
        </div>
      </div>

      {/* If filtering by school name, show instant results */}
      {schoolFilter.trim() ? (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resultados para colegios con "{schoolFilter}":</span>
            <button
              onClick={() => setSchoolFilter('')}
              className="text-[#F8C62B] hover:underline"
            >
              Volver al calendario
            </button>
          </div>

          {schoolFilteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolFilteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip)}
                  className="bg-[#121D32] hover:bg-[#15243e] border border-[#159447]/40 hover:border-[#159447] rounded-2xl p-5 cursor-pointer transition-all shadow-lg hover:shadow-[0_0_25px_rgba(21,148,71,0.25)] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#F8C62B]">
                      <Plane size={15} /> Vuelo a Camboriú
                    </span>
                    <span className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                      {trip.date}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Colegios en este vuelo:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.schools.map((sch) => (
                        <span
                          key={sch.id}
                          className="px-2.5 py-1 rounded-lg bg-[#0C1424] text-white font-bold text-xs border border-white/10 group-hover:border-[#159447]/60"
                        >
                          {sch.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-[#159447] group-hover:text-emerald-400 flex items-center justify-between pt-2 border-t border-white/5">
                    <span>INGRESAR A LAS FOTOS DEL GRUPO</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#121D32] rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400">
                No encontramos colegios registrados con ese nombre. Probá seleccionando el mes y día en el calendario.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* STEP 1: SELECT MONTH (Noviembre 2026 / Diciembre 2026 / Enero 2027) */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Seleccioná el mes de ingreso a Camboriú:
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {availableMonths.map((m) => {
                const isSelected = selectedMonthKey === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleMonthChange(m.key)}
                    className={`py-3 sm:py-3.5 px-3 rounded-2xl font-outfit font-black text-xs sm:text-sm uppercase tracking-wider transition-all text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-[#159447] text-white border-[#159447] shadow-[0_0_20px_rgba(21,148,71,0.35)] scale-[1.02]'
                        : 'bg-[#121D32] hover:bg-[#16243d] text-slate-300 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="hidden sm:inline">{m.label}</span>
                    <span className="sm:hidden">{m.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CALENDAR GRID FOR SELECTED MONTH */}
          <div className="mb-6 bg-[#090F1C] border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#159447]" />
                <h4 className="font-outfit font-bold text-sm sm:text-base text-white">
                  Calendario de Ingresos &bull; {currentMonthData.label}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#159447] shadow-[0_0_8px_#159447]" />
                Días de ingreso a Camboriú
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-bold text-slate-500 uppercase">
              {weekDays.map((wd) => (
                <div key={wd} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Offset for start of month */}
              {Array.from({ length: currentMonthData.startDayOfWeek - 1 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12" />
              ))}

              {/* Days of month */}
              {Array.from({ length: currentMonthData.daysCount }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${selectedMonthKey}-${String(dayNum).padStart(2, '0')}`;
                const hasTrips = tripsThisMonth.some((t) => t.date === dateStr);
                const isSelected = selectedDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center font-outfit text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#159447] text-white shadow-[0_0_15px_rgba(21,148,71,0.4)] ring-2 ring-white/60 z-10'
                        : hasTrips
                        ? 'bg-[#121D32] hover:bg-[#182845] text-white border border-[#159447]/60'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasTrips && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-[#159447] shadow-[0_0_6px_#159447]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: FLIGHTS & SCHOOLS FOR THE SELECTED DAY */}
          {selectedDay && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                3. Vuelos con ingreso el {selectedDay} de {currentMonthData.label}:
              </label>

              {tripsOnSelectedDay.length > 0 ? (
                <div className="space-y-4">
                  {tripsOnSelectedDay.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => handleSelectTrip(trip)}
                      className="bg-gradient-to-r from-[#121D32] to-[#0E1728] border-2 border-[#159447] rounded-3xl p-5 sm:p-7 shadow-xl hover:shadow-[0_0_30px_rgba(21,148,71,0.3)] transition-all cursor-pointer group transform hover:-translate-y-0.5"
                    >
                      {/* Flight Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#159447]/20 text-[#159447] flex items-center justify-center">
                            <Plane size={22} className="text-[#F8C62B]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8C62B]">
                              Vuelo Oficial a Camboriú
                            </span>
                            <h4 className="font-outfit font-black text-lg text-white">
                              Ingreso a Camboriú: {selectedDay} de {currentMonthData.label}
                            </h4>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 sm:text-right font-mono">
                          {trip.photos.length || trip.photo_count} fotos disponibles
                        </div>
                      </div>

                      {/* PROMINENT RECUADRO DE COLEGIOS PARTICIPANTES */}
                      <div className="bg-[#080E1B] border border-white/10 rounded-2xl p-4 sm:p-5 mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-outfit font-bold text-xs uppercase tracking-wider text-[#159447] flex items-center gap-1.5">
                            <Users size={14} /> Colegios de este grupo:
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Las fotos son para todos los colegios del grupo)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {trip.schools.map((sch) => (
                            <div
                              key={sch.id}
                              className="bg-[#121D32] border border-white/10 rounded-xl p-3 flex items-center justify-between group-hover:border-[#159447]/50 transition-colors"
                            >
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {sch.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {sch.pax_count} pax
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        className="w-full bg-[#159447] group-hover:bg-[#117739] text-white font-outfit font-black text-sm uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#159447]/30"
                      >
                        <span>INGRESAR A LAS FOTOS DE MI GRUPO</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#090F1C] rounded-2xl border border-white/10 px-4">
                  <p className="text-xs sm:text-sm text-slate-400 mb-2">
                    No hay vuelos programados para el <strong className="text-white">{selectedDay} de {currentMonthData.label}</strong>.
                  </p>
                  <p className="text-xs text-[#F8C62B]">
                    Hacé clic en los días marcados con punto verde en el calendario.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
};
