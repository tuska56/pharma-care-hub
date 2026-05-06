import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DIAS_SEMANA, MESES, TIPOS_EVENTO } from './constants';

export default function CalendarioGlobal({ anio, empleados, eventos, festivos }) {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  
  const obtenerEventosDia = (fecha) => {
    const eventos_dia = [];
    empleados.forEach(emp => {
      const evento = eventos.find(e => 
        e.empleado_id === emp.id && 
        ['VACACIONES', 'ASUNTOS_PROPIOS', 'SABADO_LIBRE'].includes(e.tipo_evento) &&
        fecha >= e.fecha_inicio && 
        fecha <= e.fecha_fin
      );
      if (evento) {
        eventos_dia.push({
          empleado: emp.nombre,
          letra: TIPOS_EVENTO[evento.tipo_evento]?.letra || '',
          color: TIPOS_EVENTO[evento.tipo_evento]?.bgLight || 'bg-gray-100'
        });
      }
    });
    const festivo = festivos.find(f => f.fecha === fecha);
    if (festivo) {
      eventos_dia.push({
        empleado: festivo.descripcion,
        letra: festivo.medio_dia ? 'F½' : 'F',
        color: 'bg-yellow-100'
      });
    }
    return eventos_dia;
  };
  
  const primerDia = new Date(anio, mesActual, 1);
  const diasMes = new Date(anio, mesActual + 1, 0).getDate();
  // Semana empieza en Lunes
  const primerDiaSemana = (primerDia.getDay() + 6) % 7;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{MESES[mesActual]} {anio}</h3>
        <div className="flex gap-1">
          <button onClick={() => setMesActual((mesActual - 1 + 12) % 12)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setMesActual((mesActual + 1) % 12)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-xs font-semibold text-center text-gray-500 pb-1">{d}</div>
        ))}
        {[...Array(primerDiaSemana)].map((_, i) => <div key={`empty-${i}`} className="h-20" />)}
        {[...Array(diasMes)].map((_, dia) => {
          const fecha = `${anio}-${String(mesActual + 1).padStart(2, '0')}-${String(dia + 1).padStart(2, '0')}`;
          const diaSemana = new Date(fecha + 'T12:00:00').getDay();
          const eventosDia = obtenerEventosDia(fecha);
          
          return (
            <div key={dia} className={`h-20 border border-gray-100 rounded-lg p-1.5 ${diaSemana === 0 ? 'bg-gray-50/80' : 'bg-white/80'} overflow-y-auto transition-colors hover:border-blue-200`}>
              <div className="font-semibold text-xs text-gray-700 mb-0.5">{dia + 1}</div>
              <div className="space-y-0.5">
                {eventosDia.map((ev, idx) => (
                  <div key={idx} className={`text-[9px] ${ev.color} rounded px-1 py-0.5 truncate`}>
                    {ev.empleado} {ev.letra}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}