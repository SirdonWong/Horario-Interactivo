import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  markAsyncEnabled: boolean;
  onToggleMarkAsync: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  markAsyncEnabled,
  onToggleMarkAsync,
}: SettingsModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none"
          aria-modal="true"
          role="dialog"
          aria-labelledby="settings-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            key="settings-content"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl max-w-md w-full border border-[var(--border-strong)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="settings-dialog-title" className="text-sm font-semibold leading-tight">
                    Configuración
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-main)]">
                    Marcar Horarios Asíncronos
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1">
                    Permite marcar sesiones como asíncronas para eximir traslapes con Actividades Personalizadas o Libre. (Nota: Para agregar actividades en una celda ocupada por una sesión asíncrona, usa la Lista Rápida, ya que la tarjeta existente impide hacer clic directo).
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={onToggleMarkAsync}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out border border-transparent select-none focus:outline-none ${markAsyncEnabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`}
                  title={markAsyncEnabled ? "Desactivar" : "Activar"}
                  aria-label={markAsyncEnabled ? "Desactivar" : "Activar"}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${markAsyncEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-all hover:shadow-xs active:scale-97"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
