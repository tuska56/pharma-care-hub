// Fetch de festivos anuales desde nager.date API
// Soporta provincias españolas con festivos locales

const PROVINCIAS_ESPAÑA = {
  'Álava': { code: 'ES', region: 'Álava' },
  'Albacete': { code: 'ES', region: 'Albacete' },
  'Alicante': { code: 'ES', region: 'Alicante' },
  'Almería': { code: 'ES', region: 'Almería' },
  'Asturias': { code: 'ES', region: 'Asturias' },
  'Ávila': { code: 'ES', region: 'Ávila' },
  'Badajoz': { code: 'ES', region: 'Badajoz' },
  'Barcelona': { code: 'ES', region: 'Barcelona' },
  'Burgos': { code: 'ES', region: 'Burgos' },
  'Cáceres': { code: 'ES', region: 'Cáceres' },
  'Cádiz': { code: 'ES', region: 'Cádiz' },
  'Cantabria': { code: 'ES', region: 'Cantabria' },
  'Castellón': { code: 'ES', region: 'Castellón' },
  'Ciudad Real': { code: 'ES', region: 'Ciudad Real' },
  'Córdoba': { code: 'ES', region: 'Córdoba' },
  'Cuenca': { code: 'ES', region: 'Cuenca' },
  'Girona': { code: 'ES', region: 'Girona' },
  'Granada': { code: 'ES', region: 'Granada' },
  'Guadalajara': { code: 'ES', region: 'Guadalajara' },
  'Guipúzcoa': { code: 'ES', region: 'Guipúzcoa' },
  'Huelva': { code: 'ES', region: 'Huelva' },
  'Huesca': { code: 'ES', region: 'Huesca' },
  'Jaén': { code: 'ES', region: 'Jaén' },
  'La Coruña': { code: 'ES', region: 'La Coruña' },
  'La Rioja': { code: 'ES', region: 'La Rioja' },
  'Las Palmas': { code: 'ES', region: 'Las Palmas' },
  'León': { code: 'ES', region: 'León' },
  'Lleida': { code: 'ES', region: 'Lleida' },
  'Lugo': { code: 'ES', region: 'Lugo' },
  'Madrid': { code: 'ES', region: 'Madrid' },
  'Málaga': { code: 'ES', region: 'Málaga' },
  'Murcia': { code: 'ES', region: 'Murcia' },
  'Navarra': { code: 'ES', region: 'Navarra' },
  'Orense': { code: 'ES', region: 'Orense' },
  'Palencia': { code: 'ES', region: 'Palencia' },
  'Palma de Mallorca': { code: 'ES', region: 'Islas Baleares' },
  'Pamplona': { code: 'ES', region: 'Navarra' },
  'Pontevedra': { code: 'ES', region: 'Pontevedra' },
  'Salamanca': { code: 'ES', region: 'Salamanca' },
  'Santa Cruz de Tenerife': { code: 'ES', region: 'Tenerife' },
  'Segovia': { code: 'ES', region: 'Segovia' },
  'Sevilla': { code: 'ES', region: 'Sevilla' },
  'Soria': { code: 'ES', region: 'Soria' },
  'Tarragona': { code: 'ES', region: 'Tarragona' },
  'Teruel': { code: 'ES', region: 'Teruel' },
  'Toledo': { code: 'ES', region: 'Toledo' },
  'Valencia': { code: 'ES', region: 'Valencia' },
  'Valladolid': { code: 'ES', region: 'Valladolid' },
  'Vizcaya': { code: 'ES', region: 'Vizcaya' },
  'Zamora': { code: 'ES', region: 'Zamora' },
  'Zaragoza': { code: 'ES', region: 'Zaragoza' }
};

// Festivos locales específicos por provincia/localidad
const FESTIVOS_LOCALES = {
  'Miranda de Ebro': [
    { fecha: '-04-23', nombre: 'San Jorge', provincia: 'Burgos' }
  ],
  'San Juan del Monte': [
    { fecha: '-06-24', nombre: 'San Juan del Monte', provincia: 'Burgos' }
  ],
  'Burgos': [
    { fecha: '-10-18', nombre: 'Día de Burgos', provincia: 'Burgos' }
  ]
};

// Traducciones completas de nombres de festivos al castellano
const TRADUCCIONES = {
  'New Year\'s Day': 'Año Nuevo',
  'Epiphany': 'Día de Reyes',
  'Good Friday': 'Viernes Santo',
  'Easter Sunday': 'Domingo de Pascua',
  'Easter Monday': 'Lunes de Pascua',
  'Labour Day': 'Día del Trabajo',
  'Assumption of Mary': 'Asunción de María',
  'National Day': 'Día de la Hispanidad',
  'All Saints\' Day': 'Día de Todos los Santos',
  'Christmas Day': 'Navidad',
  'Holy Innocents Day': 'Día de Inocentes',
  'Constitution Day': 'Día de la Constitución',
  'Day off for National Holiday': 'Fiesta Nacional',
  'Saint John\'s Day': 'San Juan',
  'Saint Joseph\'s Day': 'San José',
  'Corpus Christi': 'Corpus Christi'
};

const traducir = (nombre) => TRADUCCIONES[nombre] || nombre;

export const obtenerFestivosEspana = async (anio, provincia = 'Burgos', localidad = 'Miranda de Ebro') => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${anio}/ES`);
    if (!response.ok) throw new Error('Error fetching festivos');
    
    const festivos = await response.json();
    
    // Mapear al formato de la app con nombres en castellano
    const festivosApp = festivos.map(f => ({
      id: `pre_${anio}_${f.date}`,
      fecha: f.date,
      descripcion: traducir(f.localName || f.name),
      ambito: 'NACIONAL',
      medio_dia: false
    }));
    
    // Agregar festivos locales de la provincia/localidad
    const festivosLocales = (FESTIVOS_LOCALES[localidad] || FESTIVOS_LOCALES[provincia] || [])
      .map(f => ({
        id: `pre_${anio}_local_${f.fecha}`,
        fecha: `${anio}${f.fecha}`,
        descripcion: f.nombre,
        ambito: 'LOCAL',
        medio_dia: false
      }));
    
    return [...festivosApp, ...festivosLocales].sort((a, b) => a.fecha.localeCompare(b.fecha));
  } catch (error) {
    console.error('Error al descargar festivos:', error);
    return [];
  }
};

// Función para comparar festivos y evitar duplicados
export const compararFestivos = (f1, f2) => {
  return f1.fecha === f2.fecha && f1.descripcion.toLowerCase() === f2.descripcion.toLowerCase();
};

// Fusionar festivos descargados con los existentes, evitando duplicados
export const fusionarFestivos = (festivosExistentes, festivosNuevos) => {
  const existentes = festivosExistentes.filter(f => {
    // Mantener solo los que fueron agregados manualmente (no predefinidos)
    return typeof f.id === 'string' && !f.id.startsWith('pre_');
  });
  
  const nuevosFiltrados = festivosNuevos.filter(nuevo => {
    // Filtrar duplicados con existentes
    return !existentes.some(ex => compararFestivos(ex, nuevo));
  });
  
  return [...existentes, ...nuevosFiltrados].sort((a, b) => a.fecha.localeCompare(b.fecha));
};

export { PROVINCIAS_ESPAÑA };

