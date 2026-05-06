import React, { useState } from 'react';
import { ChevronLeft, Plus, Pencil, Trash2, Save, FileText, Check, X, Clock } from 'lucide-react';
import CalendarioAnual from './CalendarioAnual';
import ModalGenerico from './ModalGenerico';
import { TIPOS_EVENTO, DIAS_SEMANA_COMPLETO } from './constants';
import { calcularHorasSemanales } from './motorCalculo';
import { exportarPDFEmpleado } from './exportPDF';

const ESTADO_BADGE = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
  APROBADO: { label: 'Aprobado', cls: 'bg-green-100 text-green-700' },
  RECHAZADO: { label: 'Rechazado', cls: 'bg-red-100 text-red-600' },
};

const defaultHorario = () => ({
  fecha_inicio: '', fecha_fin: '', descripcion: '',
  lunes:    { activo: true,  inicio: '09:30', fin: '14:00', inicio2: '16:45', fin2: '19:30' },
  martes:   { activo: true,  inicio: '09:30', fin: '14:00', inicio2: '16:45', fin2: '19:30' },
  miercoles:{ activo: true,  inicio: '09:30', fin: '14:00', inicio2: '16:45', fin2: '19:30' },
  jueves:   { activo: true,  inicio: '09:30', fin: '14:00', inicio2: '16:45', fin2: '19:30' },
  viernes:  { activo: true,  inicio: '09:30', fin: '14:00', inicio2: '16:45', fin2: '19:30' },
  sabado:   { activo: true,  inicio: '09:45', fin: '13:30', inicio2: '', fin2: '' },
  domingo:  { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' }
});

export default function VistaEmpleado({
  empleado, estadistica, anioActual, eventos, festivos, guardias, horarios,
  logoUrl,
  onBack, onCrearEvento, onActualizarEvento, onEliminarEvento,
  onCrearHorario, onActualizarHorario, onEliminarHorario
}) {
  const [modalEvento, setModalEvento] = useState(false);
  const [modalHorario, setModalHorario] = useState(false);
  const [modalValidar, setModalValidar] = useState(null); // evento a validar
  const [editandoEvento, setEditandoEvento] = useState(null);
  const [editandoHorario, setEditandoHorario] = useState(null);
  const [formEvento, setFormEvento] = useState({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '', comentario_admin: '' });
  const [formHorario, setFormHorario] = useState(defaultHorario());
  const [comentarioValidacion, setComentarioValidacion] = useState('');

  if (!empleado || !estadistica) return null;

  const empEventos = eventos.filter(e => e.empleado_id === empleado.id);
  const empHorarios = horarios.filter(h => h.empleado_id === empleado.id);
  const pendientes = empEventos.filter(e => e.estado === 'PENDIENTE');

  const guardarEvento = () => {
    if (!formEvento.fecha_inicio || !formEvento.fecha_fin) return;
    const data = {
      empleado_id: empleado.id,
      tipo_evento: formEvento.tipo_evento,
      fecha_inicio: formEvento.fecha_inicio,
      fecha_fin: formEvento.fecha_fin,
      horas: ['FALTA_HORAS', 'HORAS_EXTRA'].includes(formEvento.tipo_evento) ? parseFloat(formEvento.horas) || 0 : null,
      turno: formEvento.tipo_evento === 'FALTA_HORAS' ? formEvento.turno : 'DIA_COMPLETO',
      comentario: formEvento.comentario || '',
      estado: 'APROBADO',
    };
    if (editandoEvento) {
      onActualizarEvento({ id: editandoEvento.id, data });
    } else {
      onCrearEvento(data);
    }
    setModalEvento(false);
    setEditandoEvento(null);
    setFormEvento({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '', comentario_admin: '' });
  };

  const aprobarEvento = (ev) => {
    onActualizarEvento({ id: ev.id, data: { ...ev, estado: 'APROBADO', comentario_admin: comentarioValidacion } });
    setModalValidar(null);
    setComentarioValidacion('');
  };

  const rechazarEvento = (ev) => {
    onActualizarEvento({ id: ev.id, data: { ...ev, estado: 'RECHAZADO', comentario_admin: comentarioValidacion } });
    setModalValidar(null);
    setComentarioValidacion('');
  };

  const guardarHorario = () => {
    if (!formHorario.fecha_inicio) return;
    const data = { empleado_id: empleado.id, ...formHorario };
    if (editandoHorario) {
      onActualizarHorario({ id: editandoHorario.id, data });
    } else {
      onCrearHorario(data);
    }
    setModalHorario(false);
    setEditandoHorario(null);
  };

  const stat = estadistica;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{empleado.nombre}</h1>
          <p className="text-sm text-gray-500">Alta: {empleado.fecha_alta} · Año {anioActual}</p>
        </div>
      </div>

      {/* Alerta pendientes */}
      {pendientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{pendientes.length} solicitud{pendientes.length > 1 ? 'es' : ''} pendiente{pendientes.length > 1 ? 's' : ''} de validación</p>
            <p className="text-xs text-amber-600">Revisa los eventos marcados en naranja</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: '#1239AD', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vacaciones</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#1239AD' }}>{stat.vacaciones.disponibles}<span className="text-lg text-gray-400">/{stat.vacaciones.total}</span></p>
          <p className="text-[11px] text-gray-400 mt-1">disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: '#7C3AED', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Asuntos Propios</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">{stat.asuntos.disponibles}<span className="text-lg text-gray-400">/{stat.asuntos.total}</span></p>
          <p className="text-[11px] text-gray-400 mt-1">disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: '#99B9AF', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sábados Libres</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#99B9AF' }}>{stat.sabados.usados}<span className="text-lg text-gray-400">/{stat.sabados.porSaldo}</span></p>
          <p className="text-[11px] text-gray-400 mt-1">Saldo: {stat.sabados.saldoHoras > 0 ? '+' : ''}{stat.sabados.saldoHoras}h</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTopColor: stat.horas.saldo >= 0 ? '#16a34a' : '#dc2626', borderTopWidth: 3 }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Horas</p>
          <p className={`text-3xl font-bold mt-2 ${stat.horas.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {stat.horas.saldo > 0 ? '+' : ''}{stat.horas.saldo}h
          </p>
          <div className="text-[11px] text-gray-400 mt-1 space-y-0.5">
            <p>Trabajadas: {stat.horas.horasRealesTrabajadas}h</p>
            <p>Convenio: {stat.horas.horasTeoricas}h</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setEditandoEvento(null); setFormEvento({ tipo_evento: 'VACACIONES', fecha_inicio: '', fecha_fin: '', horas: 0, turno: 'DIA_COMPLETO', comentario: '', comentario_admin: '' }); setModalEvento(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#1239AD' }}
        >
          <Plus size={16} /> Evento
        </button>
        <button
          onClick={() => { setEditandoHorario(null); setFormHorario(defaultHorario()); setModalHorario(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Plus size={16} /> Horario
        </button>
        <button
          onClick={() => exportarPDFEmpleado({ empleado, estadistica: estadistica, anioActual, eventos, festivos, guardias })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <FileText size={16} /> PDF
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <CalendarioAnual anio={anioActual} empleado={empleado} eventos={eventos} festivos={festivos} guardias={guardias} />
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Horarios</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {empHorarios.map(h => (
            <div key={h.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">{h.descripcion || 'Sin descripción'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{h.fecha_inicio} → {h.fecha_fin || 'Indefinido'} · {calcularHorasSemanales(h)}h/sem</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => {
                  setEditandoHorario(h);
                  setFormHorario({
                    fecha_inicio: h.fecha_inicio, fecha_fin: h.fecha_fin || '', descripcion: h.descripcion || '',
                    lunes:    h.lunes    || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    martes:   h.martes   || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    miercoles:h.miercoles|| { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    jueves:   h.jueves   || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    viernes:  h.viernes  || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    sabado:   h.sabado   || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                    domingo:  h.domingo  || { activo: false, inicio: '', fin: '', inicio2: '', fin2: '' },
                  });
                  setModalHorario(true);
                }}>
                  <Pencil size={14} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg" onClick={() => onEliminarHorario(h.id)}>
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {empHorarios.length === 0 && <p className="p-4 text-sm text-gray-400">Sin horarios configurados</p>}
        </div>
      </div>

      {/* Eventos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Eventos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {empEventos.map(ev => {
            const badge = ESTADO_BADGE[ev.estado || 'APROBADO'];
            const isPendiente = ev.estado === 'PENDIENTE';
            return (
              <div key={ev.id} className={`p-4 flex items-center justify-between ${isPendiente ? 'bg-amber-50/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${TIPOS_EVENTO[ev.tipo_evento]?.color || 'bg-gray-400'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900">{TIPOS_EVENTO[ev.tipo_evento]?.label || ev.tipo_evento}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      {ev.turno && ev.turno !== 'DIA_COMPLETO' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{ev.turno === 'MANANA' ? 'Mañana' : 'Tarde'}</span>}
                    </div>
                    <p className="text-xs text-gray-500">{ev.fecha_inicio} → {ev.fecha_fin}{ev.horas ? ` · ${ev.horas}h` : ''}</p>
                    {ev.comentario && <p className="text-xs text-gray-400 mt-0.5">💬 {ev.comentario}</p>}
                    {ev.comentario_admin && <p className="text-xs text-blue-500 mt-0.5">👤 Admin: {ev.comentario_admin}</p>}
                    {ev.observaciones && <p className="text-xs text-gray-400 mt-0.5">📝 {ev.observaciones}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {isPendiente && (
                    <>
                      <button className="p-2 hover:bg-green-50 rounded-lg" title="Aprobar" onClick={() => { setModalValidar(ev); setComentarioValidacion(''); }}>
                        <Check size={14} className="text-green-500" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg" title="Rechazar" onClick={() => { rechazarEvento(ev); }}>
                        <X size={14} className="text-red-400" />
                      </button>
                    </>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => {
                    setEditandoEvento(ev);
                    setFormEvento({ tipo_evento: ev.tipo_evento, fecha_inicio: ev.fecha_inicio, fecha_fin: ev.fecha_fin, horas: ev.horas || '', turno: ev.turno || 'DIA_COMPLETO', comentario: ev.comentario || '', comentario_admin: ev.comentario_admin || '' });
                    setModalEvento(true);
                  }}>
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg" onClick={() => onEliminarEvento(ev.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
          {empEventos.length === 0 && <p className="p-4 text-sm text-gray-400">Sin eventos registrados</p>}
        </div>
      </div>

      {/* Modal Evento */}
      <ModalGenerico isOpen={modalEvento} onClose={() => { setModalEvento(false); setEditandoEvento(null); }} title={editandoEvento ? 'Editar Evento' : 'Nuevo Evento'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select value={formEvento.tipo_evento} onChange={e => setFormEvento({ ...formEvento, tipo_evento: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {Object.entries(TIPOS_EVENTO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Inicio</label>
              <input type="date" value={formEvento.fecha_inicio} onChange={e => setFormEvento({ ...formEvento, fecha_inicio: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fin</label>
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
          {['HORAS_EXTRA'].includes(formEvento.tipo_evento) && (
            <div>
              <label className="text-sm font-medium text-gray-700">Horas</label>
              <input type="number" step="0.5" min="0" value={formEvento.horas} onChange={e => setFormEvento({ ...formEvento, horas: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Comentario (admin)</label>
            <input value={formEvento.comentario_admin} onChange={e => setFormEvento({ ...formEvento, comentario_admin: e.target.value })} placeholder="Notas internas..." className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarEvento} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
              <Save size={16} /> Guardar
            </button>
            <button onClick={() => { setModalEvento(false); setEditandoEvento(null); }} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>

      {/* Modal validar */}
      <ModalGenerico isOpen={!!modalValidar} onClose={() => setModalValidar(null)} title="Validar Solicitud">
        {modalValidar && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl text-sm">
              <p><strong>{TIPOS_EVENTO[modalValidar.tipo_evento]?.label}</strong></p>
              <p className="text-gray-500">{modalValidar.fecha_inicio} → {modalValidar.fecha_fin}</p>
              {modalValidar.comentario && <p className="text-gray-500 mt-1">Comentario: {modalValidar.comentario}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Comentario (opcional)</label>
              <input value={comentarioValidacion} onChange={e => setComentarioValidacion(e.target.value)} placeholder="Motivo de aprobación/rechazo..." className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => aprobarEvento(modalValidar)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                <Check size={16} /> Aprobar
              </button>
              <button onClick={() => rechazarEvento(modalValidar)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600">
                <X size={16} /> Rechazar
              </button>
            </div>
          </div>
        )}
      </ModalGenerico>

      {/* Modal Horario */}
      <ModalGenerico isOpen={modalHorario} onClose={() => { setModalHorario(false); setEditandoHorario(null); }} title={editandoHorario ? 'Editar Horario' : 'Nuevo Horario'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <input value={formHorario.descripcion} onChange={e => setFormHorario({ ...formHorario, descripcion: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Jornada partida..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Inicio</label>
              <input type="date" value={formHorario.fecha_inicio} onChange={e => setFormHorario({ ...formHorario, fecha_inicio: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fin (vacío = indefinido)</label>
              <input type="date" value={formHorario.fecha_fin} onChange={e => setFormHorario({ ...formHorario, fecha_fin: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div className="border-t pt-3">
            <h3 className="font-semibold text-sm mb-3 text-gray-800">Horario semanal</h3>
            {['lunes','martes','miercoles','jueves','viernes','sabado'].map((dia, idx) => (
              <div key={dia} className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formHorario[dia]?.activo || false} onChange={e => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], activo: e.target.checked } })} className="w-3.5 h-3.5 rounded" />
                  <span className="text-sm font-medium text-gray-700">{DIAS_SEMANA_COMPLETO[idx + 1]}</span>
                </label>
                {formHorario[dia]?.activo && (
                  <div className="ml-6 mt-1.5 space-y-1.5">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 w-12">Mañana</span>
                      <input type="time" value={formHorario[dia]?.inicio || ''} onChange={e => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], inicio: e.target.value } })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                      <span className="text-xs text-gray-400">—</span>
                      <input type="time" value={formHorario[dia]?.fin || ''} onChange={e => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], fin: e.target.value } })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                      <button onClick={() => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], inicio: '', fin: '' } })} className="text-xs text-gray-400 hover:text-red-400">✕</button>
                    </div>
                    {dia !== 'sabado' && (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-12">Tarde</span>
                        <input type="time" value={formHorario[dia]?.inicio2 || ''} onChange={e => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], inicio2: e.target.value } })} placeholder="--:--" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <span className="text-xs text-gray-400">—</span>
                        <input type="time" value={formHorario[dia]?.fin2 || ''} onChange={e => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], fin2: e.target.value } })} placeholder="--:--" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <button onClick={() => setFormHorario({ ...formHorario, [dia]: { ...formHorario[dia], inicio2: '', fin2: '' } })} className="text-xs text-gray-400 hover:text-red-400">✕</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-3 p-3 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-900">Total: {calcularHorasSemanales(formHorario)}h/sem</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarHorario} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
              <Save size={16} /> Guardar
            </button>
            <button onClick={() => { setModalHorario(false); setEditandoHorario(null); }} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}