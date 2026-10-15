import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  Users,
  Camera,
  Download,
  Eye,
  ExternalLink,
  Plus,
  Plane,
  Bus,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { AdminStats, Vuelta } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [s, t] = await Promise.all([tripService.getStats(), tripService.getAllTrips()]);
      setStats(s);
      setTrips(t);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs">Cargando métricas de administración...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Vueltas Registradas', value: stats.vueltas_total, icon: Compass, color: 'text-[#159447]', bg: 'bg-[#159447]/10' },
    { label: 'Colegios Participantes', value: stats.colegios_total, icon: GraduationCap, color: 'text-[#F8C62B]', bg: 'bg-[#F8C62B]/10' },
    { label: 'Total Pasajeros (Pax)', value: stats.pax_total.toLocaleString(), icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Fotos Publicadas', value: stats.fotos_total.toLocaleString(), icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Visitas a Galerías', value: stats.visitas_total.toLocaleString(), icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Descargas Realizadas', value: stats.descargas_total.toLocaleString(), icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Clics hacia DreamsCDA', value: stats.clicks_dreamscda.toLocaleString(), icon: ExternalLink, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
            Dashboard de Coordinación
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumen global de contingentes, álbumes y descargas de la temporada 2026.
          </p>
        </div>

        <Link
          to="/admin/vueltas"
          className="bg-[#159447] hover:bg-[#117739] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#159447]/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Nueva Vuelta</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#0C1424] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </span>
              </div>
              <div>
                <div className="font-outfit font-black text-xl text-white mb-0.5">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Trips Table */}
      <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-outfit font-bold text-lg text-white">Vueltas Recientes</h2>
            <p className="text-xs text-slate-400">Estado de contingentes y galerías en vivo</p>
          </div>
          <Link
            to="/admin/vueltas"
            className="text-xs text-[#159447] hover:underline font-bold flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">N° Vuelta</th>
                <th className="pb-3 px-3">Fecha</th>
                <th className="pb-3 px-3">Transporte</th>
                <th className="pb-3 px-3">Coordinador</th>
                <th className="pb-3 px-3">Colegios</th>
                <th className="pb-3 px-3">Pax</th>
                <th className="pb-3 px-3">Estado</th>
                <th className="pb-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trips.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-outfit font-bold text-white">
                    {t.code}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {t.date}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {t.transport_type === 'airplane' ? (
                        <>
                          <Plane size={14} className="text-[#F8C62B]" /> Avión
                        </>
                      ) : (
                        <>
                          <Bus size={14} className="text-[#159447]" /> Micro
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {t.coordinator_name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {t.schools.length} colegios
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {t.total_pax || t.schools.reduce((a, s) => a + s.pax_count, 0)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'publicada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : t.status === 'borrador'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/vueltas/${t.code}`}
                      className="text-[#159447] hover:text-[#117739] font-bold text-xs"
                    >
                      Gestionar &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
