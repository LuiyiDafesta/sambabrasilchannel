import React, { useState } from 'react';
import { Instagram, MessageCircle, PlayCircle, Youtube, Mail, ExternalLink, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  return (
    <footer className="bg-[#05090F] pt-16 pb-10 border-t border-white/10 select-none font-sans relative z-20 text-slate-200">
      {/* Symmetrical glowing background radial light in Verde Brasil */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[300px] rounded-full bg-[#159447]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Step 1: 3 Premium Outline Boxes with Green Borders matching group standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Instagram */}
          <a
            href="https://www.instagram.com/sambabrasilchannel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-[#159447] bg-[#0A101A] hover:bg-[#0D1624] transition-all duration-300 group shadow-[0_0_20px_rgba(21,148,71,0.12)] hover:shadow-[0_0_30px_rgba(21,148,71,0.28)] transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border border-[#159447]/30 bg-[#159447]/10 flex items-center justify-center text-[#159447] mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(21,148,71,0.3)]">
              <Instagram size={28} />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider leading-relaxed group-hover:text-[#159447] transition-colors duration-300">
              DISFRUTA LA EXPERIENCIA EN <br /> INSTAGRAM
            </h3>
          </a>

          {/* Card 2: Consultas, comentarios y sugerencias */}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-[#159447] bg-[#0A101A] hover:bg-[#0D1624] transition-all duration-300 group shadow-[0_0_20px_rgba(21,148,71,0.12)] hover:shadow-[0_0_30px_rgba(21,148,71,0.28)] transform hover:-translate-y-1 cursor-pointer w-full"
          >
            <div className="w-16 h-16 rounded-full border border-[#159447]/30 bg-[#159447]/10 flex items-center justify-center text-[#159447] mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(21,148,71,0.3)]">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider leading-relaxed group-hover:text-[#159447] transition-colors duration-300">
              CONSULTAS, COMENTARIOS Y <br /> SUGERENCIAS
            </h3>
          </button>

          {/* Card 3: Experiencia SambaBrasilChannel */}
          <a
            href="#buscador-calendario"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('buscador-calendario') || document.getElementById('hero');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-[#159447] bg-[#0A101A] hover:bg-[#0D1624] transition-all duration-300 group shadow-[0_0_20px_rgba(21,148,71,0.12)] hover:shadow-[0_0_30px_rgba(21,148,71,0.28)] transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border border-[#159447]/30 bg-[#159447]/10 flex items-center justify-center text-[#159447] mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(21,148,71,0.3)]">
              <PlayCircle size={28} />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider leading-relaxed group-hover:text-[#159447] transition-colors duration-300">
              EXPERIENCIA <br /> SAMBABRASILCHANNEL
            </h3>
          </a>

        </div>

        {/* Step 2: 3 Dark Pills Row promoting group companies in brand Verde Brasil */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* Pill 1: SAMBABRASIL */}
          <a
            href="https://travelrock.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#090F19] border border-white/10 hover:border-[#159447]/50 rounded-xl py-5 px-6 text-center shadow-sm hover:shadow-[0_0_20px_rgba(21,148,71,0.2)] transition-all duration-300 group"
          >
            <span className="font-outfit font-black text-lg uppercase tracking-wider text-white group-hover:scale-105 transition-transform duration-300">
              SAMBA<span className="text-[#159447]">BRASIL</span>
            </span>
          </a>

          {/* Pill 2: SAMBABRASILCHANNEL */}
          <Link
            to="/"
            className="flex items-center justify-center bg-[#090F19] border border-white/10 hover:border-[#159447]/50 rounded-xl py-5 px-6 text-center shadow-sm hover:shadow-[0_0_20px_rgba(21,148,71,0.2)] transition-all duration-300 group"
          >
            <span className="font-outfit font-black text-lg uppercase tracking-wider text-[#159447] drop-shadow-[0_0_8px_rgba(21,148,71,0.35)] group-hover:scale-105 transition-transform duration-300">
              SAMBABRASILCHANNEL
            </span>
          </Link>

          {/* Pill 3: DREAMSCDA (in Verde Brasil #159447, NOT orange) */}
          <a
            href="https://dreamscda.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#090F19] border border-white/10 hover:border-[#159447]/50 rounded-xl py-5 px-6 text-center shadow-sm hover:shadow-[0_0_20px_rgba(21,148,71,0.2)] transition-all duration-300 group"
          >
            <span className="font-outfit font-black text-lg uppercase tracking-wider text-white group-hover:scale-105 transition-transform duration-300">
              DREAMS<span className="text-[#159447]">CDA</span>
            </span>
          </a>

        </div>

        {/* Step 3: Big CTA Glowing Bar in Brand Verde Brasil (#159447) */}
        <div className="bg-[#159447] rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(21,148,71,0.35)] mb-12 transform hover:scale-[1.01] transition-transform duration-300">
          <p className="text-white font-outfit font-black text-sm sm:text-base md:text-lg uppercase tracking-widest leading-relaxed drop-shadow-sm">
            SOMOS #SAMBABRASILCHANNEL, LA NUEVA EXPERIENCIA AUDIOVISUAL DE BRASIL. <br className="hidden sm:inline" />
            SUMATE A LA NUEVA EXPERIENCIA SAMBABRASILCHANNEL
          </p>
        </div>

        {/* Step 4: Bottom Copyright & Social Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10 text-xs text-slate-400 font-medium">
          
          {/* Copyright Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-center md:text-left leading-relaxed">
            <span className="text-slate-300 font-bold">TEMPORADA 2026.</span>
            <span>Derechos Reservados 2026 - Samba Brasil Channel - Powered By Dreams CDA</span>
            <span className="hidden sm:inline text-white/20 px-1">|</span>
            <Link to="/terminos" className="hover:text-[#159447] transition-colors">Términos y Condiciones</Link>
            <span className="text-white/20 px-1">|</span>
            <Link to="/privacidad" className="hover:text-[#159447] transition-colors">Política de Privacidad</Link>
            <span className="text-white/20 px-1">|</span>
            <Link to="/admin" className="text-slate-400 hover:text-[#159447] transition-colors">Acceso Admin</Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/sambabrasilchannel"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#159447] flex items-center justify-center text-white border border-white/10 hover:border-[#159447] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(21,148,71,0.4)]"
              aria-label="Instagram Samba Brasil Channel"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.youtube.com/@DREAMSCDA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#159447] flex items-center justify-center text-white border border-white/10 hover:border-[#159447] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(21,148,71,0.4)]"
              aria-label="YouTube DreamsCDA"
            >
              <Youtube size={18} />
            </a>
          </div>

        </div>

      </div>

      {/* Modal for Consultas / Comentarios */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1320] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => {
                setShowContactModal(false);
                setContactSent(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {!contactSent ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 flex items-center justify-center text-[#159447]">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-xl text-white">Consultas y Sugerencias</h3>
                    <p className="text-xs text-slate-400">Equipo de soporte de Samba Brasil Channel</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSent(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Nombre y Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín González"
                      className="w-full bg-[#121D2F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Colegio o N° de Vuelta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Colegio San Martín (SB-102)"
                      className="w-full bg-[#121D2F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Tu Mensaje</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Escribinos tu consulta o sugerencia sobre las fotografías de tu viaje..."
                      className="w-full bg-[#121D2F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#159447] resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#159447] hover:bg-[#117739] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#159447]/30"
                  >
                    <Send size={16} /> Enviar Mensaje
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#159447]/20 border border-[#159447] flex items-center justify-center text-[#159447] mx-auto mb-4">
                  <MessageCircle size={32} />
                </div>
                <h4 className="font-outfit font-black text-2xl text-white mb-2">¡Mensaje Recibido!</h4>
                <p className="text-slate-300 text-sm mb-6">
                  Muchas gracias por comunicarte. Nuestro equipo de coordinación responderá a tu mensaje a la brevedad.
                </p>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSent(false);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
