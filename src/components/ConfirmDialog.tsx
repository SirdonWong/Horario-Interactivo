import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Keyboard shortcut: Escape closes dialog (cancels)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none"
          aria-modal="true"
          role="dialog"
          aria-labelledby="confirm-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCancel();
            }
          }}
        >
          <motion.div
            key="confirm-content"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl max-w-md w-full border border-[var(--border-strong)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                    variant === 'danger'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : variant === 'warning'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                  }`}
                >
                  {variant === 'info' ? (
                    <HelpCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 id="confirm-dialog-title" className="text-sm font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Se requiere tu confirmación para continuar
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

            {/* Message Body */}
            <div className="p-5 text-xs text-[var(--text-main)] leading-relaxed bg-[var(--bg-surface)]">
              {message}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-end space-x-2.5">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] text-xs font-medium rounded-lg transition-all active:scale-97"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-white text-xs font-medium rounded-lg transition-all shadow-xs active:scale-97 ${
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
