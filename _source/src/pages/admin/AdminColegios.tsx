import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Plus, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { Vuelta, Colegio } from '../../types';

export const AdminColegios: React.FC = () => {
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    tripService.getAllTrips().then(setTrips);
  }, []);

  // Collect all schools across trips
  const allSchools: (Colegio & { vuelta_code: string; vuelta_date: string })[] = [];
  trips.forEach((t) => {
    t.schools.forEach((s) => {
      allSchools.push({
        ...s,
        vuelta_code: t.code,
        vuelta_date: t.date,
      });
    });
  });

  const filtered = allSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contract_code.toLowerCase().includes(search.toLowerCase()) ||
      s.vuelta_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
            Colegios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro consolidado de contratos y contingentes escolares.
          </p>
        </div>
      </div>

      <div className="bg-[#0C1424] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por colegio, contrato o vuelta..."
            className="w-full bg-[#121D32] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447]"
          />
        </div>
        <div className="text-slate-400 font-mono text-xs">
          Total: {filtered.length} colegios
        </div>
      </div>

      <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-4 px-4">Contrato</th>
                <th className="pb-4 px-4">Colegio</th>
                <th className="pb-4 px-4">Vuelta Asignada</th>
                <th className="pb-4 px-4">Fecha</th>
                <th className="pb-4 px-4">Pasajeros (Pax)</th>
                <th className="pb-4 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => (
                <tr key={`${s.vuelta_id}-${s.id}`} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#F8C62B] font-bold">
                    {s.contract_code}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-outfit font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                      {s.vuelta_code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {s.vuelta_date}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-mono font-bold">
                    {s.pax_count} pax
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/vueltas/${s.vuelta_code}`}
                      className="text-[#159447] hover:underline font-bold"
                    >
                      Ver vuelta &rarr;
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
