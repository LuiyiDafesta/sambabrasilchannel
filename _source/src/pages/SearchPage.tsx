import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TripCalendarSearch } from '../components/search/TripCalendarSearch';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryDate = searchParams.get('fecha') || '2026-11-12';

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pt-28 pb-20 selection:bg-[#159447] selection:text-white w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-[#159447] font-semibold">Buscador de Viajes a Camboriú</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F8C62B] bg-[#F8C62B]/10 px-3 py-1 rounded-full border border-[#F8C62B]/20">
            Temporada Noviembre &bull; Diciembre &bull; Enero
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-4xl md:text-5xl text-white mt-3 mb-2 break-words">
            Encontrá el Viaje de Egresados de tu Colegio
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Elegí el mes y día en el calendario para ver el recuadro con los colegios que compartieron ese viaje a Camboriú.
          </p>
        </div>

        {/* Embedded Calendar Search Component */}
        <TripCalendarSearch initialDate={queryDate} />

      </div>
    </div>
  );
};
