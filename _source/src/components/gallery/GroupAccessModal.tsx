import React, { useState } from 'react';
import { Lock, X, AlertCircle, ArrowRight } from 'lucide-react';
import { Colegio } from '../../types';

interface GroupAccessModalProps {
  isOpen: boolean;
  tripCode: string;
  schools: Colegio[];
  onSuccess: () => void;
  onClose: () => void;
}

export const GroupAccessModal: React.FC<GroupAccessModalProps> = ({
  isOpen,
  tripCode,
  schools,
  onSuccess,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const schoolNamesString =
    schools && schools.length > 0
      ? schools.map((s) => s.name).join(' Y ')
      : tripCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputCode.trim().toUpperCase().replace(/^#/, '');
    const cleanExpected = tripCode.trim().toUpperCase().replace(/^#/, '');

    if (!cleanInput) {
      setErrorMsg('Ingresá el código de grupo para continuar.');
      return;
    }

    if (cleanInput === cleanExpected) {
      setErrorMsg(null);
      // Save unlock state in localStorage so the user is not prompted again
      try {
        localStorage.setItem(`unlocked_group_${cleanExpected}`, 'true');
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      onSuccess();
    } else {
      setErrorMsg('Código de grupo incorrecto. Verificá el código enviado por WhatsApp e intentalo nuevamente.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-[#0A0F1D] border border-[#159447]/30 rounded-3xl p-6 sm:p-9 max-w-md w-full relative shadow-[0_0_60px_rgba(21,148,71,0.25)] text-center transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Volver"
        >
          <X size={20} />
        </button>

        {/* Lock Icon with Samba Brasil Green Glow */}
        <div className="relative mx-auto w-16 h-16 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#159447]/20 rounded-2xl blur-md" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#0E1726] border border-[#159447]/50 flex items-center justify-center text-[#159447] shadow-[0_0_20px_rgba(21,148,71,0.35)]">
            <Lock size={26} strokeWidth={2.2} />
          </div>
        </div>

        {/* Badge: ACCESO PRIVADO AL GRUPO */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/35 text-[#159447] text-[10px] font-bold uppercase tracking-wider mb-3">
          <span>✦</span>
          <span>ACCESO PRIVADO AL GRUPO</span>
        </div>

        {/* Schools / Group Big Title */}
        <h2 className="font-outfit font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-tight mb-2">
          {schoolNamesString}
        </h2>

        {/* Description Copy */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6 max-w-xs mx-auto">
          Ingresá el <strong className="text-white font-bold">Código de Grupo</strong> enviado por WhatsApp para desbloquear y ver la galería oficial de este viaje.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              CÓDIGO DE GRUPO:
            </label>

            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="EJ: 0001"
                className={`w-full bg-[#121A2A] border ${
                  errorMsg
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500'
                    : 'border-[#159447]/40 focus:border-[#159447] focus:ring-2 focus:ring-[#159447]/30'
                } rounded-2xl px-4 py-3.5 text-center font-mono font-black text-lg sm:text-xl text-white placeholder:text-slate-600 uppercase tracking-widest outline-none transition-all`}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-2 text-xs text-rose-400 flex items-start justify-center gap-1.5 animate-fadeIn text-center font-semibold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs sm:text-sm uppercase tracking-wider py-4 rounded-2xl shadow-[0_0_25px_rgba(21,148,71,0.4)] hover:shadow-[0_0_35px_rgba(21,148,71,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>INGRESAR A LA GALERÍA</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-[10px] text-slate-500 mt-5">
          ¿No tenés el código? Pedíselo al coordinador de Samba Brasil asignado a tu colegio.
        </p>
      </div>
    </div>
  );
};