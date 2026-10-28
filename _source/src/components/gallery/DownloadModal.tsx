import React from 'react';
import {
  FolderArchive,
  Layers,
  Download,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Colegio } from '../../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  schools: Colegio[];
  onDownloadZip: () => void;
  onDownloadIndividual: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  count,
  schools,
  onDownloadZip,
  onDownloadIndividual,
}) => {
  if (!isOpen) return null;

  const schoolsText =
    schools && schools.length > 0
      ? schools.map((s) => s.name).join(', ')
      : 'Samba Brasil Channel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090F1C] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(21,148,71,0.2)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header Pill & Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/30 text-[#159447] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>DESCARGA MÚLTIPLE</span>
          </div>

          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
            DESCARGAR {count} {count === 1 ? 'FOTO' : 'FOTOS'}
          </h2>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-medium">
            <span className="text-white font-bold">{schoolsText}</span> &bull; Elegí cómo preferís descargar tus recuerdos:
          </p>
        </div>

        {/* Options Stack */}
        <div className="space-y-4">
          {/* OPTION 1: ARCHIVO ZIP COMPLETO (RECOMENDADO) */}
          <div className="bg-[#0D1524] border border-[#159447]/40 rounded-2xl p-5 space-y-3.5 relative shadow-lg group hover:border-[#159447] transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#159447]/15 border border-[#159447]/30 text-[#159447] flex items-center justify-center shrink-0">
                <FolderArchive size={24} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-outfit font-black text-sm text-white uppercase tracking-wider">
                    ARCHIVO ZIP COMPLETO
                  </h3>
                  <span className="bg-[#159447] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                    RECOMENDADO
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Un solo archivo <strong className="text-white font-semibold">.zip</strong> con todas las {count} fotos en máxima resolución. Evita bloqueos del navegador y es compatible con celulares y PC.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDownloadZip}
              className="w-full bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(21,148,71,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download size={15} />
              <span>DESCARGAR PAQUETE ZIP ({count} {count === 1 ? 'FOTO' : 'FOTOS'})</span>
            </button>
          </div>

          {/* OPTION 2: FOTOS INDIVIDUALES (EN COLA) */}
          <div className="bg-[#0D1524] border border-white/10 rounded-2xl p-5 space-y-3.5 hover:border-white/20 transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center shrink-0">
                <Layers size={22} />
              </div>

              <div className="flex-1">
                <h3 className="font-outfit font-black text-sm text-white uppercase tracking-wider mb-1">
                  FOTOS INDIVIDUALES (EN COLA)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guarda cada foto como archivo <strong className="text-slate-200">.jpg</strong> separado en tu carpeta de descargas. Si tu navegador muestra un aviso de descargas múltiples, asegurate de hacer clic en <strong className="text-white">Permitir</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDownloadIndividual}
              className="w-full bg-[#121826] hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-outfit font-black uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download size={15} />
              <span>DESCARGAR UNA POR UNA</span>
            </button>
          </div>
        </div>

        {/* Subtext footnote */}
        <p className="text-[11px] text-slate-500 text-center mt-5">
          Podés detener la descarga en cualquier momento desde el indicador inferior.
        </p>
      </div>
    </div>
  );
};
