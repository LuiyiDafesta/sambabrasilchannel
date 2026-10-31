import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Check,
  X,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Camera,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Fotografia, Colegio } from '../../types';
import { getCdnUrl, downloadDirectPhoto } from '../../lib/storage';
import {
  downloadPhotosAsZip,
  downloadPhotosSequentially,
  DownloadProgress,
} from '../../lib/zipDownloader';
import { DownloadModal } from './DownloadModal';
import { DownloadProgressBar } from './DownloadProgressBar';

interface FlexibleGalleryProps {
  photos: Fotografia[];
  schools: Colegio[];
  tripCode: string;
  tripDate: string;
}

export const FlexibleGallery: React.FC<FlexibleGalleryProps> = ({
  photos,
  schools,
  tripCode,
  tripDate,
}) => {
  // Columns state: 2, 3, 4, 5
  const [columnCount, setColumnCount] = useState<2 | 3 | 4 | 5>(4);

  // Selection mode & selected IDs (persists across pages)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  // Pagination
  const pageSize = 24;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(photos.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagePhotos = photos.slice(startIndex, startIndex + pageSize);

  // Lightbox
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<Fotografia | null>(null);

  // Download Modal & Progress
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [modalTargetPhotos, setModalTargetPhotos] = useState<Fotografia[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Single photo direct download feedback
  const [directDownloadToast, setDirectDownloadToast] = useState<string | null>(null);

  const galleryRef = useRef<HTMLDivElement>(null);

  // Scroll to gallery top when changing pages
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle selection for a single photo
  const toggleSelectPhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
  };

  // Quick Action: Select all on Current Page
  const handleSelectCurrentPage = () => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      pagePhotos.forEach((p) => next.add(p.id));
      return next;
    });
    setIsSelectionMode(true);
  };

  // Quick Action: Select All Photos (whole trip)
  const handleSelectAll = () => {
    const allIds = new Set(photos.map((p) => p.id));
    setSelectedPhotoIds(allIds);
    setIsSelectionMode(true);
  };

  // Quick Action: Clear Selection
  const handleClearSelection = () => {
    setSelectedPhotoIds(new Set());
  };

  // Close Selection Mode
  const handleCloseSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPhotoIds(new Set());
  };

  // Open Modal for "DESCARGAR TODAS"
  const handleOpenDownloadAll = () => {
    setModalTargetPhotos(photos);
    setDownloadModalOpen(true);
  };

  // Open Modal for "DESCARGAR SELECCIONADAS"
  const handleOpenDownloadSelected = () => {
    const target = photos.filter((p) => selectedPhotoIds.has(p.id));
    if (target.length === 0) return;
    setModalTargetPhotos(target);
    setDownloadModalOpen(true);
  };

  // Direct download for single photo (without zip compression)
  const handleDownloadSingleDirect = async (photo: Fotografia, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirectDownloadToast(`Descargando ${photo.filename || 'foto'}...`);
    await downloadDirectPhoto(photo.url, photo.filename || `foto-${photo.id}.jpg`);
    setTimeout(() => setDirectDownloadToast(null), 3000);
  };

  // Start ZIP Download
  const handleStartZipDownload = async () => {
    setDownloadModalOpen(false);
    const photosToDownload = modalTargetPhotos;
    if (photosToDownload.length === 0) return;

    abortControllerRef.current = new AbortController();
    const zipName = `SambaBrasil-${tripCode}-${tripDate || 'Camboriu'}.zip`;

    try {
      await downloadPhotosAsZip(
        photosToDownload,
        zipName,
        (p) => setDownloadProgress(p),
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      if (err.message !== 'Descarga cancelada por el usuario') {
        setDownloadProgress({
          current: 0,
          total: photosToDownload.length,
          percent: 0,
          statusText: `Error al generar ZIP: ${err.message || 'Error'}`,
          isCompleted: false,
          isError: true,
          errorMessage: err.message,
        });
      }
    }
  };

  // Start Sequential Individual Download (en cola)
  const handleStartSequentialDownload = async () => {
    setDownloadModalOpen(false);
    const photosToDownload = modalTargetPhotos;
    if (photosToDownload.length === 0) return;

    abortControllerRef.current = new AbortController();

    try {
      await downloadPhotosSequentially(
        photosToDownload,
        (p) => setDownloadProgress(p),
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      if (err.message !== 'Descarga cancelada por el usuario') {
        setDownloadProgress({
          current: 0,
          total: photosToDownload.length,
          percent: 0,
          statusText: `Descarga interrumpida: ${err.message || 'Error'}`,
          isCompleted: false,
          isError: true,
          errorMessage: err.message,
        });
      }
    }
  };

  // Cancel running download
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDownloadProgress(null);
  };

  // Dismiss finished progress bar
  const handleDismissProgress = () => {
    setDownloadProgress(null);
  };

  // Determine grid class from columnCount
  const getGridClass = () => {
    switch (columnCount) {
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6';
      case 3:
        return 'grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5';
      case 5:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5';
      case 4:
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4';
    }
  };

  return (
    <div id="galeria-flexible" ref={galleryRef} className="space-y-6 pt-4">
      {/* ============================================================ */}
      {/* 1. HEADER SECTION (Image 1) */}
      {/* ============================================================ */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/30 text-[#159447] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>GALERÍA FLEXIBLE</span>
        </div>

        <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white uppercase tracking-tight flex items-center gap-2">
          <span>GALERÍA COMPLETA DE FOTOS ({photos.length})</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Fotos exclusivas de las excursiones, fiestas y actividades compartidas por todos los chicos.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 2. ACTION ROW & COLUMN SWITCHER (Image 1 & Image 3) */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        {/* Left: Download All & Toggle Selection Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón DESCARGAR TODAS */}
          <button
            type="button"
            onClick={handleOpenDownloadAll}
            className="bg-[#121826] hover:bg-white/10 text-white border border-white/15 text-xs font-outfit font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download size={14} />
            <span>DESCARGAR TODAS ({photos.length})</span>
          </button>

          {/* Botón SELECCIONAR / CERRAR SELECCIÓN (Verde Samba Brasil #159447) */}
          {isSelectionMode ? (
            <button
              type="button"
              onClick={handleCloseSelectionMode}
              className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(21,148,71,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <X size={15} strokeWidth={2.5} />
              <span>CERRAR SELECCIÓN</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSelectionMode(true)}
              className="bg-[#121826] hover:bg-[#159447]/20 hover:border-[#159447] text-slate-200 hover:text-white border border-white/15 text-xs font-outfit font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>SELECCIONAR FOTOS</span>
            </button>
          )}
        </div>

        {/* Right: COLUMNAS LAYOUT SWITCHER (Image 3) */}
        <div className="flex items-center gap-2 bg-[#0E1522] border border-white/10 rounded-2xl px-3 py-1.5 self-start sm:self-auto shadow-inner">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1">
            COLUMNAS
          </span>

          <div className="flex items-center gap-1">
            {/* 2 COLUMNS BUTTON */}
            <button
              type="button"
              onClick={() => setColumnCount(2)}
              title="Ver en 2 Columnas"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                columnCount === 2
                  ? 'bg-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
            </button>

            {/* 3 COLUMNS BUTTON */}
            <button
              type="button"
              onClick={() => setColumnCount(3)}
              title="Ver en 3 Columnas"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                columnCount === 3
                  ? 'bg-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>

            {/* 4 COLUMNS BUTTON */}
            <button
              type="button"
              onClick={() => setColumnCount(4)}
              title="Ver en 4 Columnas"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                columnCount === 4
                  ? 'bg-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
              </svg>
            </button>

            {/* 5 COLUMNS BUTTON */}
            <button
              type="button"
              onClick={() => setColumnCount(5)}
              title="Ver en 5 Columnas"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                columnCount === 5
                  ? 'bg-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="3" width="2.5" height="18" rx="0.5" />
                <rect x="7" y="3" width="2.5" height="18" rx="0.5" />
                <rect x="11.5" y="3" width="2.5" height="18" rx="0.5" />
                <rect x="16" y="3" width="2.5" height="18" rx="0.5" />
                <rect x="20.5" y="3" width="2.5" height="18" rx="0.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SELECTION CONTROL BAR (Image 1) */}
      {/* ============================================================ */}
      {(isSelectionMode || selectedPhotoIds.size > 0) && (
        <div className="bg-[#0C1424] border border-[#159447]/30 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
          {/* Left: Counter badge & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="bg-[#159447]/15 border border-[#159447]/40 text-[#159447] font-outfit font-black text-xs uppercase px-3.5 py-1.5 rounded-xl tracking-wider shadow-sm">
              {selectedPhotoIds.size} DE {photos.length} SELECCIONADAS
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
              <button
                type="button"
                onClick={handleSelectCurrentPage}
                className="hover:text-white hover:underline cursor-pointer"
              >
                PÁGINA ACTUAL ({pagePhotos.length})
              </button>

              <span className="text-slate-600">&bull;</span>

              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:text-white hover:underline cursor-pointer"
              >
                TODAS ({photos.length})
              </button>

              <span className="text-slate-600">&bull;</span>

              <button
                type="button"
                onClick={handleClearSelection}
                className="text-slate-400 hover:text-rose-400 hover:underline cursor-pointer"
              >
                LIMPIAR
              </button>
            </div>
          </div>

          {/* Right: Descargar Seleccionadas Button */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              type="button"
              disabled={selectedPhotoIds.size === 0}
              onClick={handleOpenDownloadSelected}
              className="w-full md:w-auto bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(21,148,71,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Download size={14} />
              <span>DESCARGAR SELECCIONADAS ({selectedPhotoIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct download toast */}
      {directDownloadToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#159447] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideIn">
          <CheckCircle2 size={16} />
          <span>{directDownloadToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PHOTO GRID (Image 1) */}
      {/* ============================================================ */}
      {photos.length > 0 ? (
        <div className={getGridClass()}>
          {pagePhotos.map((photo, idx) => {
            const isSelected = selectedPhotoIds.has(photo.id);
            const photoNumber = startIndex + idx + 1;
            const cdnUrl = getCdnUrl(photo.url);

            return (
              <div
                key={photo.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelectPhoto(photo.id);
                  } else {
                    setActiveLightboxPhoto(photo);
                  }
                }}
                className={`relative group rounded-2xl overflow-hidden aspect-[4/3] bg-[#0A101A] border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-[#159447] ring-2 ring-[#159447] shadow-[0_0_22px_rgba(21,148,71,0.4)] scale-[1.01]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Photo image via CDN */}
                <img
                  src={cdnUrl}
                  alt={photo.filename || `Foto ${photoNumber}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Ambient shadow gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Top-Left Selection Checkbox Circle (Image 1) */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectPhoto(photo.id, e)}
                  title={isSelected ? 'Deseleccionar foto' : 'Seleccionar foto'}
                  className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer ${
                    isSelected
                      ? 'bg-[#159447] text-white shadow-[0_0_10px_rgba(21,148,71,0.6)] scale-110'
                      : isSelectionMode
                      ? 'bg-black/70 text-transparent border border-white/40 hover:border-[#159447]'
                      : 'bg-black/60 text-transparent border border-white/20 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Check size={14} className={isSelected ? 'text-white' : 'opacity-0'} />
                </button>

                {/* Top-Right Photo Number Pill */}
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/10">
                    #{photoNumber}
                  </span>
                </div>

                {/* Bottom Overlay Actions: Single Direct Download & Zoom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-slate-300 font-mono truncate max-w-[60%]">
                    {photo.filename || `Foto #${photoNumber}`}
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {/* Botón Descarga Individual Directa (Sin ZIP) */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadSingleDirect(photo, e)}
                      title="Descargar esta foto directamente (sin comprimir)"
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-[#159447] text-slate-200 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <Download size={13} />
                    </button>

                    {/* Botón Ver en Pantalla Completa */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxPhoto(photo);
                      }}
                      title="Ver en pantalla completa"
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 transition-all cursor-pointer"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0C1424] rounded-3xl border border-white/10">
          <Camera size={36} className="text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No hay fotos publicadas en este álbum todavía</h3>
          <p className="text-xs text-slate-400">Las fotos estarán disponibles en las próximas horas.</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. PAGINATION (Stays strictly inside gallery) */}
      {/* ============================================================ */}
      {photos.length > pageSize && (
        <div className="bg-[#090E18] border border-white/10 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 shadow-xl">
          <div>
            Mostrando{' '}
            <strong className="text-white">
              {startIndex + 1} - {Math.min(startIndex + pageSize, photos.length)}
            </strong>{' '}
            de <strong className="text-white">{photos.length}</strong> fotos
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {/* Prev Page */}
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => handlePageChange(Math.max(1, validCurrentPage - 1))}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (
                p === 1 ||
                p === totalPages ||
                (p >= validCurrentPage - 1 && p <= validCurrentPage + 1)
              ) {
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                      validCurrentPage === p
                        ? 'bg-[#159447] text-white shadow-md shadow-[#159447]/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === validCurrentPage - 2 || p === validCurrentPage + 2) {
                return (
                  <span key={p} className="px-1 text-slate-600 font-mono">
                    ...
                  </span>
                );
              }
              return null;
            })}

            {/* Next Page */}
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, validCurrentPage + 1))}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Página Siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DOWNLOAD MODAL (Image 2) */}
      {/* ============================================================ */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        count={modalTargetPhotos.length}
        schools={schools}
        onDownloadZip={handleStartZipDownload}
        onDownloadIndividual={handleStartSequentialDownload}
      />

      {/* ============================================================ */}
      {/* 7. PROGRESS BAR INDICATOR (Sequential / ZIP progress) */}
      {/* ============================================================ */}
      <DownloadProgressBar
        progress={downloadProgress}
        onCancel={handleCancelDownload}
        onDismiss={handleDismissProgress}
      />

      {/* ============================================================ */}
      {/* 8. LIGHTBOX MODAL */}
      {/* ============================================================ */}
      {activeLightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn">
          {/* Top Bar with actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
            <span className="text-xs font-mono text-slate-300 truncate max-w-xs">
              {activeLightboxPhoto.filename || 'Foto'}
            </span>
            <div className="flex items-center gap-2">
              {/* Direct single photo download */}
              <button
                type="button"
                onClick={() => handleDownloadSingleDirect(activeLightboxPhoto)}
                className="bg-white/10 hover:bg-[#159447] text-white p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Descargar foto en alta resolución directa"
              >
                <Download size={18} />
              </button>

              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Large Image Preview via CDN */}
          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={getCdnUrl(activeLightboxPhoto.url)}
              alt={activeLightboxPhoto.filename || 'Foto'}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
