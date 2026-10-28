import React, { useState, useEffect } from 'react';
import { Camera, ExternalLink, Trash2 } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { Vuelta, Fotografia } from '../../types';

export const AdminFotografias: React.FC = () => {
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [selectedVuelta, setSelectedVuelta] = useState<string>('all');

  const loadAll = () => {
    tripService.getAllTrips().then(setTrips);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta fotografía del repositorio?')) return;
    await tripService.deletePhoto(photoId);
    loadAll();
  };

  const allPhotos: (Fotografia & { vuelta_code: string })[] = [];
  trips.forEach((t) => {
    t.photos.forEach((p) => {
      allPhotos.push({ ...p, vuelta_code: t.code });
    });
  });

  const filtered = allPhotos.filter((p) => {
    if (selectedVuelta === 'all') return true;
    return p.vuelta_code === selectedVuelta;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
            Repositorio de Fotografías
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión centralizada de imágenes para administradores autorizados.
          </p>
        </div>

        <select
          value={selectedVuelta}
          onChange={(e) => setSelectedVuelta(e.target.value)}
          className="bg-[#121D32] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#159447]"
        >
          <option value="all">Todas las vueltas</option>
          {trips.map((t) => (
            <option key={t.id} value={t.code}>
              {t.code} ({t.photos.length} fotos)
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
          <span>Mostrando {filtered.length} fotografías</span>
          <span className="text-emerald-400 font-mono">CDN: cdn.sambabrasilchannel.com.ar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 relative group">
              <img src={p.url} alt={p.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between text-[10px]">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-300 font-mono truncate">{p.filename}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p.id)}
                    className="p-1 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Eliminar foto"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="bg-[#124DA0] text-white px-1.5 py-0.5 rounded font-bold">{p.vuelta_code}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#159447]">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
