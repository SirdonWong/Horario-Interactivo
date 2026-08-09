/**
 * TourOrchestrator — decides WHICH tour stage to show and WHEN.
 *
 * Three stages (each shown at most once automatically, unless manually triggered):
 *  - "welcome": shown on app mount if user has never seen any tour.
 *  - "loaded":  shown the first time availableActivities goes from 0 → >0.
 *  - "color":   shown the first time selectedActivities goes from 0 → >0.
 *
 * Uses TourSpotlight for visual rendering and tourStorage for persistence.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TourSpotlight } from './TourSpotlight';
import { loadTourProgress, saveTourProgress, TourProgress } from '../utils/tourStorage';

// ─── Types ───────────────────────────────────────────────────────────────────

type StageId = 'welcome' | 'loaded' | 'color';

interface StepDef {
  target: string; // data-tour value
  title: string;
  description: string;
}

interface StageDef {
  id: StageId;
  seenKey: keyof TourProgress;
  steps: StepDef[];
}

// ─── Stage definitions (hardcoded) ───────────────────────────────────────────

const STAGES: StageDef[] = [
  {
    id: 'welcome',
    seenKey: 'welcomeSeen',
    steps: [
      {
        target: 'prereq-toggle',
        title: '¡Bienvenido a Horario Académico!',
        description:
          'Antes de empezar: este switch controla si la app valida tus prerrequisitos contra la malla de Psicología. Si estudias otra carrera o no lo necesitas, puedes apagarlo aquí.',
      },
      {
        target: 'uploader-button',
        title: 'Sube tu oferta académica',
        description:
          'Aquí puedes cargar uno o varios archivos CSV o Excel con las materias disponibles del semestre. En cuanto subas el primero, te muestro cómo armar tu horario.',
      },
    ],
  },
  {
    id: 'loaded',
    seenKey: 'loadedSeen',
    steps: [
      {
        target: 'calendar-cell',
        title: 'Arma tu horario',
        description:
          'Haz clic en cualquier celda del calendario para ver qué materias tienes disponibles en ese horario y agregarlas con un clic.',
      },
      {
        target: 'fab-quick-select',
        title: 'O búscalas directo',
        description:
          'Si prefieres buscar por nombre, profesor o grupo en vez de navegar el calendario, usa este botón. Lista Rápida te deja agregar varias materias seguidas.',
      },
      {
        target: 'export-button',
        title: 'Exporta cuando termines',
        description:
          'Desde aquí puedes descargar tu horario final en PDF, Excel, CSV o como imagen.',
      },
    ],
  },
  {
    id: 'color',
    seenKey: 'colorSeen',
    steps: [
      {
        target: 'color-picker-trigger',
        title: 'Personaliza los colores',
        description:
          'Haz clic en este punto de color para cambiar el color de cualquier materia. Todos sus grupos comparten el mismo color.',
      },
    ],
  },
];

// ─── Helper: resolve visible DOM element for a data-tour value ───────────────

function getVisibleTarget(dataTourValue: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(
    `[data-tour="${dataTourValue}"]`
  );
  for (const el of Array.from(els)) {
    const rect = el.getBoundingClientRect();
    const hasSize = rect.width > 0 && rect.height > 0;
    const inViewport =
      rect.right > 0 &&
      rect.left < window.innerWidth &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight;
    if (hasSize && inViewport) return el;
  }
  return null;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface TourOrchestratorProps {
  hasAvailableActivities: boolean;
  hasSelectedActivities: boolean;
  anyModalOpen: boolean;
  manualTriggerSignal: number;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TourOrchestrator({
  hasAvailableActivities,
  hasSelectedActivities,
  anyModalOpen,
  manualTriggerSignal,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: TourOrchestratorProps) {
  // ── Active stage/step state ──
  const [activeStageId, setActiveStageId] = useState<StageId | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const didOpenDrawerRef = useRef(false);

  // ── Tour progress (kept in sync with localStorage) ──
  const progressRef = useRef<TourProgress>(loadTourProgress());

  // ── Pending stage to show when the current one ends or modal closes ──
  const pendingStageRef = useRef<StageId | null>(null);
  const isManualTriggerRef = useRef(false);

  // ── Previous values for detecting transitions ──
  const prevAvailableRef = useRef(hasAvailableActivities);
  const prevSelectedRef = useRef(hasSelectedActivities);

  // ─── On first mount: detect "existing user" and suppress entire tour ────
  const hasInitializedRef = useRef(false);

  if (!hasInitializedRef.current) {
    hasInitializedRef.current = true;
    const progress = progressRef.current;

    // If the user already has the data a stage teaches on mount,
    // mark that stage as seen — no point showing a tutorial for
    // something they already accomplished.
    let updated = { ...progress };
    let changed = false;

    if ((hasAvailableActivities || hasSelectedActivities) && !progress.welcomeSeen) {
      updated.welcomeSeen = true;
      changed = true;
    }
    if (hasAvailableActivities && !progress.loadedSeen) {
      updated.loadedSeen = true;
      changed = true;
    }
    if (hasSelectedActivities && !progress.colorSeen) {
      updated.colorSeen = true;
      changed = true;
    }

    if (changed) {
      saveTourProgress(updated);
      progressRef.current = updated;
    }
  }

  // ─── Mark a stage as seen and persist ──────────────────────────────────

  const markStageSeen = useCallback((stageId: StageId) => {
    const stage = STAGES.find((s) => s.id === stageId);
    if (!stage) return;
    const updated: TourProgress = { ...progressRef.current, [stage.seenKey]: true };
    progressRef.current = updated;
    saveTourProgress(updated);
  }, []);

  // ─── Close active stage (skip or complete) ─────────────────────────────

  const closeActiveStage = useCallback(
    (markSeen: boolean, stageId: StageId | null) => {
      if (stageId && markSeen) {
        markStageSeen(stageId);
      }
      setActiveStageId(null);
      setTargetEl(null);
      setActiveStepIndex(0);
    },
    [markStageSeen]
  );

  // ─── Core: resolve and activate a step ─────────────────────────────────

  const resolveStep = useCallback(
    (
      stageId: StageId,
      stepIndex: number,
      onSuccess: () => void,
      onFailAll: () => void
    ) => {
      const stage = STAGES.find((s) => s.id === stageId);
      if (!stage) return;
      const step = stage.steps[stepIndex];
      if (!step) { onFailAll(); return; }

      const attemptResolve = () => {
        const el = getVisibleTarget(step.target);
        if (el) {
          setTargetEl(el);
          onSuccess();
        } else {
          // Retry once after 300ms
          setTimeout(() => {
            const retryEl = getVisibleTarget(step.target);
            if (retryEl) {
              setTargetEl(retryEl);
              onSuccess();
            } else {
              // Advance to next step or close stage
              const nextIndex = stepIndex + 1;
              if (nextIndex < stage.steps.length) {
                resolveStep(stageId, nextIndex, () => {
                  setActiveStageId(stageId);
                  setActiveStepIndex(nextIndex);
                }, onFailAll);
              } else {
                onFailAll();
              }
            }
          }, 300);
        }
      };

      if (step.target === 'prereq-toggle') {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop && !isMobileSidebarOpen) {
          setIsMobileSidebarOpen(true);
          didOpenDrawerRef.current = true;
          setTimeout(attemptResolve, 350);
          return;
        }
      }

      attemptResolve();
    },
    [isMobileSidebarOpen, setIsMobileSidebarOpen]
  );

  // ─── Activate a stage from step 0 ──────────────────────────────────────

  // Use a ref-based flag to avoid stale closure on anyModalOpen
  const anyModalOpenRef = useRef(anyModalOpen);
  useEffect(() => { anyModalOpenRef.current = anyModalOpen; }, [anyModalOpen]);

  const activeStageIdRef = useRef<StageId | null>(null);
  useEffect(() => { activeStageIdRef.current = activeStageId; }, [activeStageId]);

  const activateStage = useCallback(
    (stageId: StageId, isManual: boolean = false) => {
      if (anyModalOpenRef.current) {
        pendingStageRef.current = stageId;
        isManualTriggerRef.current = isManual;
        return;
      }
      if (activeStageIdRef.current !== null && !isManual) {
        pendingStageRef.current = stageId;
        isManualTriggerRef.current = false;
        return;
      }

      resolveStep(
        stageId,
        0,
        () => {
          setActiveStageId(stageId);
          setActiveStepIndex(0);
        },
        () => {
          // Could not resolve any step — mark seen anyway
          markStageSeen(stageId);
        }
      );
    },
    [resolveStep, markStageSeen]
  );

  // ─── Effect: handle pending stage or re-resolve active step when modal closes ───────

  useEffect(() => {
    if (!anyModalOpen) {
      if (activeStageId === null && pendingStageRef.current !== null) {
        const pending = pendingStageRef.current;
        const isManual = isManualTriggerRef.current;
        pendingStageRef.current = null;
        isManualTriggerRef.current = false;
        activateStage(pending, isManual);
      } else if (activeStageId !== null) {
        resolveStep(
          activeStageId,
          activeStepIndex,
          () => {},
          () => {}
        );
      }
    }
  }, [anyModalOpen, activeStageId, activeStepIndex, activateStage, resolveStep]);

  // ─── Effect: welcome stage on mount ────────────────────────────────────

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress.welcomeSeen) {
      activateStage('welcome');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Effect: "loaded" stage when available activities appear ───────────

  useEffect(() => {
    const wasAvailable = prevAvailableRef.current;
    prevAvailableRef.current = hasAvailableActivities;

    if (!wasAvailable && hasAvailableActivities) {
      if (!progressRef.current.loadedSeen) {
        activateStage('loaded');
      }
    }
  }, [hasAvailableActivities, activateStage]);

  // ─── Effect: "color" stage when selected activities appear ─────────────

  useEffect(() => {
    const wasSelected = prevSelectedRef.current;
    prevSelectedRef.current = hasSelectedActivities;

    if (!wasSelected && hasSelectedActivities) {
      if (!progressRef.current.colorSeen) {
        activateStage('color');
      }
    }
  }, [hasSelectedActivities, activateStage]);

  // ─── Effect: manual trigger signal ─────────────────────────────────────

  const isFirstManualRender = useRef(true);

  useEffect(() => {
    if (isFirstManualRender.current) {
      isFirstManualRender.current = false;
      return;
    }
    // Determine the most relevant stage
    const stageId: StageId = hasSelectedActivities
      ? 'color'
      : hasAvailableActivities
      ? 'loaded'
      : 'welcome';

    // Close current stage without marking seen (manual re-trigger)
    if (activeStageIdRef.current !== null) {
      setActiveStageId(null);
      setTargetEl(null);
      setActiveStepIndex(0);
      activeStageIdRef.current = null;
    }

    // Small delay to let state settle before activating
    setTimeout(() => {
      activateStage(stageId, true);
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualTriggerSignal]);

  // ─── Navigation handlers ────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (!activeStageId) return;
    const stage = STAGES.find((s) => s.id === activeStageId);
    if (!stage) return;

    const currentStepTarget = stage.steps[activeStepIndex].target;
    if (currentStepTarget === 'prereq-toggle' && didOpenDrawerRef.current) {
      setIsMobileSidebarOpen(false);
      didOpenDrawerRef.current = false;
    }

    const nextIndex = activeStepIndex + 1;
    if (nextIndex < stage.steps.length) {
      resolveStep(
        activeStageId,
        nextIndex,
        () => { setActiveStepIndex(nextIndex); },
        () => { closeActiveStage(true, activeStageId); }
      );
    } else {
      // Stage completed normally
      closeActiveStage(true, activeStageId);
    }
  }, [activeStageId, activeStepIndex, resolveStep, closeActiveStage, setIsMobileSidebarOpen]);

  const handlePrev = useCallback(() => {
    if (!activeStageId || activeStepIndex === 0) return;
    const prevIndex = activeStepIndex - 1;
    resolveStep(
      activeStageId,
      prevIndex,
      () => { setActiveStepIndex(prevIndex); },
      () => { /* stay on current if can't resolve prev */ }
    );
  }, [activeStageId, activeStepIndex, resolveStep]);

  const handleSkip = useCallback(() => {
    if (activeStageId) {
      const stage = STAGES.find((s) => s.id === activeStageId);
      if (stage) {
        const currentStepTarget = stage.steps[activeStepIndex].target;
        if (currentStepTarget === 'prereq-toggle' && didOpenDrawerRef.current) {
          setIsMobileSidebarOpen(false);
          didOpenDrawerRef.current = false;
        }
      }
    }
    closeActiveStage(true, activeStageId);
  }, [closeActiveStage, activeStageId, activeStepIndex, setIsMobileSidebarOpen]);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (anyModalOpen || !activeStageId || !targetEl) return null;

  const stage = STAGES.find((s) => s.id === activeStageId)!;
  const step = stage.steps[activeStepIndex];

  return (
    <TourSpotlight
      targetEl={targetEl}
      title={step.title}
      description={step.description}
      stepLabel={`${activeStepIndex + 1} de ${stage.steps.length}`}
      onNext={handleNext}
      onSkip={handleSkip}
      showPrev={activeStepIndex > 0}
      onPrev={handlePrev}
    />
  );
}
