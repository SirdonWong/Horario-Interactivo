import { TimeRange, ActivitySchedule, DayOfWeek, Activity } from '../types';

/**
 * Normaliza y limpia una cadena de texto que contiene horarios.
 * Reemplaza espacios especiales (\u00A0), guiones especiales (–, —) y conectores ("a").
 */
export function normalizeTimeString(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000]/g, ' ') // Espacios especiales a espacio común
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')         // Guiones especiales a '-'
    .replace(/\s+/g, ' ')                                                  // Colapsa espacios
    .trim();
}

/**
 * Parsea todos los rangos de tiempo encontrados en una cadena.
 * Soporta formatos:
 * - "16:00-18:00"
 * - "16:00- 18:00" (con espacio después del guión)
 * - "16:00 - 18:00"
 * - "16:00 a 18:00"
 * - "8:00-10:00"
 * - "16:00 - 18:00, 19:00 - 21:00" (múltiples rangos)
 */
export function parseAllTimeRanges(text: string): TimeRange[] {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeTimeString(text);
  if (!normalized) return [];

  const results: TimeRange[] = [];

  // 1. Intentar dividir por comas/barras por si hay múltiples rangos separados
  const tokens = normalized.split(/[,;/]+/);

  for (const token of tokens) {
    const range = parseSingleTimeRange(token.trim());
    if (range) {
      results.push(range);
    }
  }

  // Fallback: Si no produjo resultados con split, probamos regex directa en toda la cadena
  if (results.length === 0) {
    const rangeRegex = /([0-2]?[0-9])(?::([0-5][0-9]))?\s*(?:am|pm)?\s*(?:-|a|A)\s*([0-2]?[0-9])(?::([0-5][0-9]))?\s*(?:am|pm)?/gi;
    let match: RegExpExecArray | null;
    while ((match = rangeRegex.exec(normalized)) !== null) {
      let startHour = parseInt(match[1], 10);
      const startMin = match[2] ? parseInt(match[2], 10) : 0;
      let endHour = parseInt(match[3], 10);
      const endMin = match[4] ? parseInt(match[4], 10) : 0;

      if (isNaN(startHour) || isNaN(endHour)) continue;
      if (startHour > 24 || endHour > 24 || startMin >= 60 || endMin >= 60) continue;

      if (endHour < startHour && endHour < 12 && startHour >= 7) {
        endHour += 12;
      }

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) continue;

      results.push({
        start: startMinutes,
        end: endMinutes,
        originalText: match[0].trim()
      });
    }
  }

  return results;
}

function parseSingleTimeRange(token: string): TimeRange | null {
  if (!token) return null;

  // Busca el separador "-" o "a"
  const parts = token.split(/\s*[-aA]\s*/);
  if (parts.length !== 2) return null;

  const start = parseTimeToken(parts[0]);
  const end = parseTimeToken(parts[1]);

  if (start === null || end === null) return null;

  let finalStart = start;
  let finalEnd = end;

  // Manejo de formato 12 horas si falta am/pm (ej: 8:00 a 2:00 -> 8:00 a 14:00)
  if (finalEnd < finalStart && finalEnd < 12 * 60) {
    finalEnd += 12 * 60;
  }

  if (finalStart >= finalEnd) return null;

  return {
    start: finalStart,
    end: finalEnd,
    originalText: token
  };
}

function parseTimeToken(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  
  const isPm = /pm/i.test(clean);
  const isAm = /am/i.test(clean);
  
  const digitsOnly = clean.replace(/[^\d:]/g, '');
  if (!digitsOnly) return null;

  const parts = digitsOnly.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours > 24 || minutes >= 60) return null;

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function parseTimeRange(text: string): TimeRange | null {
  const ranges = parseAllTimeRanges(text);
  return ranges.length > 0 ? ranges[0] : null;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Checks if two time ranges overlap
export function checkOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function hasConflict(scheduleA: ActivitySchedule[], scheduleB: ActivitySchedule[]): boolean {
  for (const sA of scheduleA) {
    for (const sB of scheduleB) {
      if (sA.day === sB.day && checkOverlap(sA.timeRange, sB.timeRange)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Formatea los horarios semanales acumulados de una materia.
 * Si la materia tiene > 1 sesión a la semana, devuelve un texto como:
 * - "Martes y Jueves 12:00-14:00"
 * - "Lunes, Miércoles y Viernes 08:00-10:00"
 * - "Martes 12:00-14:00, Jueves 14:00-16:00" (si tienen horarios distintos)
 * Si tiene 1 sola sesión o ninguna, devuelve "".
 */
export function formatWeeklySchedules(schedules: ActivitySchedule[]): string {
  if (!schedules || schedules.length === 0) return '';

  const groupsByTime = new Map<string, DayOfWeek[]>();

  for (const s of schedules) {
    const timeStr = `${formatTime(s.timeRange.start)}-${formatTime(s.timeRange.end)}`;
    if (!groupsByTime.has(timeStr)) {
      groupsByTime.set(timeStr, []);
    }
    const daysList = groupsByTime.get(timeStr)!;
    if (!daysList.includes(s.day)) {
      daysList.push(s.day);
    }
  }

  const parts: string[] = [];

  for (const [timeStr, days] of groupsByTime.entries()) {
    let daysStr = '';
    if (days.length === 1) {
      daysStr = days[0];
    } else if (days.length === 2) {
      daysStr = `${days[0]} y ${days[1]}`;
    } else {
      const last = days[days.length - 1];
      const rest = days.slice(0, days.length - 1).join(', ');
      daysStr = `${rest} y ${last}`;
    }
    parts.push(`${daysStr} ${timeStr}`);
  }

  return parts.join(', ');
}

/**
 * Determina si una actividad está exenta de conflictos de horario cuando la
 * sesión que choca contra ella es asíncrona. Están exentas las Actividades
 * Personalizadas (id con prefijo "manual:") y las materias con modalidad
 * "Libre" (comparación insensible a mayúsculas/minúsculas).
 */
export function isConflictExemptActivity(activity: Activity): boolean {
  if (activity.id.startsWith('manual:')) return true;
  return activity.modalidad.trim().toLowerCase() === 'libre';
}

/**
 * Compara dos actividades completas (no arrays de horarios sueltos) y
 * determina si tienen un traslape real, considerando las excepciones de
 * sesiones asíncronas. Una sesión marcada isAsync exime el traslape
 * ÚNICAMENTE si la otra actividad involucrada es una Actividad Personalizada
 * o tiene modalidad "Libre" — no exime traslapes entre dos materias
 * normales de facultad aunque ambas estén marcadas como asíncronas.
 */
export function activitiesConflict(a: Activity, b: Activity): boolean {
  for (const sA of a.schedules) {
    for (const sB of b.schedules) {
      if (sA.day !== sB.day) continue;
      if (!checkOverlap(sA.timeRange, sB.timeRange)) continue;

      const exempt =
        (sA.isAsync === true && isConflictExemptActivity(b)) ||
        (sB.isAsync === true && isConflictExemptActivity(a));

      if (!exempt) return true;
    }
  }
  return false;
}
