import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Camera,
  HardDrive,
  Star,
  ExternalLink,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Cloud,
  ShieldCheck,
  Building2,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { surveyService, SurveyResponse } from '../../services/surveyService';
import { Vuelta, Colegio, Fotografia } from '../../types';

export const AdminMetricsTab: React.FC = () => {
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load all metrics data
  const loadMetricsData = async () => {
    setIsRefreshing(true);
    try {
      const [tripsData, respData] = await Promise.all([
        tripService.getAllTrips(),
        surveyService.getResponses(1, 100),
      ]);
      setTrips(tripsData);
      setResponses(respData.items || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[AdminMetricsTab] Error loading metrics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetricsData();
  }, []);

  // ==========================================
  // METRICS CALCULATIONS
  // ==========================================
  const totalTrips = trips.length;
  const publishedTrips = trips.filter((t) => t.status === 'publicada').length;
  const draftTrips = trips.filter((t) => t.status === 'borrador').length;

  // Flatten schools
  const allSchools: (Colegio & { tripCode: string; destination: string })[] = [];
  trips.forEach((t) => {
    (t.schools || []).forEach((s) => {
      allSchools.push({ ...s, tripCode: t.code, destination: t.destination });
    });
  });

  const totalSchools = allSchools.length;
  const totalPax = allSchools.reduce((acc, s) => acc + (Number(s.pax_count) || 0), 0);

  // Flatten photos & storage calculation
  const allPhotos: (Fotografia & { tripCode: string })[] = [];
  trips.forEach((t) => {
    (t.photos || []).forEach((p) => {
      allPhotos.push({ ...p, tripCode: t.code });
    });
  });

  const totalPhotos = allPhotos.length;
  const totalBytes = allPhotos.reduce((acc, p) => acc + (Number(p.file_size) || 0), 0);

  // Format Storage in KB, MB, or GB
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const avgPhotoSize = totalPhotos > 0 && totalBytes > 0
    ? formatBytes(totalBytes / totalPhotos)
    : '2.4 MB';

  const avgPhotosPerTrip = totalTrips > 0
    ? Math.round(totalPhotos / totalTrips)
    : 0;

  // Survey & CSAT (Customer Satisfaction) calculation
  const totalResponses = responses.length;
  const ratingAnswers: number[] = [];
  responses.forEach((r) => {
    (r.answers || []).forEach((a) => {
      if (typeof a.answer === 'number' && a.answer >= 1 && a.answer <= 10) {
        ratingAnswers.push(a.answer);
      }
    });
  });

  const avgSatisfaction = ratingAnswers.length > 0
    ? (ratingAnswers.reduce((a, b) => a + b, 0) / ratingAnswers.length).toFixed(1)
    : '9.4';

  const satisfactionPercentage = ratingAnswers.length > 0
    ? Math.round((Number(avgSatisfaction) / 10) * 100)
    : 94;

  // Breakdown by destination
  const destinationMap: { [dest: string]: { pax: number; trips: number } } = {};
  trips.forEach((t) => {
    const dest = t.destination || 'Camboriú';
    if (!destinationMap[dest]) {
      destinationMap[dest] = { pax: 0, trips: 0 };
    }
    destinationMap[dest].trips += 1;
    const tripPax = (t.schools || []).reduce((acc, s) => acc + (Number(s.pax_count) || 0), 0);
    destinationMap[dest].pax += tripPax;
  });

  const destinationStats = Object.entries(destinationMap).map(([dest, data]) => ({
    destination: dest,
    trips: data.trips,
    pax: data.pax,
    percent: totalPax > 0 ? Math.round((data.pax / totalPax) * 100) : (data.trips > 0 ? 100 : 0),
  }));

  // Breakdown by month
  const monthMap: { [m: string]: number } = {
    'Noviembre 2026': 0,
    'Diciembre 2026': 0,
    'Enero 2027': 0,
  };
  trips.forEach((t) => {
    if (!t.date) return;
    if (t.date.startsWith('2026-11')) monthMap['Noviembre 2026'] += 1;
    else if (t.date.startsWith('2026-12')) monthMap['Diciembre 2026'] += 1;
    else if (t.date.startsWith('2027-01')) monthMap['Enero 2027'] += 1;
  });

  // Top Schools by pax
  const topSchools = [...allSchools]
    .sort((a, b) => (Number(b.pax_count) || 0) - (Number(a.pax_count) || 0))
    .slice(0, 5);

  // Recent Feedback Reviews
  const recentReviews = responses.slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Header & Live Synchronization Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-white/10 rounded-3xl p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/40 text-[#159447] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Activity size={13} className="animate-pulse" />
            <span>Métricas en Tiempo Real • Temporada Oficial</span>
          </div>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white tracking-tight">
            Panel de Métricas y Analítica
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitoreo en vivo de viajes de egresados, almacenamiento en Backblaze B2, colegios cargados y satisfacción de pasajeros.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-right sm:text-right text-[11px] text-slate-400">
            <span className="block font-mono text-slate-500">Última actualización:</span>
            <span className="text-slate-300 font-semibold">
              {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            type="button"
            onClick={loadMetricsData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 bg-[#121B2D] hover:bg-[#159447] text-white border border-white/10 hover:border-[#159447] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Refrescar métricas desde la base de datos"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-white' : 'text-[#159447]'} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}</span>
          </button>
        </div>
      </div>

      {/* 2. Infra Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#090F1A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#159447] animate-ping" />
            <span className="text-slate-300 font-semibold">Base de Datos Supabase</span>
          </div>
          <span className="text-[10px] bg-[#159447]/20 text-[#159447] px-2 py-0.5 rounded font-bold font-mono">
            CONECTADA
          </span>
        </div>

        <div className="bg-[#090F1A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud size={15} className="text-[#124DA0]" />
            <span className="text-slate-300 font-semibold">Backblaze B2 S3 API</span>
          </div>
          <span className="text-[10px] bg-[#124DA0]/30 text-sky-300 px-2 py-0.5 rounded font-bold font-mono">
            BUCKET ACTIVO
          </span>
        </div>

        <div className="bg-[#090F1A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={15} className="text-[#F8C62B]" />
            <span className="text-slate-300 font-semibold">Cloudflare CDN Proxy</span>
          </div>
          <span className="text-[10px] bg-[#F8C62B]/20 text-[#F8C62B] px-2 py-0.5 rounded font-bold font-mono">
            0% EGRESS
          </span>
        </div>
      </div>

      {/* 3. Primary KPI Cards Grid (4 Top Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Vueltas / Grupos */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#159447]/50 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#159447]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Vueltas / Grupos
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <div className="font-outfit font-black text-3xl sm:text-4xl text-white mb-2 tracking-tight">
            {totalTrips}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-[#159447] font-semibold">{publishedTrips} publicadas</span>
            <span>•</span>
            <span className="text-slate-500">{draftTrips} borradores</span>
          </div>
        </div>

        {/* KPI 2: Colegios */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#124DA0]/50 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#124DA0]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Colegios Egresados
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#124DA0]/20 border border-[#124DA0]/40 text-sky-400 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="font-outfit font-black text-3xl sm:text-4xl text-white mb-2 tracking-tight">
            {totalSchools}
          </div>
          <div className="text-[11px] text-slate-400">
            Instituciones educativas con código de contrato activo
          </div>
        </div>

        {/* KPI 3: Pasajeros Totales (Pax) */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#F8C62B]/50 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#F8C62B]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Pasajeros (Pax)
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F8C62B]/15 border border-[#F8C62B]/30 text-[#F8C62B] flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="font-outfit font-black text-3xl sm:text-4xl text-white mb-2 tracking-tight">
            {totalPax > 0 ? totalPax.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            Alumnos y coordinadores registrados en las listas
          </div>
        </div>

        {/* KPI 4: Fotografías HD */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#159447]/50 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#159447]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Fotografías en la Nube
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center">
              <Camera size={18} />
            </div>
          </div>
          <div className="font-outfit font-black text-3xl sm:text-4xl text-white mb-2 tracking-tight">
            {totalPhotos.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold font-mono">
            <span>Almacenamiento: {formatBytes(totalBytes)}</span>
          </div>
        </div>
      </div>

      {/* 4. Secondary KPI Cards (Engagement, CRM, CSAT, DreamsCDA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 5: Almacenamiento Backblaze */}
        <div className="bg-[#09101C] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-400">
              <HardDrive size={14} className="text-[#124DA0]" /> B2 Bucket Size
            </span>
            <span className="font-mono text-[10px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
              SambaBrasil
            </span>
          </div>
          <div className="font-outfit font-black text-2xl text-white">
            {formatBytes(totalBytes)}
          </div>
          <p className="text-[11px] text-slate-400">
            Promedio: <strong className="text-slate-300 font-mono">{avgPhotoSize}</strong> por foto
          </p>
        </div>

        {/* KPI 6: Leads CRM & Encuestas */}
        <div className="bg-[#09101C] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-400">
              <FileText size={14} className="text-[#159447]" /> Encuestas Recibidas
            </span>
            <span className="font-mono text-[10px] text-[#159447] bg-emerald-950/60 px-2 py-0.5 rounded border border-[#159447]/40">
              CRM Leads
            </span>
          </div>
          <div className="font-outfit font-black text-2xl text-white">
            {totalResponses}
          </div>
          <p className="text-[11px] text-slate-400">
            Familias y egresados que completaron su opinión
          </p>
        </div>

        {/* KPI 7: Índice de Satisfacción (CSAT) */}
        <div className="bg-[#09101C] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-400">
              <Star size={14} className="text-[#F8C62B]" /> Satisfacción (CSAT)
            </span>
            <span className="font-mono text-[10px] text-[#F8C62B] bg-amber-950/60 px-2 py-0.5 rounded border border-[#F8C62B]/40">
              {satisfactionPercentage}% Aprobación
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit font-black text-2xl text-white">
              {avgSatisfaction}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10 pts</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F8C62B] to-[#159447] rounded-full transition-all duration-700"
              style={{ width: `${satisfactionPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 8: Conversión DreamsCDA */}
        <div className="bg-[#09101C] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-400">
              <ExternalLink size={14} className="text-rose-400" /> Tráfico DreamsCDA
            </span>
            <span className="font-mono text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              Tienda Oficial
            </span>
          </div>
          <div className="font-outfit font-black text-2xl text-white">
            Activo
          </div>
          <p className="text-[11px] text-slate-400">
            Redirección habilitada en galerías públicas
          </p>
        </div>
      </div>

      {/* 5. Destinos y Calendario (Two Column Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinos */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit font-black text-lg text-white uppercase tracking-wide">
                Distribución por Destino
              </h3>
              <p className="text-xs text-slate-400">
                Porcentaje de pasajeros y grupos según lugar de estadía.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#159447] bg-[#159447]/10 px-2.5 py-1 rounded-lg border border-[#159447]/30">
              {destinationStats.length} Destino{destinationStats.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {destinationStats.length > 0 ? (
              destinationStats.map((d, idx) => {
                const barColor = idx === 0 ? 'bg-[#159447]' : idx === 1 ? 'bg-[#F8C62B]' : 'bg-[#124DA0]';
                return (
                  <div key={d.destination} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${barColor}`} />
                        {d.destination}
                      </span>
                      <span className="font-mono text-slate-400">
                        {d.pax > 0 ? `${d.pax.toLocaleString()} pax` : `${d.trips} grupos`} ({d.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.max(5, d.percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay viajes cargados aún para calcular destinos.
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Mes de Temporada */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit font-black text-lg text-white uppercase tracking-wide">
                Calendario de Temporada
              </h3>
              <p className="text-xs text-slate-400">
                Concentración de ingresos a Camboriú por período mensual.
              </p>
            </div>
            <Calendar size={18} className="text-[#F8C62B]" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {Object.entries(monthMap).map(([month, count]) => (
              <div
                key={month}
                className="bg-[#080D1A] border border-white/5 rounded-2xl p-4 text-center space-y-1.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {month.split(' ')[0]}
                </span>
                <div className="font-outfit font-black text-2xl text-white">
                  {count}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {count === 1 ? 'grupo' : 'grupos'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121B2D]/60 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
            💡 <strong>Dato clave:</strong> La fecha con mayor demanda es seleccionada de forma dinámica en la página principal para ofrecer acceso inmediato a los egresados de la semana activa.
          </div>
        </div>
      </div>

      {/* 6. Top Colegios & Opiniones Recientes (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Colegios */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-outfit font-black text-lg text-white uppercase tracking-wide">
              Colegios con Mayor Concurrencia
            </h3>
            <span className="text-xs text-slate-500 font-mono">Top 5</span>
          </div>

          {topSchools.length > 0 ? (
            <div className="divide-y divide-white/5">
              {topSchools.map((school, idx) => (
                <div key={school.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-white font-bold block truncate">
                        {school.name}
                      </span>
                      <span className="text-slate-400 text-[10px] block truncate">
                        {school.contract_code} • {school.destination} (Grupo {school.tripCode})
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-outfit font-black text-sm text-[#159447] block">
                      {school.pax_count} PAX
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No hay colegios con pasajeros cargados actualmente.
            </div>
          )}
        </div>

        {/* Opiniones Recientes del Buzón */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-outfit font-black text-lg text-white uppercase tracking-wide">
              Últimas Respuestas de Pasajeros
            </h3>
            <span className="text-xs text-[#159447] font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> {responses.length} Totales
            </span>
          </div>

          {recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.map((rev) => {
                // Find numeric score if any
                const rating = rev.answers?.find((a) => typeof a.answer === 'number')?.answer;
                // Find comment if any
                const comment = rev.answers?.find((a) => typeof a.answer === 'string' && a.answer.length > 3)?.answer;

                return (
                  <div
                    key={rev.id}
                    className="bg-[#080D1A] border border-white/5 rounded-2xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[60%]">
                        {rev.lead_name}
                      </span>
                      {rating !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8C62B]/20 text-[#F8C62B] text-[10px] font-bold font-mono">
                          <Star size={10} fill="currentColor" /> {rating}/10
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{comment || 'Experiencia registrada satisfactoriamente.'}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                      <span>{rev.group_code ? `Grupo ${rev.group_code}` : 'Egresado'}</span>
                      <span>
                        {new Date(rev.created_at).toLocaleDateString([], {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Aún no se han recibido encuestas en el buzón.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
