// We need to tell tailwind to generate these colors for interpolation.
// With Tailwind v4, safe-listing works differently. Wait, this app uses Vite + @tailwindcss/vite. 
// @tailwindcss/vite scans files. String interpolation like `bg-${color}-50` will NOT be picked up by the compiler.
// We must either pass full class strings in `colors.ts`, or define a safelist pattern, or just write them out.
import { Activity, ActivitySchedule } from '../types';
import { cn } from '../lib/utils';
import { formatTime } from '../utils/time';
import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getPendingPrerequisites, getMateriaNotas } from '../utils/curriculum';
import { ASSIGNMENT_COLORS, getEffectiveColorId } from '../utils/colors';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityCardProps {
  activity: Activity;
  schedule: ActivitySchedule;
  onRemove: (activityId: string) => void;
  materiasCompletadas?: Set<string>;
  showAntecedentes?: boolean;
  colorOverrides: Record<string, string>;
  onColorChange: (asignatura: string, colorId: string) => void;
  useColorfulMode: boolean;
}

export function ActivityCard({ activity, schedule, onRemove, materiasCompletadas, showAntecedentes = true, colorOverrides, onColorChange, useColorfulMode }: ActivityCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; openUpward: boolean } | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; bottom: number; left: number; openUpward: boolean } | null>(null);

  const isTouchRef = useRef(false);

  useEffect(() => {
    if (showTooltip && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Abre hacia arriba solo si no hay espacio abajo Y hay más espacio arriba (220px es aprox. la altura del tooltip)
      const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow;
      let left = rect.left;
      
      const popoverWidth = 224; // w-56 is 224px
      if (left + popoverWidth > window.innerWidth) {
        left = Math.max(8, window.innerWidth - popoverWidth - 8);
      }
      
      setTooltipPosition({
        top: rect.bottom + 4,
        bottom: window.innerHeight - rect.top + 4,
        left,
        openUpward
      });
    }
  }, [showTooltip, schedule.timeRange.start]);

  const antecedentesPendientes = materiasCompletadas ? getPendingPrerequisites(activity.asignatura, activity.antecedentes, materiasCompletadas) : [];
  const notasMateria = getMateriaNotas(activity.asignatura);

  const effectiveColorId = getEffectiveColorId(activity, colorOverrides, useColorfulMode);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showColorPicker) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showColorPicker]);
  
  return (
    <div
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-label={`Detalles de asignatura ${activity.asignatura}, Grupo ${activity.grupo}`}
      aria-expanded={showTooltip}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-md p-1.5 text-xs group transition-all duration-200 border-l-3 border-[var(--color-primary)] shadow-sm cursor-pointer flex flex-col border border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] select-none [-webkit-touch-callout:none]",
        (showTooltip || showColorPicker) && "active-card",
        !effectiveColorId && "bg-[var(--bg-app)] text-[var(--text-main)]"
      )}
      style={effectiveColorId ? {
        backgroundColor: `var(--swatch-${effectiveColorId}-bg)`,
        color: `var(--swatch-${effectiveColorId}-text)`,
      } : undefined}
      onMouseEnter={() => {
        if (!isTouchRef.current) setShowTooltip(true);
      }}
      onMouseLeave={() => {
        if (!isTouchRef.current) setShowTooltip(false);
      }}
      onTouchStart={() => {
        isTouchRef.current = true;
        setShowTooltip(true);
      }}
      onTouchEnd={() => {
        setShowTooltip(false);
        setTimeout(() => { isTouchRef.current = false; }, 500);
      }}
      onTouchCancel={() => {
        setShowTooltip(false);
        setTimeout(() => { isTouchRef.current = false; }, 500);
      }}
      onTouchMove={() => setShowTooltip(false)}
      onContextMenu={(e) => {
        // Prevents the native context menu on mobile when long-pressing
        if (window.matchMedia('(pointer: coarse)').matches) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowTooltip(!showTooltip);
        }
      }}
    >

      <div className="flex justify-between items-start print:flex-col print:items-start overflow-hidden">
        <h4 className="text-[10px] print:text-[8px] print:break-words print:hyphens-auto font-semibold leading-tight truncate print:whitespace-normal print:overflow-hidden pr-1">
          {activity.asignatura}
        </h4>
        <span className="text-[9px] print:text-[8px] font-medium text-[var(--color-primary)] shrink-0 print:mt-0.5">G{activity.grupo.padStart(2, '0')}</span>
      </div>
      <p className="text-[9px] print:text-[8px] print:break-words mt-1 leading-tight truncate print:whitespace-normal print:overflow-hidden text-[var(--text-muted)]">
        {activity.sala && `${activity.sala} • `}{activity.profesor}
      </p>
      
      {/* Color picker trigger */}
      <button
        data-tour="color-picker-trigger"
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!showColorPicker && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const popoverHeight = 110;
            const openUpward = (window.innerHeight - rect.bottom) < popoverHeight || rect.top > window.innerHeight - 150;
            let top = openUpward ? rect.top - popoverHeight : rect.bottom + 4;
            let left = rect.left + 4;
            const popoverWidth = 144;
            if (left + popoverWidth > window.innerWidth) {
              left = window.innerWidth - popoverWidth - 8;
            }
            setPopoverPosition({ top, left, openUpward });
          }
          setShowColorPicker(!showColorPicker);
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute bottom-1 left-1 w-3.5 h-3.5 rounded-full hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        style={{ backgroundColor: effectiveColorId ? `var(--swatch-${effectiveColorId}-text)` : 'var(--text-muted)' }}
        title="Cambiar color de materia"
      />

      {/* Color Picker Popover */}
      {createPortal(
        <AnimatePresence>
          {showColorPicker && popoverPosition && (
            <motion.div
              ref={colorPickerRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-[200] w-36 p-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-xl grid grid-cols-4 gap-1.5 cursor-default"
              style={{ top: popoverPosition.top, left: popoverPosition.left }}
            >
              {ASSIGNMENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(activity.asignatura, c);
                    setShowColorPicker(false);
                  }}
                  className="w-full aspect-square rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: `var(--swatch-${c}-text)` }}
                  title={c}
                />
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(activity.asignatura, "");
                  setShowColorPicker(false);
                }}
                className="w-full aspect-square rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-dashed border-[var(--border-strong)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)]"
                title="Restaurar color original"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(activity.id);
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute bottom-1 right-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--color-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] rounded-sm"
        title="Quitar actividad"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Tooltip / Details */}
      {createPortal(
        <AnimatePresence>
          {showTooltip && tooltipPosition && (
            <motion.div
              initial={{ opacity: 0, y: tooltipPosition.openUpward ? 5 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: tooltipPosition.openUpward ? 5 : -5 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[200] w-56 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-xl p-3 text-[var(--text-main)] break-words text-xs font-sans pointer-events-none"
              style={{
                left: tooltipPosition.left,
                ...(tooltipPosition.openUpward
                  ? { bottom: tooltipPosition.bottom }
                  : { top: tooltipPosition.top })
              }}
            >
              <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Modalidad:</strong> {activity.modalidad || 'N.A.'}</p>
              <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Grupo:</strong> {activity.grupo}</p>
              <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Créditos:</strong> {activity.creditos || 'N.A.'}</p>
              <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Profesor:</strong> {activity.profesor || 'Sin asignar'}</p>
              <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Sala:</strong> {activity.sala || 'Por definir'}</p>
              {showAntecedentes && (
                <>
                  {activity.antecedentes && (
                    <p className="mb-1"><strong className="text-[var(--text-muted)] font-medium">Antecedentes:</strong> {activity.antecedentes}</p>
                  )}
                  {notasMateria && (
                    <p className="mb-1 text-[10px] text-[var(--text-muted)] italic">
                      {notasMateria}
                    </p>
                  )}
                  {antecedentesPendientes.length > 0 && (
                    <p className="mb-1 text-amber-500 font-medium">
                      ⚠ Antecedente pendiente: {antecedentesPendientes.join(', ')}
                    </p>
                  )}
                </>
              )}
              <p><strong className="text-[var(--text-muted)] font-medium">Horario:</strong> {formatTime(schedule.timeRange.start)} - {formatTime(schedule.timeRange.end)}</p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}

