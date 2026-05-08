import React, { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Save, Download } from 'lucide-react';
import ModalGenerico from './ModalGenerico';
import { obtenerFestivosEspana, compararFestivos, detectarConflictosFestivos, PROVINCIAS_ESPAÑA } from './obtenerFestivos';
import logoSvg from '@/assets/logo.svg';

export default function VistaConfiguracion({
  anioActual, setAnioActual, convenio, empleados, festivos, guardias,
  logoUrl, subirLogo, quitarLogo, uploading,
  onGuardarConvenio,
  onCrearGuardia, onActualizarGuardia, onEliminarGuardia,
  onCrearFestivo, onActualizarFestivo, onEliminarFestivo,
  onActualizarEmpleado, onRegistrarTraspaso
}) {
  const [modalGuardia, setModalGuardia] = useState(false);
  const [modalFestivo, setModalFestivo] = useState(false);
  const [modalTraspaso, setModalTraspaso] = useState(false);
  const [modalConflictos, setModalConflictos] = useState(false);
  const [editandoGuardia, setEditandoGuardia] = useState(null);
  const [editandoFestivo, setEditandoFestivo] = useState(null);
  const [cargandoFestivos, setCargandoFestivos] = useState(false);
  const [conflictos, setConflictos] = useState([]);
  const [festivosParaAgregar, setFestivosParaAgregar] = useState([]);
  const fileInputRef = useRef(null);

  const [formConvenio, setFormConvenio] = useState({ horas_anuales: convenio.horas_anuales, dias_vacaciones: convenio.dias_vacaciones, dias_asuntos_propios: convenio.dias_asuntos_propios, provincia: convenio.provincia || 'Burgos', localidad: convenio.localidad || 'Miranda de Ebro' });
  const [formGuardia, setFormGuardia] = useState({ empleado_id: '', fecha: '', tipo: '', observaciones: '' });
  const [formFestivo, setFormFestivo] = useState({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false });
  const [formTraspaso, setFormTraspaso] = useState({ empleado_id: '', horas: 0, comentario: '' });

  React.useEffect(() => {
    setFormConvenio({ horas_anuales: convenio.horas_anuales, dias_vacaciones: convenio.dias_vacaciones, dias_asuntos_propios: convenio.dias_asuntos_propios, provincia: convenio.provincia || 'Burgos', localidad: convenio.localidad || 'Miranda de Ebro' });
  }, [convenio]);

  const buscarFestivos = async () => {
    setCargandoFestivos(true);
    try {
      const nuevos = await obtenerFestivosEspana(anioActual, formConvenio.provincia, formConvenio.localidad);
      const nuevosSinDuplicados = nuevos.filter(nuevo => !festivos.some(existente => compararFestivos(existente, nuevo)));
      const conflictosDetectados = detectarConflictosFestivos(festivos, nuevos);
      const soloNuevos = nuevosSinDuplicados.filter(nuevo => !conflictosDetectados.some(conf => conf.fecha === nuevo.fecha));

      if (conflictosDetectados.length > 0) {
        setConflictos(conflictosDetectados);
        setFestivosParaAgregar(soloNuevos);
        setModalConflictos(true);
        return;
      }
      if (soloNuevos.length === 0) {
        window.alert('No hay festivos nuevos para este año y esta provincia/localidad.');
        return;
      }

      soloNuevos.forEach(f => onCrearFestivo(f));
      window.alert(`Se han añadido ${soloNuevos.length} festivos nuevos.`);
    } catch (error) {
      console.error('Error cargando festivos:', error);
      window.alert('No se pudieron cargar los festivos. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setCargandoFestivos(false);
    }
  };

  const aceptarConflictos = () => {
    conflictos.forEach(nuevo => {
      const existente = festivos.find(f => f.fecha === nuevo.fecha);
      if (existente) {
        onActualizarFestivo({ id: existente.id, data: { fecha: nuevo.fecha, descripcion: nuevo.descripcion, ambito: nuevo.ambito, medio_dia: nuevo.medio_dia } });
      } else {
        onCrearFestivo(nuevo);
      }
    });
    festivosParaAgregar.forEach(f => onCrearFestivo(f));
    setModalConflictos(false);
    setConflictos([]);
    setFestivosParaAgregar([]);
    window.alert('Festivos actualizados.');
  };

  const cancelarConflictos = () => {
    setModalConflictos(false);
    setConflictos([]);
    setFestivosParaAgregar([]);
  };

  const handleLogoFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await subirLogo(file);
    event.target.value = null;
  };

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
    if (editandoFestivo) {
      onActualizarFestivo({ id: editandoFestivo.id, data });
    } else {
      onCrearFestivo(data);
    }
    setModalFestivo(false);
    setEditandoFestivo(null);
    setFormFestivo({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false });
  };

  const traspasarHoras = () => {
    if (!formTraspaso.empleado_id || !formTraspaso.horas) return;
    onActualizarEmpleado({ id: formTraspaso.empleado_id, data: { horas_arrastre: parseFloat(formTraspaso.horas) } });
    onRegistrarTraspaso?.mutate?.({ 
      empleado_id: formTraspaso.empleado_id, 
      horas: parseFloat(formTraspaso.horas),
      comentario: formTraspaso.comentario || 'Sin comentario'
    });
    setModalTraspaso(false);
    setFormTraspaso({ empleado_id: '', horas: 0, comentario: '' });
  };

  const festivosManuales = festivos.filter(f => typeof f.id === 'string' ? !f.id.startsWith('pre_') : true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Año {anioActual}</p>
        </div>
        <input
          type="number"
          min="2000"
          max={new Date().getFullYear() + 20}
          value={anioActual}
          onChange={e => setAnioActual(Number(e.target.value) || new Date().getFullYear())}
          className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Logo fijo */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Logo de la Farmacia</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img src={logoUrl || logoSvg} alt="Logo Farmacia" className="h-16 object-contain rounded-xl border border-gray-200" />
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Sube el logotipo de la farmacia y se mostrará en la esquina superior izquierda.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                {uploading ? 'Subiendo...' : 'Subir logo'}
              </button>
              {logoUrl && (
                <button onClick={quitarLogo} className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                  Quitar logo
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
          </div>
        </div>
      </div>

      {/* Convenio */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Convenio {anioActual}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div>
            <label className="text-sm font-medium text-gray-700">Provincia</label>
            <select value={formConvenio.provincia} onChange={e => setFormConvenio({ ...formConvenio, provincia: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.keys(PROVINCIAS_ESPAÑA).sort().map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Localidad</label>
            <input type="text" value={formConvenio.localidad} onChange={e => setFormConvenio({ ...formConvenio, localidad: e.target.value })} placeholder="Ej: Miranda de Ebro" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          <div className="flex gap-2">
            <button onClick={buscarFestivos} disabled={cargandoFestivos} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <Download size={14} /> {cargandoFestivos ? 'Buscando...' : 'Buscar festivos'}
            </button>
            <button onClick={() => { setEditandoFestivo(null); setFormFestivo({ fecha: '', descripcion: '', ambito: 'MANUAL', medio_dia: false }); setModalFestivo(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50">
              <Plus size={14} /> Añadir
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {(Array.isArray(festivos) ? [...festivos].sort((a, b) => (a?.fecha || '').localeCompare(b?.fecha || '')) : []).map((f, index) => {
            const key = f.id || `${f.fecha || 'festivo'}-${index}`;
            const esPredefinido = f.id && typeof f.id === 'string' && f.id.startsWith('pre_');
            return (
              <div key={key} className="p-3 flex items-center justify-between">
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
                  <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Eliminar festivo" onClick={() => onEliminarFestivo(f.id || f.fecha)}><Trash2 size={12} className="text-red-400" /></button>
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
          <div>
            <label className="text-sm font-medium text-gray-700">Comentarios</label>
            <textarea value={formTraspaso.comentario} onChange={e => setFormTraspaso({ ...formTraspaso, comentario: e.target.value })} placeholder="Ej: Traspaso por horas extra trabajadas..." className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" rows="3" />
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
            Las horas se asignarán como arrastre del empleado. Los comentarios se guardarán en el historial.
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={traspasarHoras} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}><Save size={16} /> Traspasar</button>
            <button onClick={() => setModalTraspaso(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>

      <ModalGenerico isOpen={modalConflictos} onClose={cancelarConflictos} title="Conflictos de festivos">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Se han encontrado festivos con la misma fecha pero diferente descripción. Elige si quieres reemplazarlos o cancelar la importación.</p>
          <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50">
            {conflictos.map(f => {
              const existente = festivos.find(ex => ex.fecha === f.fecha);
              return (
                <div key={f.fecha} className="p-3 rounded-xl bg-white border border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{f.fecha}</p>
                  <p className="text-xs text-gray-500">Antiguo: {existente?.descripcion || 'No existe'}</p>
                  <p className="text-xs text-gray-700">Nuevo: {f.descripcion} <span className="uppercase text-[10px] text-blue-600">{f.ambito}</span></p>
                </div>
              );
            })}
          </div>
          {festivosParaAgregar.length > 0 && (
            <div className="p-3 rounded-xl bg-white border border-gray-100">
              <p className="text-sm font-medium text-gray-900">Festivos nuevos listos para añadir:</p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {festivosParaAgregar.map(f => (<li key={f.fecha}>{f.fecha} · {f.descripcion}</li>))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={aceptarConflictos} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Reemplazar y añadir</button>
            <button onClick={cancelarConflictos} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}