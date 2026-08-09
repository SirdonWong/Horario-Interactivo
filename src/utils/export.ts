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
export async function exportToExcel(activities: Activity[], filename = 'horario_academico.xlsx'): Promise<void> {
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
