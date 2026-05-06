import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import ModalGenerico from './ModalGenerico';
import logoSvg from '@/assets/logo.svg';

export default function VistaConfiguracion({
  anioActual, setAnioActual, convenio, empleados, festivos, guardias,
  logoUrl, subirLogo, quitarLogo, uploading,
  onGuardarConvenio,
  onCrearGuardia, onActualizarGuardia, onEliminarGuardia,
  onCrearFestivo, onActualizarFestivo, onEliminarFestivo,
  onActualizarEmpleado
}) {
  const [modalGuardia, setModalGuardia] = useState(false);
  const [modalFestivo, setModalFestivo] = useState(false);
  const [modalTraspaso, setModalTraspaso] = useState(false);
  const [editandoGuardia, setEditandoGuardia] = useState(null);
  const [editandoFestivo, setEditandoFestivo] = useState(null);
  
  const [formConvenio, setFormConvenio] = useState({ horas_anuales: convenio.horas_anuales, dias_vacaciones: convenio.dias_vacaciones, dias_asuntos_propios: convenio.dias_asuntos_propios });
  const [formGuardia, setFormGuardia] = useState({ empleado_id: '', fecha: '', tipo: '', observaciones: '' });
  const [formFestivo, setFormFestivo] = useState({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false });
  const [formTraspaso, setFormTraspaso] = useState({ empleado_id: '', horas: 0 });

  React.useEffect(() => {
    setFormConvenio({ horas_anuales: convenio.horas_anuales, dias_vacaciones: convenio.dias_vacaciones, dias_asuntos_propios: convenio.dias_asuntos_propios });
  }, [convenio]);

  const guardarGuardia = () => {
    if (!formGuardia.empleado_id || !formGuardia.fecha || !formGuardia.tipo) return;
    const data = { empleado_id: formGuardia.empleado_id, fecha: formGuardia.fecha, tipo: formGuardia.tipo, observaciones: formGuardia.observaciones };
    if (editandoGuardia) {
      onActualizarGuardia({ id: editandoGuardia.id, data });
    } else {
      onCrearGuardia(data);
    }
    setModalGuardia(false);
    setEditandoGuardia(null);
    setFormGuardia({ empleado_id: '', fecha: '', tipo: '', observaciones: '' });
  };

  const guardarFestivo = () => {
    if (!formFestivo.fecha || !formFestivo.descripcion) return;
    const data = { fecha: formFestivo.fecha, descripcion: formFestivo.descripcion, ambito: formFestivo.ambito, medio_dia: formFestivo.medio_dia };
    const esPredefinido = editandoFestivo && typeof editandoFestivo.id === 'string' && editandoFestivo.id.startsWith('pre_');
    if (editandoFestivo && !esPredefinido) {
      // Festivo real en BD: actualizar
      onActualizarFestivo({ id: editandoFestivo.id, data });
    } else {
      // Festivo nuevo o predefinido que se edita: crear en BD
      onCrearFestivo(data);
    }
    setModalFestivo(false);
    setEditandoFestivo(null);
    setFormFestivo({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false });
  };

  const traspasarHoras = () => {
    if (!formTraspaso.empleado_id || !formTraspaso.horas) return;
    onActualizarEmpleado({ id: formTraspaso.empleado_id, data: { horas_arrastre: parseFloat(formTraspaso.horas) } });
    setModalTraspaso(false);
    setFormTraspaso({ empleado_id: '', horas: 0 });
  };

  const festivosManuales = festivos.filter(f => typeof f.id === 'string' ? !f.id.startsWith('pre_') : true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Año {anioActual}</p>
        </div>
        <select value={anioActual} onChange={e => setAnioActual(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>Año {a}</option>)}
        </select>
      </div>

      {/* Logo fijo */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Logo de la Farmacia</h2>
        <div className="flex items-center gap-4">
          <img src={logoSvg} alt="Logo Farmacia" className="h-16 object-contain" />
          <p className="text-sm text-gray-500">María García Puelles · Farmacia</p>
        </div>
      </div>

      {/* Convenio */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Convenio {anioActual}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Horas Anuales</label>
            <input type="number" value={formConvenio.horas_anuales} onChange={e => setFormConvenio({ ...formConvenio, horas_anuales: parseFloat(e.target.value) })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Días Vacaciones</label>
            <input type="number" value={formConvenio.dias_vacaciones} onChange={e => setFormConvenio({ ...formConvenio, dias_vacaciones: parseInt(e.target.value) })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Días Asuntos Propios</label>
            <input type="number" value={formConvenio.dias_asuntos_propios} onChange={e => setFormConvenio({ ...formConvenio, dias_asuntos_propios: parseInt(e.target.value) })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button onClick={() => onGuardarConvenio(formConvenio)} className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
          <Save size={16} /> Guardar Convenio
        </button>
      </div>

      {/* Traspaso */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Traspaso de Horas</h2>
          <button onClick={() => setModalTraspaso(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50">
            <Plus size={14} /> Traspasar
          </button>
        </div>
        <p className="text-sm text-gray-500">Permite asignar horas de arrastre a un empleado.</p>
      </div>

      {/* Guardias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Guardias</h2>
          <button onClick={() => { setEditandoGuardia(null); setFormGuardia({ empleado_id: '', fecha: '', tipo: '', observaciones: '' }); setModalGuardia(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50">
            <Plus size={14} /> Añadir
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {guardias.map(g => {
            const emp = empleados.find(e => e.id === g.empleado_id);
            return (
              <div key={g.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{emp?.nombre || 'Desconocido'} — {g.tipo}</p>
                  <p className="text-xs text-gray-500">{g.fecha}{g.observaciones ? ` · ${g.observaciones}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => {
                    setEditandoGuardia(g);
                    setFormGuardia({ empleado_id: g.empleado_id, fecha: g.fecha, tipo: g.tipo, observaciones: g.observaciones || '' });
                    setModalGuardia(true);
                  }}><Pencil size={14} className="text-gray-400" /></button>
                  <button className="p-2 hover:bg-red-50 rounded-lg" onClick={() => onEliminarGuardia(g.id)}><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            );
          })}
          {guardias.length === 0 && <p className="p-4 text-sm text-gray-400">Sin guardias</p>}
        </div>
      </div>

      {/* Festivos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Festivos {anioActual}</h2>
          <button onClick={() => { setEditandoFestivo(null); setFormFestivo({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false }); setModalFestivo(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50">
            <Plus size={14} /> Añadir
          </button>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {festivos.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(f => {
            const esPredefinido = typeof f.id === 'string' && f.id.startsWith('pre_');
            return (
              <div key={f.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{f.descripcion}</span>
                  <span className="text-xs text-gray-500 ml-2">{f.fecha}</span>
                  {f.medio_dia && <span className="text-xs text-amber-600 ml-1.5 font-medium">(½ día)</span>}
                  <span className="text-[10px] text-gray-400 ml-1.5 uppercase">{f.ambito}</span>
                  {esPredefinido && <span className="text-[9px] text-gray-300 ml-1.5">• predefinido</span>}
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => {
                    setEditandoFestivo(f);
                    setFormFestivo({ fecha: f.fecha, descripcion: f.descripcion, ambito: f.ambito, medio_dia: f.medio_dia || false });
                    setModalFestivo(true);
                  }}><Pencil size={12} className="text-gray-400" /></button>
                  {/* Borrar solo disponible para festivos guardados en BD (id no empieza por pre_) */}
                  {!esPredefinido && (
                    <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Eliminar festivo" onClick={() => onEliminarFestivo(f.id)}><Trash2 size={12} className="text-red-400" /></button>
                  )}
                  {esPredefinido && (
                    <span className="w-7 inline-block" title="Festivo predefinido (edítalo para guardarlo en BD y poder borrarlo)" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modales */}
      <ModalGenerico isOpen={modalGuardia} onClose={() => { setModalGuardia(false); setEditandoGuardia(null); }} title={editandoGuardia ? 'Editar Guardia' : 'Nueva Guardia'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Empleado</label>
            <select value={formGuardia.empleado_id} onChange={e => setFormGuardia({ ...formGuardia, empleado_id: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="">Seleccionar...</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" value={formGuardia.fecha} onChange={e => setFormGuardia({ ...formGuardia, fecha: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <input value={formGuardia.tipo} onChange={e => setFormGuardia({ ...formGuardia, tipo: e.target.value })} placeholder="Mañana/Tarde/24h" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <input value={formGuardia.observaciones} onChange={e => setFormGuardia({ ...formGuardia, observaciones: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarGuardia} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}><Save size={16} /> Guardar</button>
            <button onClick={() => setModalGuardia(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>

      <ModalGenerico isOpen={modalFestivo} onClose={() => { setModalFestivo(false); setEditandoFestivo(null); }} title={editandoFestivo ? 'Editar Festivo' : 'Nuevo Festivo'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" value={formFestivo.fecha} onChange={e => setFormFestivo({ ...formFestivo, fecha: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <input value={formFestivo.descripcion} onChange={e => setFormFestivo({ ...formFestivo, descripcion: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Ámbito</label>
            <select value={formFestivo.ambito} onChange={e => setFormFestivo({ ...formFestivo, ambito: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="MANUAL">Manual</option>
              <option value="LOCAL">Local</option>
              <option value="AUTONOMICO">Autonómico</option>
              <option value="NACIONAL">Nacional</option>
              <option value="CONVENIO">Convenio</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formFestivo.medio_dia} onChange={e => setFormFestivo({ ...formFestivo, medio_dia: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Medio día</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarFestivo} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}><Save size={16} /> Guardar</button>
            <button onClick={() => setModalFestivo(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>

      <ModalGenerico isOpen={modalTraspaso} onClose={() => setModalTraspaso(false)} title="Traspasar Horas">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Empleado</label>
            <select value={formTraspaso.empleado_id} onChange={e => setFormTraspaso({ ...formTraspaso, empleado_id: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="">Seleccionar...</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Horas</label>
            <input type="number" step="0.5" value={formTraspaso.horas} onChange={e => setFormTraspaso({ ...formTraspaso, horas: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
            Las horas se asignarán como arrastre del empleado.
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={traspasarHoras} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}><Save size={16} /> Traspasar</button>
            <button onClick={() => setModalTraspaso(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}