import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, AlertTriangle } from 'lucide-react';
import { Activity } from '../types';
import { activitiesConflict, formatWeeklySchedules } from '../utils/time';
import { resolveMateriaId } from '../utils/curriculum';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableActivities: Activity[];
  selectedActivities: Activity[];
  materiasCompletadas: Set<string>;
  showAntecedentes: boolean;
  onSelectActivity: (activity: Activity) => void;
  onRemoveActivity: (activityId: string) => void;
}

export function SubjectSelectionModal({
  isOpen,
  onClose,
  availableActivities,
  selectedActivities,
  materiasCompletadas,
  showAntecedentes,
  onSelectActivity,
  onRemoveActivity,
}: SubjectSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Pre-calculate selected IDs and schedules for fast checking
  const selectedIds = useMemo(() => {
    const set = new Set<string>();
    selectedActivities.forEach(a => set.add(a.id));
    return set;
  }, [selectedActivities]);

  const selectedAsignaturas = useMemo(() => {
    const set = new Set<string>();
    selectedActivities.forEach(a => {
      const key = resolveMateriaId(a.asignatura) || a.asignatura.trim().toLowerCase();
      set.add(key);
    });
    return set;
  }, [selectedActivities]);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const isSearchingGrupo = lowerSearch.includes('grupo');
    
    return availableActivities.filter(a => {
      const scheduleText = formatWeeklySchedules(a.schedules) || '';
      return (
        a.asignatura.toLowerCase().includes(lowerSearch) ||
        (a.profesor && a.profesor.toLowerCase().includes(lowerSearch)) ||
        (a.grupo && (
          String(a.grupo).toLowerCase().includes(lowerSearch) ||
          (isSearchingGrupo && `grupo ${String(a.grupo).toLowerCase()}`.includes(lowerSearch))
        )) ||
        (a.sala && a.sala.toLowerCase().includes(lowerSearch)) ||
        scheduleText.toLowerCase().includes(lowerSearch)
      );
    });
  }, [availableActivities, searchTerm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-subtle)] shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                Selección Rápida de Asignaturas
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Busca y agrega materias directamente a tu horario semanal.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 sm:p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por materia, profesor, grupo (ej. A o Grupo A), sala u horario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] text-sm border border-[var(--border-subtle)] rounded-lg pl-9 pr-4 py-2 sm:py-2.5 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 bg-[var(--bg-app)] relative">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-subtle)] mb-3">
                  <Search className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-main)]">No se encontraron materias</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">Intenta con otra búsqueda o asegúrate de haber cargado el archivo correspondiente.</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const materiaKey = resolveMateriaId(activity.asignatura) || activity.asignatura.trim().toLowerCase();
                const isSelected = selectedIds.has(activity.id);
                const isOtraCatedraSeleccionada = !isSelected && selectedAsignaturas.has(materiaKey);
                const isCompletada = showAntecedentes && materiasCompletadas.has(resolveMateriaId(activity.asignatura) || "");
                const isConflicting = !isSelected && !isOtraCatedraSeleccionada && !isCompletada && selectedActivities.some(sel => activitiesConflict(activity, sel));
                const scheduleText = formatWeeklySchedules(activity.schedules);

                const isDisabled = isOtraCatedraSeleccionada || isConflicting || isCompletada;

                return (
                  <motion.button
                    key={activity.id}
                    whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                    onClick={() => {
                      if (isDisabled && !isSelected) return;
                      if (isSelected) {
                        onRemoveActivity(activity.id);
                      } else {
                        onSelectActivity(activity);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                      ${isSelected 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' 
                        : isDisabled
                          ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-50 cursor-not-allowed'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-2">
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-main)]'}`}>
                          {activity.asignatura}
                        </span>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full self-start sm:self-auto ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                          Grupo {activity.grupo}
                        </span>
                      </div>
                      
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:text-xs text-[var(--text-muted)]">
                        {activity.profesor && (
                          <span className="truncate">{activity.profesor}</span>
                        )}
                        {scheduleText && (
                          <span className="truncate">{scheduleText}</span>
                        )}
                        {activity.sala && (
                          <span className="truncate">{activity.sala}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end pl-1 sm:pl-2">
                      {isSelected ? (
                        <div className="flex items-center space-x-1.5 text-[var(--color-primary)] bg-white/50 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Agregada</span>
                        </div>
                      ) : isCompletada ? (
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[var(--text-muted)] bg-[var(--bg-app)] border border-[var(--border-subtle)] px-1.5 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Ya aprobada</span>
                        </div>
                      ) : isOtraCatedraSeleccionada ? (
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Ya seleccionada</span>
                        </div>
                      ) : isConflicting ? (
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-500 px-1.5 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Conflicto</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[var(--border-strong)] flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-transparent" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
            
            {/* Footer with counts */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center shrink-0">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                {selectedActivities.length} {selectedActivities.length === 1 ? 'materia seleccionada' : 'materias seleccionadas'} en total
              </span>
            </div>
          </motion.div>
        </div>
    </AnimatePresence>
  );
}
