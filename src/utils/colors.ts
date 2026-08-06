import { Activity } from '../types';

export const ASSIGNMENT_COLORS = [
  'indigo',
  'emerald',
  'blue',
  'amber',
  'rose',
  'fuchsia',
  'teal',
  'cyan',
  'violet',
  'orange',
  'sky',
  'lime',
  'pink',
  'purple'
];

export function getColorForAsignatura(asignatura: string, index: number): string {
  return ASSIGNMENT_COLORS[index % ASSIGNMENT_COLORS.length];
}

export function getEffectiveColorId(
  activity: Activity, 
  overrides: Record<string, string>,
  useColorfulMode: boolean = false
): string | undefined {
  if (overrides[activity.asignatura]) {
    return overrides[activity.asignatura];
  }
  return useColorfulMode ? activity.color : undefined;
}
