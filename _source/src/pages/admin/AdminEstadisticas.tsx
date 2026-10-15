import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Download, Eye, ExternalLink, Calendar } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { AdminStats } from '../../types';

export const AdminEstadisticas: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    tripService.getStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
          Estadísticas y Métricas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rendimiento audiovisual de la temporada, descargas y conversión comercial hacia DreamsCDA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2">
            <Eye size={16} className="text-[#159447]" /> Tráfico a Galerías
          </div>
          <div className="font-outfit font-black text-4xl text-white mb-2">
            {stats.visitas_total.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Total de visualizaciones acumuladas en álbumes de viaje.</p>
        </div>

        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2">
            <Download size={16} className="text-[#F8C62B]" /> Descargas Gratuitas
          </div>
          <div className="font-outfit font-black text-4xl text-white mb-2">
            {stats.descargas_total.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Archivos en alta resolución guardados por pasajeros y familias.</p>
        </div>

        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2">
            <ExternalLink size={16} className="text-sky-400" /> Conversión DreamsCDA
          </div>
          <div className="font-outfit font-black text-4xl text-white mb-2">
            {stats.clicks_dreamscda.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Clics dirigidos a la tienda de fotografías oficiales.</p>
        </div>
      </div>

      <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8">
        <h3 className="font-outfit font-bold text-lg text-white mb-4">Participación por Destino</h3>
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Rio de Janeiro & Arraial do Cabo</span>
              <span className="font-mono">68% de pasajeros (1,930 pax)</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#159447] rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Búzios & Cabo Frío</span>
              <span className="font-mono">32% de pasajeros (910 pax)</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#F8C62B] rounded-full" style={{ width: '32%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
