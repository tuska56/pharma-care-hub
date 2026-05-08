/**
 * Vista de solo-lectura para el rol "empleado" (user).
 * Puede ver su calendario, estadísticas, solicitar eventos e imprimir PDF.
 * NO ve Asuntos Propios.
 */
import React, { useState } from 'react';
import { FileText, Plus, Save, Clock } from 'lucide-react';
import CalendarioAnual from './CalendarioAnual';
import ModalGenerico from './ModalGenerico';
import { TIPOS_EVENTO } from './constants';
import { exportarPDFEmpleado } from './exportPDF';

const ESTADO_BADGE = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
  APROBADO:  { label: 'Aprobado',  cls: 'bg-green-100 text-green-700' },
  RECHAZADO: { label: 'Rechazado', cls: 'bg-red-100 text-red-600' },
};

// Tipos que el empleado puede solicitar (sin asuntos propios)
const TIPOS_EMPLEADO = {
  VACACIONES:  TIPOS_EVENTO.VACACIONES,
  SABADO_LIBRE: TIPOS_EVENTO.SABADO_LIBRE,
  FALTA_HORAS: TIPOS_EVENTO.FALTA_HORAS,
};

export default function VistaEmpleadoRO({
  empleado, estadistica, anioActual, eventos, festivos, guardias,
  logoUrl, onSolicitarEvento, onActualizarEvento, onEliminarEvento
}) {
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [editandoEvento, setEditandoEvento] = useState(null);
  const [formEvento, setFormEvento] = useState({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '' });

  if (!empleado || !estadistica) return null;

  const stat = estadistica;
  // Solo mostrar eventos no rechazados para el empleado
  const empEventos = eventos.filter(e => e.empleado_id === empleado.id);
  const hoy = new Date().toISOString().split('T')[0];

  const enviarSolicitud = () => {
    if (!formEvento.fecha_inicio || !formEvento.fecha_fin) return;
    const data = {
      empleado_id: empleado.id,
      tipo_evento: formEvento.tipo_evento,
      fecha_inicio: formEvento.fecha_inicio,
      fecha_fin: formEvento.fecha_fin,
      horas: formEvento.tipo_evento === 'FALTA_HORAS' ? parseFloat(formEvento.horas) || 0 : null,
      turno: formEvento.tipo_evento === 'FALTA_HORAS' ? formEvento.turno : 'DIA_COMPLETO',
      comentario: formEvento.comentario || '',
      estado: 'PENDIENTE',
      solicitado_por_empleado: true,
    };
    if (editandoEvento) {
      onActualizarEvento({ id: editandoEvento.id, data });
    } else {
      onSolicitarEvento(data);
    }
    setModalSolicitud(false);
    setEditandoEvento(null);
    setFormEvento({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '' });
  };

  const puedeModificar = (ev) => {
    // Solo puede pedir cambio si el evento no es pasado
    return ev.fecha_fin >= hoy;
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: '#1239AD' }}>
            {empleado.nombre?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hola, {empleado.nombre}</h1>
            <p className="text-sm text-gray-500">Año {anioActual} · Alta: {empleado.fecha_alta}</p>
          </div>
        </div>
      </div>

      {/* Stats — sin Asuntos Propios */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: '#1239AD', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vacaciones</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#1239AD' }}>{stat.vacaciones.disponibles}<span className="text-lg text-gray-400">/{stat.vacaciones.total}</span></p>
          <p className="text-[11px] text-gray-400 mt-1">días disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: '#99B9AF', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sábados Libres</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#99B9AF' }}>{stat.sabados.usados}<span className="text-lg text-gray-400">/{stat.sabados.porSaldo}</span></p>
          <p className="text-[11px] text-gray-400 mt-1">usados / disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: stat.horas.saldo >= 0 ? '#16a34a' : '#dc2626', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Horas</p>
          <p className={`text-3xl font-bold mt-2 ${stat.horas.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {stat.horas.saldo > 0 ? '+' : ''}{stat.horas.saldo}h
          </p>
          <p className="text-[11px] text-gray-400 mt-1">respecto al convenio</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setEditandoEvento(null); setFormEvento({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '' }); setModalSolicitud(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#1239AD' }}
        >
          <Plus size={16} /> Solicitar Ausencia
        </button>
        <button
          onClick={() => exportarPDFEmpleado({ empleado, estadistica, anioActual, eventos, festivos, guardias, logoUrl })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <FileText size={16} /> Ver mi PDF
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <CalendarioAnual anio={anioActual} empleado={empleado} eventos={eventos} festivos={festivos} guardias={guardias} />
      </div>

      {/* Mis eventos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Mis Ausencias</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {empEventos.map(ev => {
            const badge = ESTADO_BADGE[ev.estado || 'APROBADO'];
            const isPendiente = ev.estado === 'PENDIENTE';
            const modificable = puedeModificar(ev);
            return (
              <div key={ev.id} className={`p-4 flex items-center justify-between ${isPendiente ? 'bg-amber-50/40' : ''}`}>
                <div className="flex items-center gap-3">
                  {isPendiente ? <Clock size={14} className="text-amber-500" /> : <div className={`w-2.5 h-2.5 rounded-full ${TIPOS_EVENTO[ev.tipo_evento]?.color || 'bg-gray-400'}`}></div>}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900">{TIPOS_EVENTO[ev.tipo_evento]?.label || ev.tipo_evento}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ev.fecha_inicio} → {ev.fecha_fin}</p>
                    {ev.comentario && <p className="text-xs text-gray-400 mt-0.5">💬 {ev.comentario}</p>}
                    {ev.comentario_admin && <p className="text-xs text-blue-500 mt-0.5">Admin: {ev.comentario_admin}</p>}
                  </div>
                </div>
                {modificable && (ev.estado === 'PENDIENTE' || ev.estado === 'APROBADO') && (
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-xs text-gray-500" title="Modificar solicitud" onClick={() => {
                      setEditandoEvento(ev);
                      setFormEvento({ tipo_evento: ev.tipo_evento, fecha_inicio: ev.fecha_inicio, fecha_fin: ev.fecha_fin, horas: ev.horas || 0, turno: ev.turno || 'DIA_COMPLETO', comentario: ev.comentario || '' });
                      setModalSolicitud(true);
                    }}>✏️</button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-xs text-red-400" title="Solicitar eliminación" onClick={() => {
                      if (confirm('¿Solicitar la cancelación de este evento?')) {
                        onActualizarEvento({ id: ev.id, data: { ...ev, estado: 'PENDIENTE', comentario: (ev.comentario || '') + ' [SOLICITA CANCELACIÓN]', solicitado_por_empleado: true } });
                      }
                    }}>🗑</button>
                  </div>
                )}
              </div>
            );
          })}
          {empEventos.length === 0 && <p className="p-4 text-sm text-gray-400">Sin eventos registrados</p>}
        </div>
      </div>

      {/* Modal Solicitud */}
      <ModalGenerico isOpen={modalSolicitud} onClose={() => { setModalSolicitud(false); setEditandoEvento(null); }} title={editandoEvento ? 'Modificar Solicitud' : 'Solicitar Ausencia'}>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
            Tu solicitud quedará como <strong>Pendiente</strong> hasta que el administrador la apruebe o rechace.
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select value={formEvento.tipo_evento} onChange={e => setFormEvento({ ...formEvento, tipo_evento: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {Object.entries(TIPOS_EMPLEADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Desde</label>
              <input type="date" value={formEvento.fecha_inicio} onChange={e => setFormEvento({ ...formEvento, fecha_inicio: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hasta</label>
              <input type="date" value={formEvento.fecha_fin} onChange={e => setFormEvento({ ...formEvento, fecha_fin: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          {formEvento.tipo_evento === 'FALTA_HORAS' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Turno</label>
                <select value={formEvento.turno} onChange={e => setFormEvento({ ...formEvento, turno: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                  <option value="DIA_COMPLETO">Día completo</option>
                  <option value="MANANA">Solo mañana</option>
                  <option value="TARDE">Solo tarde</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Horas (opcional)</label>
                <input type="number" step="0.5" min="0" value={formEvento.horas} onChange={e => setFormEvento({ ...formEvento, horas: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Comentario (opcional)</label>
            <input value={formEvento.comentario} onChange={e => setFormEvento({ ...formEvento, comentario: e.target.value })} placeholder="Motivo, detalles..." className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={enviarSolicitud} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
              <Save size={16} /> {editandoEvento ? 'Guardar cambios' : 'Enviar Solicitud'}
            </button>
            <button onClick={() => { setModalSolicitud(false); setEditandoEvento(null); }} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}