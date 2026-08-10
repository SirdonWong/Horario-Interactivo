import { Activity } from '../types';
import { formatTime } from './time';

const DAYS_ORDER: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 7,
};

const DAYS_ORDER_ARRAY = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const EXCEL_COLORS: Record<string, string> = {
  indigo: "FFE0E7FF",
  emerald: "FFD1FAE5",
  blue: "FFDBEAFE",
  amber: "FFFEF3C7",
  rose: "FFFFE4E6",
  fuchsia: "FFFAE8FF",
  teal: "FFCCFBF1",
  cyan: "FFCFFAFE",
  violet: "FFEDE9FE",
  orange: "FFFFEDD5",
  sky: "FFE0F2FE",
  lime: "FFECFCCB",
  pink: "FFFCE7F3",
  purple: "FFF3E8FF",
  default: "FFF3F4F6", // gray-100
};

/**
 * Convierte la lista de actividades seleccionadas en un arreglo de objetos planos
 * para el resumen por materia.
 */
export function getMateriasExportData(activities: Activity[]) {
  return activities.map((act) => ({
    'Asignatura': act.asignatura || '',
    'Grupo': act.grupo || '',
    'Profesor': act.profesor || 'Por asignar',
    'Créditos': act.creditos || '-',
    'Modalidad': act.modalidad || '-',
    'Sala': act.sala || '-',
    'Horario Semanal': act.horarioTexto || '-',
  }));
}

/**
 * Convierte la lista de actividades seleccionadas en un arreglo de objetos planos
 * desglosados por cada sesión/bloque horario en la semana.
 */
export function getAgendaExportData(activities: Activity[]) {
  const rows: Array<{
    'Día': string;
    'Hora Inicio': string;
    'Hora Fin': string;
    'Asignatura': string;
    'Grupo': string;
    'Profesor': string;
    'Modalidad': string;
    'Sala': string;
    _dayOrder: number;
    _startMin: number;
  }> = [];

  for (const act of activities) {
    if (act.schedules && act.schedules.length > 0) {
      for (const sch of act.schedules) {
        rows.push({
          'Día': sch.day,
          'Hora Inicio': formatTime(sch.timeRange.start),
          'Hora Fin': formatTime(sch.timeRange.end),
          'Asignatura': act.asignatura || '',
          'Grupo': act.grupo || '',
          'Profesor': act.profesor || 'Por asignar',
          'Modalidad': act.modalidad || '-',
          'Sala': act.sala || '-',
          _dayOrder: DAYS_ORDER[sch.day] || 99,
          _startMin: sch.timeRange.start,
        });
      }
    } else {
      // Fallback si la materia no tiene schedules parseados
      rows.push({
        'Día': 'Sin horario asignado',
        'Hora Inicio': '-',
        'Hora Fin': '-',
        'Asignatura': act.asignatura || '',
        'Grupo': act.grupo || '',
        'Profesor': act.profesor || 'Por asignar',
        'Modalidad': act.modalidad || '-',
        'Sala': act.sala || '-',
        _dayOrder: 999,
        _startMin: 0,
      });
    }
  }

  // Ordenar por día de la semana y luego por hora de inicio
  rows.sort((a, b) => {
    if (a._dayOrder !== b._dayOrder) {
      return a._dayOrder - b._dayOrder;
    }
    return a._startMin - b._startMin;
  });

  // Eliminar propiedades auxiliares de ordenamiento
  return rows.map(({ _dayOrder, _startMin, ...cleanRow }) => cleanRow);
}

/**
 * Genera la matriz visual del calendario para Excel.
 */
function generateMatrixSheet(activities: Activity[], XLSX: any) {
  const startHour = 7;
  const endHour = 22;
  const intervalMins = 30;
  
  const totalRows = ((endHour - startHour) * 60) / intervalMins;
  
  const aoa: any[][] = [];
  
  // Fila 0: Encabezados
  const headers = ['Hora', ...DAYS_ORDER_ARRAY];
  aoa.push(headers);
  
  // Generar filas de tiempo (e.g. 07:00, 07:30, ...)
  for (let i = 0; i < totalRows; i++) {
    const totalMins = startHour * 60 + i * intervalMins;
    const hour = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    const row = new Array(8).fill('');
    row[0] = timeStr;
    aoa.push(row);
  }
  
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  if (!ws['!merges']) ws['!merges'] = [];
  
  // Aplicar estilos base
  for (let c = 0; c < 8; c++) {
    const cellRef = XLSX.utils.encode_cell({ c, r: 0 }); // Encabezados
    if (ws[cellRef]) {
      ws[cellRef].s = {
        fill: { fgColor: { rgb: "FF2DD4BF" } }, // Aguamarina (Teal 400)
        font: { bold: true, color: { rgb: "FF0F172A" } }, // Texto oscuro
        alignment: { vertical: "center", horizontal: "center" }
      };
    }
  }
  
  for (let r = 1; r <= totalRows; r++) {
    const cellRef = XLSX.utils.encode_cell({ c: 0, r }); // Columna de horas
    if (ws[cellRef]) {
      ws[cellRef].s = {
        fill: { fgColor: { rgb: "FFF1F5F9" } }, // slate-100
        font: { bold: true, color: { rgb: "FF334155" } }, // slate-700
        alignment: { vertical: "top", horizontal: "center" }
      };
    }
    
    // Borde sutil para las celdas de la grilla
    for (let c = 1; c < 8; c++) {
      const cellRefData = XLSX.utils.encode_cell({ c, r });
      if (!ws[cellRefData]) {
         ws[cellRefData] = { v: '', t: 's' };
      }
      ws[cellRefData].s = {
        border: {
          top: { style: "hair", color: { rgb: "FFE2E8F0" } }, // slate-200
          bottom: { style: "hair", color: { rgb: "FFE2E8F0" } },
          left: { style: "hair", color: { rgb: "FFE2E8F0" } },
          right: { style: "hair", color: { rgb: "FFE2E8F0" } }
        }
      };
    }
  }

  // Llenar datos de actividades
  activities.forEach(act => {
    if (!act.schedules) return;
    
    const colorKey = act.color || 'default';
    const excelColor = EXCEL_COLORS[colorKey] || EXCEL_COLORS.default;
    
    act.schedules.forEach(sch => {
      const colIndex = DAYS_ORDER_ARRAY.indexOf(sch.day) + 1; // +1 porque la col 0 es 'Hora'
      if (colIndex === 0) return; // Día no válido
      
      const startMins = sch.timeRange.start;
      const endMins = sch.timeRange.end;
      
      // Filtrar horarios fuera del rango (7 a 22)
      if (startMins < startHour * 60 || endMins > endHour * 60) return;
      
      const startRow = Math.floor((startMins - (startHour * 60)) / intervalMins) + 1;
      const endRow = Math.ceil((endMins - (startHour * 60)) / intervalMins); // Inclusivo
      
      if (startRow > endRow) return;
      
      // Merge
      ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      
      const text = `${act.asignatura}\n${act.grupo || ''}\n${act.sala || ''}`.trim();
      const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: startRow });
      
      ws[cellRef] = { v: text, t: 's' };
      
      // Aplicar estilos al bloque fusionado
      for (let r = startRow; r <= endRow; r++) {
        const ref = XLSX.utils.encode_cell({ c: colIndex, r });
        if (!ws[ref]) ws[ref] = { v: '', t: 's' };
        
        ws[ref].s = {
          fill: { fgColor: { rgb: excelColor } },
          alignment: { vertical: "center", horizontal: "center", wrapText: true },
          font: { color: { rgb: "FF1E293B" }, bold: true }, // slate-800
          border: {
             top: { style: "thin", color: { rgb: "FF94A3B8" } }, // slate-400
             bottom: { style: "thin", color: { rgb: "FF94A3B8" } },
             left: { style: "thin", color: { rgb: "FF94A3B8" } },
             right: { style: "thin", color: { rgb: "FF94A3B8" } }
          }
        };
      }
    });
  });
  
  ws['!cols'] = [
    { wch: 10 }, // Hora
    { wch: 20 }, // Lunes
    { wch: 20 }, // Martes
    { wch: 20 }, // Miércoles
    { wch: 20 }, // Jueves
    { wch: 20 }, // Viernes
    { wch: 20 }, // Sábado
    { wch: 20 }, // Domingo
  ];
  
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 25 }; 
  for (let r = 1; r <= totalRows; r++) {
    ws['!rows'][r] = { hpt: 30 };
  }
  
  return ws;
}

/**
 * Exporta las actividades seleccionadas a un archivo Excel (.xlsx) con 2 pestañas.
 */
export async function exportToExcel(activities: Activity[], filename = 'horario_interactivo.xlsx'): Promise<void> {
  const importXLSX = await import('xlsx-js-style');
  const XLSX = importXLSX.default || importXLSX;

  const materiasData = getMateriasExportData(activities);
  const agendaData = getAgendaExportData(activities);

  const workbook = XLSX.utils.book_new();

  // Helper para inyectar estilos en una hoja
  const applyStyles = (ws: any) => {
    if (!ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_ref]) continue;

        if (R === 0) {
          // Encabezados (Fila 0)
          ws[cell_ref].s = {
            fill: { fgColor: { rgb: "FF2DD4BF" } }, // Aguamarina (Teal 400)
            font: { bold: true, color: { rgb: "FF0F172A" } }, // Texto oscuro
            alignment: { vertical: "center", horizontal: "center" }
          };
        } else {
          // Datos (Resto de las filas)
          ws[cell_ref].s = {
            alignment: { vertical: "top", wrapText: true }
          };
        }
      }
    }
  };

  // Hoja 1: Materias Inscritas
  const wsMaterias = XLSX.utils.json_to_sheet(materiasData);
  applyStyles(wsMaterias);
  // Ajuste de ancho de columnas
  wsMaterias['!cols'] = [
    { wch: 50 }, // Asignatura
    { wch: 10 }, // Grupo
    { wch: 30 }, // Profesor
    { wch: 10 }, // Créditos
    { wch: 15 }, // Modalidad
    { wch: 15 }, // Sala
    { wch: 50 }, // Horario Semanal
  ];
  XLSX.utils.book_append_sheet(workbook, wsMaterias, 'Materias Inscritas');

  // Hoja 2: Calendario Semanal (Matriz visual)
  const wsMatrix = generateMatrixSheet(activities, XLSX);
  XLSX.utils.book_append_sheet(workbook, wsMatrix, 'Calendario Semanal');

  // Hoja 3: Lista de Sesiones (Antes Agenda Semanal)
  const wsAgenda = XLSX.utils.json_to_sheet(agendaData);
  applyStyles(wsAgenda);
  wsAgenda['!cols'] = [
    { wch: 12 }, // Día
    { wch: 12 }, // Hora Inicio
    { wch: 12 }, // Hora Fin
    { wch: 50 }, // Asignatura
    { wch: 10 }, // Grupo
    { wch: 30 }, // Profesor
    { wch: 15 }, // Modalidad
    { wch: 15 }, // Sala
  ];
  XLSX.utils.book_append_sheet(workbook, wsAgenda, 'Lista de Sesiones');

  // Escribir y descargar archivo
  XLSX.writeFile(workbook, filename);
}

/**
 * Escapa valores para que no rompan el formato CSV (comas, comillas, saltos de línea)
 */
function escapeCSVValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  // Si contiene comas, comillas o saltos de línea, envolver en comillas y duplicar comillas internas
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Convierte un arreglo de objetos en una cadena de texto en formato CSV con BOM UTF-8.
 */
export function convertToCSVString(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');

  const bodyRows = data.map((row) =>
    headers.map((h) => escapeCSVValue(row[h])).join(',')
  );

  // Agregar BOM UTF-8 (\ufeff) para asegurar compatibilidad con Excel en Windows
  return '\ufeff' + [headerRow, ...bodyRows].join('\r\n');
}

/**
 * Exporta las actividades seleccionadas a un archivo CSV descargable.
 */
export function exportToCSV(
  activities: Activity[],
  type: 'materias' | 'agenda',
  filename?: string
): void {
  const data = type === 'materias' ? getMateriasExportData(activities) : getAgendaExportData(activities);
  const csvContent = convertToCSVString(data);

  const defaultFilename = type === 'materias' ? 'horario_materias.csv' : 'horario_agenda.csv';
  const finalFilename = filename || defaultFilename;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const DAY_TO_RRULE: Record<string, string> = {
  Lunes: 'MO',
  Martes: 'TU',
  Miércoles: 'WE',
  Miercoles: 'WE',
  Jueves: 'TH',
  Viernes: 'FR',
  Sábado: 'SA',
  Sabado: 'SA',
  Domingo: 'SU',
};

const DAY_INDEX: Record<string, number> = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Sabado: 6,
};

function getNextDateForWeekday(dayName: string): Date {
  const targetIndex = DAY_INDEX[dayName] ?? 1;
  const today = new Date();
  const todayIndex = today.getDay();
  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
}

function formatICSDateTime(date: Date, minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60);
  const mins = minutesFromMidnight % 60;
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = hours.toString().padStart(2, '0');
  const min = mins.toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}00`;
}

function getUTCDateTimeString(date: Date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const min = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function getUTF8ByteLength(str: string): number {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i++;
    } else bytes += 3;
  }
  return bytes;
}

function foldICSLine(line: string): string {
  const maxBytes = 75;
  if (getUTF8ByteLength(line) <= maxBytes) {
    return line;
  }

  let result = '';
  let currentBytes = 0;

  for (let i = 0; i < line.length; i++) {
    let char = line[i];
    const charCode = line.charCodeAt(i);
    let charBytes = 1;

    if (charCode <= 0x7f) charBytes = 1;
    else if (charCode <= 0x7ff) charBytes = 2;
    else if (charCode >= 0xd800 && charCode <= 0xdbff) {
      charBytes = 4;
      if (i + 1 < line.length) {
        char += line[i + 1];
        i++;
      }
    } else charBytes = 3;

    if (currentBytes + charBytes > maxBytes) {
      result += '\r\n ';
      currentBytes = 1;
    }
    result += char;
    currentBytes += charBytes;
  }

  return result;
}

function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

export function generateICSContent(activities: Activity[]): string {
  const dtstamp = getUTCDateTimeString(new Date());

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Horario Interactivo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  let eventIndex = 0;

  for (const act of activities) {
    if (!act.schedules || act.schedules.length === 0) continue;

    for (const sch of act.schedules) {
      const rruleDay = DAY_TO_RRULE[sch.day];
      if (!rruleDay) continue;

      eventIndex++;
      const eventDate = getNextDateForWeekday(sch.day);
      const dtstart = formatICSDateTime(eventDate, sch.timeRange.start);
      const dtend = formatICSDateTime(eventDate, sch.timeRange.end);

      const safeId = (act.id || 'act').replace(/[^a-zA-Z0-9-]/g, '-');
      const uid = `event-${safeId}-${sch.day}-${eventIndex}@horario-interactivo.local`;

      const description = [
        `Modalidad: ${act.modalidad || 'N.A.'}`,
        `Grupo: ${act.grupo || 'N.A.'}`,
        `Créditos: ${act.creditos || 'N.A.'}`,
        `Profesor: ${act.profesor || 'Sin asignar'}`,
        `Sala: ${act.sala || 'Por definir'}`,
      ].join(' | ');

      rawLines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`,
        `SUMMARY:${escapeICSText(act.asignatura || '')}`,
        `LOCATION:${escapeICSText(act.sala || '')}`,
        `DESCRIPTION:${escapeICSText(description)}`,
        'END:VEVENT'
      );
    }
  }

  rawLines.push('END:VCALENDAR');

  const foldedLines = rawLines.map(line => foldICSLine(line));
  return foldedLines.join('\r\n') + '\r\n';
}

export function exportToICS(activities: Activity[], filename = 'horario_interactivo.ics'): void {
  const icsContent = generateICSContent(activities);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Captura el calendario y la tabla de materias como imágenes y los combina
 * en un PDF landscape de dos páginas.
 * Usa carga dinámica (igual que exportToExcel) para no incrementar el bundle
 * inicial: jsPDF y html-to-image solo se descargan al llamar esta función.
 */
export async function exportToPDF(activities: Activity[], filename = 'horario_interactivo.pdf'): Promise<void> {
  // Carga dinámica de dependencias — no forman parte del bundle principal
  const [{ toPng }, { jsPDF }, autoTableModule] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const isDark = document.documentElement.classList.contains('dark');
  const bgColor = isDark ? '#111827' : '#ffffff';

  // ── Página 1: área del calendario ─────────────────────────────────────────
  const calendarEl = document.getElementById('calendar-export-area');
  if (!calendarEl) {
    throw new Error('No se encontró el elemento del calendario (#calendar-export-area).');
  }

  // Si la pantalla es estrecha, clonar en un contenedor de ancho fijo (mismo
  // patrón que la exportación PNG existente en App.tsx)
  const targetWidth = Math.max(1200, calendarEl.clientWidth);
  let exportNode: HTMLElement = calendarEl;
  let tempContainer: HTMLDivElement | null = null;

  if (calendarEl.clientWidth < 1200) {
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px';
    tempContainer.style.opacity = '0';
    tempContainer.style.pointerEvents = 'none';

    exportNode = calendarEl.cloneNode(true) as HTMLElement;
    exportNode.style.width = '1200px';
    exportNode.style.minWidth = '1200px';
    exportNode.style.height = 'max-content';

    tempContainer.appendChild(exportNode);
    document.body.appendChild(tempContainer);

    // Permitir que el navegador calcule el layout del clon
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  let calendarDataUrl = '';
  try {
    exportNode.classList.add('exporting-mode');
    calendarDataUrl = await toPng(exportNode, {
      backgroundColor: bgColor,
      cacheBust: true,
      pixelRatio: 2,
      width: targetWidth,
    });
  } finally {
    exportNode.classList.remove('exporting-mode');
  }

  if (tempContainer) {
    document.body.removeChild(tempContainer);
    tempContainer = null;
  }

  // ── Construir PDF con jsPDF ───────────────────────────────────────────────
  // Usamos un Image temporal para obtener las dimensiones reales de la captura
  const getImageDimensions = (dataUrl: string): Promise<{ w: number; h: number }> =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    });

  const calDims = await getImageDimensions(calendarDataUrl);

  // Página en landscape, unidades en puntos (pt), formato A4
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Dimensiones del área imprimible en A4 landscape (pt)
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Escalar la imagen del calendario para que quepa en la página manteniendo
  // la proporción
  const calRatio = Math.min(pageW / calDims.w, pageH / calDims.h);
  const calW = calDims.w * calRatio;
  const calH = calDims.h * calRatio;
  const calX = (pageW - calW) / 2;
  const calY = (pageH - calH) / 2;

  pdf.addImage(calendarDataUrl, 'PNG', calX, calY, calW, calH);

  // ── Página 2: tabla de materias inscritas (Vectorial) ────────────────────
  if (activities && activities.length > 0) {
    pdf.addPage();
    
    // Título de la tabla
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Resumen del Horario y Asignaturas Inscritas', 40, 40);

    // Línea separadora tenue bajo el título
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.setLineWidth(1);
    pdf.line(40, 48, pageW - 40, 48);

    // Subtítulo (Totales con diseño coincidente al modo impresión)
    const totalCreditos = activities.reduce((acc, curr) => {
      const num = parseInt(curr.creditos, 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    const totalCreditosStr = String(totalCreditos);
    const materiasStr = String(activities.length);

    let currentX = 40;
    const currentY = 66;

    pdf.setFontSize(11);

    // 1. Número de créditos (Negrita, slate-900)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(totalCreditosStr, currentX, currentY);
    currentX += pdf.getTextWidth(totalCreditosStr) + 4;

    // 2. Etiqueta "Créditos Totales" (Normal, slate-700)
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Créditos Totales', currentX, currentY);
    currentX += pdf.getTextWidth('Créditos Totales') + 20;

    // 3. Número de materias (Negrita, slate-900)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(materiasStr, currentX, currentY);
    currentX += pdf.getTextWidth(materiasStr) + 4;

    // 4. Etiqueta "Materias" (Normal, slate-700)
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Materias', currentX, currentY);

    // Preparar datos para la tabla
    const tableColumn = ["Asignatura", "Grupo", "Créditos", "Profesor", "Horario", "Sala"];
    const tableRows = activities.map(act => [
      act.asignatura,
      act.grupo,
      act.creditos || '-',
      act.profesor || '-',
      act.horarioTexto || '-',
      act.sala || '-'
    ]);

    // Generar la tabla con autoTable
    autoTable(pdf, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 }, // slate-900
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      styles: { fontSize: 9, cellPadding: 6 },
    });
  }

  pdf.save(filename);
}
