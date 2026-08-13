export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 to 21

export interface TimeRange {
  start: number; // minutes from midnight
  end: number;
  originalText: string;
}

export interface ActivitySchedule {
  day: DayOfWeek;
  timeRange: TimeRange;
  isAsync?: boolean; // true si esta sesión específica es asíncrona/trabajo en plataforma
}

export interface LoadedFile {
  id: string;
  name: string;
  count: number;
}

export interface Activity {
  id: string; // Asignatura + "-" + Grupo
  modalidad: string;
  asignatura: string;
  creditos: string;
  grupo: string;
  profesor: string;
  antecedentes: string;
  sala: string;
  horarioTexto: string;
  schedules: ActivitySchedule[];
  color: string;
  sourceFile?: string;
}
