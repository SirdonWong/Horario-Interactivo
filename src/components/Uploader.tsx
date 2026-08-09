import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseCSVData, previewCSV, CSVPreview } from '../utils/csv';
import { readExcelSheets } from '../utils/excel';
import { Activity, LoadedFile } from '../types';
import {
  ColumnMapping,
  fingerprintHeaders,
  suggestColumnMapping,
  mappingIsHighConfidence,
} from '../utils/columnMapping';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface UploaderProps {
  onDataLoaded: (newActivities: Activity[], newFiles: LoadedFile[]) => void;
  onMappingNeeded: (pending: PendingMappingFile) => void;
  onExcelSheetsNeeded: (file: File, sheets: string[]) => void;
  onError: (message: string) => void;
  onClearError: () => void;
}

export interface PendingMappingFile {
  file: File;
  preview: CSVPreview;
  initialMapping: ColumnMapping;
  /** Nombre de la hoja de Excel que originó este archivo virtual (si aplica) */
  sheetName?: string;
}

export function Uploader({ onDataLoaded, onMappingNeeded, onExcelSheetsNeeded, onError, onClearError }: UploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileWithMapping = async (file: File, mapping: ColumnMapping) => {
    const activities = await parseCSVData(file, mapping);
    const newFiles: LoadedFile[] = [{
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      count: activities.length,
    }];
    onDataLoaded(activities, newFiles);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files) as File[];
    await processCsvFiles(
      fileArray,
      onClearError,
      onExcelSheetsNeeded,
      onError,
      onDataLoaded,
      onMappingNeeded
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <label
        htmlFor="csv-file-input"
        data-tour="uploader-button"
        className="flex items-center justify-center p-2 sm:px-3.5 sm:py-1 bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg text-xs sm:text-xs font-medium border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all shadow-sm cursor-pointer select-none"
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv, .xlsx, .xls"
          multiple
          className="sr-only"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Upload className="w-5 h-5 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
        <span className="hidden sm:inline">Cargar Archivo(s)</span>
      </label>
    </div>
  );
}


// Helper exported for App.tsx to process a file after the user confirms the mapping dialog
export async function processFileAfterMapping(
  file: File,
  mapping: ColumnMapping,
  onDataLoaded: (newActivities: Activity[], newFiles: LoadedFile[]) => void,
) {
  const activities = await parseCSVData(file, mapping);
  const newFiles: LoadedFile[] = [{
    id: `${file.name}-${Date.now()}`,
    name: file.name,
    count: activities.length,
  }];
  onDataLoaded(activities, newFiles);
}

// Extracted core logic so it can be called programmatically from App.tsx
export async function processCsvFiles(
  files: File[],
  onClearError: () => void,
  onExcelSheetsNeeded: (file: File, sheets: string[]) => void,
  onError: (message: string) => void,
  onDataLoaded: (newActivities: Activity[], newFiles: LoadedFile[]) => void,
  onMappingNeeded: (pending: PendingMappingFile) => void
) {
  onClearError();

  const processFileWithMapping = async (file: File, mapping: ColumnMapping) => {
    const activities = await parseCSVData(file, mapping);
    const newFiles: LoadedFile[] = [{
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      count: activities.length,
    }];
    onDataLoaded(activities, newFiles);
  };

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const sheets = await readExcelSheets(file);
        if (sheets.length > 0) {
          onExcelSheetsNeeded(file, sheets);
          break; // Wait for user to select sheets
        } else {
          onError(`El archivo "${file.name}" no contiene hojas válidas o está vacío.`);
          continue;
        }
      }

      const preview = await previewCSV(file);
      const fingerprint = fingerprintHeaders(preview.headers);

      // Check localStorage for a previously confirmed mapping with same fingerprint
      const savedMappings = loadFromStorage<Record<string, ColumnMapping>>('columnMappings', {});
      if (savedMappings[fingerprint]) {
        // Previously confirmed — use it directly
        await processFileWithMapping(file, savedMappings[fingerprint]);
        continue;
      }

      // No saved mapping — try auto-suggestion
      const suggested = suggestColumnMapping(preview.headers);

      if (mappingIsHighConfidence(suggested)) {
        // All columns (except Domingo) matched automatically
        savedMappings[fingerprint] = suggested;
        saveToStorage('columnMappings', savedMappings);
        await processFileWithMapping(file, suggested);
      } else {
        // Low confidence — need user to confirm via dialog
        onMappingNeeded({ file, preview, initialMapping: suggested });
        break;
      }
    }
  } catch (err: any) {
    console.error("Error parsing CSV", err);
    onError(err.message || "Hubo un error al procesar el archivo CSV.");
  }
}

