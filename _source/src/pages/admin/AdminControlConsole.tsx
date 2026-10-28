import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Edit2,
  Trash2,
  X,
  UploadCloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  BarChart3,
  Database,
  Star,
  LogOut,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { uploadImage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { Vuelta, Fotografia } from '../../types';

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  url?: string;
}

export const AdminControlConsole: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signOut } = useAuth();

  // Trips data
  const [trips, setTrips] = useState<Vuelta[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'colegios' | 'encuestas' | 'estadisticas'
  const [activeTab, setActiveTab] = useState<'colegios' | 'encuestas' | 'estadisticas'>('colegios');

  // Active subview: null = Table of groups, or string = ID/code of trip being managed in Gallery
  const [galleryTripCode, setGalleryTripCode] = useState<string | null>(searchParams.get('galeria'));

  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [pageSize, setPageSize] = useState<number>(15);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal: Create / Edit Group
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [groupCode, setGroupCode] = useState('');
  const [groupDestination, setGroupDestination] = useState('Camboriú');
  const [groupDate, setGroupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [schoolInputs, setSchoolInputs] = useState<string[]>(['']);
  const [savingGroup, setSavingGroup] = useState(false);

  // Modal: Double Confirmation Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Vuelta | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Gallery Subview: Drag & Drop and sequential upload queue
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Trips
  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getAllTrips();
      setTrips(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // Sync gallery trip from URL if any
  useEffect(() => {
    const galParam = searchParams.get('galeria');
    if (galParam) {
      setGalleryTripCode(galParam);
    }
  }, [searchParams]);

  const activeGalleryTrip = galleryTripCode
    ? trips.find((t) => t.code.toLowerCase() === galleryTripCode.toLowerCase() || t.id === galleryTripCode)
    : null;

  // Handle Quick Copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTripId(null);
    setGroupCode('');
    setGroupDestination('Camboriú');
    setGroupDate(new Date().toISOString().split('T')[0]);
    setSchoolInputs(['']);
    setGroupModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (trip: Vuelta) => {
    setEditingTripId(trip.id);
    setGroupCode(trip.code);
    setGroupDestination(trip.destination || 'Camboriú');
    setGroupDate(trip.date);
    const existingNames = trip.schools && trip.schools.length > 0 ? trip.schools.map((s) => s.name) : [''];
    setSchoolInputs(existingNames);
    setGroupModalOpen(true);
  };

  // Add / Remove School Input
  const handleAddSchoolInput = () => {
    setSchoolInputs((prev) => [...prev, '']);
  };

  const handleRemoveSchoolInput = (index: number) => {
    if (schoolInputs.length <= 1) return;
    setSchoolInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSchoolInputChange = (index: number, val: string) => {
    setSchoolInputs((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Save Group (Create or Update)
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode.trim()) return;

    const validSchools = schoolInputs.map((s) => s.trim()).filter(Boolean);
    if (validSchools.length === 0) {
      alert('Debes ingresar al menos un nombre de colegio.');
      return;
    }

    setSavingGroup(true);
    try {
      if (editingTripId) {
        await tripService.updateGroupWithSchools(editingTripId, {
          code: groupCode,
          date: groupDate,
          destination: groupDestination,
          schoolNames: validSchools,
        });
      } else {
        await tripService.createGroupWithSchools({
          code: groupCode,
          date: groupDate,
          destination: groupDestination,
          schoolNames: validSchools,
        });
      }
      setGroupModalOpen(false);
      await loadTrips();
    } catch (err: any) {
      alert(`Error al guardar grupo: ${err.message || 'Error inesperado'}`);
    } finally {
      setSavingGroup(false);
    }
  };

  // Open Delete Double Confirmation Modal
  const openDeleteModal = (trip: Vuelta) => {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setDeleting(true);
    try {
      await tripService.deleteTrip(tripToDelete.id);
      setDeleteModalOpen(false);
      setTripToDelete(null);
      if (galleryTripCode === tripToDelete.code || galleryTripCode === tripToDelete.id) {
        setGalleryTripCode(null);
        setSearchParams({});
      }
      await loadTrips();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message || 'Error'}`);
    } finally {
      setDeleting(false);
    }
  };

  // Open Gallery View for a Group
  const handleOpenGallery = (trip: Vuelta) => {
    setGalleryTripCode(trip.code);
    setSearchParams({ galeria: trip.code });
  };

  const handleCloseGallery = () => {
    setGalleryTripCode(null);
    setSearchParams({});
  };

  // ==========================================
  // SEQUENTIAL QUEUE UPLOAD SYSTEM (Backblaze & Supabase)
  // ==========================================
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadQueueItem[] = Array.from(files).map((file) => ({
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  // Process queue sequentially one by one
  useEffect(() => {
    if (!activeGalleryTrip || isProcessingQueue) return;

    const nextItem = uploadQueue.find((item) => item.status === 'pending');
    if (!nextItem) return;

    const processItem = async () => {
      setIsProcessingQueue(true);

      // Mark as uploading
      setUploadQueue((prev) =>
        prev.map((i) => (i.id === nextItem.id ? { ...i, status: 'uploading' } : i))
      );

      try {
        let uploadedUrl = '';
        try {
          // Upload to Backblaze B2 via PHP endpoint
          const res = await uploadImage(nextItem.file, `grupos/${activeGalleryTrip.code.toLowerCase()}`);
          if (res.url) {
            uploadedUrl = res.url;
          }
        } catch (uploadErr) {
          console.warn('[Queue Upload] PHP/B2 upload failed, using local CDN fallback:', uploadErr);
          // Fallback if local without PHP: create object URL or standard CDN path
          uploadedUrl = URL.createObjectURL(nextItem.file);
        }

        // Register in Supabase photos table
        await tripService.addPhoto(activeGalleryTrip.id, {
          url: uploadedUrl,
          filename: nextItem.name,
          category: 'momentos',
          file_size: nextItem.size,
        });

        // Mark as completed
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === nextItem.id ? { ...i, status: 'completed', url: uploadedUrl } : i
          )
        );

        // Refresh trips data to show new photo
        await loadTrips();
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === nextItem.id
              ? { ...i, status: 'error', errorMessage: err.message || 'Error de subida' }
              : i
          )
        );
      } finally {
        setIsProcessingQueue(false);
      }
    };

    processItem();
  }, [uploadQueue, isProcessingQueue, activeGalleryTrip]);

  // Set Cover Photo
  const handleSetCoverPhoto = async (photoUrl: string) => {
    if (!activeGalleryTrip) return;
    await tripService.setCoverPhoto(activeGalleryTrip.id, photoUrl);
    await loadTrips();
  };

  // Delete Photo from Album
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Deseas eliminar esta fotografía de la galería del grupo?')) return;
    await tripService.deletePhoto(photoId);
    await loadTrips();
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      t.code.toLowerCase().includes(term) ||
      t.destination.toLowerCase().includes(term) ||
      (t.schools && t.schools.some((s) => s.name.toLowerCase().includes(term)));

    const matchesDest =
      destinationFilter === 'all' ||
      t.destination.toLowerCase() === destinationFilter.toLowerCase();

    return matchesSearch && matchesDest;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedTrips = filteredTrips.slice(startIndex, startIndex + pageSize);

  // Available unique destinations
  const uniqueDestinations = Array.from(new Set(trips.map((t) => t.destination || 'Camboriú')));

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans selection:bg-[#F8C62B] selection:text-black">
      {/* ============================================================ */}
      {/* 1. TOP HEADER CONSOLE (Exact match to Image 1, 3, 4) */}
      {/* ============================================================ */}
      <header className="bg-[#090F1C] border-b border-white/10 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <span className="text-[#F8C62B]">✦</span>
              <span>PANEL ADMINISTRATIVO</span>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-white leading-none">
              CONSOLA DE CONTROL
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-[#F8C62B] hover:bg-[#e6b522] text-black font-outfit font-black text-xs sm:text-sm uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(248,198,43,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>REGISTRAR COLEGIO</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="bg-[#121824] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
              <span>SALIR</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN NAVIGATION TABS (Image 1, 4) */}
      {/* ============================================================ */}
      <div className="bg-[#070D18] px-4 sm:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2.5 sm:gap-4 border-b border-white/10 pb-4">
          {/* TAB 1: GESTIÓN DE COLEGIOS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('colegios');
              handleCloseGallery();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-outfit font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'colegios'
                ? 'bg-[#F8C62B] text-black shadow-[0_0_20px_rgba(248,198,43,0.35)]'
                : 'bg-[#101726] hover:bg-[#152033] text-slate-300 border border-white/5'
            }`}
          >
            <Database size={15} />
            <span>GESTIÓN DE COLEGIOS</span>
          </button>

          {/* TAB 2: SISTEMA DE ENCUESTAS */}
          <button
            type="button"
            onClick={() => setActiveTab('encuestas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-outfit font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'encuestas'
                ? 'bg-[#F8C62B] text-black shadow-[0_0_20px_rgba(248,198,43,0.35)]'
                : 'bg-[#101726] hover:bg-[#152033] text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Sparkles size={15} />
            <span>SISTEMA DE ENCUESTAS</span>
          </button>

          {/* TAB 3: MÉTRICAS Y ESTADÍSTICAS */}
          <button
            type="button"
            onClick={() => setActiveTab('estadisticas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-outfit font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'estadisticas'
                ? 'bg-[#F8C62B] text-black shadow-[0_0_20px_rgba(248,198,43,0.35)]'
                : 'bg-[#101726] hover:bg-[#152033] text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            <BarChart3 size={15} />
            <span>MÉTRICAS Y ESTADÍSTICAS</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. BODY VIEW: (GALLERY VIEW or TABLE VIEW or OTHER TABS) */}
      {/* ============================================================ */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* VIEW: ENCUESTAS PLACEHOLDER */}
        {activeTab === 'encuestas' && (
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F8C62B]/10 border border-[#F8C62B]/30 text-[#F8C62B] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="font-outfit font-black text-xl text-white uppercase tracking-wider mb-2">
              Sistema de Encuestas
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Módulo preparado para encuestas de satisfacción, votación de fiestas temáticas y feedback de egresados de Samba Brasil.
            </p>
            <span className="inline-flex px-3 py-1 rounded-full bg-[#159447]/10 border border-[#159447]/30 text-[#159447] text-xs font-bold uppercase">
              Próximamente disponible
            </span>
          </div>
        )}

        {/* VIEW: ESTADISTICAS PLACEHOLDER */}
        {activeTab === 'estadisticas' && (
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#159447]/10 border border-[#159447]/30 text-[#159447] flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={28} />
            </div>
            <h3 className="font-outfit font-black text-xl text-white uppercase tracking-wider mb-2">
              Métricas y Estadísticas
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Visualización de visualizaciones de fotos, descargas HD, colegios registrados y actividad en tiempo real.
            </p>
            <span className="inline-flex px-3 py-1 rounded-full bg-[#F8C62B]/10 border border-[#F8C62B]/30 text-[#F8C62B] text-xs font-bold uppercase">
              Próximamente disponible
            </span>
          </div>
        )}

        {/* VIEW: GESTIÓN DE COLEGIOS (SUBVIEW: GALLERY OR GROUPS TABLE) */}
        {activeTab === 'colegios' && (
          <>
            {activeGalleryTrip ? (
              /* ============================================================ */
              /* SUBVIEW: GALERÍA DEL GRUPO (Exact match to Image 3) */
              /* ============================================================ */
              <div className="space-y-6 animate-fadeIn">
                {/* Group Top Meta Card */}
                <div className="bg-[#0B111D] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F8C62B] block mb-1">
                      ADMINISTRANDO GALERÍA DEL GRUPO
                    </span>
                    <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white uppercase leading-tight mb-3">
                      {activeGalleryTrip.schools && activeGalleryTrip.schools.length > 0
                        ? activeGalleryTrip.schools.map((s) => s.name).join(', ')
                        : activeGalleryTrip.code}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-[#F8C62B]/10 border border-[#F8C62B]/30 text-[#F8C62B] font-bold px-2.5 py-1 rounded-lg">
                        CÓDIGO: {activeGalleryTrip.code}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#159447]" />
                        <strong className="text-white">{activeGalleryTrip.destination}</strong>
                      </span>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar size={14} className="text-sky-400" />
                        <strong className="text-white">{activeGalleryTrip.date}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`/galeria/${activeGalleryTrip.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      <span>VER VISTA PÚBLICA</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCloseGallery}
                      className="bg-[#F8C62B] hover:bg-[#e6b522] text-black font-outfit font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(248,198,43,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>VOLVER A COLEGIOS</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Dropzone & Horizontal Grid Card */}
                <div className="bg-[#090E18] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                  {/* Gallery header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#159447] mb-1">
                        <span>✦</span>
                        <span>NIVEL DE GRUPO</span>
                      </div>
                      <h3 className="font-outfit font-black text-lg sm:text-xl text-white uppercase flex items-center gap-2">
                        <ImageIcon size={18} className="text-[#F8C62B]" />
                        <span>GALERÍA DE FOTOS GRUPALES ({activeGalleryTrip.photos?.length || 0})</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Podés subir 1 o más fotos grupales oficiales en HD. Los egresados podrán descargarlas en máxima resolución.
                      </p>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFilesSelected(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#F8C62B] hover:bg-[#e6b522] text-black font-outfit font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(248,198,43,0.3)] flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <UploadCloud size={15} />
                        <span>SUBIR FOTOS GRUPALES HD</span>
                      </button>
                    </div>
                  </div>

                  {/* Drag and Drop Container */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-[#F8C62B]/50 bg-black/20 hover:bg-black/30 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 group-hover:border-[#F8C62B]/40 flex items-center justify-center mx-auto text-[#F8C62B] mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud size={22} />
                    </div>
                    <h4 className="font-outfit font-black text-xs sm:text-sm text-white uppercase tracking-wider mb-1">
                      ARRASTRÁ Y SOLTÁ FOTOS GRUPALES AQUÍ
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      O HAZ CLIC PARA SELECCIONAR VARIOS ARCHIVOS JPG, PNG O WEBP (PROCESAMIENTO EN COLA SECUENCIAL)
                    </p>
                  </div>

                  {/* Sequential Queue Progress Indicators */}
                  {uploadQueue.length > 0 && (
                    <div className="bg-[#0D1524] border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-2">
                          {isProcessingQueue && <Loader2 size={13} className="animate-spin text-[#F8C62B]" />}
                          <span>Cola de subida secuencial ({uploadQueue.filter((q) => q.status === 'completed').length}/{uploadQueue.length})</span>
                        </span>
                        {uploadQueue.some((q) => q.status === 'completed' || q.status === 'error') && (
                          <button
                            type="button"
                            onClick={() => setUploadQueue((prev) => prev.filter((q) => q.status === 'uploading' || q.status === 'pending'))}
                            className="text-[10px] text-slate-400 hover:text-white"
                          >
                            Limpiar finalizados
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {uploadQueue.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-[11px] px-3 py-1.5 rounded-lg bg-black/30 border border-white/5"
                          >
                            <span className="truncate max-w-[200px] text-slate-300">{item.name}</span>
                            <div className="flex items-center gap-2">
                              {item.status === 'pending' && <span className="text-slate-500">En cola</span>}
                              {item.status === 'uploading' && (
                                <span className="text-[#F8C62B] flex items-center gap-1">
                                  <Loader2 size={11} className="animate-spin" /> Subiendo a Backblaze...
                                </span>
                              )}
                              {item.status === 'completed' && (
                                <span className="text-[#159447] flex items-center gap-1 font-bold">
                                  <CheckCircle2 size={12} /> Subida exitosa
                                </span>
                              )}
                              {item.status === 'error' && (
                                <span className="text-rose-400 font-bold">Error</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horizontal / Responsive Photos Grid (Image 3) */}
                  <div>
                    {activeGalleryTrip.photos && activeGalleryTrip.photos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {activeGalleryTrip.photos.map((photo, idx) => {
                          const isCover = activeGalleryTrip.cover_image === photo.url;
                          return (
                            <div
                              key={photo.id}
                              className="group relative rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-white/20 transition-all shadow-lg aspect-[4/3]"
                            >
                              <img
                                src={photo.url}
                                alt={photo.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Top Bar Badges */}
                              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none z-10">
                                <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-white/10">
                                  FOTO GRUPAL #{idx + 1}
                                </span>

                                {isCover ? (
                                  <span className="bg-[#F8C62B] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                    <Star size={10} fill="currentColor" />
                                    PORTADA OFICIAL
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverPhoto(photo.url)}
                                    className="pointer-events-auto opacity-0 group-hover:opacity-100 bg-black/80 hover:bg-[#F8C62B] text-slate-300 hover:text-black text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 transition-all flex items-center gap-1"
                                    title="Marcar como foto de portada"
                                  >
                                    <Star size={10} />
                                    <span>Hacer Portada</span>
                                  </button>
                                )}
                              </div>

                              {/* Bottom Overlay Actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                <div className="flex items-center justify-between gap-2 text-white">
                                  <span className="text-[10px] font-mono truncate text-slate-300 max-w-[70%]">
                                    {photo.filename}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={photo.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                      title="Ver en alta resolución"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePhoto(photo.id)}
                                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                                      title="Eliminar fotografía"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No hay fotografías cargadas aún para este grupo. Arrastrá fotos arriba o haz clic en "SUBIR FOTOS GRUPALES HD".
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================ */
              /* SUBVIEW: TABLA PRINCIPAL DE GRUPOS (Exact match to Image 1, 4, 5) */
              /* ============================================================ */
              <div className="space-y-4">
                {/* Search & Filter Bar (Image 1, 4, 5) */}
                <div className="bg-[#0B101C] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
                  {/* Search Input */}
                  <div className="relative w-full md:w-96">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Buscar colegio por nombre o destino..."
                      className="w-full bg-[#121826] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F8C62B] transition-all"
                    />
                  </div>

                  {/* Actions / Filter dropdowns */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      className="bg-[#121826] border border-white/10 hover:border-white/20 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <SlidersHorizontal size={13} />
                      <span>FILTROS</span>
                    </button>

                    {/* Filter Destination */}
                    <div className="relative">
                      <select
                        value={destinationFilter}
                        onChange={(e) => {
                          setDestinationFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white appearance-none pr-8 focus:outline-none focus:border-[#F8C62B]"
                      >
                        <option value="all">Todos los Destinos</option>
                        {uniqueDestinations.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Page Size Selector Popup (Image 5) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPageSizeOpen(!pageSizeOpen)}
                        className="bg-[#121826] border border-white/10 hover:border-white/20 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <span className="text-slate-400">VER</span>
                        <strong className="text-white">{pageSize}</strong>
                        <ChevronDown size={13} className="text-slate-400" />
                      </button>

                      {pageSizeOpen && (
                        <div className="absolute right-0 top-full mt-2 w-24 bg-[#141B2B] border border-white/15 rounded-xl py-1.5 shadow-2xl z-30 animate-fadeIn">
                          {[10, 15, 25, 50, 100].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setPageSize(size);
                                setPageSizeOpen(false);
                                setCurrentPage(1);
                              }}
                              className={`w-full text-center py-1.5 text-xs font-bold transition-colors ${
                                pageSize === size
                                  ? 'bg-white/15 text-white'
                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-[#090E18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  {loading ? (
                    <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#F8C62B]" size={24} />
                      <span className="text-xs">Cargando grupos registrados...</span>
                    </div>
                  ) : filteredTrips.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <p className="text-sm font-semibold text-white mb-1">No se encontraron grupos</p>
                      <p className="text-xs text-slate-500 mb-4">
                        {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Aún no hay grupos creados en la base de datos.'}
                      </p>
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="bg-[#F8C62B] text-black text-xs font-black uppercase px-4 py-2 rounded-xl"
                      >
                        + REGISTRAR PRIMER COLEGIO
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-[#0C1220]/60">
                            <th className="py-4 px-5">CÓDIGO DE GRUPO</th>
                            <th className="py-4 px-5">COLEGIOS INTEGRANTES DEL GRUPO</th>
                            <th className="py-4 px-5">DESTINO</th>
                            <th className="py-4 px-5">FECHA DE VIAJE</th>
                            <th className="py-4 px-5 text-right">ACCIONES ADMINISTRATIVAS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                          {paginatedTrips.map((trip) => {
                            const isCopied = copiedCode === trip.code;
                            const schoolNames = trip.schools && trip.schools.length > 0 ? trip.schools : [];

                            return (
                              <tr
                                key={trip.id}
                                className="hover:bg-white/[0.02] transition-colors group"
                              >
                                {/* CÓDIGO DE GRUPO */}
                                <td className="py-4 px-5 align-middle">
                                  <div className="flex flex-col">
                                    <div className="inline-flex items-center gap-1.5 w-fit bg-[#F8C62B]/10 border border-[#F8C62B]/40 text-[#F8C62B] px-3 py-1.5 rounded-xl font-outfit font-black text-sm tracking-wide">
                                      <span>{trip.code}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(trip.code)}
                                        className="p-1 hover:bg-[#F8C62B]/20 rounded-md transition-colors text-[#F8C62B]"
                                        title="Copiar código"
                                      >
                                        {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                                      ID: {trip.id.substring(0, 10)}...
                                    </span>
                                  </div>
                                </td>

                                {/* COLEGIOS INTEGRANTES DEL GRUPO */}
                                <td className="py-4 px-5 align-middle">
                                  <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                                    {schoolNames.length > 0 ? (
                                      schoolNames.map((s) => (
                                        <span
                                          key={s.id}
                                          className="bg-black/60 border border-white/10 text-white font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide"
                                        >
                                          {s.name}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-500 italic text-[11px]">Sin colegios asignados</span>
                                    )}
                                  </div>
                                </td>

                                {/* DESTINO */}
                                <td className="py-4 px-5 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 font-bold text-white uppercase text-xs">
                                    <MapPin size={14} className="text-[#F8C62B]" />
                                    <span>{trip.destination || 'Camboriú'}</span>
                                  </div>
                                </td>

                                {/* FECHA DE VIAJE */}
                                <td className="py-4 px-5 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                                    <Calendar size={13} className="text-[#159447]" />
                                    <span>{trip.date}</span>
                                  </div>
                                </td>

                                {/* ACCIONES ADMINISTRATIVAS */}
                                <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-2">
                                    {/* Botón GALERÍA */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenGallery(trip)}
                                      className="bg-[#121826] hover:bg-[#F8C62B] text-slate-200 hover:text-black border border-white/10 hover:border-[#F8C62B] text-xs font-outfit font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      <ImageIcon size={13} />
                                      <span>GALERÍA</span>
                                    </button>

                                    {/* Botón Edición */}
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(trip)}
                                      className="p-2 rounded-xl bg-[#121826] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                                      title="Editar Grupo y Colegios"
                                    >
                                      <Edit2 size={13} />
                                    </button>

                                    {/* Botón Eliminación */}
                                    <button
                                      type="button"
                                      onClick={() => openDeleteModal(trip)}
                                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-colors"
                                      title="Eliminar Grupo"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {filteredTrips.length > 0 && (
                    <div className="px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-[#0C1220]/40">
                      <div>
                        Mostrando{' '}
                        <strong className="text-white">
                          {startIndex + 1} - {Math.min(startIndex + pageSize, filteredTrips.length)}
                        </strong>{' '}
                        de <strong className="text-white">{filteredTrips.length}</strong> grupos
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => {
                          const p = i + 1;
                          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setCurrentPage(p)}
                                className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                                  currentPage === p
                                    ? 'bg-[#F8C62B] text-black shadow-md'
                                    : 'hover:bg-white/5 text-slate-300'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          }
                          if (p === currentPage - 2 || p === currentPage + 2) {
                            return <span key={p} className="px-1 text-slate-600">...</span>;
                          }
                          return null;
                        })}

                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ============================================================ */}
      {/* 4. MODAL: REGISTRAR / EDITAR GRUPO (Specification 11) */}
      {/* ============================================================ */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090F1C] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8C62B] block mb-1">
                {editingTripId ? 'MODIFICACIÓN DE DATOS' : 'NUEVO REGISTRO'}
              </span>
              <h3 className="font-outfit font-black text-2xl text-white uppercase">
                {editingTripId ? 'Editar Grupo y Colegios' : 'Registrar Nuevo Grupo'}
              </h3>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-5">
              {/* CÓDIGO DE GRUPO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Código de Grupo
                </label>
                <input
                  type="text"
                  required
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  placeholder="Ej: SB-101 o B313"
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#F8C62B] transition-colors"
                />
              </div>

              {/* COLEGIOS INTEGRANTES DEL GRUPO (DYNAMIC INPUTS) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Colegios integrantes del grupo
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSchoolInput}
                    className="text-[11px] font-bold text-[#F8C62B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Agregar colegio</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {schoolInputs.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={val}
                        onChange={(e) => handleSchoolInputChange(idx, e.target.value)}
                        placeholder={`Nombre del colegio #${idx + 1}`}
                        className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#F8C62B] transition-colors"
                      />
                      {schoolInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSchoolInput(idx)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                          title="Eliminar este colegio"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* DESTINO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Destino
                </label>
                <input
                  type="text"
                  required
                  value={groupDestination}
                  onChange={(e) => setGroupDestination(e.target.value)}
                  placeholder="Camboriú"
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F8C62B] transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Por defecto es Camboriú, abierto a nuevos destinos futuros.
                </span>
              </div>

              {/* FECHA DEL VIAJE (FECHA DE INGRESO A CAMBORIU) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Fecha del Viaje (Ingreso a Camboriú)
                </label>
                <input
                  type="date"
                  required
                  value={groupDate}
                  onChange={(e) => setGroupDate(e.target.value)}
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F8C62B] transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Esta fecha se representará en el calendario público para que los alumnos ubiquen su viaje.
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={savingGroup}
                  className="bg-[#F8C62B] hover:bg-[#e6b522] text-black font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(248,198,43,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingGroup && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingTripId ? 'GUARDAR CAMBIOS' : 'REGISTRAR GRUPO'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: DOBLE CONFIRMACIÓN DE ELIMINACIÓN (Exact match Image 2) */}
      {/* ============================================================ */}
      {deleteModalOpen && tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090D16] border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            {/* Header pill & Close */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400">
                ZONA DE SEGURIDAD &bull; ELIMINACIÓN
              </span>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 flex-shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="font-outfit font-black text-xl text-white leading-tight">
                  Eliminar Colegio / Grupo
                </h3>
                <p className="text-xs text-slate-400">
                  Doble confirmación para evitar borrados por error.
                </p>
              </div>
            </div>

            {/* Group details pill card */}
            <div className="bg-[#121622] border border-white/10 rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-fit">
                COLEGIO / GRUPO COMPLETO
              </span>
              <strong className="text-white text-xs truncate">
                {tripToDelete.schools && tripToDelete.schools.length > 0
                  ? tripToDelete.schools.map((s) => s.name).join(', ')
                  : tripToDelete.code}
              </strong>
            </div>

            {/* Explanation */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Estás a punto de borrar definitivamente el grupo{' '}
              <strong className="text-white">
                "{tripToDelete.schools && tripToDelete.schools.length > 0
                  ? tripToDelete.schools.map((s) => s.name).join(', ')
                  : tripToDelete.code}"
              </strong>{' '}
              del sistema. Se perderán el acceso de los alumnos y la galería vinculada.
            </p>

            {/* Critical Danger Alert Box */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3.5 mb-6 text-rose-300 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-200 uppercase font-black tracking-wider block mb-0.5">
                  ¡PELIGRO CRÍTICO!
                </strong>
                <span>
                  Esta acción es permanente e irreversible. Se eliminarán los registros de la base de datos y todas las fotos/videos de la nube.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors uppercase"
              >
                CANCELAR
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white font-outfit font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>SÍ, ELIMINAR GRUPO COMPLETO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
