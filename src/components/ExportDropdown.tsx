import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  ChevronDown,
  Image,
  FileSpreadsheet,
  FileText,
  Calendar,
  CalendarPlus,
  Loader2,
  Printer,
} from 'lucide-react';

interface ExportDropdownProps {
  onExportPng: () => Promise<void> | void;
  onExportExcel: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  onExportCsvMaterias: () => void;
  onExportCsvAgenda: () => void;
  onExportIcs: () => void;
  onPrint?: () => void;
  isExportingPng?: boolean;
}

export function ExportDropdown({
  onExportPng,
  onExportExcel,
  onExportPdf,
  onExportCsvMaterias,
  onExportCsvAgenda,
  onExportIcs,
  onPrint,
  isExportingPng = false,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = async (
    action: () => Promise<void> | void,
    asyncKind?: 'excel' | 'pdf'
  ) => {
    setIsOpen(false);
    if (asyncKind === 'excel') {
      setIsExportingExcel(true);
      try {
        await action();
      } finally {
        setIsExportingExcel(false);
      }
    } else if (asyncKind === 'pdf') {
      setIsExportingPdf(true);
      try {
        await action();
      } finally {
        setIsExportingPdf(false);
      }
    } else {
      await action();
    }
  };

  const isBusy = isExportingPng || isExportingExcel || isExportingPdf;
  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef}>
      <button
        data-tour="export-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isBusy}
        className="flex items-center justify-center p-2 sm:px-3.5 sm:py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isBusy ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-3.5 sm:h-3.5 sm:mr-1.5 animate-spin" />
            <span className="hidden sm:inline">Exportando...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDown className={`hidden sm:block w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-50 py-1.5 focus:outline-none"
          >
            <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] mb-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                Formatos de exportación
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAction(onExportPdf, 'pdf')}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">PDF</div>
                <div className="text-[11px] text-[var(--text-muted)]">Descarga directa, 2 páginas (calendario + materias)</div>
              </div>
            </button>

            {/* Opción Imprimir */}
            {onPrint && (
              <button
                type="button"
                onClick={() => handleAction(onPrint)}
                className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
              >
                <Printer className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Imprimir</div>
                  <div className="text-[11px] text-[var(--text-muted)]">O enviar a impresora nativa (Ctrl+P)</div>
                </div>
              </button>
            )}

            {/* Opción PNG */}
            <button
              type="button"
              onClick={() => handleAction(onExportPng)}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <Image className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">PNG</div>
                <div className="text-[11px] text-[var(--text-muted)]">Captura visual del calendario</div>
              </div>
            </button>

            {/* Opción Excel */}
            <button
              type="button"
              onClick={() => handleAction(onExportExcel, 'excel')}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Excel (.xlsx)</div>
                <div className="text-[11px] text-[var(--text-muted)]">Libro con 3 pestañas (Materias, Calendario y Lista)</div>
              </div>
            </button>

            {/* Opción ICS */}
            <button
              type="button"
              onClick={() => handleAction(onExportIcs)}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <CalendarPlus className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Calendario (.ics)</div>
                <div className="text-[11px] text-[var(--text-muted)]">Compatible con Google Calendar, Apple Calendar y Outlook</div>
              </div>
            </button>

            <div className="my-1 border-t border-[var(--border-subtle)]" />

            {/* Opción CSV Materias */}
            <button
              type="button"
              onClick={() => handleAction(onExportCsvMaterias)}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">CSV - Materias Inscritas</div>
                <div className="text-[11px] text-[var(--text-muted)]">Lista plana de clases inscritas</div>
              </div>
            </button>

            {/* Opción CSV Agenda */}
            <button
              type="button"
              onClick={() => handleAction(onExportCsvAgenda)}
              className="w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-[var(--border-subtle)]/30 transition-colors text-[var(--text-main)]"
            >
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">CSV - Agenda Semanal</div>
                <div className="text-[11px] text-[var(--text-muted)]">Desglose por sesiones por día y hora</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
