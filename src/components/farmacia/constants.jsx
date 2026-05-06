// Semana empieza en Lunes
export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DIAS_SEMANA_COMPLETO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const COLOR_PRIMARIO = '#1239AD';
export const COLOR_SECUNDARIO = '#99B9AF';

export const TIPOS_EVENTO = {
  VACACIONES: { label: 'Vacaciones', color: 'bg-blue-600', bgLight: 'bg-blue-100', letra: 'V', hex: '#1239AD' },
  ASUNTOS_PROPIOS: { label: 'Asuntos Propios', color: 'bg-purple-500', bgLight: 'bg-purple-100', letra: 'A', hex: '#7C3AED' },
  SABADO_LIBRE: { label: 'Sábado Libre', color: 'bg-cyan-600', bgLight: 'bg-cyan-100', letra: 'SL', hex: '#0891B2' },
  FALTA_HORAS: { label: 'Falta', color: 'bg-red-500', bgLight: 'bg-red-100', letra: 'F', hex: '#EF4444' },
  HORAS_EXTRA: { label: 'Horas Extra', color: 'bg-green-500', bgLight: 'bg-green-100', letra: '+', hex: '#22C55E' },
  FESTIVO_TRABAJADO: { label: 'Festivo Trabajado', color: 'bg-orange-500', bgLight: 'bg-orange-100', letra: 'FT', hex: '#F97316' },
};

export const FESTIVOS_POR_ANIO = {
  2024: [
    { fecha: '2024-01-01', descripcion: 'Año Nuevo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-01-06', descripcion: 'Reyes', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-03-29', descripcion: 'Viernes Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-05-01', descripcion: 'Día del Trabajo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-06-09', descripcion: 'La Rioja', ambito: 'AUTONOMICO', medio_dia: false },
    { fecha: '2024-06-24', descripcion: 'San Juan del Monte (Miranda)', ambito: 'LOCAL', medio_dia: true },
    { fecha: '2024-08-15', descripcion: 'Asunción', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-10-12', descripcion: 'Fiesta Nacional', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-11-01', descripcion: 'Todos los Santos', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-12-06', descripcion: 'Constitución', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-12-08', descripcion: 'Inmaculada', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-12-24', descripcion: 'Nochebuena', ambito: 'CONVENIO', medio_dia: true },
    { fecha: '2024-12-25', descripcion: 'Navidad', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2024-12-31', descripcion: 'Nochevieja', ambito: 'CONVENIO', medio_dia: true }
  ],
  2025: [
    { fecha: '2025-01-01', descripcion: 'Año Nuevo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-01-06', descripcion: 'Reyes', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-04-18', descripcion: 'Viernes Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-05-01', descripcion: 'Día del Trabajo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-06-09', descripcion: 'La Rioja', ambito: 'AUTONOMICO', medio_dia: false },
    { fecha: '2025-06-23', descripcion: 'San Juan del Monte (Miranda)', ambito: 'LOCAL', medio_dia: true },
    { fecha: '2025-08-15', descripcion: 'Asunción', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-10-12', descripcion: 'Fiesta Nacional', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-11-01', descripcion: 'Todos los Santos', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-12-06', descripcion: 'Constitución', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-12-08', descripcion: 'Inmaculada', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-12-24', descripcion: 'Nochebuena', ambito: 'CONVENIO', medio_dia: true },
    { fecha: '2025-12-25', descripcion: 'Navidad', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2025-12-31', descripcion: 'Nochevieja', ambito: 'CONVENIO', medio_dia: true }
  ],
  2026: [
    { fecha: '2026-01-01', descripcion: 'Año Nuevo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-01-06', descripcion: 'Reyes', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-04-02', descripcion: 'Jueves Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-04-03', descripcion: 'Viernes Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-04-04', descripcion: 'Sábado Santo', ambito: 'LOCAL', medio_dia: false },
    { fecha: '2026-04-23', descripcion: 'San Jorge / La Rioja', ambito: 'AUTONOMICO', medio_dia: false },
    { fecha: '2026-05-01', descripcion: 'Día del Trabajo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-05-25', descripcion: 'Lunes Pascua', ambito: 'LOCAL', medio_dia: false },
    { fecha: '2026-05-26', descripcion: 'Martes Pascua (medio día)', ambito: 'LOCAL', medio_dia: true },
    { fecha: '2026-08-15', descripcion: 'Asunción', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-09-12', descripcion: 'Sábado festivo local', ambito: 'LOCAL', medio_dia: false },
    { fecha: '2026-10-12', descripcion: 'Fiesta Nacional', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-11-01', descripcion: 'Todos los Santos', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-12-07', descripcion: 'Constitución', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-12-08', descripcion: 'Inmaculada', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-12-24', descripcion: 'Nochebuena (medio día)', ambito: 'CONVENIO', medio_dia: true },
    { fecha: '2026-12-25', descripcion: 'Navidad', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2026-12-31', descripcion: 'Nochevieja (medio día)', ambito: 'CONVENIO', medio_dia: true }
  ],
  2027: [
    { fecha: '2027-01-01', descripcion: 'Año Nuevo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-01-06', descripcion: 'Reyes', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-03-25', descripcion: 'Jueves Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-03-26', descripcion: 'Viernes Santo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-04-23', descripcion: 'San Jorge / La Rioja', ambito: 'AUTONOMICO', medio_dia: false },
    { fecha: '2027-05-01', descripcion: 'Día del Trabajo', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-08-15', descripcion: 'Asunción', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-10-12', descripcion: 'Fiesta Nacional', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-11-01', descripcion: 'Todos los Santos', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-12-06', descripcion: 'Constitución', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-12-08', descripcion: 'Inmaculada', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-12-24', descripcion: 'Nochebuena (medio día)', ambito: 'CONVENIO', medio_dia: true },
    { fecha: '2027-12-25', descripcion: 'Navidad', ambito: 'NACIONAL', medio_dia: false },
    { fecha: '2027-12-31', descripcion: 'Nochevieja (medio día)', ambito: 'CONVENIO', medio_dia: true }
  ]
};