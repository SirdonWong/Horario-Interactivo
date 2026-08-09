import { Activity } from '../types';
import { normalize } from './curriculum';

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
  const key = normalize(activity.asignatura);
  if (overrides[key]) {
    return overrides[key];
  }
  return useColorfulMode ? activity.color : undefined;
}

export function normalizeColorOverrideKey(asignatura: string): string {
  return normalize(asignatura);
}

