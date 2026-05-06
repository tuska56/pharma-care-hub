// Utilidades de cálculo de horas
export const calcularHoras = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
};

export const calcularHorasSemanales = (horario) => {
  let total = 0;
  ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].forEach(dia => {
    if (horario[dia]?.activo) {
      total += calcularHoras(horario[dia].inicio, horario[dia].fin);
      if (horario[dia].inicio2 && horario[dia].fin2) {
        total += calcularHoras(horario[dia].inicio2, horario[dia].fin2);
      }
    }
  });
  return Math.round(total * 100) / 100;
};

export const calcularHorasDia = (fecha, horario) => {
  const diaSemana = new Date(fecha + 'T12:00:00').getDay();
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const nombreDia = dias[diaSemana];
  if (!horario || !horario[nombreDia] || !horario[nombreDia].activo) return 0;
  
  let total = calcularHoras(horario[nombreDia].inicio, horario[nombreDia].fin);
  if (horario[nombreDia].inicio2 && horario[nombreDia].fin2) {
    total += calcularHoras(horario[nombreDia].inicio2, horario[nombreDia].fin2);
  }
  return total;
};

const contarDiasEventoEnAnio = (fechaInicio, fechaFin, anio) => {
  const inicio = new Date(fechaInicio + 'T12:00:00');
  const fin = new Date(fechaFin + 'T12:00:00');
  const inicioAnio = new Date(anio, 0, 1, 12, 0, 0);
  const finAnio = new Date(anio, 11, 31, 12, 0, 0);
  const desde = inicio < inicioAnio ? inicioAnio : inicio;
  const hasta = fin > finAnio ? finAnio : fin;
  if (hasta < desde) return 0;
  return Math.round((hasta - desde) / (1000 * 60 * 60 * 24)) + 1;
};

const esAnioBisiesto = (anio) => {
  return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
};

// MOTOR DE CÁLCULO
export const MotorCalculo = {
  calcularHorasAnuales: (empleado, convenio, eventos, festivos, horarios, simular = false) => {
    const anio = convenio.anio;
    let horasTotales = 0;
    let horasVacaciones = 0;
    let horasFestivos = 0;
    let horasFaltas = 0;
    let horasExtra = 0;
    // Si el empleado tiene horas propias configuradas, se usan; si no, las del convenio
    // Proporcional si el empleado se dio de alta dentro del año
    const horasConvenio = empleado.horas_anuales || convenio.horas_anuales;
    const fechaAlta = empleado.fecha_alta ? new Date(empleado.fecha_alta + 'T12:00:00') : null;
    const inicioAnio = new Date(anio, 0, 1);
    const finAnio = new Date(anio, 11, 31);
    let horasTeoricas = horasConvenio;
    if (fechaAlta && fechaAlta.getFullYear() === anio) {
      const diasAnio = esAnioBisiesto(anio) ? 366 : 365;
      const diasDesdeAlta = Math.round((finAnio - fechaAlta) / (1000 * 60 * 60 * 24)) + 1;
      horasTeoricas = Math.round((horasConvenio * (diasDesdeAlta / diasAnio)) * 100) / 100;
    }
    
    const obtenerHorario = (fecha) => {
      return horarios
        .filter(h => h.empleado_id === empleado.id)
        .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
        .find(h => {
          const fechaDate = new Date(fecha + 'T12:00:00');
          const inicio = new Date(h.fecha_inicio + 'T12:00:00');
          const fin = h.fecha_fin ? new Date(h.fecha_fin + 'T12:00:00') : new Date('2099-12-31');
          return fechaDate >= inicio && fechaDate <= fin;
        });
    };
    
    for (let mes = 0; mes < 12; mes++) {
      const diasMes = new Date(anio, mes + 1, 0).getDate();
      for (let dia = 1; dia <= diasMes; dia++) {
        const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        if (fechaAlta && fechaAlta.getFullYear() === anio && fecha < empleado.fecha_alta) continue;
        const diaSemana = new Date(fecha + 'T12:00:00').getDay();
        if (diaSemana === 0) continue;
        
        const horario = obtenerHorario(fecha);
        if (!horario) continue;
        
        const horasDia = calcularHorasDia(fecha, horario);
        horasTotales += horasDia;
        
        const eventoDelDia = eventos.find(e => 
          e.empleado_id === empleado.id && 
          fecha >= e.fecha_inicio && 
          fecha <= e.fecha_fin
        );
        
        const festivoDelDia = festivos.find(f => f.fecha === fecha);
        
        if (eventoDelDia && !simular) {
          switch (eventoDelDia.tipo_evento) {
            case 'VACACIONES':
            case 'ASUNTOS_PROPIOS':
            case 'SABADO_LIBRE':
              horasVacaciones += horasDia;
              break;
            case 'FESTIVO_TRABAJADO':
              // Se considera como día trabajado normal; no hay ajuste extra.
              break;
            case 'FALTA_HORAS':
              horasFaltas += eventoDelDia.horas || horasDia;
              break;
            case 'HORAS_EXTRA':
              horasExtra += eventoDelDia.horas || 0;
              break;
          }
        } else if (festivoDelDia && !eventoDelDia) {
          if (festivoDelDia.medio_dia) {
            horasFestivos += (horasDia - 4.5);
          } else {
            horasFestivos += horasDia;
          }
        }
      }
    }
    
    const horasRealesTrabajadas = horasTotales - horasVacaciones - horasFestivos - horasFaltas + horasExtra;
    const saldo = horasRealesTrabajadas - horasTeoricas;
    
    return {
      horasTeoricas: Math.round(horasTeoricas * 100) / 100,
      horasRealesTrabajadas: Math.round(horasRealesTrabajadas * 100) / 100,
      horasVacaciones: Math.round(horasVacaciones * 100) / 100,
      horasFestivos: Math.round(horasFestivos * 100) / 100,
      horasFaltas: Math.round(horasFaltas * 100) / 100,
      horasExtra: Math.round(horasExtra * 100) / 100,
      saldo: Math.round(saldo * 100) / 100
    };
  },
  
  calcularVacaciones: (empleado, convenio, eventos) => {
    const anio = convenio.anio;
    const vacacionesUsadas = eventos.filter(e => 
      e.empleado_id === empleado.id && 
      e.tipo_evento === 'VACACIONES'
    ).reduce((total, e) => {
      return total + contarDiasEventoEnAnio(e.fecha_inicio, e.fecha_fin, anio);
    }, 0);

    // Proporcional si el empleado se dio de alta dentro del año
    let totalVacaciones = convenio.dias_vacaciones;
    const fechaAlta = empleado.fecha_alta ? new Date(empleado.fecha_alta + 'T12:00:00') : null;
    if (fechaAlta && fechaAlta.getFullYear() === anio) {
      const diasAnio = esAnioBisiesto(anio) ? 366 : 365;
      const diasDesdeAlta = Math.round((new Date(anio, 11, 31) - fechaAlta) / (1000 * 60 * 60 * 24)) + 1;
      totalVacaciones = Math.round(convenio.dias_vacaciones * (diasDesdeAlta / diasAnio));
    }
    
    return {
      total: totalVacaciones,
      usadas: vacacionesUsadas,
      disponibles: totalVacaciones - vacacionesUsadas
    };
  },
  
  calcularAsuntosPropios: (empleado, convenio, eventos) => {
    const anio = convenio.anio;
    const asuntosUsados = eventos.filter(e => 
      e.empleado_id === empleado.id && 
      e.tipo_evento === 'ASUNTOS_PROPIOS'
    ).reduce((total, e) => {
      return total + contarDiasEventoEnAnio(e.fecha_inicio, e.fecha_fin, anio);
    }, 0);

    // Proporcional si el empleado se dio de alta dentro del año
    let totalAsuntos = convenio.dias_asuntos_propios;
    const fechaAlta = empleado.fecha_alta ? new Date(empleado.fecha_alta + 'T12:00:00') : null;
    if (fechaAlta && fechaAlta.getFullYear() === anio) {
      const diasAnio = esAnioBisiesto(anio) ? 366 : 365;
      const diasDesdeAlta = Math.round((new Date(anio, 11, 31) - fechaAlta) / (1000 * 60 * 60 * 24)) + 1;
      totalAsuntos = Math.round(convenio.dias_asuntos_propios * (diasDesdeAlta / diasAnio));
    }
    
    return {
      total: totalAsuntos,
      usados: asuntosUsados,
      disponibles: totalAsuntos - asuntosUsados
    };
  },
  
  calcularSabadosLibres: (empleado, convenio, eventos, festivos, horarios) => {
    const anioSab = convenio.anio;
    const fechaAltaSab = empleado.fecha_alta ? new Date(empleado.fecha_alta + 'T12:00:00') : null;
    
    const obtenerHorario = (fecha) => {
      return horarios
        .filter(h => h.empleado_id === empleado.id)
        .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
        .find(h => {
          const fechaDate = new Date(fecha + 'T12:00:00');
          const inicio = new Date(h.fecha_inicio + 'T12:00:00');
          const fin = h.fecha_fin ? new Date(h.fecha_fin + 'T12:00:00') : new Date('2099-12-31');
          return fechaDate >= inicio && fechaDate <= fin;
        });
    };
    
    let horasTotales = 0;
    let horasVacaciones = 0;
    let horasFestivos = 0;
    let horasFaltas = 0;
    let horasExtra = 0;
    let horasSabados = 0;
    let cantidadSabados = 0;
    
    for (let mes = 0; mes < 12; mes++) {
      const diasMes = new Date(anioSab, mes + 1, 0).getDate();
      for (let dia = 1; dia <= diasMes; dia++) {
        const fecha = `${anioSab}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        if (fechaAltaSab && fechaAltaSab.getFullYear() === anioSab && fecha < empleado.fecha_alta) continue;
        const diaSemana = new Date(fecha + 'T12:00:00').getDay();
        if (diaSemana === 0) continue;
        
        const horario = obtenerHorario(fecha);
        if (!horario) continue;
        
        const horasDia = calcularHorasDia(fecha, horario);
        
        if (diaSemana === 6) {
          cantidadSabados++;
          horasSabados += horasDia;
        }
        
        horasTotales += horasDia;
        
        const evento = eventos.find(e => 
          e.empleado_id === empleado.id && 
          fecha >= e.fecha_inicio && 
          fecha <= e.fecha_fin
        );
        
        const festivo = festivos.find(f => f.fecha === fecha);
        
        if (evento) {
          switch (evento.tipo_evento) {
            case 'VACACIONES':
            case 'ASUNTOS_PROPIOS':
              horasVacaciones += horasDia;
              break;
            case 'SABADO_LIBRE':
              break;
            case 'FESTIVO_TRABAJADO':
              // Se considera como día trabajado normal; no hay ajuste extra.
              break;
            case 'FALTA_HORAS':
              horasFaltas += evento.horas || horasDia;
              break;
            case 'HORAS_EXTRA':
              horasExtra += evento.horas || 0;
              break;
          }
        } else if (festivo && !evento) {
          if (festivo.medio_dia) {
            horasFestivos += (horasDia - 4.5);
          } else {
            horasFestivos += horasDia;
          }
        }
      }
    }
    
    const horasPromedioPorSabado = cantidadSabados > 0 ? horasSabados / cantidadSabados : 3.75;
    const horasNetasSinSabados = horasTotales - horasVacaciones - horasFestivos - horasFaltas + horasExtra;
    const horasConvenioBase = empleado.horas_anuales || convenio.horas_anuales;
    let horasAnualesEmpleado = horasConvenioBase;
    if (fechaAltaSab && fechaAltaSab.getFullYear() === anioSab) {
      const diasAnio = esAnioBisiesto(anioSab) ? 366 : 365;
      const diasDesdeAlta = Math.round((new Date(anioSab, 11, 31) - fechaAltaSab) / (1000 * 60 * 60 * 24)) + 1;
      horasAnualesEmpleado = Math.round((horasConvenioBase * (diasDesdeAlta / diasAnio)) * 100) / 100;
    }
    const saldoHoras = horasNetasSinSabados - horasAnualesEmpleado;
    
    const sabadosPorSaldo = saldoHoras > 0 && horasPromedioPorSabado > 0
      ? Math.floor(saldoHoras / horasPromedioPorSabado)
      : 0;
    
    const sabadosUsados = eventos.filter(e => 
      e.empleado_id === empleado.id && 
      e.tipo_evento === 'SABADO_LIBRE'
    ).reduce((total, e) => {
      const inicio = new Date(e.fecha_inicio + 'T12:00:00');
      const fin = new Date(e.fecha_fin + 'T12:00:00');
      let count = 0;
      for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 6) count++;
      }
      return total + count;
    }, 0);
    
    return {
      porSaldo: sabadosPorSaldo,
      disponibles: Math.max(0, sabadosPorSaldo - sabadosUsados),
      usados: sabadosUsados,
      saldoHoras: Math.round(saldoHoras * 100) / 100,
      horasPorSabado: Math.round(horasPromedioPorSabado * 100) / 100
    };
  }
};