import React, { useMemo, useState } from 'react';
import { construirPlanificacionSabados, construirEventosPlanificacion } from './planificacionInteligente';
import { CheckCircle2, RefreshCcw, ChevronDown, ChevronUp, Info } from 'lucide-react';

const TooltipInfo = ({ text, children }) => {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setMostrar(true)}
        onMouseLeave={() => setMostrar(false)}
        onClick={() => setMostrar(!mostrar)}
        className="inline-flex items-center justify-center w-5 h-5 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
        title={text}
      >
        <Info size={14} />
      </button>
      {mostrar && (
        <div className="absolute z-50 left-full ml-2 w-48 p-2 text-xs text-gray-700 bg-blue-50 border border-blue-200 rounded-lg shadow-lg whitespace-normal">
          {text}
          {children && <div className="mt-1 text-blue-600 font-semibold">{children}</div>}
        </div>
      )}
    </div>
  );
};

export default function PlanificacionView({
  anioActual,
  empleados,
  eventos,
  festivos,
  horarios,
  convenio,
  planificacion,
  onConfirmPlanificacion
}) {
  const [simulado, setSimulado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [pesosAjustados, setPesosAjustados] = useState({});
  const [modo, setModo] = useState('SABADOS_ORO');

  const resultado = useMemo(() => {
    if (!empleados.length || !convenio) return null;
    return construirPlanificacionSabados({ 
      empleados, eventos, festivos, horarios, convenio, anio: anioActual, modo
    });
  }, [anioActual, empleados, eventos, festivos, horarios, convenio, modo]);

  const handleSimular = () => {
    setSimulado(resultado);
    setMostrarAjustes(true);
  };

  const handleAjustarPeso = (empleadoId, valor) => {
    setPesosAjustados(prev => ({
      ...prev,
      [empleadoId]: Math.max(0, Math.min(100, valor))
    }));
  };

  const handleConfirmar = () => {
    if (!resultado) return;
    setGuardando(true);
    const eventosPlanificados = construirEventosPlanificacion(resultado.assignments);
    const contadoresPorEmpleado = resultado.resumenEmpleados.reduce((acc, item) => {
      acc[item.empleado.id] = {
        sabadoOroUltimoAno: item.asignados,
        ultimoAnoSinSabadoOro: item.asignados === 0,
        sabadoOroAsignadoHistorico: (item.empleado.beneficios?.sabadoOroAsignadoHistorico || 0) + item.asignados
      };
      return acc;
    }, {});

    onConfirmPlanificacion({
      anio: resultado.anio,
      assignments: resultado.assignments,
      eventosPlanificados,
      contadoresPorEmpleado
    });
    setGuardando(false);
  };

  const preview = simulado || resultado;
  const esModoOro = modo === 'SABADOS_ORO';
  const tituloModo = esModoOro ? 'Sábados de Oro' : 'Un Sábado al Mes';
  const descModo = esModoOro 
    ? 'Sábados siguientes a festividades (viernes festivo o lunes festivo siguiente)' 
    : 'Un sábado por mes repartido de forma equilibrada entre empleados';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Planificación Inteligente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Reparte automáticamente {tituloModo.toLowerCase()} y calcula el impacto de horas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSimular} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <RefreshCcw size={16} /> Simular reparto
          </button>
          <button onClick={handleConfirmar} disabled={!preview || guardando} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
            <CheckCircle2 size={16} /> {guardando ? 'Guardando...' : 'Confirmar asignación'}
          </button>
        </div>
      </div>

      {/* Selector de modo */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Modo de Distribución</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
            modo === 'SABADOS_ORO' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <input 
              type="radio" 
              name="modo" 
              value="SABADOS_ORO" 
              checked={modo === 'SABADOS_ORO'} 
              onChange={(e) => setModo(e.target.value)}
              className="w-4 h-4 text-blue-600 cursor-pointer"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900">Sábados de Oro</p>
              <p className="text-xs text-gray-500 mt-1">Sábados tras viernes o antes de lunes festivos</p>
            </div>
          </label>
          <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
            modo === 'SABADO_MENSUAL' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <input 
              type="radio" 
              name="modo" 
              value="SABADO_MENSUAL" 
              checked={modo === 'SABADO_MENSUAL'} 
              onChange={(e) => setModo(e.target.value)}
              className="w-4 h-4 text-blue-600 cursor-pointer"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900">Un Sábado al Mes</p>
              <p className="text-xs text-gray-500 mt-1">Un sábado por mes repartido equilibradamente</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Año</p>
          <p className="text-3xl font-bold text-gray-900">{anioActual}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{tituloModo}</p>
            <TooltipInfo text={esModoOro 
              ? "Sábados que se generan cuando el viernes anterior o el lunes siguiente es festivo." 
              : "Un sábado por mes (primer sábado) disponible para repartir entre empleados."} 
            />
          </div>
          <p className="text-3xl font-bold text-gray-900">{preview?.totalDisponibles ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">{descModo}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Asignaciones previstas</p>
            <TooltipInfo text="Número de sábados que se van a repartir entre empleados. Algunos pueden no asignarse si no hay candidatos disponibles con saldo suficiente." />
          </div>
          <p className="text-3xl font-bold text-gray-900">{preview?.totalAsignados ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Ajusta antes de confirmar para guardar el resultado.</p>
        </div>
      </div>

      {mostrarAjustes && simulado && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button 
            onClick={() => setMostrarAjustes(!mostrarAjustes)}
            className="w-full p-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50"
          >
            <div>
              <h2 className="font-bold text-gray-900">Panel de Ajustes - Prioridad por Empleado</h2>
              <p className="text-sm text-gray-500 mt-1">Visualiza cómo se asignan los {esModoOro ? 'sábados de oro' : 'sábados mensuales'} según prioridad de méritos y saldo de horas.</p>
            </div>
            {mostrarAjustes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {mostrarAjustes && (
            <div className="p-5 space-y-6">
              {empleados.filter(e => e.activo !== false).map(emp => (
                <div key={emp.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-900">{emp.nombre}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={pesosAjustados[emp.id] ?? emp.merito ?? 50}
                        onChange={(e) => handleAjustarPeso(emp.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center"
                      />
                      <span className="text-sm text-gray-500 w-6">%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={pesosAjustados[emp.id] ?? emp.merito ?? 50}
                    onChange={(e) => handleAjustarPeso(emp.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {pesosAjustados[emp.id] !== undefined 
                      ? `Prioridad: ${pesosAjustados[emp.id] >= 75 ? 'Muy Alta' : pesosAjustados[emp.id] >= 50 ? 'Normal' : 'Baja'}`
                      : `Mérito base: ${emp.merito ?? 50}`
                    }
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => setPesosAjustados({})}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Restaurar valores por defecto
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Vista previa de asignaciones</h2>
            <p className="text-sm text-gray-500 mt-1">Se asignan los {esModoOro ? 'sábados de oro' : 'sábados mensuales'} a empleados disponibles, priorizando por méritos y equilibrio de carga.</p>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {preview?.assignments?.length > 0 ? preview.assignments.map((asig, idx) => (
              <div key={`${asig.fecha}-${idx}`} className="p-4 border-b border-gray-100 last:border-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{asig.fecha}</p>
                    <p className="text-xs text-gray-500">{asig.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{asig.empleado?.nombre || 'Sin disponible'}</p>
                    <p className="text-xs text-gray-500">{asig.razon}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-sm text-gray-500">No hay {esModoOro ? 'sábados de oro' : 'sábados mensuales'} detectados para este año o falta información.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">Impacto por empleado</h2>
                <p className="text-sm text-gray-500 mt-1">Saldo actual, asignaciones previstas y horas proyectadas tras el reparto.</p>
              </div>
              <TooltipInfo text="El cálculo de sábados se basa en el saldo de horas del año teórico (horas convenio - vacaciones, asuntos propios, faltas + extras). Cada sábado equivale a un número de horas según el promedio trabajado. El saldo proyectado muestra cuántas horas quedará después del reparto." />
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {preview?.resumenEmpleados?.length > 0 ? preview.resumenEmpleados.map(item => (
              <div key={item.empleado.id} className="p-4 border-b border-gray-100 last:border-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.empleado.nombre}</p>
                    <p className="text-xs text-gray-500">Prioridad: {item.prioridad}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-1">{item.asignados} {esModoOro ? 'oro' : 'mensual'}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>Saldo actual</span>
                      <TooltipInfo text="Horas sobrantes/faltantes del año teórico (convenio - vacaciones - faltas + extras). Base para calcular sábados teóricos." />
                    </div>
                    <span>{item.saldoActual > 0 ? '+' : ''}{item.saldoActual}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>Saldo proyectado</span>
                      <TooltipInfo text="Saldo actual menos las horas de los sábados asignados. Muestra el resultado final tras el reparto." />
                    </div>
                    <span>{item.saldoProyectado > 0 ? '+' : ''}{item.saldoProyectado}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>Sábados teóricos</span>
                      <TooltipInfo text="Sábados que se podrían tomar según el saldo de horas del año teórico. Es decir: saldo ÷ horas por sábado (aproximadamente 4h). NOTA: Es teórico, solo para cálculo." />
                    </div>
                    <span>{item.sabadosTeoricos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>Sábados disponibles</span>
                      <TooltipInfo text="Sábados teóricos menos los ya usados/tomados. La cantidad que aún se puede asignar a este empleado." />
                    </div>
                    <span>{item.sabadosDisponibles}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-sm text-gray-500">Faltan empleados activos o eventos.</div>
            )}
          </div>
        </div>
      </div>

      {planificacion?.ultimaEjecucion && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Última planificación guardada: {new Date(planificacion.ultimaEjecucion).toLocaleString()}</p>
          <p className="text-sm text-gray-600">Año: {planificacion.anio}, asignaciones: {planificacion.asignaciones?.length ?? 0}</p>
        </div>
      )}
    </div>
  );
}
