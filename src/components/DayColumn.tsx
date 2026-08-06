import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Activity, DayOfWeek, HOURS, ActivitySchedule } from '../types';
import { checkOverlap, hasConflict, formatTime, formatWeeklySchedules } from '../utils/time';
import { ActivityCard } from './ActivityCard';
import { cn } from '../lib/utils';
import { getPendingPrerequisites, resolveMateriaId } from '../utils/curriculum';

interface DayColumnProps {
  key?: string;
  day: DayOfWeek;
  availableActivities: Activity[];
  selectedActivities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onRemoveActivity: (activityId: string) => void;
  materiasCompletadas: Set<string>;
  showAntecedentes?: boolean;
  isLast?: boolean;
  colorOverrides: Record<string, string>;
  onColorChange: (asignatura: string, colorId: string) => void;
  useColorfulMode: boolean;
  columnIndex?: number;
}

export function DayColumn({
  day,
  availableActivities,
  selectedActivities,
  onSelectActivity,
  onRemoveActivity,
  materiasCompletadas,
  showAntecedentes = true,
  isLast,
  colorOverrides,
  onColorChange,
  useColorfulMode,
  columnIndex = 3
}: DayColumnProps) {
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveHour(null);
      }
    }
    if (activeHour !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeHour]);

  // Find activities mapped to this day that are selected
  const activitiesForThisDay = selectedActivities.flatMap(act => {
    return act.schedules
      .filter(s => s.day === day)
      .map(schedule => ({ activity: act, schedule }));
  });

  const handleCellClick = (hour: number, e?: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    if (activeHour === hour) {
      setActiveHour(null);
    } else {
      setActiveHour(hour);
      if (e?.currentTarget) {
        // Scroll the column into view horizontally to ensure dropdown fits on mobile screens
        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const getDropdownPositionClass = () => {
    if (columnIndex === 0) return "left-0"; // Lunes
    if (columnIndex === 1) return "left-0 sm:left-1/2 sm:-translate-x-1/2"; // Martes
    if (columnIndex === 5 || columnIndex === 6) return "right-0"; // Sábado, Domingo
    return "left-1/2 -translate-x-1/2";
  };

  const getAvailableForHour = (hour: number) => {
    const hourStart = hour * 60;
    const hourEnd = (hour + 1) * 60;
    const hourRange = { start: hourStart, end: hourEnd, originalText: '' };

    return availableActivities.filter(act => {
      const scheduleOnDay = act.schedules.find(s => s.day === day);
      if (!scheduleOnDay) return false;
      if (!checkOverlap(scheduleOnDay.timeRange, hourRange)) return false;
      if (selectedActivities.some(sa => sa.id === act.id)) return false;
      if (selectedActivities.some(sa => sa.asignatura === act.asignatura)) return false;
      return true;
    });
  };

  return (
    <div className={cn("flex-1 relative min-w-0", !isLast && "border-r border-[var(--border-subtle)]")}>
      {/* Grid cells */}
      <div className="relative h-full">
        {HOURS.map(hour => {
          const available = getAvailableForHour(hour);
          const hasOptions = available.length > 0;

          return (
            <div
              key={hour}
              tabIndex={0}
              role="button"
              aria-label={`Ver materias de ${day} a las ${formatTime(hour * 60)}`}
              aria-expanded={activeHour === hour}
              className={cn(
                "h-16 relative group cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]",
                activeHour === hour ? "bg-[var(--color-primary-light)] z-[65]" : "hover:bg-[var(--bg-surface-hover)]"
              )}
              onClick={(e) => handleCellClick(hour, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(hour, e);
                }
              }}
            >

              {hasOptions && activeHour !== hour && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-sm">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              )}

              {/* Dropdown menu */}
              {activeHour === hour && (
                <div 
                  ref={dropdownRef}
                  className={`absolute top-10 w-[85vw] max-w-[280px] sm:w-72 sm:max-w-none bg-[var(--bg-surface)] shadow-lg border border-[var(--border-strong)] rounded-lg p-2 sm:p-2.5 z-[65] max-h-[320px] overflow-y-auto ${getDropdownPositionClass()}`}
                  onClick={(e) => e.stopPropagation()} 
                >
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                    Materias disponibles {day} {formatTime(hour * 60)}
                  </p>
                  
                  {available.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--text-muted)] text-center">No hay asignaturas disponibles</div>
                  ) : (
                    <div className="space-y-1.5">
                      {available.map(act => {
                        const isApproved = showAntecedentes && materiasCompletadas.has(resolveMateriaId(act.asignatura) || "");
                        const selectedSchedules = selectedActivities.flatMap(sa => sa.schedules);
                        const isConflict = hasConflict(act.schedules, selectedSchedules);
                        const antecedentesPendientes = getPendingPrerequisites(act.asignatura, act.antecedentes, materiasCompletadas);
                        const weeklyScheduleText = formatWeeklySchedules(act.schedules);

                        return (
                          <div
                            key={act.id}
                            className={cn(
                              "p-2.5 rounded-lg text-xs transition-colors border border-[var(--border-subtle)]",
                              isApproved 
                                ? "opacity-50 bg-black/5 dark:bg-white/5 cursor-not-allowed" 
                                : isConflict 
                                  ? "opacity-50 bg-red-500/10 border-red-500/20 cursor-not-allowed" 
                                  : "hover:bg-[var(--bg-app)] cursor-pointer hover:border-[var(--border-strong)]"
                            )}
                            onClick={() => {
                              if (isConflict || isApproved) return;
                              onSelectActivity(act);
                              setActiveHour(null);
                            }}
                          >
                            <div className="font-semibold text-[var(--text-main)]">{act.asignatura}</div>
                            {weeklyScheduleText && (
                              <div className="text-[10px] font-medium text-[var(--color-primary)] mt-0.5">
                                {weeklyScheduleText}
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                              <span>Grupo {act.grupo} • {act.profesor}</span>
                              {isApproved && <span className="text-[var(--text-muted)] font-medium">Ya aprobada</span>}
                              {!isApproved && !isConflict && <span className="text-[var(--color-primary)] font-medium">+ Agregar</span>}
                              {!isApproved && isConflict && <span className="text-[var(--color-danger)] font-medium">Conflicto</span>}
                            </div>
                            {showAntecedentes && antecedentesPendientes.length > 0 && (
                              <div className="text-[10px] text-amber-500 mt-1 font-medium">
                                ⚠ Antecedente pendiente: {antecedentesPendientes.join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Selected Activities rendered absolutely */}
        {activitiesForThisDay.map(({ activity, schedule }) => {
          const calendarStartOffset = 7 * 60;
          const topMinutes = schedule.timeRange.start - calendarStartOffset;
          const durationMinutes = schedule.timeRange.end - schedule.timeRange.start;
          
          const ratio = 4 / 60; // 4rem (h-16) per 60 minutes
          const topRem = topMinutes * ratio; 
          const heightRem = durationMinutes * ratio;

          return (
            <div
              key={activity.id}
              className="absolute left-0 right-0 z-10 hover:z-[60] focus-within:z-[60] px-1"
              style={{
                top: `${topRem}rem`,
                height: `${heightRem}rem`,
              }}
            >
              <ActivityCard
                activity={activity}
                schedule={schedule}
                onRemove={onRemoveActivity}
                materiasCompletadas={materiasCompletadas}
                showAntecedentes={showAntecedentes}
                colorOverrides={colorOverrides}
                onColorChange={onColorChange}
                useColorfulMode={useColorfulMode}
              />
            </div>
          );
        })}

      </div>
    </div>
  );

}
