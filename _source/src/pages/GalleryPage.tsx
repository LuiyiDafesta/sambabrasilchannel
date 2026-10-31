import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Download,
  Plane,
  Calendar,
  Users,
  ExternalLink,
  Sparkles,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Share2,
  MapPin,
  Check,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { surveyService, Survey } from '../services/surveyService';
import { PassengerSurveyModal } from '../components/survey/PassengerSurveyModal';
import { FlexibleGallery } from '../components/gallery/FlexibleGallery';
import { GroupAccessModal } from '../components/gallery/GroupAccessModal';
import { Vuelta } from '../types';

function formatTripDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    if (!m || !d) return dateStr;
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthName = months[parseInt(m, 10) - 1];
    return `${parseInt(d, 10)} de ${monthName}`;
  } catch {
    return dateStr;
  }
}

export const GalleryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Vuelta | null>(null);
  const [loading, setLoading] = useState(true);

  // Survey & DreamsCDA Settings state
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [dreamscdaEnabled, setDreamscdaEnabled] = useState(true);

  // Group Access Protection state
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Share feedback
  const [shareToast, setShareToast] = useState(false);

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

        // Check if group is already unlocked in this browser
        if (tripData) {
          const cleanCode = tripData.code.trim().toUpperCase().replace(/^#/, '');
          const isSaved = localStorage.getItem(`unlocked_group_${cleanCode}`) === 'true';
          if (isSaved) {
            setIsUnlocked(true);
          }
        }

        // Check active surveys or specific encuesta parameter from URL
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
            className="bg-[#159447] text-white font-bold text-xs uppercase px-6 py-3 rounded-xl cursor-pointer"
          >
            Volver al Buscador
          </button>
        </div>
      </div>
    );
  }

  const schoolsText =
    trip.schools && trip.schools.length > 0
      ? trip.schools.map((s) => s.name).join(', ')
      : trip.code;

  const handleShare = async () => {
    const shareData = {
      title: `Fotos de Viaje - Samba Brasil Channel`,
      text: `Mirá las fotos del viaje de egresados de ${schoolsText} en Samba Brasil Channel`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // Ignorar si el usuario cancela el diálogo nativo
      }
    }

    // Copiar al portapapeles
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pt-28 pb-20 selection:bg-[#159447] selection:text-white relative w-full max-w-full overflow-x-hidden">
      {/* Content wrapper with blur filter when locked */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-all duration-500 ${!isUnlocked
          ? 'filter blur-2xl pointer-events-none select-none max-h-[85vh] overflow-hidden opacity-30'
          : 'opacity-100'
          }`}
      >

            {/* ============================================================ */}
            {/* 1. TOP NAV BAR: VOLVER & COMPARTIR (Imagen de referencia) */}
            {/* ============================================================ */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {/* Botón VOLVER */}
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/buscar');
                  }
                }}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-xs sm:text-sm font-outfit font-black uppercase tracking-wider transition-colors cursor-pointer group"
              >
                <ArrowLeft size={16} className="text-[#159447] group-hover:-translate-x-1 transition-transform" />
                <span>VOLVER</span>
              </button>

              {/* Botón COMPARTIR */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-[#121826] hover:bg-[#159447]/20 border border-white/10 hover:border-[#159447] text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-outfit font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                title="Compartir enlace de este viaje"
              >
                <Share2 size={15} className="text-[#159447]" />
                <span>COMPARTIR</span>
              </button>
            </div>

            {/* Share toast feedback */}
            {shareToast && (
              <div className="fixed top-24 right-6 z-50 bg-[#159447] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slideIn">
                <Check size={16} />
                <span>¡Enlace del viaje copiado para compartir con tus amigos!</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. ALBUM HERO HEADER (Imagen de referencia) */}
            {/* ============================================================ */}
            <div className="space-y-4 pt-2">
              {/* Badge: VIAJE DE EGRESADOS PREMIUM */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/35 text-[#159447] text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <Sparkles size={13} />
                <span>VIAJE DE EGRESADOS PREMIUM</span>
              </div>

              {/* Gran Título con los Colegios del Grupo en Gigante */}
              <h1 className="font-outfit font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.08] break-words">
                {schoolsText}
              </h1>

              {/* Etiquetas / Chips individuales de cada Colegio */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {trip.schools && trip.schools.length > 0 ? (
                  trip.schools.map((sch) => (
                    <span
                      key={sch.id}
                      className="bg-[#121826] border border-white/10 text-slate-100 font-outfit font-bold text-xs uppercase px-3.5 py-1.5 rounded-full tracking-wide shadow-sm"
                    >
                      {sch.name}
                    </span>
                  ))
                ) : (
                  <span className="bg-[#121826] border border-white/10 text-white font-outfit font-bold text-xs uppercase px-3.5 py-1.5 rounded-full tracking-wide">
                    {trip.code}
                  </span>
                )}
              </div>

              {/* Fila de Metadatos: Destino & Fecha de Ingreso */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                {/* Destino */}
                <div className="inline-flex items-center gap-1.5 bg-[#121826]/90 border border-white/10 px-3.5 py-1.5 rounded-xl font-bold text-slate-200 shadow-sm">
                  <MapPin size={14} className="text-[#159447]" />
                  <span className="uppercase">{trip.destination || 'Camboriú'}</span>
                </div>

                {/* Fecha de Ingreso Formateada */}
                <div className="inline-flex items-center gap-1.5 bg-[#121826]/90 border border-white/10 px-3.5 py-1.5 rounded-xl font-bold text-slate-200 shadow-sm">
                  <Calendar size={14} className="text-[#159447]" />
                  <span>{formatTripDate(trip.date)}</span>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PASSENGER SATISFACTION SURVEY BANNER (Only if active survey) */}
            {/* ============================================================ */}
            {activeSurvey && (
              <div className="bg-[#0C1524] border border-[#159447]/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(21,148,71,0.15)] relative overflow-hidden group">
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

            {/* ============================================================ */}
            {/* DREAMSCDA PROMOTIONAL BLOCK (Controlled by Admin switch) */}
            {/* ============================================================ */}
            {dreamscdaEnabled && (
              <div className="bg-gradient-to-r from-[#0C1524] to-[#12213A] border border-[#159447]/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
                <div className="max-w-2xl mx-auto">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#159447] bg-[#159447]/15 px-3 py-1 rounded-full border border-[#159447]/30">
                    Fotos Profesionales HD
                  </span>
                  <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white mt-3 mb-2">
                    ¿Querés descubrir más recuerdos de tu viaje?
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
                    Encontrá las fotos profesionales, retratos individuales y panorámicas exclusivas en DreamsCDA.
                  </p>
                  <a
                    href="https://dreamscda.com.ar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-[#159447]/30 transition-all cursor-pointer"
                  >
                    <span>VER FOTOS PROFESIONALES</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. FLEXIBLE GALLERY (Image 1, 2, 3) */}
            {/* ============================================================ */}
            <FlexibleGallery
              photos={trip.photos || []}
              schools={trip.schools || []}
              tripCode={trip.code}
              tripDate={trip.date}
            />

          </div>

          {/* GROUP ACCESS PROTECTION MODAL */}
          <GroupAccessModal
            isOpen={!isUnlocked}
            tripCode={trip.code}
            schools={trip.schools || []}
            onSuccess={() => setIsUnlocked(true)}
            onClose={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/buscar');
              }
            }}
          />

          {/* PASSENGER SURVEY MODAL */}
          {activeSurvey && isUnlocked && (
            <PassengerSurveyModal
              survey={activeSurvey}
              groupCode={trip.code}
              isOpen={surveyOpen}
              onClose={() => setSurveyOpen(false)}
            />
          )}
        </div>
  );
};
