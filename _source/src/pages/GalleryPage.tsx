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
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { surveyService, Survey } from '../services/surveyService';
import { PassengerSurveyModal } from '../components/survey/PassengerSurveyModal';
import { FlexibleGallery } from '../components/gallery/FlexibleGallery';
import { Vuelta } from '../types';

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

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pt-28 pb-20 selection:bg-[#159447] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={`/buscar?fecha=${trip.date}`} className="hover:text-white transition-colors">
            {trip.date}
          </Link>
          <span>/</span>
          <span className="text-[#159447] font-semibold">Viaje {trip.code}</span>
        </div>

        {/* ============================================================ */}
        {/* ALBUM HEADER SECTION */}
        {/* ============================================================ */}
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Transport Icon + Title + Coordinator */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center shrink-0">
                <Plane size={32} className="text-[#159447]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#159447] block">
                  Vuelo Oficial a Camboriú, Brasil
                </span>
                <h1 className="font-outfit font-black text-2xl sm:text-4xl text-white tracking-tight mt-0.5">
                  Álbum &bull; Ingreso a Camboriú {trip.date}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Coordinación: <strong className="text-slate-200">{trip.coordinator_name || 'Staff Samba Brasil'}</strong></span>
                  <span>&bull;</span>
                  <span className="text-slate-400 font-mono">Código: <strong className="text-[#159447]">{trip.code}</strong></span>
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
                {trip.schools && trip.schools.length > 0 ? (
                  trip.schools.map((sch) => (
                    <li key={sch.id} className="text-xs text-slate-200 flex items-center justify-between gap-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#159447]" />
                        {sch.name}
                      </span>
                      {sch.pax_count ? (
                        <span className="text-slate-400 text-[11px] font-mono">({sch.pax_count} pax)</span>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-300 font-bold uppercase">{trip.code}</li>
                )}
              </ul>
            </div>

            {/* Right: Quick shortcut badge */}
            <div className="flex flex-col items-start lg:items-end w-full lg:w-auto shrink-0">
              <span className="bg-[#159447]/15 border border-[#159447]/40 text-[#159447] text-xs font-bold uppercase px-4 py-2 rounded-xl">
                {trip.photos?.length || 0} fotos HD disponibles
              </span>
              <span className="text-[11px] text-slate-400 mt-1.5 font-mono">
                Descarga en ZIP o individuales
              </span>
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
                href="https://fotos.dreamscda.com.ar"
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

      {/* PASSENGER SURVEY MODAL */}
      {activeSurvey && (
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
