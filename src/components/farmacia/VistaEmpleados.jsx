import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import ModalGenerico from './ModalGenerico';
import { calcularHorasSemanales } from './motorCalculo';

export default function VistaEmpleados({
  empleados, estadisticas, horarios,
  onSelectEmpleado,
  onCrearEmpleado, onActualizarEmpleado, onEliminarEmpleado
}) {
  const [modalEmpleado, setModalEmpleado] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', fecha_alta: '', horas_anuales: '' });

  const guardar = () => {
    if (!form.nombre || !form.fecha_alta) return;
    const data = { ...form, horas_anuales: form.horas_anuales ? parseFloat(form.horas_anuales) : null };
    if (editando) {
      onActualizarEmpleado({ id: editando.id, data });
    } else {
      onCrearEmpleado({ ...data, activo: true, horas_arrastre: 0 });
    }
    setModalEmpleado(false);
    setEditando(null);
    setForm({ nombre: '', fecha_alta: '', horas_anuales: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Empleados</h1>
          <p className="text-sm text-gray-500 mt-0.5">{empleados.length} registrados</p>
        </div>
        <button 
          onClick={() => { setEditando(null); setForm({ nombre: '', fecha_alta: '' }); setModalEmpleado(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: '#1239AD' }}
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="grid gap-4">
        {empleados.map(emp => {
          const stat = estadisticas.empleados.find(s => s.empleado.id === emp.id);
          const empHorarios = horarios.filter(h => h.empleado_id === emp.id);
          
          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1239AD' }}>
                      {emp.nombre?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{emp.nombre}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Alta: {emp.fecha_alta}</p>
                      {stat && (
                        <div className="flex gap-4 mt-1.5 text-xs">
                          <span style={{ color: '#1239AD' }} className="font-semibold">Vac: {stat.vacaciones.disponibles}/{stat.vacaciones.total}</span>
                          <span style={{ color: '#99B9AF' }} className="font-semibold">Sáb: {stat.sabados.usados}/{stat.sabados.porSaldo}</span>
                          <span className={`font-semibold ${stat.horas.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            Saldo: {stat.horas.saldo > 0 ? '+' : ''}{stat.horas.saldo}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => onSelectEmpleado(emp)}>
                      Detalles
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => {
                      setEditando(emp);
                      setForm({ nombre: emp.nombre, fecha_alta: emp.fecha_alta, horas_anuales: emp.horas_anuales || '' });
                      setModalEmpleado(true);
                    }}>
                      <Pencil size={14} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" onClick={() => {
                      if (confirm(`¿Eliminar a ${emp.nombre}? Se borrarán también todos sus eventos y horarios.`)) onEliminarEmpleado(emp.id);
                    }}>
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {empHorarios.length > 0 && (
                  <div className="mt-4 border-t border-gray-50 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Horarios activos</p>
                    {empHorarios.map(h => (
                      <div key={h.id} className="p-2.5 bg-gray-50 rounded-lg mb-1.5 text-xs">
                        <span className="font-medium">{h.descripcion || 'Horario'}</span>
                        <span className="text-gray-500 ml-2">{h.fecha_inicio} → {h.fecha_fin || '∞'} · {calcularHorasSemanales(h)}h/sem</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ModalGenerico isOpen={modalEmpleado} onClose={() => { setModalEmpleado(false); setEditando(null); }} title={editando ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha Alta <span className="text-red-500">*</span></label>
            <input type="date" value={form.fecha_alta} onChange={e => setForm({ ...form, fecha_alta: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Horas anuales propias <span className="text-gray-400 font-normal">(opcional)</span></label>
            <p className="text-xs text-gray-400 mb-1">Solo si difiere del convenio (ej: jornada reducida). Vacío = usa las del convenio.</p>
            <input type="number" step="0.5" min="0" value={form.horas_anuales} onChange={e => setForm({ ...form, horas_anuales: e.target.value })} placeholder="Ej: 1339 (75%)" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardar} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
              <Save size={16} /> Guardar
            </button>
            <button onClick={() => { setModalEmpleado(false); setEditando(null); }} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">
              Cancelar
            </button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}