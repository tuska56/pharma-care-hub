import React, { useState, useRef } from 'react';
import { Loader2, Smartphone } from 'lucide-react';
import useAppData from '../components/farmacia/useAppData';
import useCurrentUser from '../components/farmacia/useCurrentUser';
import VistaDashboard from '../components/farmacia/VistaDashboard';
import VistaEmpleados from '../components/farmacia/VistaEmpleados';
import VistaEmpleado from '../components/farmacia/VistaEmpleado';
import VistaEmpleadoRO from '../components/farmacia/VistaEmpleadoRO';
import VistaConfiguracion from '../components/farmacia/VistaConfiguracion';
import VistaUsuarios from '../components/farmacia/VistaUsuarios';
import ModalInstall from '../components/farmacia/ModalInstall';
import useLogoStore from '../components/farmacia/useLogoStore';
import { appClient } from '../api/appClient';
import logoSvg from '../assets/logo.svg';

export default function FarmaciaControl() {
  const {
    anioActual, setAnioActual,
    modoSimulacion, setModoSimulacion,
    empleados, eventos, horarios, guardias, festivos, convenio,
    estadisticas, isLoading,
    crearEmpleado, actualizarEmpleado, eliminarEmpleado,
    crearEvento, actualizarEvento, eliminarEvento,
    crearHorario, actualizarHorario, eliminarHorario,
    crearGuardia, actualizarGuardia, eliminarGuardia,
    crearFestivo, actualizarFestivo, eliminarFestivo,
    guardarConvenio,
    restaurarBackup,
  } = useAppData();

  const { user, loading: loadingUser, isAdmin, isEmpleado } = useCurrentUser();
  const [vista, setVista] = useState('dashboard');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [modalInstall, setModalInstall] = useState(false);
  const fileInputRef = useRef(null);
  const { logoUrl, subirLogo, quitarLogo, uploading } = useLogoStore();

  const handleSelectEmpleado = (emp) => {
    setEmpleadoSeleccionado(emp);
    setVista('empleado');
  };

  const exportarDB = () => {
    const datos = { empleados, eventos, horarios, guardias, festivos, convenio, anio: anioActual };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `farmacia_backup_${anioActual}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const datos = JSON.parse(reader.result);
        restaurarBackup.mutate(datos);
        window.alert('Backup importado correctamente.');
      } catch (error) {
        window.alert('No se pudo importar el backup. El archivo JSON no es válido.');
      }
    };
    reader.readAsText(file);
  };

  const importarDB = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const exportarCSV = () => {
    const filas = [['Empleado', 'Vacaciones usadas', 'Vacaciones total', 'Asuntos usados', 'Sábados usados', 'Sábados teóricos', 'Saldo horas']];
    estadisticas.empleados.forEach(s => {
      filas.push([
        s.empleado.nombre,
        s.vacaciones.usadas,
        s.vacaciones.total,
        s.asuntos.usados,
        s.sabados.usados,
        s.sabados.porSaldo,
        s.horas.saldo
      ]);
    });
    const csv = filas.map(f => f.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `farmacia_${anioActual}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Para el rol empleado: encontrar su empleado vinculado
  const miEmpleado = isEmpleado && user?.empleado_id
    ? empleados.find(e => e.id === user.empleado_id)
    : null;
  const miEstadistica = miEmpleado
    ? estadisticas.empleados.find(s => s.empleado.id === miEmpleado.id)
    : null;
  // El empleado solo ve SUS eventos, no los de todos
  const misEventos = miEmpleado
    ? eventos.filter(e => e.empleado_id === miEmpleado.id)
    : [];

  if (isLoading || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0ee 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: '#1239AD' }} />
          <p className="text-sm text-gray-500 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Si es empleado sin vinculación, mostrar aviso
  if (isEmpleado && !miEmpleado && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f8f9fd 0%, #f0f5f3 100%)' }}>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EEF1FB' }}>
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta pendiente de configurar</h2>
          <p className="text-sm text-gray-500">Tu cuenta aún no está vinculada a ningún empleado. Contacta con el administrador para que configure tu acceso.</p>
        </div>
      </div>
    );
  }

  // Render para rol EMPLEADO
  if (isEmpleado) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fd 0%, #f0f5f3 100%)' }}>
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2.5">
                <img src={logoSvg} alt="Logo" className="h-8 w-auto object-contain rounded" />
                <span className="text-lg font-bold tracking-tight hidden sm:inline" style={{ color: '#1239AD' }}>Calendario Farmacia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:inline">{user?.full_name}</span>
                <button onClick={() => appClient.auth.logout()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                  Salir
                </button>
                <button onClick={() => setModalInstall(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Smartphone size={17} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <VistaEmpleadoRO
            empleado={miEmpleado}
            estadistica={miEstadistica}
            anioActual={anioActual}
            eventos={misEventos}
            festivos={festivos}
            guardias={guardias}
            logoUrl={logoUrl}
            onSolicitarEvento={(data) => crearEvento.mutate(data)}
            onActualizarEvento={({ id, data }) => actualizarEvento.mutate({ id, data })}
            onEliminarEvento={(id) => eliminarEvento.mutate(id)}
          />
        </main>
        <ModalInstall isOpen={modalInstall} onClose={() => setModalInstall(false)} />
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'empleados', label: 'Empleados' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'configuracion', label: 'Config' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fd 0%, #f0f5f3 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <img src={logoSvg} alt="Logo" className="h-8 w-auto object-contain rounded" />
              <span className="text-lg font-bold tracking-tight hidden sm:inline" style={{ color: '#1239AD' }}>Calendario Farmacia</span>
            </div>
            <nav className="flex gap-1 items-center">
              {navItems.map(item => (
                <button 
                  key={item.key} 
                  onClick={() => setVista(item.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    vista === item.key 
                      ? 'text-white' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={vista === item.key ? { background: '#1239AD' } : {}}
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => setModalInstall(true)} className="p-1.5 hover:bg-gray-100 rounded-lg ml-1" title="Instalar en móvil/tablet">
                <Smartphone size={17} className="text-gray-400" />
              </button>
              <button onClick={() => appClient.auth.logout()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 ml-1">
                Salir
              </button>
            </nav>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportBackup(file);
        }}
      />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {vista === 'dashboard' && (
          <VistaDashboard
            anioActual={anioActual}
            setAnioActual={setAnioActual}
            empleados={empleados}
            eventos={eventos}
            festivos={festivos}
            estadisticas={estadisticas}
            onSelectEmpleado={handleSelectEmpleado}
            onExportDB={exportarDB}
            onImportDB={importarDB}
          />
        )}

        {vista === 'empleados' && (
          <VistaEmpleados
            empleados={empleados}
            estadisticas={estadisticas}
            horarios={horarios}
            onSelectEmpleado={handleSelectEmpleado}
            onCrearEmpleado={(data) => crearEmpleado.mutate(data)}
            onActualizarEmpleado={({ id, data }) => actualizarEmpleado.mutate({ id, data })}
            onEliminarEmpleado={(id) => eliminarEmpleado.mutate(id)}
          />
        )}

        {vista === 'empleado' && empleadoSeleccionado && (
          <VistaEmpleado
            empleado={empleadoSeleccionado}
            estadistica={estadisticas.empleados.find(s => s.empleado.id === empleadoSeleccionado.id)}
            anioActual={anioActual}
            eventos={eventos}
            festivos={festivos}
            guardias={guardias}
            horarios={horarios}
            logoUrl={logoUrl}
            onBack={() => setVista('dashboard')}
            onCrearEvento={(data) => crearEvento.mutate(data)}
            onActualizarEvento={({ id, data }) => actualizarEvento.mutate({ id, data })}
            onEliminarEvento={(id) => eliminarEvento.mutate(id)}
            onCrearHorario={(data) => crearHorario.mutate(data)}
            onActualizarHorario={({ id, data }) => actualizarHorario.mutate({ id, data })}
            onEliminarHorario={(id) => eliminarHorario.mutate(id)}
          />
        )}

        {vista === 'usuarios' && (
          <VistaUsuarios empleados={empleados} />
        )}

        {vista === 'configuracion' && (
          <VistaConfiguracion
            anioActual={anioActual}
            setAnioActual={setAnioActual}
            convenio={convenio}
            empleados={empleados}
            festivos={festivos}
            guardias={guardias}
            logoUrl={logoUrl}
            subirLogo={subirLogo}
            quitarLogo={quitarLogo}
            uploading={uploading}
            onGuardarConvenio={(data) => guardarConvenio.mutate(data)}
            onCrearGuardia={(data) => crearGuardia.mutate(data)}
            onActualizarGuardia={({ id, data }) => actualizarGuardia.mutate({ id, data })}
            onEliminarGuardia={(id) => eliminarGuardia.mutate(id)}
            onCrearFestivo={(data) => crearFestivo.mutate(data)}
            onActualizarFestivo={({ id, data }) => actualizarFestivo.mutate({ id, data })}
            onEliminarFestivo={(id) => eliminarFestivo.mutate(id)}
            onActualizarEmpleado={({ id, data }) => actualizarEmpleado.mutate({ id, data })}
          />
        )}
      </main>

      <ModalInstall isOpen={modalInstall} onClose={() => setModalInstall(false)} />
    </div>
  );
}