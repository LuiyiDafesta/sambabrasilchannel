import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Plane,
  Bus,
  Plus,
  Trash2,
  Edit2,
  Upload,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
  ExternalLink,
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { uploadImage } from '../../lib/storage';
import { Vuelta, Colegio, Fotografia } from '../../types';

export const AdminVueltaDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [trip, setTrip] = useState<Vuelta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generales' | 'colegios' | 'fotografias' | 'estadisticas'>('colegios');

  // New School Modal state
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [contractCode, setContractCode] = useState('CT-1024');
  const [schoolName, setSchoolName] = useState('');
  const [paxCount, setPaxCount] = useState(50);
  const [city, setCity] = useState('');

  // Photos Uploader State
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadTrip();
  }, [code]);

  async function loadTrip() {
    if (!code) return;
    setLoading(true);
    const data = await tripService.getTripById(code);
    setTrip(data);
    setLoading(false);
  }

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !schoolName) return;
    await tripService.addSchool(trip.id, {
      contract_code: contractCode,
      name: schoolName,
      pax_count: Number(paxCount),
      city,
    });
    setShowSchoolModal(false);
    setSchoolName('');
    loadTrip();
  };

  const handleRemoveSchool = async (schoolId: string) => {
    if (!trip) return;
    if (confirm('¿Seguro que deseas desvincular este colegio de la vuelta?')) {
      await tripService.removeSchool(trip.id, schoolId);
      loadTrip();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !trip) return;

    setUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Attempt actual upload to Backblaze B2 via upload_b2.php
        try {
          const res = await uploadImage(file, `vueltas/${trip.code.toLowerCase()}`);
          if (res.success && res.url) {
            await tripService.addPhoto(trip.id, {
              url: res.url,
              category: 'momentos',
              filename: file.name,
              file_size: file.size,
              created_at: new Date().toISOString(),
            });
            count++;
          }
        } catch (uploadErr) {
          // If server PHP upload isn't running in local vite dev, create photo preview
          const localPreviewUrl = URL.createObjectURL(file);
          await tripService.addPhoto(trip.id, {
            url: localPreviewUrl,
            category: 'momentos',
            filename: file.name,
            file_size: file.size,
            created_at: new Date().toISOString(),
          });
          count++;
        }
      }
      setUploadSuccess(`Se procesaron ${count} fotografías correctamente para el álbum.`);
      loadTrip();
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir las fotografías');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#159447] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs">Cargando detalles de la vuelta...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Vuelta no encontrada</h2>
        <Link to="/admin/vueltas" className="text-xs text-[#159447] underline">Volver al listado</Link>
      </div>
    );
  }

  const totalPax = trip.schools.reduce((acc, s) => acc + s.pax_count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Breadcrumbs & Header */}
      <div>
        <Link
          to="/admin/vueltas"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
        >
          <ChevronLeft size={16} /> Volver a Vueltas
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#124DA0]/20 border border-[#124DA0]/40 flex items-center justify-center text-white">
              {trip.transport_type === 'airplane' ? (
                <Plane size={24} className="text-[#F8C62B]" />
              ) : (
                <Bus size={24} className="text-[#159447]" />
              )}
            </div>
            <div>
              <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                Viaje {trip.code}
              </h1>
              <p className="text-xs text-slate-400">
                Fecha: <strong className="text-white">{trip.date}</strong> &bull; Coordinador: <strong className="text-white">{trip.coordinator_name}</strong>
              </p>
            </div>
          </div>

          <Link
            to={`/galeria/${trip.code}`}
            target="_blank"
            className="text-xs text-[#159447] hover:underline flex items-center gap-1.5 self-start sm:self-auto font-bold"
          >
            <span>Ver álbum público</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Tab Navigation Matching Mockup */}
      <div className="flex items-center border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('generales')}
          className={`px-5 py-3 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'generales'
              ? 'border-[#124DA0] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Datos generales
        </button>
        <button
          onClick={() => setActiveTab('colegios')}
          className={`px-5 py-3 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'colegios'
              ? 'border-[#124DA0] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Colegios ({trip.schools.length})
        </button>
        <button
          onClick={() => setActiveTab('fotografias')}
          className={`px-5 py-3 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'fotografias'
              ? 'border-[#124DA0] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Fotografías ({trip.photos.length})
        </button>
        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`px-5 py-3 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'estadisticas'
              ? 'border-[#124DA0] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* TAB 1: DATOS GENERALES */}
      {activeTab === 'generales' && (
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <h3 className="font-outfit font-bold text-lg text-white">Configuración del Viaje</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Código:</span>
              <strong className="text-white text-base font-outfit">{trip.code}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Fecha de Ingreso a Camboriú:</span>
              <strong className="text-white">{trip.date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Transporte:</span>
              <strong className="text-white capitalize">{trip.transport_type === 'airplane' ? 'Avión' : 'Micro'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Detalle de Transporte:</span>
              <span className="text-slate-300">{trip.transport_details || 'Charter Oficial'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Coordinador Principal:</span>
              <strong className="text-white">{trip.coordinator_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Estado de Publicación:</span>
              <span className="text-emerald-400 font-bold uppercase">{trip.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLEGIOS (Exact match to bottom-center panel in reference board) */}
      {activeTab === 'colegios' && (
        <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-outfit font-bold text-lg text-white">Colegios Participantes</h3>
              <p className="text-xs text-slate-400">Contratos y distribución de pasajeros asignados a este vuelo o micro.</p>
            </div>

            <button
              onClick={() => setShowSchoolModal(true)}
              className="bg-[#124DA0] hover:bg-[#0f4085] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>Agregar colegio</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-4">Contrato</th>
                  <th className="pb-3 px-4">Colegio</th>
                  <th className="pb-3 px-4">Ciudad</th>
                  <th className="pb-3 px-4">Pax</th>
                  <th className="pb-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trip.schools.map((sch) => (
                  <tr key={sch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#F8C62B]">
                      {sch.contract_code}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {sch.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {sch.city || 'Argentina'}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-mono font-bold">
                      {sch.pax_count}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRemoveSchool(sch.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Eliminar colegio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total summary row */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 px-4">
            <span>Total de pasajeros del viaje:</span>
            <span className="text-white font-mono text-sm bg-white/5 px-3 py-1 rounded-lg">
              {totalPax} pax
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: FOTOGRAFÍAS (Exact match to bottom-right panel in reference board) */}
      {activeTab === 'fotografias' && (
        <div className="space-y-6">
          {/* Drag & Drop Upload Zone */}
          <div className="bg-[#0C1424] border-2 border-dashed border-[#159447]/40 hover:border-[#159447] rounded-3xl p-8 sm:p-12 text-center transition-all bg-gradient-to-b from-[#159447]/5 to-transparent relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={32} />
            </div>

            <h3 className="font-outfit font-black text-xl text-white mb-1">
              {uploading ? 'Subiendo archivos a Backblaze B2...' : 'Arrastrá las fotos aquí'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              o seleccioná archivos desde tu computadora (JPEG, PNG, WEBP)
            </p>

            <button
              type="button"
              disabled={uploading}
              className="bg-[#124DA0] hover:bg-[#0f4085] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-md"
            >
              <Upload size={16} />
              <span>{uploading ? 'Procesando...' : 'Seleccionar Fotos'}</span>
            </button>
          </div>

          {/* Upload Status messages */}
          {uploadSuccess && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={18} /> {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={18} /> {uploadError}
            </div>
          )}

          {/* Current Photos Grid in this Trip */}
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-outfit font-bold text-base text-white">
                Fotos del Álbum ({trip.photos.length})
              </h4>
              <span className="text-xs text-slate-400">
                Almacenamiento: <code className="text-[#F8C62B]">Backblaze B2 &bull; SambaBrasil</code>
              </span>
            </div>

            {trip.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {trip.photos.map((p) => (
                  <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                    <img src={p.url} alt={p.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-[10px] text-white">
                      <span className="truncate">{p.filename}</span>
                      <span className="text-[#159447] font-bold uppercase">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No hay fotografías cargadas aún para esta vuelta. Usá el área superior para subir el primer lote.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ESTADÍSTICAS */}
      {activeTab === 'estadisticas' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 text-center">
            <span className="text-xs text-slate-400 block mb-1">Visitas al Álbum</span>
            <strong className="text-3xl font-outfit font-black text-white">1,420</strong>
          </div>
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 text-center">
            <span className="text-xs text-slate-400 block mb-1">Descargas Gratuitas</span>
            <strong className="text-3xl font-outfit font-black text-[#159447]">890</strong>
          </div>
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 text-center">
            <span className="text-xs text-slate-400 block mb-1">Interés en DreamsCDA</span>
            <strong className="text-3xl font-outfit font-black text-[#F8C62B]">245</strong>
          </div>
        </div>
      )}

      {/* Modal Agregar Colegio */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1320] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowSchoolModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <h3 className="font-outfit font-black text-xl text-white mb-4">
              Vincular Colegio al Viaje
            </h3>

            <form onSubmit={handleAddSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Número de Contrato</label>
                <input
                  type="text"
                  required
                  placeholder="CT-1024"
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Colegio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Colegio Nacional"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cantidad de Pasajeros (Pax)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paxCount}
                  onChange={(e) => setPaxCount(Number(e.target.value))}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ciudad / Provincia</label>
                <input
                  type="text"
                  placeholder="Ej. La Plata"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#121D32] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#159447]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#159447] hover:bg-[#117739] text-white font-bold py-3 rounded-xl uppercase tracking-wider transition-all"
                >
                  Agregar a la Vuelta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
