import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface ExcelSheetDialogProps {
  fileName: string;
  sheets: string[];
  onConfirm: (selectedSheets: string[]) => void;
  onCancel: () => void;
}

export function ExcelSheetDialog({
  fileName,
  sheets,
  onConfirm,
  onCancel
}: ExcelSheetDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(sheets));

  const toggleSheet = (sheet: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(sheet)) {
      newSelected.delete(sheet);
    } else {
      newSelected.add(sheet);
    }
    setSelected(newSelected);
  };

  const selectAll = () => setSelected(new Set(sheets));
  const deselectAll = () => setSelected(new Set());

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
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] rounded-t-xl shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] flex items-center">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                Seleccionar Hojas de Excel
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Archivo: {fileName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto">
          {sheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-app)] border border-dashed border-[var(--border-strong)] rounded-lg">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
              <h3 className="text-sm font-semibold text-[var(--text-main)]">Sin datos válidos</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
                No se encontraron hojas con contenido en este archivo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Hojas Disponibles ({sheets.length})
                </span>
                <div className="space-x-2 text-[11px]">
                  <button onClick={selectAll} className="text-[var(--color-primary)] font-medium hover:underline">Todas</button>
                  <span className="text-[var(--text-muted)]">|</span>
                  <button onClick={deselectAll} className="text-[var(--text-muted)] font-medium hover:underline">Ninguna</button>
                </div>
              </div>

              <div className="border border-[var(--border-subtle)] rounded-lg divide-y divide-[var(--border-subtle)] bg-[var(--bg-app)] overflow-hidden">
                {sheets.map(sheet => (
                  <motion.label 
                    whileTap={{ scale: 0.98 }}
                    key={sheet} 
                    className="flex items-center px-4 py-3 hover:bg-[var(--bg-surface)] cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(sheet)}
                      onChange={() => toggleSheet(sheet)}
                      className="w-4 h-4 rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors">
                      {sheet}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-end gap-3 rounded-b-xl shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors border border-transparent"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(Array.from(selected))}
            disabled={selected.size === 0}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center"
          >
            Importar ({selected.size})
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
