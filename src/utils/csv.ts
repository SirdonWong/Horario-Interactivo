import Papa from 'papaparse';
import { Activity, ActivitySchedule, DayOfWeek } from '../types';
import { parseAllTimeRanges } from './time';
import { getColorForAsignatura } from './colors';
import { ColumnMapping } from './columnMapping';

// ---------------------------------------------------------------------------
// Header normalization — keeps backward compat with the "canonical" column
// names used before column-mapping was introduced.
// ---------------------------------------------------------------------------

function normalizeHeader(header: string): string {
  const h = header.trim().replace(/^\uFEFF/, '').toLowerCase();
  const map: Record<string, string> = {
    'modalidad': 'Modalidad',
    'asignatura': 'Asignatura',
    'créditos': 'Créditos',
    'creditos': 'Créditos',
    'grupo': 'Grupo',
    'profesor': 'Profesor',
    'antecedentes': 'Antecedentes',
    'sala': 'Sala',
    'horario': 'Horario',
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miércoles': 'Miércoles',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sábado': 'Sábado',
    'sabado': 'Sábado',
    'domingo': 'Domingo',
  };
  return map[h] || header.trim().replace(/^\uFEFF/, '');
}

// ---------------------------------------------------------------------------
// Preview: read only headers + a few sample rows for the mapping dialog.
// ---------------------------------------------------------------------------

export interface CSVPreview {
  headers: string[];   // raw headers, as they appear in the file (BOM stripped)
  sampleRows: string[][];
}

export function previewCSV(file: File): Promise<CSVPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: 'greedy',
      preview: 4, // header row + 3 data rows
      complete: (results) => {
        const allRows = results.data as string[][];
        if (allRows.length === 0) {
          reject(new Error('El archivo CSV está vacío.'));
          return;
        }
        // Strip BOM from the very first cell
        const headers = allRows[0].map((h) => h.trim().replace(/^\uFEFF/, ''));
        const sampleRows = allRows.slice(1);
        resolve({ headers, sampleRows });
      },
      error: (error) => reject(error),
    });
  });
}

// ---------------------------------------------------------------------------
// Full parse — now accepts an optional ColumnMapping so that column look-ups
// go through the mapping instead of hardcoded names.
// ---------------------------------------------------------------------------

export function parseCSVData(file: File, mapping?: ColumnMapping): Promise<Activity[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      // Use normalizeHeader (legacy) if no mapping, otherwise just trim and strip BOM
      // so the keys match exactly what previewCSV generated.
      transformHeader: mapping ? (h) => h.trim().replace(/^\uFEFF/, '') : normalizeHeader,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];

          if (headers.length > 0 && headers.length < 5) {
            const h = headers[0] || '';
            if (h.includes(';') || h.includes('\t')) {
              throw new Error('El archivo CSV parece usar un delimitador no reconocido o un formato incorrecto. Por favor, asegúrate de que esté separado por comas y tenga las columnas correctas.');
            }
          }

          // When using legacy path (no mapping), validate required columns.
          if (!mapping) {
            const REQUIRED_COLUMNS = [
              'Modalidad', 'Asignatura', 'Créditos', 'Grupo', 'Profesor',
              'Antecedentes', 'Sala', 'Horario', 'Lunes', 'Martes',
              'Miércoles', 'Jueves', 'Viernes', 'Sábado'
            ];
            const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
              throw new Error(`El archivo CSV no tiene el formato correcto. Faltan las columnas: ${missingColumns.join(', ')}`);
            }
          }

          // Detect headers-only CSV (no data rows after the header).
          const dataRows = results.data as any[];
          if (dataRows.length === 0) {
            throw new Error(
              `El archivo "${file.name}" no contiene filas de datos, solo encabezados. ` +
              'Por favor, verifica que el archivo tenga al menos una fila de oferta académica.'
            );
          }

          const activities = processCSVRows(dataRows, file.name, mapping);
          resolve(activities);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => reject(error),
    });
  });
}

// ---------------------------------------------------------------------------
// Row → Activity conversion
// ---------------------------------------------------------------------------

// Helper to read a field from a row using either the mapping or the legacy
// hardcoded column name. Returns '' when the column is unmapped or missing.
function field(row: any, mapping: ColumnMapping | undefined, campoKey: string, legacyName: string): string {
  const col = mapping ? mapping[campoKey] : legacyName;
  if (!col) return '';
  return (row[col] || '').trim();
}

export function processCSVRows(rows: any[], sourceFileName?: string, mapping?: ColumnMapping): Activity[] {
  const activities: Activity[] = [];
  const asignaturaColors = new Map<string, string>();
  let colorIndex = 0;

  const creditosPorAsignatura = new Map<string, string>();
  for (const row of rows) {
    const asig = field(row, mapping, 'asignatura', 'Asignatura');
    const creds = field(row, mapping, 'creditos', 'Créditos');
    if (asig && creds) {
      if (!creditosPorAsignatura.has(asig)) {
        creditosPorAsignatura.set(asig, creds);
      } else {
        const existing = creditosPorAsignatura.get(asig);
        if (existing !== creds) {
          console.warn(`[csv] Inconsistencia en créditos para "${asig}" en "${sourceFileName}": se vio "${existing}" y luego "${creds}". Se conserva el primero.`);
        }
      }
    }
  }

  // Map from canonical day key → DayOfWeek display name + legacy column name
  const dayEntries: { key: string; legacy: string; dayOfWeek: DayOfWeek }[] = [
    { key: 'lunes', legacy: 'Lunes', dayOfWeek: 'Lunes' },
    { key: 'martes', legacy: 'Martes', dayOfWeek: 'Martes' },
    { key: 'miercoles', legacy: 'Miércoles', dayOfWeek: 'Miércoles' },
    { key: 'jueves', legacy: 'Jueves', dayOfWeek: 'Jueves' },
    { key: 'viernes', legacy: 'Viernes', dayOfWeek: 'Viernes' },
    { key: 'sabado', legacy: 'Sábado', dayOfWeek: 'Sábado' },
    { key: 'domingo', legacy: 'Domingo', dayOfWeek: 'Domingo' },
  ];

  for (const row of rows) {
    const asignatura = field(row, mapping, 'asignatura', 'Asignatura');
    const grupo = field(row, mapping, 'grupo', 'Grupo');

    if (!asignatura || !grupo) {
      console.warn(
        `[csv] Fila omitida en "${sourceFileName}": Asignatura o Grupo vacío.`,
        { asignatura: asignatura || '(vacío)', grupo: grupo || '(vacío)' }
      );
      continue;
    }

    const id = `${asignatura}-${grupo}`;

    // Check if we already have it (same id from same or different file).
    if (activities.some(a => a.id === id)) {
      console.warn(
        `[csv] Fila omitida en "${sourceFileName}": id duplicado "${id}". ` +
        'Se conserva la primera ocurrencia.'
      );
      continue;
    }

    let color = asignaturaColors.get(asignatura);
    if (!color) {
      color = getColorForAsignatura(asignatura, colorIndex++);
      asignaturaColors.set(asignatura, color);
    }

    let creditos = field(row, mapping, 'creditos', 'Créditos');
    if (!creditos) {
      creditos = creditosPorAsignatura.get(asignatura) || '';
      if (creditos) {
        console.warn(`[csv] Créditos inferidos para "${asignatura}" Grupo ${grupo} desde otra fila del mismo archivo.`);
      }
    }

    const schedules: ActivitySchedule[] = [];

    for (const entry of dayEntries) {
      const timeStr = field(row, mapping, entry.key, entry.legacy);
      if (timeStr) {
        const timeRanges = parseAllTimeRanges(timeStr);
        if (timeRanges.length === 0) {
          console.warn(
            `[csv] Sesión omitida en "${sourceFileName}" (${asignatura}, Grupo ${grupo}): ` +
            `horario inválido en columna ${entry.dayOfWeek}: "${timeStr}"`
          );
        }
        for (const timeRange of timeRanges) {
          schedules.push({ day: entry.dayOfWeek, timeRange });
        }
      }
    }

    activities.push({
      id,
      modalidad: field(row, mapping, 'modalidad', 'Modalidad'),
      asignatura,
      creditos,
      grupo,
      profesor: field(row, mapping, 'profesor', 'Profesor'),
      antecedentes: field(row, mapping, 'antecedentes', 'Antecedentes'),
      sala: field(row, mapping, 'sala', 'Sala'),
      horarioTexto: field(row, mapping, 'horario', 'Horario'),
      schedules,
      color,
      sourceFile: sourceFileName,
    });
  }

  return activities;
}
