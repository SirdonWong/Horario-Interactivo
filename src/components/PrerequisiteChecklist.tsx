import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import malla from '../data/mallaCurricular.json';
import { exportProgress, parseProgressFile } from '../utils/progress';
import { X, Search, Download, Upload, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface PrerequisiteChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  completadas: Set<string>;
  onToggle: (materiaId: string) => void;
  onImportProgress: (ids: string[]) => void;
}

export function PrerequisiteChecklist({
  isOpen,
  onClose,
  completadas,
  onToggle,
  onImportProgress,
}: PrerequisiteChecklistProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importInfo, setImportInfo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSemestres, setCollapsedSemestres] = useState<Set<number>>(new Set());
  const [pendingImport, setPendingImport] = useState<{ materiasCompletadas: string[]; idsDescartados?: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const materiasPorSemestre = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const grupos = new Map<number, typeof malla.materias>();

    for (const m of malla.materias) {
      if (query && !m.nombre.toLowerCase().includes(query)) {
        continue;
      }
      if (!grupos.has(m.semestre)) grupos.set(m.semestre, []);
      grupos.get(m.semestre)!.push(m);
    }
    return Array.from(grupos.entries()).sort((a, b) => a[0] - b[0]);
  }, [searchQuery]);



  const creditosAcumulados = useMemo(() => {
    let total = 0;
    for (const id of completadas) {
      const m = malla.materias.find((mm) => mm.id === id);
      if (m) total += m.creditos;
    }
    return total;
  }, [completadas]);

  const toggleSemestreCollapse = (semestre: number) => {
    setCollapsedSemestres(prev => {
      const next = new Set(prev);
      if (next.has(semestre)) {
        next.delete(semestre);
      } else {
        next.add(semestre);
      }
      return next;
    });
  };

  const handleToggleSemestreBulk = (materias: { id: string }[], shouldSelectAll: boolean) => {
    for (const m of materias) {
      const isChecked = completadas.has(m.id);
      if (shouldSelectAll && !isChecked) {
        onToggle(m.id);
      } else if (!shouldSelectAll && isChecked) {
        onToggle(m.id);
      }
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImportError(null);
    setImportInfo(null);

    const reader = new FileReader();
    reader.onload = () => {
      const resultado = parseProgressFile(reader.result as string);
      if (!resultado.ok || !resultado.materiasCompletadas) {
        setImportError(resultado.error ?? 'No se pudo leer el archivo.');
        return;
      }

      setPendingImport({
        materiasCompletadas: resultado.materiasCompletadas,
        idsDescartados: resultado.idsDescartados,
      });
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    onImportProgress(pendingImport.materiasCompletadas);

    if (pendingImport.idsDescartados) {
      setImportInfo(
        `Se importaron ${pendingImport.materiasCompletadas.length} materias. Se omitieron ${pendingImport.idsDescartados} que ya no existen en el catálogo.`
      );
    }
    setPendingImport(null);
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="prerequisite-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            key="modal-content"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            ref={dialogRef}
            className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-[var(--border-strong)] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="prerequisite-modal-title" className="text-base font-semibold leading-tight tracking-tight">
                    Historial de Prerrequisitos
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Marca las asignaturas aprobadas para validar antecedentes en tiempo real
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Container for all content below header */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Action Bar & Stats */}
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-[var(--text-muted)]">
                  Créditos obligatorios: <strong className="text-[var(--text-main)] font-semibold">{creditosAcumulados} cr</strong>
                </span>
                <span className="text-[var(--text-muted)]">
                  Materias listas: <strong className="text-[var(--text-main)] font-semibold">{completadas.size}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportProgress(Array.from(completadas))}
                  className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] text-[var(--text-main)] font-medium transition-all hover:shadow-xs active:scale-97"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar JSON</span>
                </button>

                <label className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] text-[var(--text-main)] font-medium cursor-pointer transition-all hover:shadow-xs active:scale-97">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar JSON</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar materia por nombre..."
                  className="w-full pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--color-primary)] outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="shrink-0">
              <AnimatePresence>
                {importError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-4 mt-3 flex items-start justify-between gap-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg p-2.5"
                >
                  <span>{importError}</span>
                  <button onClick={() => setImportError(null)} className="shrink-0 font-semibold">×</button>
                </motion.div>
              )}

              {importInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-4 mt-3 flex items-start justify-between gap-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs rounded-lg p-2.5"
                >
                  <span>{importInfo}</span>
                  <button onClick={() => setImportInfo(null)} className="shrink-0 font-semibold">×</button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 space-y-4 flex-1">
              {materiasPorSemestre.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No se encontraron materias que coincidan con "{searchQuery}"
                </div>
              ) : (
                <>
                  {materiasPorSemestre.map(([semestre, materias]) => {
                    const isCollapsed = collapsedSemestres.has(semestre);
                    const completadasDelSemestre = materias.filter(m => completadas.has(m.id));
                    const todasCompletadas = completadasDelSemestre.length === materias.length && materias.length > 0;
                    const pct = materias.length > 0 ? (completadasDelSemestre.length / materias.length) * 100 : 0;

                    return (
                      <div key={semestre} className="bg-[var(--bg-app)] rounded-lg border border-[var(--border-subtle)] overflow-hidden transition-all shadow-xs">
                        {/* Header del Semestre con Checkbox de Selección Masiva, Barra de Progreso y Acordeón */}
                        <div className="p-3 flex flex-col bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] select-none">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={todasCompletadas}
                                onChange={(e) => handleToggleSemestreBulk(materias, e.target.checked)}
                                className="rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                title={todasCompletadas ? "Desmarcar todo el semestre" : "Marcar todo el semestre"}
                              />
                              <span
                                className="text-xs font-semibold text-[var(--text-main)] cursor-pointer hover:text-[var(--color-primary)] transition-colors flex items-center space-x-2"
                                onClick={() => toggleSemestreCollapse(semestre)}
                              >
                                <span>Semestre {semestre}</span>
                                {todasCompletadas && (
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-normal flex items-center space-x-0.5">
                                    <Check className="w-3 h-3 inline" />
                                    <span>Completo</span>
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] text-[var(--text-muted)] font-medium">
                                {completadasDelSemestre.length} de {materias.length} aprobadas
                              </span>
                              <button
                                onClick={() => toggleSemestreCollapse(semestre)}
                                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors"
                                aria-label={isCollapsed ? "Expandir semestre" : "Colapsar semestre"}
                              >
                                <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="w-4 h-4" />
                                </motion.div>
                              </button>
                            </div>
                          </div>

                          {/* Mini progress bar */}
                          <div className="w-full bg-[var(--border-subtle)] h-1 rounded-full mt-2.5 overflow-hidden">
                            <motion.div
                              className="bg-[var(--color-primary)] h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        {/* Grid de Materias Animado */}
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {materias.map((m) => {
                                  const isChecked = completadas.has(m.id);
                                  return (
                                    <motion.label
                                      key={m.id}
                                      whileTap={{ scale: 0.98 }}
                                      className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors border ${
                                        isChecked
                                          ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] text-[var(--text-main)] font-medium'
                                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-main)]'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2.5 truncate pr-2">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => onToggle(m.id)}
                                          className="shrink-0 rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <span className="truncate font-medium">{m.nombre}</span>
                                      </div>
                                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{m.creditos} cr</span>
                                    </motion.label>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)]">
                Los cambios se aplican y guardan automáticamente
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-all hover:shadow-xs active:scale-97"
              >
                Listo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Import Confirmation Dialog */}
      <ConfirmDialog
        isOpen={pendingImport !== null}
        title="¿Reemplazar checklist actual?"
        message={`Esta acción va a reemplazar tu historial de materias aprobadas con ${pendingImport?.materiasCompletadas.length ?? 0} asignaturas contenidas en el archivo importado.`}
        confirmText="Reemplazar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </AnimatePresence>
  );
}

