import React, { useState, useEffect, useRef } from 'react';
import { CAMPOS_CANONICOS, ColumnMapping, mappingCoversEssentials } from '../utils/columnMapping';

interface ColumnMappingDialogProps {
  headers: string[];
  sampleRows: string[][];
  initialMapping: ColumnMapping;
  fileName: string;
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export function ColumnMappingDialog({
  headers,
  sampleRows,
  initialMapping,
  fileName,
  onConfirm,
  onCancel,
}: ColumnMappingDialogProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);
  const dialogRef = useRef<HTMLDivElement>(null);

  // --- Escape key closes the modal ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // --- Focus trap: keep keyboard focus inside the modal ---
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

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
  }, []);

  const handleChange = (campoKey: string, columnaOriginal: string) => {
    setMapping((prev) => ({
      ...prev,
      [campoKey]: columnaOriginal === '' ? null : columnaOriginal,
    }));
  };

  const puedeConfirmar = mappingCoversEssentials(mapping);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="mapping-dialog-title"
    >
      <div ref={dialogRef} className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 border border-[var(--border-strong)]">
        <h2 id="mapping-dialog-title" className="text-base font-semibold mb-1">Confirma las columnas de "{fileName}"</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          No reconocimos automáticamente todas las columnas de este archivo. Revisa la vista previa
          y confirma a qué corresponde cada una antes de cargarlo.
        </p>

        <div className="overflow-x-auto mb-4 border border-[var(--border-subtle)] rounded-lg">
          <table className="text-[11px] w-full">
            <thead className="bg-[var(--bg-app)]">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-2.5 py-1.5 text-left font-medium text-[var(--text-muted)] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, i) => (
                <tr key={i} className="border-t border-[var(--border-subtle)]">
                  {row.map((cell, j) => (
                    <td key={j} className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-main)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2.5 mb-5">
          {CAMPOS_CANONICOS.map((campo) => {
            const selectId = `mapping-select-${campo.key}`;
            return (
              <div key={campo.key} className="flex items-center gap-3 text-xs">
                <label htmlFor={selectId} className="w-44 shrink-0 font-medium text-[var(--text-main)]">
                  {campo.label}
                  {campo.requerido && <span className="text-[var(--color-danger)]"> *</span>}
                </label>
                <select
                  id={selectId}
                  value={mapping[campo.key] ?? ''}
                  onChange={(e) => handleChange(campo.key, e.target.value)}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs flex-1 focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">— No mapear —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {!puedeConfirmar && (
          <p className="text-xs text-[var(--color-danger)] mb-4 font-medium">
            Falta mapear Asignatura y/o Grupo (obligatorios), o ningún día de la semana está
            mapeado.
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={onCancel}
            className="text-xs px-3.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] text-[var(--text-main)] font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={!puedeConfirmar}
            className="text-xs px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar y cargar
          </button>
        </div>
      </div>
    </div>
  );
}

