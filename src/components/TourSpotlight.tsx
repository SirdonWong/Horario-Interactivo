/**
 * TourSpotlight — generic guided tour "spotlight" component.
 *
 * Renders a spotlight overlay that darkens the entire screen except a
 * highlighted rect around `targetEl`, plus a floating card with title,
 * description, step label and navigation buttons.
 *
 * Usage: import this component wherever the tour orchestrator lives.
 * NOT connected to App.tsx yet — this file is infrastructure only.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface CardPosition {
  top: number;
  left: number;
  openUpward: boolean;
}

export interface TourSpotlightProps {
  /** The DOM element to spotlight. Pass null to skip rendering entirely. */
  targetEl: HTMLElement | null;
  title: string;
  description: string;
  /** Free-form step label, e.g. "1 de 3". Caller controls numbering. */
  stepLabel: string;
  onNext: () => void;
  onSkip: () => void;
  showPrev?: boolean;
  onPrev?: () => void;
}

const PADDING = 8;       // px gap between element edge and spotlight border
const CARD_WIDTH = 320;  // px — max width of the floating card
const CARD_HEIGHT = 180; // px — estimated height for placement decisions
const Z_INDEX = 220;     // above modals (200) and below Radix menus (300)

function computeRects(el: HTMLElement): {
  spotlight: SpotlightRect;
  card: CardPosition;
} {
  const rect = el.getBoundingClientRect();

  const spotlight: SpotlightRect = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  // Decide whether card goes above or below the spotlight
  const spaceBelow = window.innerHeight - (rect.bottom + PADDING);
  const spaceAbove = rect.top - PADDING;
  const openUpward = spaceBelow < CARD_HEIGHT && spaceAbove > CARD_HEIGHT;

  let cardTop = openUpward
    ? spotlight.top - CARD_HEIGHT - 8
    : spotlight.top + spotlight.height + 8;

  // Clamp card horizontally so it never goes off-screen
  let cardLeft = spotlight.left;
  if (cardLeft + CARD_WIDTH > window.innerWidth - 8) {
    cardLeft = window.innerWidth - CARD_WIDTH - 8;
  }
  if (cardLeft < 8) cardLeft = 8;

  // Clamp card vertically
  if (cardTop < 8) cardTop = 8;
  if (cardTop + CARD_HEIGHT > window.innerHeight - 8) {
    cardTop = window.innerHeight - CARD_HEIGHT - 8;
  }

  return {
    spotlight,
    card: { top: cardTop, left: cardLeft, openUpward },
  };
}

export function TourSpotlight({
  targetEl,
  title,
  description,
  stepLabel,
  onNext,
  onSkip,
  showPrev = false,
  onPrev,
}: TourSpotlightProps) {
  const [rects, setRects] = useState<ReturnType<typeof computeRects> | null>(null);
  const [isDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Recompute position on mount and on resize
  useEffect(() => {
    if (!targetEl) return;

    const update = () => setRects(computeRects(targetEl));
    update();

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [targetEl]);

  // Block body scroll while mounted; restore on unmount
  useEffect(() => {
    if (!targetEl) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [targetEl]);

  // Keyboard: Escape → skip
  useEffect(() => {
    if (!targetEl) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [targetEl, onSkip]);

  // Click on the real element → next
  useEffect(() => {
    if (!targetEl) return;
    const handleRealClick = () => {
      onNext();
    };
    targetEl.addEventListener('click', handleRealClick);
    return () => {
      targetEl.removeEventListener('click', handleRealClick);
    };
  }, [targetEl, onNext]);

  if (!targetEl || !rects) return null;

  const { spotlight, card } = rects;

  return (
    <>
      {/* ── Spotlight hole ── */}
      {createPortal(
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: 8,
            // The large spread shadow creates the dark overlay; the element
            // itself stays transparent, acting as the "hole".
            boxShadow: `0 0 0 2px var(--color-primary), 0 0 0 9999px rgba(0,0,0,${isDark ? 0.55 : 0.3})`,
            pointerEvents: 'none',
            zIndex: Z_INDEX,
          }}
        />,
        document.body,
      )}

      {/* ── Floating card ── */}
      {createPortal(
        <AnimatePresence>
          <motion.div
            key="tour-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-spotlight-title"
            initial={{ scale: 0.95, opacity: 0, y: card.openUpward ? 8 : -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: card.openUpward ? 8 : -8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'fixed',
              top: card.top,
              left: card.left,
              width: CARD_WIDTH,
              zIndex: Z_INDEX,
            }}
            className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl shadow-2xl border border-[var(--border-strong)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-between">
              <div>
                <h3
                  id="tour-spotlight-title"
                  className="text-sm font-semibold leading-tight"
                >
                  {title}
                </h3>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                  {stepLabel}
                </span>
              </div>
              <button
                id="tour-skip-btn"
                onClick={onSkip}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] px-2 py-1 rounded-md hover:bg-[var(--bg-surface-hover)] transition-colors"
                aria-label="Saltar tour"
              >
                Saltar tour
              </button>
            </div>

            {/* Body */}
            <div className="p-4 text-xs text-[var(--text-main)] leading-relaxed bg-[var(--bg-surface)]">
              {description}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-end space-x-2">
              {showPrev && onPrev && (
                <button
                  id="tour-prev-btn"
                  onClick={onPrev}
                  className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] text-xs font-medium rounded-lg transition-all active:scale-97"
                >
                  Atrás
                </button>
              )}
              <button
                id="tour-next-btn"
                onClick={onNext}
                className="px-4 py-2 text-white text-xs font-medium rounded-lg transition-all shadow-xs active:scale-97 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
