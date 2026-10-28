import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';
import { DownloadProgress } from '../../lib/zipDownloader';

interface DownloadProgressBarProps {
  progress: DownloadProgress | null;
  onCancel: () => void;
  onDismiss: () => void;
}

export const DownloadProgressBar: React.FC<DownloadProgressBarProps> = ({
  progress,
  onCancel,
  onDismiss,
}) => {
  if (!progress) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg animate-slideUp">
      <div className="bg-[#090F1C]/95 backdrop-blur-md border border-[#159447]/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            {progress.isCompleted ? (
              <CheckCircle2 size={18} className="text-[#159447]" />
            ) : progress.isError ? (
              <AlertCircle size={18} className="text-rose-400" />
            ) : (
              <Loader2 size={18} className="animate-spin text-[#159447]" />
            )}

            <div>
              <h4 className="font-outfit font-black text-xs sm:text-sm uppercase tracking-wide">
                {progress.isCompleted
                  ? '¡Descarga Finalizada!'
                  : progress.isError
                  ? 'Descarga Interrumpida'
                  : 'Procesando Descarga...'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {progress.statusText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#159447]">
              {progress.percent}%
            </span>

            {progress.isCompleted || progress.isError ? (
              <button
                type="button"
                onClick={onDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-rose-500/10 cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#121826] rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              progress.isError ? 'bg-rose-500' : 'bg-[#159447]'
            }`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
          <span>{progress.current} / {progress.total} fotos procesadas</span>
          <span>Samba Brasil Channel CDN</span>
        </div>
      </div>
    </div>
  );
};
