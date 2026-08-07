import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, X, ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';

// Subcomponent for Animated Select using Radix UI + Framer Motion
function AnimatedSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const safeValue = value || '__NO_MAP__';

  return (
    <Select.Root
      value={safeValue}
      onValueChange={(val) => onChange(val === '__NO_MAP__' ? '' : val)}
      open={open}
      onOpenChange={setOpen}
    >
      <Select.Trigger className="flex items-center justify-between w-full border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] outline-none transition-all group">
        <Select.Value>
          <span className="block truncate text-left flex-1 mr-2">
            {safeValue === '__NO_MAP__' ? '— No mapear —' : safeValue}
          </span>
        </Select.Value>
        <Select.Icon asChild>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
        </Select.Icon>
      </Select.Trigger>

      <AnimatePresence>
        {open && (
          <Select.Portal forceMount>
            <Select.Content
              asChild
              position="popper"
              sideOffset={4}
              className="z-[300] w-full min-w-[var(--radix-select-trigger-width)] max-w-[90vw] sm:max-w-none max-h-52 overflow-hidden bg-[var(--bg-surface)] rounded-lg shadow-xl border border-[var(--border-strong)]"
            >
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <Select.Viewport className="p-1">
                  <Select.Item
                    value="__NO_MAP__"
                    className="relative flex items-center pl-7 pr-2 py-1.5 text-xs font-medium text-[var(--text-muted)] rounded-md cursor-pointer select-none outline-none border-l-3 border-transparent data-[highlighted]:border-[var(--color-primary)] data-[highlighted]:text-[var(--color-primary)] data-[highlighted]:bg-[var(--bg-surface-hover)]/30 transition-colors"
                  >
                    <Select.ItemText>— No mapear —</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    </Select.ItemIndicator>
                  </Select.Item>

                  <div className="h-px bg-[var(--border-subtle)] my-1 mx-2" />

                  {options.map((h) => (
                    <Select.Item
                      key={h}
                      value={h}
                      className="relative flex items-center pl-7 pr-2 py-1.5 text-xs text-[var(--text-main)] rounded-md cursor-pointer select-none outline-none border-l-3 border-transparent data-[highlighted]:border-[var(--color-primary)] data-[highlighted]:text-[var(--color-primary)] data-[highlighted]:bg-[var(--bg-surface-hover)]/30 transition-colors"
                    >
                      <Select.ItemText>
                        <span className="block truncate">{h}</span>
                      </Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </motion.div>
            </Select.Content>
          </Select.Portal>
        )}
      </AnimatePresence>
    </Select.Root>
  );
}
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
    <motion.div
      key="mapping-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none"
      aria-modal="true"
      role="dialog"
      aria-labelledby="mapping-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        key="mapping-content"
        ref={dialogRef}
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-[var(--border-strong)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-app)] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 id="mapping-dialog-title" className="text-sm font-semibold leading-tight">
                Confirma las columnas de "{fileName}"
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Revisa el mapeo antes de continuar
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

        {/* Body (scrollable) */}
        <div className="p-6 overflow-y-auto">
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
              <div key={campo.key} className="flex items-center gap-2 sm:gap-3 text-xs">
                <label htmlFor={selectId} className="w-[35%] sm:w-[40%] shrink-0 font-medium text-[var(--text-main)] truncate">
                  {campo.label}
                  {campo.requerido && <span className="text-[var(--color-danger)]"> *</span>}
                </label>
                <div className="w-[65%] sm:w-[60%]">
                  <AnimatedSelect
                    value={mapping[campo.key] ?? ''}
                    onChange={(val) => handleChange(campo.key, val)}
                    options={headers}
                    placeholder="— No mapear —"
                  />
                </div>
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

        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-end space-x-2.5 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] text-xs font-medium rounded-lg transition-all active:scale-97"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={!puedeConfirmar}
            className="px-4 py-2 text-white text-xs font-medium rounded-lg transition-all shadow-xs active:scale-97 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar y cargar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

