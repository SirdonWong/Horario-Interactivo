import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Plus, X } from 'lucide-react';
import { Activity, DAYS, DayOfWeek } from '../types';
import { createManualActivity, updateManualActivity, activityToFormValues, ManualActivityFormValues } from '../utils/manualActivities';

interface ManualActivityFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialActivity?: Activity;
  colorIndex: number;
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    TIME_OPTIONS.push(`${hh}:${mm}`);
  }
}

function parseDayTimes(text: string | undefined): { start: string; end: string } {
  if (!text || text.trim() === '') return { start: '', end: '' };
  const parts = text.split(/[-–—a]/).map(p => p.trim());
  if (parts.length >= 2) {
    return { start: parts[0], end: parts[1] };
  }
  return { start: parts[0] || '', end: '' };
}

function addTwoHours(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  let hours = parseInt(match[1], 10) + 2;
  const minutes = match[2];
  if (hours > 22) hours = 22;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

interface TimeSelectInputProps {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  isInvalid?: boolean;
  openUpward?: boolean;
}

function TimeSelectInput({ value, placeholder, onChange, isInvalid, openUpward = false }: TimeSelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = TIME_OPTIONS.filter(opt =>
    opt.toLowerCase().includes(value.trim().toLowerCase())
  );
  const displayOptions = filteredOptions.length > 0 ? filteredOptions : TIME_OPTIONS;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && isOpen) {
            e.stopPropagation();
            setIsOpen(false);
          }
        }}
        className={`w-full bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all ${
          isInvalid
            ? 'border-2 border-[var(--color-danger)] focus-visible:ring-0'
            : 'border border-[var(--border-subtle)] focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]'
        }`}
      />
      
      {isOpen && (
        <div className={`absolute left-0 w-full max-h-36 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-xl z-[250] py-1 select-none ${
          openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {displayOptions.map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setIsOpen(false);
              }}
              className={`px-3 py-1 text-xs cursor-pointer transition-colors ${
                value === opt
                  ? 'bg-[var(--color-primary)] text-white font-medium'
                  : 'text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ManualActivityFormModal({
  isOpen,
  mode,
  initialActivity,
  colorIndex,
  onSave,
  onCancel,
}: ManualActivityFormModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const defaultValues: ManualActivityFormValues = {
    asignatura: '',
    grupo: 'U',
    modalidad: '',
    profesor: '',
    creditos: '',
    sala: '',
    antecedentes: '',
    horarios: {},
  };

  const [values, setValues] = useState<ManualActivityFormValues>(defaultValues);
  const [invalidDays, setInvalidDays] = useState<DayOfWeek[]>([]);
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [showDaysError, setShowDaysError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialActivity) {
        setValues(activityToFormValues(initialActivity));
      } else {
        setValues(defaultValues);
      }
      setInvalidDays([]);
      setShowEmptyError(false);
      setShowDaysError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialActivity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // --- Focus trap: keep keyboard focus inside the modal ---
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    // Move focus into the dialog on mount
    const firstFocusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable.length > 0) {
      firstFocusable[0].focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable: HTMLElement[] = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleChange = (field: keyof ManualActivityFormValues, val: string) => {
    setValues(prev => ({ ...prev, [field]: val }));
    if (field === 'asignatura' && val.trim() !== '') {
      setShowEmptyError(false);
    }
  };

  const handleTimeChange = (day: DayOfWeek, newStart: string, newEnd: string, changedField: 'start' | 'end') => {
    let finalStart = newStart;
    let finalEnd = newEnd;

    if (changedField === 'start' && newStart.trim() !== '' && !newEnd) {
      const suggestedEnd = addTwoHours(newStart.trim());
      if (suggestedEnd) {
        finalEnd = suggestedEnd;
      }
    }

    let combined = '';
    if (finalStart.trim() !== '' || finalEnd.trim() !== '') {
      combined = `${finalStart.trim()}-${finalEnd.trim()}`;
    }

    setValues(prev => ({
      ...prev,
      horarios: { ...prev.horarios, [day]: combined }
    }));
    setInvalidDays(prev => prev.filter(d => d !== day));
    setShowDaysError(false);
  };

  const handleSave = () => {
    let hasError = false;
    if (values.asignatura.trim() === '') {
      setShowEmptyError(true);
      hasError = true;
    }

    const hasAnySchedule = DAYS.some(day => (values.horarios[day] || '').trim() !== '');
    if (!hasAnySchedule) {
      setShowDaysError(true);
      hasError = true;
    }

    if (hasError) return;

    let result;
    if (mode === 'create') {
      result = createManualActivity(values, colorIndex);
    } else {
      result = updateManualActivity(initialActivity!, values);
    }

    if (result.invalidDays.length > 0) {
      setInvalidDays(result.invalidDays);
      return;
    }

    onSave(result.activity);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="manual-activity-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none"
          aria-modal="true"
          role="dialog"
          aria-labelledby="manual-activity-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCancel();
            }
          }}
        >
          <motion.div
            key="manual-activity-content"
            ref={dialogRef}
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-[var(--border-strong)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-app)] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                  {mode === 'create' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h2 id="manual-activity-dialog-title" className="text-sm font-semibold leading-tight">
                    {mode === 'create' ? 'Agregar nueva actividad' : 'Editar actividad'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {mode === 'create' ? 'Crea una actividad manual (ej. Taller, Club)' : 'Modifica los datos y horarios'}
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto [scrollbar-gutter:stable] space-y-4">
              {/* Asignatura y Grupo */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Asignatura <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={values.asignatura}
                    onChange={(e) => handleChange('asignatura', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                  {showEmptyError && (
                    <p className="text-[10px] text-[var(--color-danger)] mt-1 font-medium">Asignatura es obligatoria.</p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Grupo
                  </label>
                  <input
                    type="text"
                    value={values.grupo}
                    onChange={(e) => handleChange('grupo', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Modalidad y Profesor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Modalidad
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Presencial, Virtual..."
                    value={values.modalidad}
                    onChange={(e) => handleChange('modalidad', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Profesor
                  </label>
                  <input
                    type="text"
                    value={values.profesor}
                    onChange={(e) => handleChange('profesor', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Creditos y Sala */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Créditos
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 6"
                    value={values.creditos}
                    onChange={(e) => handleChange('creditos', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={values.sala}
                    onChange={(e) => handleChange('sala', e.target.value)}
                    className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Antecedentes */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-main)] mb-1">
                  Antecedentes
                </label>
                <textarea
                  rows={2}
                  value={values.antecedentes}
                  onChange={(e) => handleChange('antecedentes', e.target.value)}
                  className="w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all resize-none"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Si esta actividad tiene requisitos, escríbelos como texto libre (ej. '1 antecedente: Nombre de la materia').
                </p>
              </div>

              <hr className="border-[var(--border-subtle)]" />

              {/* Horarios */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-main)] mb-3">Horario (al menos un día)</h3>
                
                {invalidDays.length > 0 && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-[var(--color-danger)] font-medium">
                    No se pudo interpretar el horario de: {invalidDays.join(', ')}. Revisa el formato (ej. 18:00-20:00).
                  </div>
                )}
                
                {showDaysError && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-[var(--color-danger)] font-medium">
                    Agrega al menos un horario en algún día.
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {DAYS.map((day, idx) => {
                    const isInvalid = invalidDays.includes(day);
                    const { start: startVal, end: endVal } = parseDayTimes(values.horarios[day]);
                    const openUpward = idx >= 4; // Viernes, Sábado, Domingo

                    return (
                      <div key={day} className="flex items-center gap-3">
                        <label className="w-20 shrink-0 text-xs text-[var(--text-muted)] font-medium text-right">
                          {day}
                        </label>
                        <div className="flex-1 max-w-sm flex items-center gap-2">
                          <TimeSelectInput
                            value={startVal}
                            placeholder="Inicio"
                            onChange={(newStart) => handleTimeChange(day, newStart, endVal, 'start')}
                            isInvalid={isInvalid}
                            openUpward={openUpward}
                          />
                          <span className="text-xs text-[var(--text-muted)] shrink-0 font-medium">a</span>
                          <TimeSelectInput
                            value={endVal}
                            placeholder="Fin"
                            onChange={(newEnd) => handleTimeChange(day, startVal, newEnd, 'end')}
                            isInvalid={isInvalid}
                            openUpward={openUpward}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-end space-x-2.5 shrink-0">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] text-xs font-medium rounded-lg transition-all active:scale-97"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white text-xs font-medium rounded-lg transition-all shadow-xs active:scale-97 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
