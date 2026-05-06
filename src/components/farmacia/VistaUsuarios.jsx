/**
 * Gestión de usuarios (solo admin).
 * Permite crear usuarios con vinculación y enviar la invitación cuando el admin quiera.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Plus, Save, Send, Shield, User, Pencil, Trash2 } from 'lucide-react';
import ModalGenerico from './ModalGenerico';

// Almacenamiento local de "usuarios pendientes de invitar" (pre-invitaciones)
const STORAGE_KEY = 'farmacia_pre_invitaciones';
function getPreInvitaciones() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function setPreInvitaciones(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function VistaUsuarios({ empleados }) {
  const queryClient = useQueryClient();
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formCrear, setFormCrear] = useState({ email: '', role: 'user', empleado_id: '' });
  const [formEditar, setFormEditar] = useState({ role: 'user', empleado_id: '' });
  const [enviando, setEnviando] = useState(null); // id del pre que se está enviando
  const [mensaje, setMensaje] = useState('');
  const [preInvitaciones, setPreInvState] = useState(getPreInvitaciones);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => appClient.entities.User.list(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const actualizarUsuario = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });

  const guardarPreInvitacion = () => {
    if (!formCrear.email || !formCrear.empleado_id) return;
    // Evitar duplicados
    const existe = preInvitaciones.find(p => p.email === formCrear.email);
    if (existe) { setMensaje(`⚠️ Ya existe una pre-invitación para ${formCrear.email}`); return; }
    const yaInvitado = usuarios.find(u => u.email === formCrear.email);
    if (yaInvitado) { setMensaje(`⚠️ ${formCrear.email} ya está registrado`); return; }
    const nuevo = { id: Date.now().toString(), ...formCrear };
    const nueva = [...preInvitaciones, nuevo];
    setPreInvState(nueva);
    setPreInvitaciones(nueva);
    setMensaje(`✅ Usuario guardado. Envía la invitación cuando quieras.`);
    setFormCrear({ email: '', role: 'user', empleado_id: '' });
    setModalCrear(false);
  };

  const eliminarPre = (id) => {
    const nueva = preInvitaciones.filter(p => p.id !== id);
    setPreInvState(nueva);
    setPreInvitaciones(nueva);
  };

  const enviarInvitacion = async (pre) => {
    setEnviando(pre.id);
    setMensaje('');
    try {
      await appClient.users.inviteUser(pre.email, pre.role);
      await new Promise(r => setTimeout(r, 2000));
      const lista = await appClient.entities.User.list();
      const nuevo = lista.find(u => u.email === pre.email);
      if (nuevo) {
        await appClient.entities.User.update(nuevo.id, { empleado_id: pre.empleado_id });
      }
      // Eliminar de pre-invitaciones
      const nueva = preInvitaciones.filter(p => p.id !== pre.id);
      setPreInvState(nueva);
      setPreInvitaciones(nueva);
      setMensaje(`✅ Invitación enviada a ${pre.email}`);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    } catch(e) {
      setMensaje(`❌ Error: ${e.message}`);
    }
    setEnviando(null);
  };

  const guardarEdicion = () => {
    if (!usuarioEditando) return;
    actualizarUsuario.mutate({ id: usuarioEditando.id, data: { role: formEditar.role, empleado_id: formEditar.empleado_id } });
    setModalEditar(false);
    setUsuarioEditando(null);
  };

  const abrirEditar = (u) => {
    setUsuarioEditando(u);
    setFormEditar({ role: u.role || 'user', empleado_id: u.empleado_id || '' });
    setModalEditar(true);
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Shield size={11} /> Admin</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><User size={11} /> Empleado</span>;
  };

  const empleadoVinculado = (u) => empleados.find(e => e.id === u.empleado_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prepara usuarios y envía invitaciones cuando quieras</p>
        </div>
        <button
          onClick={() => { setModalCrear(true); setMensaje(''); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#1239AD' }}
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Info de roles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} style={{ color: '#1239AD' }} />
            <span className="font-semibold text-sm text-gray-800">Rol Admin</span>
          </div>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✅ Dashboard completo</li>
            <li>✅ Gestión de todos los empleados</li>
            <li>✅ Crear/editar/eliminar eventos</li>
            <li>✅ Configuración, festivos, guardias</li>
            <li>✅ Exportar CSV y PDF</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} style={{ color: '#99B9AF' }} />
            <span className="font-semibold text-sm text-gray-800">Rol Empleado</span>
          </div>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✅ Ver su propio perfil y calendario</li>
            <li>✅ Consultar sus vacaciones y saldo de horas</li>
            <li>✅ Solicitar vacaciones/ausencias</li>
            <li>✅ Descargar su PDF</li>
            <li>❌ Sin acceso a datos de otros empleados</li>
          </ul>
        </div>
      </div>

      {/* Pre-invitaciones (pendientes de enviar) */}
      {preInvitaciones.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-amber-100">
            <h2 className="text-base font-bold text-amber-800">Pendientes de invitar ({preInvitaciones.length})</h2>
            <p className="text-xs text-amber-600 mt-0.5">Usuarios preparados. Pulsa "Enviar invitación" cuando quieras.</p>
          </div>
          <div className="divide-y divide-amber-100">
            {preInvitaciones.map(pre => {
              const emp = empleados.find(e => e.id === pre.empleado_id);
              const estáEnviando = enviando === pre.id;
              return (
                <div key={pre.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: pre.role === 'admin' ? '#1239AD' : '#99B9AF' }}>
                      {pre.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{pre.email}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getRoleBadge(pre.role)}
                        {emp && <span className="text-xs" style={{ color: '#99B9AF' }}>→ {emp.nombre}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => enviarInvitacion(pre)}
                      disabled={!!enviando}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                      style={{ background: '#1239AD' }}
                    >
                      <Send size={12} /> {estáEnviando ? 'Enviando...' : 'Enviar'}
                    </button>
                    <button onClick={() => eliminarPre(pre.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Eliminar">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mensaje && <div className={`p-3 rounded-xl text-sm ${mensaje.startsWith('❌') ? 'bg-red-50 text-red-800' : mensaje.startsWith('⚠️') ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>{mensaje}</div>}

      {/* Lista de usuarios registrados */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Usuarios registrados ({usuarios.length})</h2>
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-gray-400">Cargando...</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {usuarios.map(u => {
              const emp = empleadoVinculado(u);
              return (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: u.role === 'admin' ? '#1239AD' : '#99B9AF' }}>
                      {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{u.full_name || u.email}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      {emp && <p className="text-xs mt-0.5" style={{ color: '#99B9AF' }}>Vinculado: {emp.nombre}</p>}
                      {!emp && <p className="text-xs mt-0.5 text-amber-500">⚠️ Sin empleado vinculado</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(u.role)}
                    <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Editar">
                      <Pencil size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {usuarios.length === 0 && <p className="p-4 text-sm text-gray-400">No hay usuarios registrados aún</p>}
          </div>
        )}
      </div>

      {/* Modal crear pre-invitación */}
      <ModalGenerico isOpen={modalCrear} onClose={() => { setModalCrear(false); setMensaje(''); }} title="Preparar usuario">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
            El usuario se guardará aquí. La invitación por email solo se envía cuando pulses <strong>"Enviar"</strong>.
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={formCrear.email} onChange={e => setFormCrear({ ...formCrear, email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="nombre@farmacia.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <select value={formCrear.role} onChange={e => setFormCrear({ ...formCrear, role: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="user">Empleado (solo su perfil)</option>
              <option value="admin">Administrador (acceso total)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Empleado vinculado <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-1">Necesario para que el usuario vea su propio perfil</p>
            <select value={formCrear.empleado_id} onChange={e => setFormCrear({ ...formCrear, empleado_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="">Seleccionar empleado...</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarPreInvitacion} disabled={!formCrear.email || !formCrear.empleado_id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#1239AD' }}>
              <Save size={16} /> Guardar (sin enviar)
            </button>
            <button onClick={() => setModalCrear(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>

      {/* Modal editar rol */}
      <ModalGenerico isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar Usuario">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Usuario: <strong>{usuarioEditando?.full_name || usuarioEditando?.email}</strong></p>
          <div>
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <select value={formEditar.role} onChange={e => setFormEditar({ ...formEditar, role: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="user">Empleado (solo su perfil)</option>
              <option value="admin">Administrador (acceso total)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Vincular con empleado</label>
            <p className="text-xs text-gray-400 mb-1">Necesario para que el empleado vea su propio perfil</p>
            <select value={formEditar.empleado_id} onChange={e => setFormEditar({ ...formEditar, empleado_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="">Sin vinculación</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={guardarEdicion} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#1239AD' }}>
              <Save size={16} /> Guardar
            </button>
            <button onClick={() => setModalEditar(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        </div>
      </ModalGenerico>
    </div>
  );
}