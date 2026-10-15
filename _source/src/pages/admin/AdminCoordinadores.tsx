import React from 'react';
import { Users, Mail, Phone, Calendar, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCoordinadores: React.FC = () => {
  const coordinators = [
    { id: 'c-1', name: 'Juan Pérez', email: 'juan.perez@sambabrasil.com.ar', phone: '+54 9 11 5821-4920', trips: ['SB-102', 'SB-110'] },
    { id: 'c-2', name: 'Laura Gómez', email: 'laura.gomez@sambabrasil.com.ar', phone: '+54 9 11 6390-1284', trips: ['SB-103'] },
    { id: 'c-3', name: 'Martín Díaz', email: 'martin.diaz@sambabrasil.com.ar', phone: '+54 9 11 4412-8901', trips: ['SB-104'] },
    { id: 'c-4', name: 'Florencia Rossi', email: 'florencia.rossi@sambabrasil.com.ar', phone: '+54 9 11 3280-9912', trips: ['SB-105'] },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">
          Coordinadores
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Equipo a cargo del acompañamiento y supervisión de contingentes en Brasil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coordinators.map((c) => (
          <div key={c.id} className="bg-[#0C1424] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#159447]/20 border border-[#159447]/40 text-[#159447] flex items-center justify-center font-outfit font-bold text-xl mb-4">
                {c.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3 className="font-outfit font-bold text-lg text-white mb-1">{c.name}</h3>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                <Mail size={13} className="text-[#F8C62B]" /> {c.email}
              </p>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                <Phone size={13} className="text-[#159447]" /> {c.phone}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-bold">
                Vueltas asignadas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {c.trips.map((code) => (
                  <Link
                    key={code}
                    to={`/admin/vueltas/${code}`}
                    className="bg-[#124DA0]/30 hover:bg-[#124DA0]/60 text-white font-mono text-[11px] px-2 py-0.5 rounded border border-[#124DA0]/50"
                  >
                    {code}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
