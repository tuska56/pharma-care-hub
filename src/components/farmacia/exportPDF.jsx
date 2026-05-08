// Generador de PDF del informe anual de un empleado (abre ventana de impresión)
import { TIPOS_EVENTO, MESES } from './constants';
import logoSvg from '@/assets/logo.svg';

async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const LOGO_URL = logoSvg;

export async function exportarPDFEmpleado({ empleado, estadistica, anioActual, eventos, festivos, guardias, logoUrl }) {
  const stat = estadistica;
  const logoSource = logoUrl || LOGO_URL;
  const empEventos = eventos.filter(e => e.empleado_id === empleado.id);

  // Generar HTML del calendario anual (12 meses)
  const calHTML = generarCalendarioHTML(anioActual, empleado, eventos, festivos, guardias);

  const saldo = stat?.horas.saldo || 0;
  const saldoColor = saldo >= 0 ? '#16a34a' : '#dc2626';

  const eventosHTML = empEventos.length
    ? empEventos.map(ev => `
        <tr>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${TIPOS_EVENTO[ev.tipo_evento]?.label || ev.tipo_evento}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${ev.fecha_inicio}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${ev.fecha_fin}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${ev.horas ? ev.horas + 'h' : '-'}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${ev.observaciones || ev.comentario || '-'}</td>
        </tr>`).join('')
    : '<tr><td colspan="5" style="padding:8px;color:#999;text-align:center">Sin eventos registrados</td></tr>';

  const logoBase64 = await urlToBase64(logoSource);
  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" alt="Logo" style="height:56px;object-fit:contain;" />`
    : `<img src="${logoSource}" alt="Logo" style="height:56px;object-fit:contain;" />`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe ${empleado.nombre} — ${anioActual}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; background: white; }
    .page { max-width: 900px; margin: 0 auto; padding: 24px; }
    .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #99B9AF; padding-bottom: 16px; margin-bottom: 20px; }
    .header-text h1 { font-size: 20px; color: #1239AD; }
    .header-text p { font-size: 12px; color: #666; margin-top: 4px; }
    .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { border-top: 3px solid #1239AD; background: #f8faff; padding: 12px; border-radius: 8px; }
    .stat-card .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-card .value { font-size: 22px; font-weight: bold; margin-top: 4px; }
    .stat-card .sub { font-size: 10px; color: #aaa; margin-top: 2px; }
    h2 { font-size: 14px; color: #1239AD; margin: 20px 0 10px; border-left: 3px solid #99B9AF; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1239AD; color: white; padding: 6px 8px; text-align: left; font-size: 11px; }
    td { font-size: 11px; }
    .cal-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .cal-mes { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; }
    .cal-mes h4 { text-align:center; font-size:10px; font-weight:bold; color:#1239AD; margin-bottom:6px; }
    .cal-days { display: grid; grid-template-columns: repeat(7,1fr); gap:1px; }
    .cal-day-header { font-size:7px; text-align:center; font-weight:bold; color:#888; padding:1px 0; }
    .cal-day { font-size:8px; text-align:center; padding:2px 1px; border-radius:3px; min-height:16px; position:relative; font-weight:500; }
    .cal-day .letra { font-size:6px; display:block; font-weight:bold; color:#555; }
    .legend { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px; }
    .legend-item { display:flex; align-items:center; gap:5px; font-size:10px; color:#555; }
    .legend-dot { width:12px; height:12px; border-radius:3px; }
    .footer { margin-top: 24px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
    .no-print { display: flex; gap: 8px; margin-bottom: 16px; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="no-print">
      <button onclick="window.print()" style="background:#1239AD;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;">🖨️ Imprimir / Guardar PDF</button>
      <button onclick="window.close()" style="background:#f3f4f6;color:#444;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;">✕ Cerrar</button>
    </div>

    <div class="header">
      ${logoHTML}
      <div class="header-text">
        <h1>Informe Anual de Empleado</h1>
        <p><strong>${empleado.nombre}</strong> · Alta: ${empleado.fecha_alta} · Año ${anioActual}</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="label">Vacaciones</div>
        <div class="value" style="color:#1239AD">${stat?.vacaciones.disponibles ?? '-'}/${stat?.vacaciones.total ?? '-'}</div>
        <div class="sub">días disponibles</div>
      </div>
      <div class="stat-card" style="border-top-color:#99B9AF">
        <div class="label">Sábados Libres</div>
        <div class="value" style="color:#99B9AF">${stat?.sabados.usados ?? 0}/${stat?.sabados.porSaldo ?? 0}</div>
        <div class="sub">usados / teóricos</div>
      </div>
      <div class="stat-card" style="border-top-color:${saldoColor}">
        <div class="label">Saldo Horas</div>
        <div class="value" style="color:${saldoColor}">${saldo > 0 ? '+' : ''}${saldo}h</div>
        <div class="sub">Trabaj.: ${stat?.horas.horasRealesTrabajadas}h / Conv.: ${stat?.horas.horasTeoricas}h</div>
      </div>
    </div>

    <h2>Calendario Anual ${anioActual}</h2>
    ${calHTML}

    <h2>Eventos Registrados</h2>
    <table>
      <thead><tr><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Horas</th><th>Observaciones</th></tr></thead>
      <tbody>${eventosHTML}</tbody>
    </table>

    <div class="footer">
      Generado el ${new Date().toLocaleDateString('es-ES')} · Calendario Farmacia
    </div>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

function generarCalendarioHTML(anio, empleado, eventos, festivos, guardias) {
  const COLORES = {
    VACACIONES: '#DBEAFE',
    ASUNTOS_PROPIOS: '#EDE9FE',
    SABADO_LIBRE: '#CFFAFE',
    FALTA_HORAS: '#FEE2E2',
    HORAS_EXTRA: '#DCFCE7',
    FESTIVO_TRABAJADO: '#FFEDD5',
    festivo: '#FEF9C3',
    domingo: '#F3F4F6',
  };

  const mesesHTML = Array.from({ length: 12 }, (_, mesIdx) => {
    const primerDiaJS = new Date(anio, mesIdx, 1).getDay();
    // Lunes = 0 en nuestro sistema
    const primerDia = (primerDiaJS + 6) % 7;
    const diasMes = new Date(anio, mesIdx + 1, 0).getDate();

    const diasHTML = ['L','M','X','J','V','S','D'].map(d => `<div class="cal-day-header">${d}</div>`).join('');
    const vaciosHTML = Array(primerDia).fill('<div></div>').join('');

    const celdas = Array.from({ length: diasMes }, (_, dIdx) => {
      const dia = dIdx + 1;
      const fecha = `${anio}-${String(mesIdx + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const diaSemana = new Date(fecha + 'T12:00:00').getDay();

      const evento = eventos.find(e => e.empleado_id === empleado.id && fecha >= e.fecha_inicio && fecha <= e.fecha_fin);
      const festivoObj = festivos.find(f => f.fecha === fecha);
      const guardiaObj = guardias.find(g => g.empleado_id === empleado.id && g.fecha === fecha);

      let bg = diaSemana === 0 ? COLORES.domingo : 'transparent';
      let letra = '';

      if (evento) {
        bg = COLORES[evento.tipo_evento] || '#F3F4F6';
        const letras = { VACACIONES: 'V', ASUNTOS_PROPIOS: 'A', SABADO_LIBRE: 'SL', FALTA_HORAS: 'F', HORAS_EXTRA: '+', FESTIVO_TRABAJADO: 'FT' };
        letra = letras[evento.tipo_evento] || '';
      } else if (festivoObj) {
        bg = COLORES.festivo;
        letra = festivoObj.medio_dia ? 'F½' : 'F';
      }
      if (guardiaObj) letra = letra ? letra + ',G' : 'G';

      return `<div class="cal-day" style="background:${bg};">${dia}${letra ? `<span class="letra">${letra}</span>` : ''}</div>`;
    }).join('');

    return `<div class="cal-mes">
      <h4>${MESES[mesIdx]}</h4>
      <div class="cal-days">${diasHTML}${vaciosHTML}${celdas}</div>
    </div>`;
  }).join('');

  const legendaHTML = `
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#DBEAFE"></div> V - Vacaciones</div>
      <div class="legend-item"><div class="legend-dot" style="background:#EDE9FE"></div> A - Asuntos Propios</div>
      <div class="legend-item"><div class="legend-dot" style="background:#CFFAFE"></div> SL - Sábado Libre</div>
      <div class="legend-item"><div class="legend-dot" style="background:#FEE2E2"></div> F - Falta</div>
      <div class="legend-item"><div class="legend-dot" style="background:#DCFCE7"></div> + - Horas Extra</div>
      <div class="legend-item"><div class="legend-dot" style="background:#FEF9C3"></div> F - Festivo</div>
    </div>`;

  return `<div class="cal-grid">${mesesHTML}</div>${legendaHTML}`;
}