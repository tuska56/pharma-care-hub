import React from 'react';
import { DIAS_SEMANA, MESES, TIPOS_EVENTO } from './constants';

export default function CalendarioAnual({ anio, empleado, eventos, festivos, guardias }) {
  const obtenerEventosDia = (fecha) => {
    const eventos_dia = [];
    const evento = eventos.find(e => 
      e.empleado_id === empleado.id && 
      fecha >= e.fecha_inicio && 
      fecha <= e.fecha_fin
    );
    if (evento) eventos_dia.push({ tipo: 'evento', data: evento });
    const festivo = festivos.find(f => f.fecha === fecha);
    if (festivo) eventos_dia.push({ tipo: 'festivo', data: festivo });
    const guardia = guardias.find(g => g.empleado_id === empleado.id && g.fecha === fecha);
    if (guardia) eventos_dia.push({ tipo: 'guardia', data: guardia });
    return eventos_dia;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Calendario Anual {anio}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, mesIdx) => {
          const primerDia = new Date(anio, mesIdx, 1);
          const ultimoDia = new Date(anio, mesIdx + 1, 0);
          const diasMes = ultimoDia.getDate();
          // Semana empieza en Lunes (0=Lun, 6=Dom)
          const primerDiaSemana = (primerDia.getDay() + 6) % 7;
          
          return (
            <div key={mesIdx} className="border border-gray-200 rounded-xl p-3 bg-white/60 backdrop-blur-sm">
              <h4 className="font-semibold text-center mb-2 text-sm text-gray-800">{MESES[mesIdx]}</h4>
              <div className="grid grid-cols-7 gap-0.5">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-[10px] font-bold text-center text-gray-500 py-0.5">{d}</div>
                ))}
                {[...Array(primerDiaSemana)].map((_, i) => <div key={`empty-${i}`} />)}
                {[...Array(diasMes)].map((_, dia) => {
                  const fecha = `${anio}-${String(mesIdx + 1).padStart(2, '0')}-${String(dia + 1).padStart(2, '0')}`;
                  const diaSemana = new Date(fecha + 'T12:00:00').getDay();
                  const eventosDia = obtenerEventosDia(fecha);
                  
                  let bgColor = '';
                  let letra = '';
                  
                  if (diaSemana === 0) bgColor = 'bg-gray-100'; // domingo
                  
                  eventosDia.forEach(ev => {
                    if (ev.tipo === 'evento') {
                      bgColor = TIPOS_EVENTO[ev.data.tipo_evento]?.bgLight || 'bg-gray-100';
                      letra = TIPOS_EVENTO[ev.data.tipo_evento]?.letra || '';
                    } else if (ev.tipo === 'festivo') {
                      bgColor = 'bg-yellow-100';
                      letra = ev.data.medio_dia ? 'F½' : 'F';
                    } else if (ev.tipo === 'guardia') {
                      letra = letra ? letra + ',G' : 'G';
                    }
                  });
                  
                  return (
                    <div key={dia} className={`h-7 ${bgColor} rounded flex flex-col items-center justify-center text-xs relative transition-colors hover:ring-1 hover:ring-blue-300`}>
                      <span className="font-medium text-[11px] text-gray-700">{dia + 1}</span>
                      {letra && <span className="text-[7px] font-bold absolute bottom-0 text-gray-600">{letra}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-2">
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-blue-100 rounded-sm border border-blue-200"></div><span>V - Vacaciones</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-purple-100 rounded-sm border border-purple-200"></div><span>A - Asuntos Propios</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-cyan-100 rounded-sm border border-cyan-200"></div><span>SL - Sábado Libre</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-red-100 rounded-sm border border-red-200"></div><span>F - Falta</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-green-100 rounded-sm border border-green-200"></div><span>+ - Horas Extra</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-yellow-100 rounded-sm border border-yellow-200"></div><span>F - Festivo</span></div>
      </div>
    </div>
  );
}