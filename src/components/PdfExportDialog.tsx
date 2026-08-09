import React from 'react';
import { motion } from 'motion/react';
import { FileText, Info } from 'lucide-react';

interface PdfExportDialogProps {
  includeSubjectList: boolean;
  onIncludeSubjectListChange: (include: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PdfExportDialog({
  includeSubjectList,
  onIncludeSubjectListChange,
  onConfirm,
  onCancel
}: PdfExportDialogProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-sm shadow-2xl flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] rounded-t-xl shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-rose-500" />
                Exportar a Documento PDF
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Configura las opciones de impresión.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <label className="flex items-start gap-3 cursor-pointer group mb-4">
            <div className="flex items-center h-5">
              <input 
                type="checkbox"
                checked={includeSubjectList}
                onChange={(e) => onIncludeSubjectListChange(e.target.checked)}
                className="w-4 h-4 text-[var(--color-primary)] bg-[var(--bg-surface)] border-[var(--border-strong)] rounded focus:ring-[var(--color-primary)] focus:ring-offset-[var(--bg-surface)] transition-colors cursor-pointer"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors">
                Incluir resumen de asignaturas
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Añade una tabla al final del documento con el detalle de profesor, créditos y aula para cada materia inscrita.
              </p>
            </div>
          </label>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              <strong>Sugerencia:</strong> En la ventana de impresión, puedes elegir la orientación (Vertical u Horizontal) que mejor se adapte. Si el horario tiene muchas horas, el calendario visual se extenderá automáticamente a múltiples páginas sin cortarse.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] rounded-b-xl flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors shadow-sm shadow-[var(--color-primary)]/20"
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
