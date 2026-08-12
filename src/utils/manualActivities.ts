import { Activity, DayOfWeek, DAYS, ActivitySchedule } from '../types';
import { parseAllTimeRanges, formatTime, formatWeeklySchedules } from './time';
import { getColorForAsignatura } from './colors';
import { loadFromStorage, saveToStorage } from './storage';

export interface ManualActivityFormValues {
  asignatura: string;
  grupo: string;
  modalidad: string;
  profesor: string;
  creditos: string;
  sala: string;
  antecedentes: string;
  horarios: Partial<Record<DayOfWeek, string>>;
}

export interface BuildManualActivityResult {
  activity: Activity;
  invalidDays: DayOfWeek[];
}

export function createManualActivity(values: ManualActivityFormValues, colorIndex: number): BuildManualActivityResult {
  const invalidDays: DayOfWeek[] = [];
  const schedules: ActivitySchedule[] = [];
  
  for (const day of DAYS) {
    const text = values.horarios[day];
    if (text && text.trim() !== '') {
      const ranges = parseAllTimeRanges(text);
      if (ranges.length === 0) {
        invalidDays.push(day);
      } else {
        ranges.forEach(range => {
          schedules.push({ day, timeRange: range });
        });
      }
    }
  }

  const activity: Activity = {
    id: `manual:${crypto.randomUUID()}`,
    asignatura: values.asignatura,
    grupo: values.grupo,
    modalidad: values.modalidad,
    profesor: values.profesor,
    creditos: values.creditos,
    sala: values.sala,
    antecedentes: values.antecedentes,
    horarioTexto: formatWeeklySchedules(schedules),
    schedules,
    color: getColorForAsignatura(values.asignatura, colorIndex),
    sourceFile: undefined
  };

  return { activity, invalidDays };
}

export function updateManualActivity(existing: Activity, values: ManualActivityFormValues): BuildManualActivityResult {
  const { activity: newActivity, invalidDays } = createManualActivity(values, 0); // Color index doesn't matter here
  
  newActivity.id = existing.id;
  newActivity.color = existing.color;
  
  return { activity: newActivity, invalidDays };
}

const MANUAL_ACTIVITIES_KEY = 'manualActivities';

export function loadManualActivities(): Activity[] {
  return loadFromStorage<Activity[]>(MANUAL_ACTIVITIES_KEY, []);
}

export function saveManualActivities(activities: Activity[]): void {
  saveToStorage<Activity[]>(MANUAL_ACTIVITIES_KEY, activities);
}

export function activityToFormValues(activity: Activity): ManualActivityFormValues {
  const horarios: Partial<Record<DayOfWeek, string>> = {};
  for (const day of DAYS) {
    const sessionsForDay = activity.schedules.filter(s => s.day === day);
    if (sessionsForDay.length > 0) {
      horarios[day] = sessionsForDay
        .map(s => s.timeRange.originalText || `${formatTime(s.timeRange.start)}-${formatTime(s.timeRange.end)}`)
        .join(', ');
    }
  }
  return {
    asignatura: activity.asignatura,
    grupo: activity.grupo,
    modalidad: activity.modalidad,
    profesor: activity.profesor,
    creditos: activity.creditos,
    sala: activity.sala,
    antecedentes: activity.antecedentes,
    horarios,
  };
}
