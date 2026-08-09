import React from 'react';
import { Activity, DAYS, HOURS } from '../types';
import { formatTime } from '../utils/time';
import { DayColumn } from './DayColumn';

interface CalendarProps {
  availableActivities: Activity[];
  selectedActivities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onRemoveActivity: (activityId: string) => void;
  materiasCompletadas: Set<string>;
  showAntecedentes?: boolean;
  colorOverrides: Record<string, string>;
  onColorChange: (asignatura: string, colorId: string) => void;
  useColorfulMode: boolean;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function Calendar({
  availableActivities,
  selectedActivities,
  onSelectActivity,
  onRemoveActivity,
  materiasCompletadas,
  showAntecedentes = true,
  colorOverrides,
  onColorChange,
  useColorfulMode,
  onScroll,
}: CalendarProps) {
  
  return (
    <div className="h-full print-auto-height flex flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
      {/* Scrollable Container for Mobile */}
      <div 
        className="flex-1 overflow-auto relative bg-[var(--bg-surface)] print-auto-height"
        onScroll={onScroll}
      >
        <div className="min-w-[720px] h-full flex flex-col bg-[var(--bg-surface)]" id="calendar-export-area">
          {/* Day Headers */}
          <div className="grid grid-cols-[65px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-[var(--border-subtle)] bg-[var(--bg-app)] sticky top-0 z-[70]">
            <div className="p-3 border-r border-[var(--border-subtle)] bg-[var(--bg-app)] sticky left-0 z-[80]"></div>
            {DAYS.map((day, idx) => (
              <div key={day} className={`p-3 text-center text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase ${idx < 6 ? 'border-r border-[var(--border-subtle)]' : ''}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex-1 relative grid grid-cols-[65px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
            {/* Time Labels (Sticky Left with z-40 and solid background) */}
            <div className="flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] sticky left-0 z-40 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-surface)]">
                  {formatTime(hour * 60)}
                </div>
              ))}
            </div>

            {/* Grid Cells and Activities Container */}
            <div className="col-span-7 flex relative bg-[var(--bg-surface)]">
              {/* Background horizontal lines */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {HOURS.map(hour => (
                  <div key={hour} className="h-16 border-b border-[var(--border-subtle)] opacity-50 w-full" />
                ))}
              </div>

              {DAYS.map((day, idx) => (
                <DayColumn
                  key={day}
                  day={day}
                  availableActivities={availableActivities}
                  selectedActivities={selectedActivities}
                  onSelectActivity={onSelectActivity}
                  onRemoveActivity={onRemoveActivity}
                  materiasCompletadas={materiasCompletadas}
                  showAntecedentes={showAntecedentes}
                  isLast={idx === 6}
                  colorOverrides={colorOverrides}
                  onColorChange={onColorChange}
                  useColorfulMode={useColorfulMode}
                  columnIndex={idx}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



