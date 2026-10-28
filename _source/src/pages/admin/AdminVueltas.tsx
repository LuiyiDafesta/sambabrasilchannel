import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Plane,
  Bus,
  Search,
  Filter,
  X,
  CheckCircle2,
  Calendar,
  Users,
  Compass,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { Vuelta, TransportType, VueltaStatus } from '../../types';

export const AdminVueltas: React.FC = () => {
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [search, setSearch] = useState('');
  const [filterTransport, setFilterTransport] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [date, setDate] = useState('2026-10-17');
  const [transportType, setTransportType] = useState<TransportType>('airplane');
  const [coordinatorName, setCoordinatorName] = useState('Juan Pérez');
  const [status, setStatus] = useState<VueltaStatus>('publicada');

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    const data = await tripService.getAllTrips();
    setTrips(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await tripService.createVuelta({
      code: code.toUpperCase() || `SB-${Math.floor(100 + Math.random() * 900)}`,
      date,
      transport_type: transportType,
      coordinator_name: coordinatorName,
      status,
      schools: [],
      photos: [],
    });
    setShowModal(false);
    setCode('');
    loadTrips();
  };

  const filtered = trips.filter((t) => {
    const matchesSearch =
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.coordinator_name.toLowerCase().includes(search.toLowerCase()) ||
      t.schools.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));

    const matchesTransport =
      filterTransport === 'all' || t.transport_type === filterTransport;

    return matchesSearch && matchesTransport;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header matching reference board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
            Vueltas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Listado maestro de vuelos y micros programados para la temporada.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#124DA0] hover:bg-[#0f4085] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Nueva Vuelta</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0C1424] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, colegio o coordinador..."
            className="w-full bg-[#121D32] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-500" />
          <select
            value={filterTransport}
            onChange={(e) => setFilterTransport(e.target.value)}
            className="bg-[#121D32] border border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los transportes</option>
            <option value="airplane">Solo Avión</option>
            <option value="bus">Solo Micro</option>
          </select>
        </div>
      </div>

      {/* Main Table Matching Reference Mockup */}
      <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-4 px-4">N° Vuelta</th>
                <th className="pb-4 px-4">Fecha</th>
                <th className="pb-4 px-4">Transporte</th>
                <th className="pb-4 px-4">Coordinador</th>
                <th className="pb-4 px-4">Colegios</th>
                <th className="pb-4 px-4">Pax</th>
                <th className="pb-4 px-4">Estado</th>
                <th className="pb-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-outfit font-bold text-white text-sm">
                    {t.code}
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-mono">
                    {t.date}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {t.transport_type === 'airplane' ? (
                        <>
                          <Plane size={15} className="text-[#F8C62B]" /> Avión
                        </>
                      ) : (
                        <>
                          <Bus size={15} className="text-[#159447]" /> Micro
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-200">
                    {t.coordinator_name}
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-mono">
                    {t.schools.length}
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-mono">
                    {t.total_pax || t.schools.reduce((a, s) => a + s.pax_count, 0)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'publicada'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'borrador'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/admin/vueltas/${t.code}`}
                      className="inline-flex items-center gap-1 text-[#159447] hover:text-[#117739] font-bold text-xs bg-[#159447]/10 hover:bg-[#159447]/20 px-3 py-1.5 rounded-lg border border-[#159447]/30 transition-all"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Vuelta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1320] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <h3 className="font-outfit font-black text-xl text-white mb-4 flex items-center gap-2">
              <Compass size={22} className="text-[#159447]" /> Nueva Vuelta
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Código de Vuelta (ej. SB-107)</label>
                <input
                  type="text"
                  required
                  placeholder="SB-107"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white uppercase focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fecha de Ingreso a Camboriú</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Transporte</label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value as TransportType)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                >
                  <option value="airplane">Avión (Vuelo Privado)</option>
                  <option value="bus">Micro (Larga Distancia)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coordinador a Cargo</label>
                <input
                  type="text"
                  required
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estado Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VueltaStatus)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                >
                  <option value="publicada">Publicada (Visible para familias)</option>
                  <option value="borrador">Borrador (Oculta mientras se cargan fotos)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#159447] hover:bg-[#117739] text-white font-bold py-3 rounded-xl uppercase tracking-wider transition-all"
                >
                  Crear y Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
