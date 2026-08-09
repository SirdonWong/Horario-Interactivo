/**
 * Tour progress persistence.
 * Uses the same versioned localStorage system as the rest of the app.
 * Never import localStorage directly here — always go through loadFromStorage/saveToStorage.
 */
import { loadFromStorage, saveToStorage } from './storage';

const TOUR_PROGRESS_KEY = 'tourProgress';

export interface TourProgress {
  welcomeSeen: boolean;
  loadedSeen: boolean;
  colorSeen: boolean;
}

const TOUR_PROGRESS_FALLBACK: TourProgress = {
  welcomeSeen: false,
  loadedSeen: false,
  colorSeen: false,
};

export function loadTourProgress(): TourProgress {
  return loadFromStorage<TourProgress>(TOUR_PROGRESS_KEY, TOUR_PROGRESS_FALLBACK);
}

export function saveTourProgress(progress: TourProgress): void {
  saveToStorage<TourProgress>(TOUR_PROGRESS_KEY, progress);
}
