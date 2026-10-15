import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Plane,
  Bus,
  CheckCircle2,
  Calendar,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Share2,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { Vuelta, Fotografia } from '../types';

export const GalleryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Vuelta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todas' | 'momentos' | 'destino' | 'carnaval'>('todas');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<Fotografia | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      if (!code) return;
      setLoading(true);
      const data = await tripService.getTripById(code);
      setTrip(data);
      setLoading(false);
    }
    fetchTrip();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Cargando álbum fotográfico...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-white px-4">
        <div className="max-w-md text-center py-16 px-6 bg-[#0C1424] border border-white/10 rounded-3xl">
          <h2 className="font-outfit font-black text-2xl text-white mb-2">Álbum no encontrado</h2>
          <p className="text-slate-400 text-sm mb-6">El viaje solicitado no existe o no tiene fotografías publicadas aún.</p>
          <button
            onClick={() => navigate('/buscar')}
            className="bg-[#159447] text-white font-bold text-xs uppercase px-6 py-3 rounded-xl"
          >
            Volver al Buscador
          </button>
        </div>
      </div>
    );
  }

  // Filter photos based on active category tab
  const filteredPhotos = trip.photos.filter((p) => {
    if (activeTab === 'todas') return true;
    return p.category === activeTab;
  });

  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedPhotoIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPhotoIds(next);
  };

  const selectAllPhotos = () => {
    if (selectedPhotoIds.size === filteredPhotos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  const handleDownloadSelected = () => {
    if (selectedPhotoIds.size === 0) return;
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pt-28 pb-20 selection:bg-[#159447] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={`/buscar?fecha=${trip.date}`} className="hover:text-white transition-colors">
            {trip.date}
          </Link>
          <span>/</span>
          <span className="text-[#159447] font-semibold">Viaje {trip.code}</span>
        </div>

        {/* ALBUM HEADER SECTION (Matching reference board) */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Transport Icon + Title + Coordinator */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#124DA0]/20 border border-[#124DA0]/40 text-[#4082e6] flex items-center justify-center shrink-0">
                {trip.transport_type === 'airplane' ? <Plane size={32} className="text-[#F8C62B]" /> : <Bus size={32} className="text-[#159447]" />}
              </div>
              <div>
                <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
                  Viaje {trip.code}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar size={13} className="text-[#159447]" /> {trip.date}
                  </span>
                  <span>&bull;</span>
                  <span>Coordinador: <strong className="text-slate-200">{trip.coordinator_name}</strong></span>
                </div>
              </div>
            </div>

            {/* Center: Colegios List */}
            <div className="bg-[#121D32] border border-white/5 rounded-2xl p-4 w-full lg:w-auto min-w-[280px]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Colegios en este viaje:
              </div>
              <ul className="space-y-1">
                {trip.schools.map((sch) => (
                  <li key={sch.id} className="text-xs text-slate-200 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159447]" />
                      {sch.name}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">({sch.pax_count} pax)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Download Actions & Available Photos */}
            <div className="flex flex-col items-start lg:items-end w-full lg:w-auto shrink-0">
              <button
                onClick={handleDownloadSelected}
                disabled={selectedPhotoIds.size === 0}
                className={`w-full lg:w-auto font-outfit font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  selectedPhotoIds.size > 0
                    ? 'bg-[#159447] hover:bg-[#117739] text-white shadow-lg shadow-[#159447]/30 cursor-pointer transform hover:-translate-y-0.5'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Download size={16} />
                <span>
                  Descargar {selectedPhotoIds.size > 0 ? `(${selectedPhotoIds.size}) seleccionadas` : 'fotos seleccionadas'}
                </span>
              </button>
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {trip.photo_count || trip.photos.length} fotos disponibles
              </span>
            </div>

          </div>

          {/* Download feedback notification */}
          {downloadSuccess && (
            <div className="mt-4 p-3 bg-[#159447]/20 border border-[#159447] rounded-xl text-xs text-[#159447] flex items-center gap-2 animate-fadeIn font-semibold">
              <CheckCircle2 size={16} />
              ¡Iniciando descarga en alta calidad de las fotografías seleccionadas!
            </div>
          )}
        </div>

        {/* FILTER TABS & SELECTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center bg-[#0C1424] p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('todas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'todas'
                  ? 'bg-[#124DA0] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas las fotos
            </button>
            <button
              onClick={() => setActiveTab('momentos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'momentos'
                  ? 'bg-[#124DA0] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Momentos del viaje
            </button>
            <button
              onClick={() => setActiveTab('destino')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'destino'
                  ? 'bg-[#124DA0] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              En el destino
            </button>
            <button
              onClick={() => setActiveTab('carnaval')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'carnaval'
                  ? 'bg-[#124DA0] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Carnaval & Fiestas
            </button>
          </div>

          {/* Quick Select All Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-400">
            <button
              onClick={selectAllPhotos}
              className="hover:text-white underline font-semibold cursor-pointer"
            >
              {selectedPhotoIds.size === filteredPhotos.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
          </div>
        </div>

        {/* PHOTO GRID */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {filteredPhotos.map((photo) => {
              const isSelected = selectedPhotoIds.has(photo.id);
              return (
                <div
                  key={photo.id}
                  onClick={() => setActiveLightboxPhoto(photo)}
                  className={`relative group rounded-2xl overflow-hidden aspect-[4/3] bg-[#0A101A] border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-[#159447] ring-2 ring-[#159447] shadow-[0_0_20px_rgba(21,148,71,0.3)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Selection Checkbox on Top Right */}
                  <button
                    onClick={(e) => toggleSelectPhoto(photo.id, e)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#159447] text-white shadow-md'
                        : 'bg-black/60 text-white/50 border border-white/20 hover:border-white group-hover:opacity-100 sm:opacity-0'
                    }`}
                  >
                    <Check size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  {/* Category Badge on Bottom Left */}
                  <div className="absolute bottom-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.category}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0C1424] rounded-3xl border border-white/10 mb-16">
            <Camera size={36} className="text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No hay fotos en esta categoría</h3>
            <p className="text-xs text-slate-400">Probá seleccionando la pestaña "Todas las fotos".</p>
          </div>
        )}

        {/* DREAMSCDA PROMOTIONAL BLOCK */}
        <div className="bg-gradient-to-r from-[#0C1524] to-[#12213A] border border-[#F8C62B]/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F8C62B] bg-[#F8C62B]/15 px-3 py-1 rounded-full border border-[#F8C62B]/30">
              Fotos Profesionales HD
            </span>
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white mt-3 mb-2">
              ¿Querés descubrir más recuerdos de tu viaje?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              Encontrá las fotos profesionales, retratos individuales y panorámicas exclusivas en DreamsCDA.
            </p>
            <a
              href="https://fotos.dreamscda.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F8C62B] hover:bg-[#e4b21e] text-black font-outfit font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-[#F8C62B]/20 transition-all cursor-pointer"
            >
              <span>VER FOTOS PROFESIONALES</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {activeLightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn">
          {/* Top Bar with actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
            <span className="text-xs font-mono text-slate-300 truncate max-w-xs">
              {activeLightboxPhoto.filename}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={activeLightboxPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-white/10 hover:bg-[#159447] text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
                title="Descargar imagen"
              >
                <Download size={18} />
              </a>
              <button
                onClick={() => setActiveLightboxPhoto(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Large Image Preview */}
          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={activeLightboxPhoto.url}
              alt={activeLightboxPhoto.filename}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
