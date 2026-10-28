import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Survey, surveyService } from '../../services/surveyService';

interface PassengerSurveyModalProps {
  survey: Survey;
  groupCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PassengerSurveyModal: React.FC<PassengerSurveyModalProps> = ({
  survey,
  groupCode,
  isOpen,
  onClose,
}) => {
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [answers, setAnswers] = useState<{ [qId: string]: string | number | boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleAnswerChange = (qId: string, val: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) {
      alert('Por favor completá tu nombre y correo electrónico.');
      return;
    }

    setSubmitting(true);
    try {
      const answersPayload = survey.questions.map((q) => ({
        question_id: q.id,
        question_text: q.text,
        answer: answers[q.id] !== undefined ? answers[q.id] : '',
      }));

      await surveyService.submitResponse({
        survey_id: survey.id,
        survey_title: survey.title,
        lead_name: leadName.trim(),
        lead_email: leadEmail.trim(),
        lead_phone: leadPhone.trim() || undefined,
        group_code: groupCode,
        answers: answersPayload,
      });

      setSubmitted(true);
    } catch (err: any) {
      alert(`Error al enviar tu opinión: ${err.message || 'Error inesperado'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090F1C] border border-[#159447]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_0_50px_rgba(21,148,71,0.2)] max-h-[90vh] overflow-y-auto selection:bg-[#159447] selection:text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/15 border border-[#159447]/30 text-[#159447] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={13} />
                <span>EXPERIENCIA SAMBA BRASIL</span>
              </div>
              <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white uppercase leading-tight">
                {survey.title}
              </h3>
              {survey.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {survey.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DATOS DEL EGRESADO / PASAJERO */}
              <div className="bg-[#0D1524] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#159447] block">
                  TUS DATOS DE CONTACTO
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Ej: +54 9 11 1234-5678"
                    className="w-full bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                  />
                </div>
              </div>

              {/* LISTADO DE PREGUNTAS */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#159447] block">
                  PREGUNTAS DE LA ENCUESTA ({survey.questions.length})
                </span>

                {survey.questions.map((q, idx) => (
                  <div key={q.id} className="bg-[#0B1220] border border-white/10 rounded-2xl p-4 space-y-2.5">
                    <label className="block text-xs font-bold text-white">
                      <span className="text-[#159447] mr-1.5 font-mono">#{idx + 1}</span>
                      {q.text}
                    </label>

                    {/* TYPE: TEXT */}
                    {q.type === 'text' && (
                      <textarea
                        rows={3}
                        required
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Escribí aquí tu opinión o comentarios..."
                        className="w-full bg-[#121826] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                      />
                    )}

                    {/* TYPE: 1 to 10 RATING BUTTONS */}
                    {q.type === 'rating_1_10' && (
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const isSelected = answers[q.id] === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, num)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.5)] scale-110'
                                    : 'bg-[#121826] hover:bg-white/10 text-slate-300 border border-white/10'
                                }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                          <span>1 (Muy insatisfecho)</span>
                          <span>10 (Excelente)</span>
                        </div>
                      </div>
                    )}

                    {/* TYPE: BOOLEAN (Sí / No) */}
                    {q.type === 'boolean' && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(q.id, true)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            answers[q.id] === true
                              ? 'bg-[#159447] text-white border-[#159447] shadow-[0_0_12px_rgba(21,148,71,0.4)]'
                              : 'bg-[#121826] text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          SÍ / VERDADERO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(q.id, false)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            answers[q.id] === false
                              ? 'bg-[#159447] text-white border-[#159447] shadow-[0_0_12px_rgba(21,148,71,0.4)]'
                              : 'bg-[#121826] text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          NO / FALSO
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-sm uppercase tracking-wider py-3.5 rounded-2xl shadow-[0_0_20px_rgba(21,148,71,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>ENVIAR MI OPINIÓN</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* CONFIRMATION STATE */
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(21,148,71,0.3)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-outfit font-black text-2xl text-white uppercase">
              ¡Muchas Gracias por tu Opinión!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Tus respuestas fueron recibidas con éxito. Nos ayudan a seguir mejorando cada viaje de Samba Brasil Channel.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              CERRAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

