import { useState, useEffect, useMemo, useCallback } from 'react';
import { MotorCalculo } from './motorCalculo';

const STORAGE_KEY = 'pharma_care_hub_data';

const defaultState = {
  anioActual: new Date().getFullYear(),
  modoSimulacion: false,
  empleados: [
    {
      id: 'empleado-1',
      nombre: 'Admin Local',
      fecha_alta: new Date().toISOString().split('T')[0],
      activo: true,
      horas_arrastre: 0,
      merito: 50
    }
  ],
  eventos: [],
  horarios: [],
  guardias: [],
  festivos: [],
  traspasos_historial: [],
  convenio: {
    anio: new Date().getFullYear(),
    nombre: 'Farmacia Local',
    logo_url: null,
    horas_anuales: 0,
    dias_vacaciones: 0,
    dias_asuntos_propios: 0,
    provincia: 'Burgos',
    localidad: 'Miranda de Ebro'
  },
  planificacion: {
    anio: null,
    ultimaEjecucion: null,
    asignaciones: [],
    pesos_empleados: {}
  },
  isLoading: false
};

const readStorage = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      convenio: {
        ...defaultState.convenio,
        ...(parsed.convenio || {})
      },
      planificacion: {
        ...defaultState.planificacion,
        ...(parsed.planificacion || {})
      }
    };
  } catch {
    return defaultState;
  }
};

const writeStorage = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const getId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildEstadisticas = (state) => {
  const activos = state.empleados.filter(emp => emp.activo !== false);
  return {
    totalEmpleados: activos.length,
    empleados: activos.map(emp => {
      const vacaciones = MotorCalculo.calcularVacaciones(emp, state.convenio, state.eventos);
      const asuntos = MotorCalculo.calcularAsuntosPropios(emp, state.convenio, state.eventos);
      const sabados = MotorCalculo.calcularSabadosLibres(emp, state.convenio, state.eventos, state.festivos, state.horarios);
      const horas = MotorCalculo.calcularHorasAnuales(emp, state.convenio, state.eventos, state.festivos, state.horarios);
      return {
        empleado: emp,
        vacaciones,
        asuntos,
        sabados,
        horas
      };
    })
  };
};

export default function useAppData() {
  const [state, setState] = useState(() => readStorage());

  useEffect(() => {
    writeStorage(state);
  }, [state]);

  const setAnioActual = useCallback((anio) => {
    setState(prev => ({
      ...prev,
      anioActual: anio,
      convenio: {
        ...prev.convenio,
        anio
      }
    }));
  }, []);

  const setModoSimulacion = useCallback((value) => {
    setState(prev => ({ ...prev, modoSimulacion: value }));
  }, []);

  const crearEmpleado = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({
        ...prev,
        empleados: [...prev.empleados, { id: getId(), activo: true, horas_arrastre: 0, merito: 50, ...data }]
      }));
    }
  }), []);

  const actualizarEmpleado = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        empleados: prev.empleados.map(emp => emp.id === id ? { ...emp, ...data } : emp)
      }));
    }
  }), []);

  const eliminarEmpleado = useMemo(() => ({
    mutate: (id) => {
      setState(prev => ({
        ...prev,
        empleados: prev.empleados.filter(emp => emp.id !== id),
        eventos: prev.eventos.filter(ev => ev.empleado_id !== id),
        horarios: prev.horarios.filter(h => h.empleado_id !== id)
      }));
    }
  }), []);

  const crearEvento = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({ ...prev, eventos: [...prev.eventos, { id: getId(), ...data }] }));
    }
  }), []);

  const actualizarEvento = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        eventos: prev.eventos.map(ev => ev.id === id ? { ...ev, ...data } : ev)
      }));
    }
  }), []);

  const eliminarEvento = useMemo(() => ({
    mutate: (id) => {
      setState(prev => ({ ...prev, eventos: prev.eventos.filter(ev => ev.id !== id) }));
    }
  }), []);

  const crearHorario = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({ ...prev, horarios: [...prev.horarios, { id: getId(), ...data }] }));
    }
  }), []);

  const actualizarHorario = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        horarios: prev.horarios.map(h => h.id === id ? { ...h, ...data } : h)
      }));
    }
  }), []);

  const eliminarHorario = useMemo(() => ({
    mutate: (id) => {
      setState(prev => ({ ...prev, horarios: prev.horarios.filter(h => h.id !== id) }));
    }
  }), []);

  const crearGuardia = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({ ...prev, guardias: [...prev.guardias, { id: getId(), ...data }] }));
    }
  }), []);

  const actualizarGuardia = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        guardias: prev.guardias.map(g => g.id === id ? { ...g, ...data } : g)
      }));
    }
  }), []);

  const eliminarGuardia = useMemo(() => ({
    mutate: (id) => {
      setState(prev => ({ ...prev, guardias: prev.guardias.filter(g => g.id !== id) }));
    }
  }), []);

  const crearFestivo = useMemo(() => ({
    mutate: (data) => {
      const festivo = { id: data.id || getId(), ...data };
      setState(prev => ({ ...prev, festivos: [...prev.festivos, festivo] }));
    }
  }), []);

  const actualizarFestivo = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        festivos: prev.festivos.map(f => {
          if (id && f.id === id) return { ...f, ...data };
          if (!id && f.fecha === data.fecha) return { ...f, ...data };
          return f;
        })
      }));
    }
  }), []);

  const eliminarFestivo = useMemo(() => ({
    mutate: (identifier) => {
      setState(prev => ({
        ...prev,
        festivos: prev.festivos.filter(f => {
          if (!identifier) return false;
          if (typeof identifier === 'string') {
            return f.id !== identifier && f.fecha !== identifier;
          }
          return f.id !== identifier.id && f.fecha !== identifier.fecha;
        })
      }));
    }
  }), []);

  const guardarPlanificacion = useMemo(() => ({
    mutate: ({ anio, assignments, eventosPlanificados, contadoresPorEmpleado }) => {
      setState(prev => ({
        ...prev,
        eventos: [
          ...prev.eventos.filter(ev => !(ev.tipo_evento === 'SABADO_LIBRE' && ev.origen === 'planificacion')),
          ...eventosPlanificados.map(evento => ({ id: getId(), ...evento }))
        ],
        empleados: prev.empleados.map(emp => {
          const contador = contadoresPorEmpleado?.[emp.id];
          if (!contador) return emp;
          return {
            ...emp,
            beneficios: {
              ...(emp.beneficios || {}),
              ...contador
            }
          };
        }),
        planificacion: {
          anio,
          ultimaEjecucion: new Date().toISOString(),
          asignaciones: assignments
        }
      }));
    }
  }), []);

  const guardarConvenio = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({ ...prev, convenio: { ...prev.convenio, ...data } }));
    }
  }), []);

  const restaurarBackup = useMemo(() => ({
    mutate: (backup) => {
      setState(prev => ({
        ...prev,
        empleados: backup.empleados || [],
        eventos: backup.eventos || [],
        horarios: backup.horarios || [],
        guardias: backup.guardias || [],
        festivos: backup.festivos || [],
        convenio: {
          ...prev.convenio,
          ...backup.convenio,
          anio: backup.convenio?.anio ?? prev.convenio.anio
        },
        planificacion: {
          ...prev.planificacion,
          ...backup.planificacion
        },
        anioActual: backup.anio ?? prev.anioActual
      }));
    }
  }), []);

  const registrarTraspaso = useMemo(() => ({
    mutate: ({ empleado_id, horas, comentario }) => {
      setState(prev => ({
        ...prev,
        traspasos_historial: [
          ...prev.traspasos_historial,
          {
            id: getId(),
            empleado_id,
            horas,
            comentario,
            fecha: new Date().toISOString()
          }
        ]
      }));
    }
  }), []);

  const actualizarPesosSimulacion = useMemo(() => ({
    mutate: (pesos_empleados) => {
      setState(prev => ({
        ...prev,
        planificacion: {
          ...prev.planificacion,
          pesos_empleados
        }
      }));
    }
  }), []);

  const estadisticas = useMemo(() => buildEstadisticas(state), [state.empleados, state.eventos, state.horarios, state.festivos, state.convenio]);

  return {
    anioActual: state.anioActual,
    setAnioActual,
    modoSimulacion: state.modoSimulacion,
    setModoSimulacion,
    empleados: state.empleados,
    eventos: state.eventos,
    horarios: state.horarios,
    guardias: state.guardias,
    festivos: state.festivos,
    convenio: state.convenio,
    estadisticas,
    isLoading: state.isLoading,
    traspasos_historial: state.traspasos_historial,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    crearGuardia,
    actualizarGuardia,
    eliminarGuardia,
    crearFestivo,
    actualizarFestivo,
    eliminarFestivo,
    guardarConvenio,
    guardarPlanificacion,
    restaurarBackup,
    registrarTraspaso,
    actualizarPesosSimulacion,
    planificacion: state.planificacion
  };
}
