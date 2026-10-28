import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Link as LinkIcon,
  Check,
  Copy,
  Plus,
  Trash2,
  Edit2,
  X,
  Code,
  MessageSquare,
  ShoppingBag,
  Send,
  Loader2,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  surveyService,
  AppSettings,
  Survey,
  SurveyQuestion,
  SurveyResponse,
} from '../../services/surveyService';

export const AdminSurveyTab: React.FC = () => {
  // Application Settings
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form states for settings
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [dreamscdaEnabled, setDreamscdaEnabled] = useState(true);
  const [trackingScript, setTrackingScript] = useState('');
  const [anychatScript, setAnychatScript] = useState('');

  // Status feedback messages
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});

  // Surveys state
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  // Survey Modal State
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyIsActive, setSurveyIsActive] = useState(true);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: 'q1', text: '', type: 'text' },
  ]);
  const [savingSurvey, setSavingSurvey] = useState(false);

  // Passenger Responses (Inbox)
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [responsesTotal, setResponsesTotal] = useState(0);
  const [responsesPage, setResponsesPage] = useState(1);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [viewingResponse, setViewingResponse] = useState<SurveyResponse | null>(null);

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load all data
  const loadAllData = async () => {
    setLoadingSettings(true);
    setLoadingSurveys(true);
    setLoadingResponses(true);

    try {
      const [appSettings, surveysList, respData] = await Promise.all([
        surveyService.getSettings(),
        surveyService.getSurveys(),
        surveyService.getResponses(responsesPage, 10),
      ]);

      setSettings(appSettings);
      setWebhookUrl(appSettings.webhook_config?.url || '');
      setWebhookEnabled(appSettings.webhook_config?.enabled || false);
      setDreamscdaEnabled(appSettings.dreamscda_banner?.enabled ?? true);
      setTrackingScript(appSettings.tracking_script?.script || '');
      setAnychatScript(appSettings.anychat_script?.script || '');

      setSurveys(surveysList);
      setResponses(respData.items);
      setResponsesTotal(respData.total);
    } finally {
      setLoadingSettings(false);
      setLoadingSurveys(false);
      setLoadingResponses(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [responsesPage]);

  const showTempFeedback = (key: string, msg: string) => {
    setFeedback((prev) => ({ ...prev, [key]: msg }));
    setTimeout(() => {
      setFeedback((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2500);
  };

  // 1. Save Webhook
  const handleSaveWebhook = async () => {
    await surveyService.updateSetting('webhook_config', {
      url: webhookUrl.trim(),
      enabled: webhookEnabled,
    });
    showTempFeedback('webhook', '¡Webhook guardado correctamente!');
  };

  // Toggle Webhook
  const handleToggleWebhook = async () => {
    const nextVal = !webhookEnabled;
    setWebhookEnabled(nextVal);
    await surveyService.updateSetting('webhook_config', {
      url: webhookUrl.trim(),
      enabled: nextVal,
    });
    showTempFeedback('webhook', nextVal ? 'Webhook activado' : 'Webhook desactivado');
  };

  // 2. Toggle DreamsCDA Banner
  const handleToggleDreamscda = async () => {
    const nextVal = !dreamscdaEnabled;
    setDreamscdaEnabled(nextVal);
    await surveyService.updateSetting('dreamscda_banner', { enabled: nextVal });
    showTempFeedback('dreamscda', nextVal ? 'Banner DreamsCDA visible' : 'Banner DreamsCDA oculto');
  };

  // 3. Save Tracking Script
  const handleSaveTrackingScript = async () => {
    await surveyService.updateSetting('tracking_script', { script: trackingScript });
    showTempFeedback('tracking', 'Script de tracking guardado');
  };

  // 4. Save AnyChat Script
  const handleSaveAnychatScript = async () => {
    await surveyService.updateSetting('anychat_script', { script: anychatScript });
    showTempFeedback('anychat', 'Script de AnyChat guardado');
  };

  // Open Create Survey Modal
  const openCreateSurveyModal = () => {
    setEditingSurveyId(null);
    setSurveyTitle('');
    setSurveyDescription('');
    setSurveyIsActive(true);
    setQuestions([
      { id: `q-${Date.now()}-1`, text: '', type: 'text' },
      { id: `q-${Date.now()}-2`, text: '', type: 'rating_1_10' },
    ]);
    setSurveyModalOpen(true);
  };

  // Open Edit Survey Modal
  const openEditSurveyModal = (survey: Survey) => {
    setEditingSurveyId(survey.id);
    setSurveyTitle(survey.title);
    setSurveyDescription(survey.description || '');
    setSurveyIsActive(survey.is_active);
    setQuestions(
      survey.questions && survey.questions.length > 0
        ? survey.questions
        : [{ id: `q-${Date.now()}-1`, text: '', type: 'text' }]
    );
    setSurveyModalOpen(true);
  };

  // Add Question to Modal
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}-${prev.length + 1}`, text: '', type: 'rating_1_10' },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Change Question
  const handleQuestionChange = (id: string, field: 'text' | 'type', value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Save Survey (Create or Update)
  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyTitle.trim()) return;

    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      alert('Debes ingresar al menos una pregunta válida.');
      return;
    }

    setSavingSurvey(true);
    try {
      if (editingSurveyId) {
        await surveyService.updateSurvey(editingSurveyId, {
          title: surveyTitle,
          description: surveyDescription,
          questions: validQuestions,
          is_active: surveyIsActive,
        });
      } else {
        await surveyService.createSurvey({
          title: surveyTitle,
          description: surveyDescription,
          questions: validQuestions,
          is_active: surveyIsActive,
        });
      }
      setSurveyModalOpen(false);
      const updated = await surveyService.getSurveys();
      setSurveys(updated);
    } finally {
      setSavingSurvey(false);
    }
  };

  // Toggle Survey Active
  const handleToggleSurvey = async (survey: Survey) => {
    await surveyService.toggleSurveyActive(survey.id, !survey.is_active);
    const updated = await surveyService.getSurveys();
    setSurveys(updated);
  };

  // Delete Survey
  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta encuesta?')) return;
    await surveyService.deleteSurvey(surveyId);
    const updated = await surveyService.getSurveys();
    setSurveys(updated);
  };

  // Copy Survey Link
  const handleCopySurveyLink = (surveyId: string) => {
    const fullUrl = `${window.location.origin}/buscar?encuesta=${surveyId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(surveyId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ============================================================ */}
      {/* 1. HEADER SECTION (Image 1) */}
      {/* ============================================================ */}
      <div className="bg-[#0B101C] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#159447]/10 border border-[#159447]/30 text-[10px] font-bold uppercase tracking-wider text-[#159447] mb-2">
          <span>✦</span>
          <span>MÓDULO DE CRM & LEADS</span>
        </div>
        <h2 className="font-outfit font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-2 leading-tight">
          CREADOR AVANZADO & INBOX DE RESPUESTAS
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Armá encuestas dinámicas, conectá tu CRM mediante webhooks y visualizá opiniones en tiempo real.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 2. CONFIGURATION CARDS (Image 1) */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* CARD 1: CONEXIÓN DE WEBHOOK (N8N) */}
        <div className="bg-[#090E18] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#159447] block mb-0.5">
                CRM & AUTOMATIZACIONES
              </span>
              <h3 className="font-outfit font-bold text-base text-white uppercase">
                CONEXIÓN DE WEBHOOK (N8N)
              </h3>
              <p className="text-xs text-slate-400">
                Configurá tu endpoint para disparar un webhook en segundo plano con los datos del lead y sus respuestas al instante.
              </p>
            </div>

            {/* Toggle switch for webhook */}
            <button
              type="button"
              onClick={handleToggleWebhook}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                webhookEnabled
                  ? 'bg-[#159447]/20 border-[#159447] text-white shadow-[0_0_12px_rgba(21,148,71,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <span>{webhookEnabled ? 'ACTIVO' : 'INACTIVO'}</span>
              {webhookEnabled ? <ToggleRight size={18} className="text-[#159447]" /> : <ToggleLeft size={18} />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.tu-servidor.com/webhook/..."
              className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-[#159447] transition-colors"
            />
            <button
              type="button"
              onClick={handleSaveWebhook}
              className="w-full sm:w-auto whitespace-nowrap bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(21,148,71,0.35)] transition-all cursor-pointer"
            >
              CONECTAR WEBHOOK
            </button>
          </div>
          {feedback.webhook && (
            <span className="text-[11px] text-[#159447] font-semibold flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 size={12} /> {feedback.webhook}
            </span>
          )}
        </div>

        {/* CARD 2: BANNER DE VENTAS DE FOTOS (DREAMSCDA) */}
        <div className="bg-[#090E18] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#159447] block mb-0.5">
              VENTAS Y PROMOCIONES
            </span>
            <h3 className="font-outfit font-bold text-base text-white uppercase">
              BANNER DE VENTAS DE FOTOS (DREAMSCDA)
            </h3>
            <p className="text-xs text-slate-400">
              Habilitá o deshabilitá el banner premium de redirección en las galerías públicas al instante.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDreamscda}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              dreamscdaEnabled
                ? 'bg-[#159447]/20 border-[#159447] text-white shadow-[0_0_15px_rgba(21,148,71,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span>{dreamscdaEnabled ? 'ACTIVO (MOSTRAR)' : 'INACTIVO (OCULTAR)'}</span>
            {dreamscdaEnabled ? <ToggleRight size={20} className="text-[#159447]" /> : <ToggleLeft size={20} />}
          </button>
        </div>

        {/* CARD 3: SCRIPT DE VISITOR TRACKING / ANALYTICS */}
        <div className="bg-[#090E18] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#159447] block mb-0.5">
              SEGUIMIENTO WEB AVANZADO
            </span>
            <h3 className="font-outfit font-bold text-base text-white uppercase">
              SCRIPT DE VISITOR TRACKING / ANALYTICS
            </h3>
            <p className="text-xs text-slate-400">
              Pegá tu fragmento de código de seguimiento completo (incluyendo etiquetas &lt;script&gt;) para inyectarlo en las páginas públicas.
            </p>
          </div>

          <textarea
            rows={4}
            value={trackingScript}
            onChange={(e) => setTrackingScript(e.target.value)}
            placeholder="<script async defer src='https://app.visitortracking.com/assets/js/tracer.js'></script>&#10;<script>...</script>"
            className="w-full bg-[#121826] border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#159447] transition-colors"
          />

          <div className="flex items-center justify-between">
            {feedback.tracking ? (
              <span className="text-[11px] text-[#159447] font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 size={12} /> {feedback.tracking}
              </span>
            ) : <span />}
            <button
              type="button"
              onClick={handleSaveTrackingScript}
              className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(21,148,71,0.35)] transition-all cursor-pointer"
            >
              GUARDAR SCRIPT DE TRACKING
            </button>
          </div>
        </div>

        {/* CARD 4: SCRIPT DE ANYCHAT */}
        <div className="bg-[#090E18] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#159447] block mb-0.5">
              SOPORTE EN VIVO
            </span>
            <h3 className="font-outfit font-bold text-base text-white uppercase">
              SCRIPT DE ANYCHAT
            </h3>
            <p className="text-xs text-slate-400">
              Pegá tu fragmento de código de AnyChat (incluyendo etiquetas &lt;script&gt;) para inyectarlo y activar el chat en la parte pública del sitio.
            </p>
          </div>

          <textarea
            rows={4}
            value={anychatScript}
            onChange={(e) => setAnychatScript(e.target.value)}
            placeholder="<!-- Pegá aquí tu código de widget de AnyChat -->&#10;<script>...</script>"
            className="w-full bg-[#121826] border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#159447] transition-colors"
          />

          <div className="flex items-center justify-between">
            {feedback.anychat ? (
              <span className="text-[11px] text-[#159447] font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 size={12} /> {feedback.anychat}
              </span>
            ) : <span />}
            <button
              type="button"
              onClick={handleSaveAnychatScript}
              className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(21,148,71,0.35)] transition-all cursor-pointer"
            >
              GUARDAR SCRIPT DE ANYCHAT
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CUESTIONARIOS DE SATISFACCIÓN (Image 2) */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#159447]" />
            <h3 className="font-outfit font-black text-lg sm:text-xl text-white uppercase tracking-tight">
              CUESTIONARIOS DE SATISFACCIÓN ({surveys.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={openCreateSurveyModal}
            className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(21,148,71,0.35)] flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus size={15} strokeWidth={3} />
            <span>CREAR ENCUESTA</span>
          </button>
        </div>

        {/* Surveys Table */}
        <div className="bg-[#090E18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loadingSurveys ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#159447]" size={22} />
              <span className="text-xs">Cargando encuestas...</span>
            </div>
          ) : surveys.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-white mb-1">No hay encuestas creadas</p>
              <p className="text-xs text-slate-500 mb-4">
                Hacé clic en "+ CREAR ENCUESTA" para publicar la primera encuesta de satisfacción.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-[#0C1220]/60">
                    <th className="py-4 px-5">TÍTULO / DESCRIPCIÓN</th>
                    <th className="py-4 px-5">PREGUNTAS</th>
                    <th className="py-4 px-5">ESTADO</th>
                    <th className="py-4 px-5">WHATSAPP / COPIAR ENLACE</th>
                    <th className="py-4 px-5 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {surveys.map((survey) => {
                    const isCopied = copiedLink === survey.id;
                    return (
                      <tr key={survey.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Titulo */}
                        <td className="py-4 px-5 align-middle">
                          <div>
                            <strong className="text-white text-sm font-outfit block uppercase">
                              {survey.title}
                            </strong>
                            <span className="text-slate-400 text-[11px] line-clamp-1">
                              {survey.description || 'Sin descripción adicional'}
                            </span>
                          </div>
                        </td>

                        {/* Preguntas */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447]/10 border border-[#159447]/30 text-[#159447] font-bold text-[11px]">
                            <Sparkles size={11} />
                            {survey.questions?.length || 0} PREGUNTAS
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleSurvey(survey)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border cursor-pointer transition-all ${
                              survey.is_active
                                ? 'bg-[#159447]/20 border-[#159447] text-white shadow-[0_0_10px_rgba(21,148,71,0.3)]'
                                : 'bg-slate-800 border-white/10 text-slate-400'
                            }`}
                          >
                            <span>{survey.is_active ? 'ACTIVA' : 'INACTIVA'}</span>
                          </button>
                        </td>

                        {/* Copiar enlace */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopySurveyLink(survey.id)}
                            className="inline-flex items-center gap-1.5 bg-[#121826] hover:bg-[#159447] text-slate-200 hover:text-white border border-white/10 hover:border-[#159447] px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase transition-all shadow-sm"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                            <span>{isCopied ? '¡COPIADO!' : 'COPIAR ENLACE'}</span>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditSurveyModal(survey)}
                              className="p-2 rounded-xl bg-[#121826] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                              title="Editar preguntas"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSurvey(survey.id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-colors"
                              title="Eliminar encuesta"
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
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BANDEJA DE ENTRADA: RESPUESTAS DE PASAJEROS (Image 2) */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#159447]" />
            <h3 className="font-outfit font-black text-lg sm:text-xl text-white uppercase tracking-tight">
              BANDEJA DE ENTRADA: RESPUESTAS DE PASAJEROS
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            TOTAL: {responsesTotal} LEADS
          </span>
        </div>

        <div className="bg-[#090E18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loadingResponses ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#159447]" size={22} />
              <span className="text-xs">Cargando respuestas...</span>
            </div>
          ) : responses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <HelpCircle size={22} />
              </div>
              <h4 className="font-outfit font-bold text-sm text-white uppercase mb-1">
                NO SE HAN RECIBIDO RESPUESTAS AÚN
              </h4>
              <p className="text-xs text-slate-500">
                Comparte un enlace de encuesta con tus pasajeros para recopilar leads y opiniones.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-[#0C1220]/60">
                    <th className="py-4 px-5">PASAJERO / LEAD</th>
                    <th className="py-4 px-5">EMAIL & CONTACTO</th>
                    <th className="py-4 px-5">GRUPO / COLEGIO</th>
                    <th className="py-4 px-5">FECHA DE ENVÍO</th>
                    <th className="py-4 px-5 text-right">RESPUESTAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {responses.map((resp) => (
                    <tr key={resp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 align-middle font-bold text-white uppercase">
                        {resp.lead_name}
                      </td>
                      <td className="py-4 px-5 align-middle text-slate-300">
                        <div>
                          <span className="block font-mono text-[11px]">{resp.lead_email}</span>
                          {resp.lead_phone && (
                            <span className="text-[10px] text-slate-500">{resp.lead_phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 align-middle">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10 text-white font-bold text-[11px] uppercase">
                          {resp.group_code || resp.school_name || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-5 align-middle text-slate-400 font-mono text-[11px]">
                        {resp.created_at ? new Date(resp.created_at).toLocaleString('es-AR') : '-'}
                      </td>
                      <td className="py-4 px-5 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => setViewingResponse(resp)}
                          className="bg-[#121826] hover:bg-[#159447] text-slate-200 hover:text-white border border-white/10 hover:border-[#159447] px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          <span>VER ({resp.answers?.length || 0})</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: CREAR / EDITAR ENCUESTA (Images 3 & 4) */}
      {/* ============================================================ */}
      {surveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090F1C] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSurveyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#159447] mb-1">
                <span>✦</span>
                <span>NUEVA ENCUESTA ESTUDIANTIL</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-white uppercase">
                {editingSurveyId ? 'Editar Cuestionario' : 'Crear Encuesta de Satisfacción'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generá un cuestionario interactivo con formato de texto, escala del 1 al 10 o verdadero/falso.
              </p>
            </div>

            <form onSubmit={handleSaveSurvey} className="space-y-6">
              {/* TÍTULO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Título de la Encuesta
                </label>
                <input
                  type="text"
                  required
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="Ej: Tu opinión sobre el viaje / Puntuación Coordinador"
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#159447] transition-colors"
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Descripción / Copia Explicativa
                </label>
                <textarea
                  rows={2}
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  placeholder="Queremos saber qué tal te pareció la experiencia de Samba Brasil..."
                  className="w-full bg-[#121826] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                />
              </div>

              {/* PREGUNTAS DEL CUESTIONARIO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#159447]">
                    Preguntas del Cuestionario ({questions.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-[11px] font-bold text-[#159447] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Agregar pregunta</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-[#0D1424] border border-white/10 rounded-2xl p-4 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                          PREGUNTA #{idx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar pregunta"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Texto de la pregunta */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Texto de la pregunta:
                        </label>
                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                          placeholder="Ej. ¿Cómo calificarías la excursión a Playa Brava?"
                          className="w-full bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#159447] transition-colors"
                        />
                      </div>

                      {/* Tipo de respuesta (Image 4 dropdown options) */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Tipo de respuesta:
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                          className="w-full bg-[#121826] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#159447] appearance-none"
                        >
                          <option value="text">Texto Libre (Comentarios y sugerencias abiertas)</option>
                          <option value="rating_1_10">Numérica del 1 al 10 (Botones de puntuación)</option>
                          <option value="boolean">Verdadero o Falso (Botones de conformidad Sí/No)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVAR ENCUESTA PARA PASAJEROS */}
              <div className="bg-[#0D1524] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <strong className="text-white text-xs uppercase font-bold">
                      ACTIVAR ENCUESTA PARA PASAJEROS
                    </strong>
                    {surveyIsActive && (
                      <span className="bg-[#159447]/20 border border-[#159447]/40 text-[#159447] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                        ACTIVA EN LA GALERÍA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    La encuesta aparecerá inmediatamente activa en la galería de los egresados con el botón "Responder Encuesta".
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={surveyIsActive}
                  onChange={(e) => setSurveyIsActive(e.target.checked)}
                  className="w-5 h-5 accent-[#159447] rounded cursor-pointer"
                />
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSurveyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors uppercase"
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={savingSurvey}
                  className="bg-[#159447] hover:bg-[#117739] text-white font-outfit font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(21,148,71,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {savingSurvey && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingSurveyId ? 'GUARDAR CAMBIOS' : 'CREAR Y PUBLICAR ENCUESTA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: DETALLES DE RESPUESTA DE LEAD */}
      {/* ============================================================ */}
      {viewingResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090F1C] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingResponse(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#159447] block mb-1">
              DETALLE DE RESPUESTA
            </span>
            <h3 className="font-outfit font-black text-2xl text-white uppercase mb-1">
              {viewingResponse.lead_name}
            </h3>
            <div className="text-xs text-slate-400 mb-6 space-y-0.5">
              <p>Email: <strong className="text-white">{viewingResponse.lead_email}</strong></p>
              {viewingResponse.lead_phone && (
                <p>Teléfono: <strong className="text-white">{viewingResponse.lead_phone}</strong></p>
              )}
              {viewingResponse.group_code && (
                <p>Grupo: <strong className="text-[#159447]">{viewingResponse.group_code}</strong></p>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                Respuestas a las Preguntas:
              </h4>
              {viewingResponse.answers && viewingResponse.answers.length > 0 ? (
                viewingResponse.answers.map((ans, idx) => (
                  <div key={idx} className="bg-[#0D1424] border border-white/10 rounded-xl p-3.5">
                    <span className="text-[11px] text-slate-400 font-bold block mb-1">
                      {ans.question_text}
                    </span>
                    <strong className="text-white text-xs block bg-black/30 p-2 rounded-lg">
                      {String(ans.answer)}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Sin respuestas detalladas.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setViewingResponse(null)}
                className="bg-[#159447] text-white text-xs font-black uppercase px-5 py-2 rounded-xl"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

