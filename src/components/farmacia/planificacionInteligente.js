import { MotorCalculo } from './motorCalculo';

const formatFecha = (date) => {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const esAusente = (empleado, fecha, eventos) => {
  if (!empleado || empleado.activo === false) return true;
  return eventos.some(evento =>
    evento.empleado_id === empleado.id &&
    ['VACACIONES', 'ASUNTOS_PROPIOS', 'SABADO_LIBRE'].includes(evento.tipo_evento) &&
    fecha >= evento.fecha_inicio &&
    fecha <= evento.fecha_fin
  );
};

export const calcularSabadosOro = (festivos, anio) => {
  const festivosSet = new Set(festivos.filter(f => f.fecha?.startsWith(`${anio}-`)).map(f => f.fecha));
  const sabados = [];

  for (let mes = 0; mes < 12; mes++) {
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    for (let dia = 1; dia <= diasMes; dia++) {
      const fechaDate = new Date(anio, mes, dia, 12, 0, 0);
      if (fechaDate.getDay() !== 6) continue;
      const viernes = formatFecha(new Date(anio, mes, dia - 1));
      const lunes = formatFecha(new Date(anio, mes, dia + 2));
      const esViernesFestivo = festivosSet.has(viernes);
      const esLunesFestivo = festivosSet.has(lunes);
      if (esViernesFestivo || esLunesFestivo) {
        sabados.push({
          fecha: formatFecha(fechaDate),
          descripcion: esViernesFestivo ? 'Sábado de Oro (viernes festivo)' : 'Sábado de Oro (lunes festivo)',
          motivo: esViernesFestivo ? 'Festivo viernes anterior' : 'Festivo lunes siguiente',
          tipo: 'SÁBADO ORO'
        });
      }
    }
  }

  return sabados;
};


export const calcularSabadosMensuales = (anio) => {
  const sabados = [];

  for (let mes = 0; mes < 12; mes++) {
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    let sabadoEncontrado = false;
    
    // Buscar el primer sábado del mes
    for (let dia = 1; dia <= diasMes && !sabadoEncontrado; dia++) {
      const fechaDate = new Date(anio, mes, dia, 12, 0, 0);
      if (fechaDate.getDay() === 6) {
        sabados.push({
          fecha: formatFecha(fechaDate),
          descripcion: `Sábado Mensual - ${fechaDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
          motivo: 'Reparto equilibrado mensual',
          tipo: 'SÁBADO MENSUAL'
        });
        sabadoEncontrado = true;
      }
    }
  }

  return sabados;
};

const distribuirSabadosEquilibradamente = (sabados, empleadosStats, eventos) => {
  const porEmpleado = empleadosStats
    .sort((a, b) => {
      if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
      if (a.saldo !== b.saldo) return b.saldo - a.saldo;
      const fechaA = a.empleado.fecha_alta ? new Date(a.empleado.fecha_alta).getTime() : Infinity;
      const fechaB = b.empleado.fecha_alta ? new Date(b.empleado.fecha_alta).getTime() : Infinity;
      return fechaA - fechaB;
    })
    .map(item => ({ ...item, asignados: 0 }));

  const assignments = sabados.map(sabado => {
    // Buscar candidatos disponibles, ordenados por:
    // 1. No ausente en esa fecha
    // 2. Tenga saldo > 0
    // 3. Haya recibido menos sábados (equilibrio)
    // 4. Orden de prioridad ya aplicado en sort
    
    const candidatosDisponibles = porEmpleado.filter(item =>
      !esAusente(item.empleado, sabado.fecha, eventos) &&
      item.saldo > 0 &&
      item.asignados < item.sabadosDisponibles
    );

    if (candidatosDisponibles.length === 0) {
      return { ...sabado, empleado_id: null, empleado: null, razon: 'No hay empleado disponible o saldo suficiente' };
    }

    // Seleccionar el que tenga menos asignaciones (equilibrio)
    const candidato = candidatosDisponibles.reduce((prev, curr) =>
      prev.asignados <= curr.asignados ? prev : curr
    );

    candidato.asignados += 1;
    return { ...sabado, empleado_id: candidato.empleado.id, empleado: candidato.empleado, razon: 'Asignado automáticamente' };
  });

  return { porEmpleado, assignments };
};

export const construirPlanificacionSabados = ({ empleados, eventos, festivos, horarios, convenio, anio, modo = 'SABADOS_ORO' }) => {
  const sabados = modo === 'SABADO_MENSUAL' 
    ? calcularSabadosMensuales(anio)
    : calcularSabadosOro(festivos, anio);
    
  const empleadosActivos = empleados.filter(emp => emp.activo !== false);

  const estadisticas = empleadosActivos.map(emp => {
    const horas = MotorCalculo.calcularHorasAnuales(emp, convenio, eventos, festivos, horarios);
    const sabadosLibres = MotorCalculo.calcularSabadosLibres(emp, convenio, eventos, festivos, horarios);
    return {
      empleado: emp,
      horas,
      sabados: sabadosLibres,
      saldo: horas.saldo,
      sabadosDisponibles: Math.max(0, sabadosLibres.porSaldo - sabadosLibres.usados),
      prioridad: emp.beneficios?.sabadoOroUltimoAno === 0 ? 0 : 1
    };
  });

  const { porEmpleado, assignments } = distribuirSabadosEquilibradamente(sabados, estadisticas, eventos);

  const resumenEmpleados = porEmpleado.map(item => {
    const horasPorSabado = item.sabados.horasPorSabado || 4;
    const saldoProyectado = Math.round((item.saldo - item.asignados * horasPorSabado) * 100) / 100;
    return {
      empleado: item.empleado,
      asignados: item.asignados,
      saldoActual: item.saldo,
      saldoProyectado,
      horasPorSabado,
      prioridad: item.prioridad === 0 ? 'Alta' : 'Normal',
      sabadosTeoricos: item.sabados.porSaldo,
      sabadosUsados: item.sabados.usados,
      sabadosDisponibles: item.sabadosDisponibles
    };
  });

  return {
    anio,
    modo,
    sabados,
    assignments,
    resumenEmpleados,
    totalAsignados: assignments.filter(a => a.empleado_id).length,
    totalDisponibles: sabados.length,
    empleadosActivos: empleadosActivos.length
  };
};

export const construirEventosPlanificacion = (assignments) => {
  return assignments
    .filter(a => a.empleado_id)
    .map(a => ({
      tipo_evento: 'SABADO_LIBRE',
      fecha_inicio: a.fecha,
      fecha_fin: a.fecha,
      empleado_id: a.empleado_id,
      comentario: 'Sábado asignado por planificación inteligente',
      origen: 'planificacion'
    }));
};
