import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  MessageSquare,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { surveyService, Survey, AppSettings } from '../services/surveyService';
import { PassengerSurveyModal } from '../components/survey/PassengerSurveyModal';
import { Vuelta, Fotografia } from '../types';

export const GalleryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Vuelta | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<Fotografia | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Survey & Settings state
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [dreamscdaEnabled, setDreamscdaEnabled] = useState(true);

  useEffect(() => {
    async function fetchTripAndSettings() {
      if (!code) return;
      setLoading(true);
      try {
        const [tripData, activeSurveys, appSettings] = await Promise.all([
          tripService.getTripById(code),
          surveyService.getActiveSurveys(),
          surveyService.getSettings(),
        ]);

        setTrip(tripData);
        setDreamscdaEnabled(appSettings?.dreamscda_banner?.enabled ?? true);

        // Check active surveys or specific encuesta from URL
        const encuestaParam = searchParams.get('encuesta');
        if (encuestaParam) {
          const specific = await surveyService.getSurveyById(encuestaParam);
          if (specific) {
            setActiveSurvey(specific);
            setSurveyOpen(true);
          }
        } else if (activeSurveys.length > 0) {
          setActiveSurvey(activeSurveys[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTripAndSettings();
  }, [code, searchParams]);

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

  // All photos without categories or filters ("todas al montón")
  const allPhotos = trip.photos;

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
    if (selectedPhotoIds.size === allPhotos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(allPhotos.map((p) => p.id)));
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
              <div className="w-16 h-16 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center shrink-0">
                <Plane size={32} className="text-[#F8C62B]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F8C62B] block">
                  Vuelo Oficial a Camboriú, Brasil
                </span>
                <h1 className="font-outfit font-black text-2xl sm:text-4xl text-white tracking-tight mt-0.5">
                  Álbum &bull; Ingreso a Camboriú {trip.date}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Coordinación: <strong className="text-slate-200">{trip.coordinator_name}</strong></span>
                  <span>&bull;</span>
                  <span className="text-slate-400 font-mono">Vuelo: {trip.code}</span>
                </div>
              </div>
            </div>

            {/* Center: Colegios List (Highlighted Box) */}
            <div className="bg-[#121D32] border border-[#159447]/40 rounded-2xl p-4 w-full lg:w-auto min-w-[300px]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#159447] uppercase tracking-wider">
                  Colegios de este grupo:
                </span>
                <span className="text-[10px] text-slate-400">Álbum compartido</span>
              </div>
              <ul className="space-y-1">
                {trip.schools.map((sch) => (
                  <li key={sch.id} className="text-xs text-slate-200 flex items-center justify-between gap-4 font-semibold">
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

        {/* SELECTION BAR & PHOTO COUNT (Sin filtros de categorías, todas las fotos juntas al montón) */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#159447] shadow-[0_0_8px_#159447]" />
            <h2 className="font-outfit font-black text-lg text-white">
              Fotografías del Viaje
            </h2>
            <span className="text-xs font-mono text-slate-400 ml-2">
              ({trip.photos.length} fotos)
            </span>
          </div>

          {/* Quick Select All Toggle */}
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <button
              onClick={selectAllPhotos}
              className="hover:text-white underline font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {selectedPhotoIds.size === trip.photos.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
          </div>
        </div>

        {/* PHOTO GRID - TODAS LAS FOTOS JUNTAS AL MONTÓN */}
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {allPhotos.map((photo) => {
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0C1424] rounded-3xl border border-white/10 mb-16">
            <Camera size={36} className="text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No hay fotos publicadas en este álbum todavía</h3>
            <p className="text-xs text-slate-400">Las fotos estarán disponibles en las próximas horas.</p>
          </div>
        )}

        {/* PASSENGER SATISFACTION SURVEY BANNER (Only shown if an active survey exists) */}
        {activeSurvey && (
          <div className="bg-[#0C1524] border border-[#159447]/50 rounded-3xl p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(21,148,71,0.15)] relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(21,148,71,0.3)]">
                <Sparkles size={28} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#159447] block mb-0.5">
                  ENCUESTA DE SATISFACCIÓN DE PASAJEROS
                </span>
                <h3 className="font-outfit font-black text-xl sm:text-2xl text-white uppercase">
                  {activeSurvey.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {activeSurvey.description || 'Contanos cómo fue tu experiencia de viaje con Samba Brasil Channel y ayudanos a seguir mejorando.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSurveyOpen(true)}
              className="w-full md:w-auto bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(21,148,71,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap relative z-10 shrink-0"
            >
              RESPONDER ENCUESTA
            </button>
          </div>
        )}

        {/* DREAMSCDA PROMOTIONAL BLOCK (Controlled by Admin switch) */}
        {dreamscdaEnabled && (
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
        )}

      </div>

      {/* PASSENGER SURVEY MODAL */}
      {activeSurvey && (
        <PassengerSurveyModal
          survey={activeSurvey}
          groupCode={trip.code}
          isOpen={surveyOpen}
          onClose={() => setSurveyOpen(false)}
        />
      )}

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
