import { useState, useEffect, useMemo, useCallback } from 'react';

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
      horas_arrastre: 0
    }
  ],
  eventos: [],
  horarios: [],
  guardias: [],
  festivos: [],
  convenio: {
    anio: new Date().getFullYear(),
    nombre: 'Farmacia Local',
    logo_url: null
  },
  isLoading: false
};

const readStorage = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
};

const writeStorage = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const getId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildEstadisticas = (empleados) => {
  const activos = empleados.filter(emp => emp.activo !== false);
  return {
    totalEmpleados: activos.length,
    empleados: activos.map(emp => ({
      empleado: emp,
      vacaciones: { disponibles: 0, total: 0 },
      asuntos: { disponibles: 0, total: 0 },
      sabados: { usados: 0, porSaldo: 0 },
      horas: { saldo: emp.horas_arrastre || 0 }
    }))
  };
};

export default function useAppData() {
  const [state, setState] = useState(() => readStorage());

  useEffect(() => {
    writeStorage(state);
  }, [state]);

  const setAnioActual = useCallback((anio) => {
    setState(prev => ({ ...prev, anioActual: anio }));
  }, []);

  const setModoSimulacion = useCallback((value) => {
    setState(prev => ({ ...prev, modoSimulacion: value }));
  }, []);

  const crearEmpleado = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({
        ...prev,
        empleados: [...prev.empleados, { id: getId(), activo: true, horas_arrastre: 0, ...data }]
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
      setState(prev => ({ ...prev, festivos: [...prev.festivos, { id: getId(), ...data }] }));
    }
  }), []);

  const actualizarFestivo = useMemo(() => ({
    mutate: ({ id, data }) => {
      setState(prev => ({
        ...prev,
        festivos: prev.festivos.map(f => f.id === id ? { ...f, ...data } : f)
      }));
    }
  }), []);

  const eliminarFestivo = useMemo(() => ({
    mutate: (id) => {
      setState(prev => ({ ...prev, festivos: prev.festivos.filter(f => f.id !== id) }));
    }
  }), []);

  const guardarConvenio = useMemo(() => ({
    mutate: (data) => {
      setState(prev => ({ ...prev, convenio: { ...prev.convenio, ...data } }));
    }
  }), []);

  const estadisticas = useMemo(() => buildEstadisticas(state.empleados), [state.empleados]);

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
    guardarConvenio
  };
}
