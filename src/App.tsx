import React, { useState, useEffect, Suspense } from 'react';
import { Activity, LoadedFile } from './types';
import { Uploader, PendingMappingFile, processFileAfterMapping, processCsvFiles } from './components/Uploader';
import { Calendar } from './components/Calendar';
const ColumnMappingDialog = React.lazy(() => 
  import('./components/ColumnMappingDialog').then(m => 
    ({ default: m.ColumnMappingDialog })
  )
);
import { ExcelSheetDialog } from './components/ExcelSheetDialog';
import { Download, FileSpreadsheet, Trash2, Sun, Moon, Calendar as CalendarIcon, RotateCcw, AlertTriangle, Loader2, Menu, X, GraduationCap, Palette } from 'lucide-react';

import { loadFromStorage, saveToStorage } from './utils/storage';
import { PrerequisiteChecklist } from './components/PrerequisiteChecklist';
import { ColumnMapping, fingerprintHeaders } from './utils/columnMapping';
import { ConfirmDialog } from './components/ConfirmDialog';
import { convertSheetToCSV } from './utils/excel';
import { AnimatePresence, motion } from 'motion/react';
import { SubjectSelectionModal } from './components/SubjectSelectionModal';
import { ListPlus } from 'lucide-react';

// Horario Academico Main App Component - Impeccable Design
export default function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPrerequisiteModalOpen, setIsPrerequisiteModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(true);
  const lastScrollY = React.useRef(0);

  const handleCalendarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current + 10) {
      setIsFabExpanded(false);
    } else if (currentScrollY < lastScrollY.current - 10) {
      setIsFabExpanded(true);
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [availableActivities, setAvailableActivities] = useState<Activity[]>(() =>
    loadFromStorage<Activity[]>('availableActivities', [])
  );

  const [selectedActivities, setSelectedActivities] = useState<Activity[]>(() =>
    loadFromStorage<Activity[]>('selectedActivities', [])
  );

  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>(() =>
    loadFromStorage<LoadedFile[]>('loadedFiles', [])
  );

  const [materiasCompletadas, setMateriasCompletadas] = useState<string[]>(() =>
    loadFromStorage<string[]>('materiasCompletadas', [])
  );
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAntecedentes, setShowAntecedentes] = useState<boolean>(() =>
    loadFromStorage<boolean>('showAntecedentes', true)
  );
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(() =>
    loadFromStorage<Record<string, string>>('colorOverrides', {})
  );
  const [pendingMapping, setPendingMapping] = useState<PendingMappingFile | null>(null);
  const [pendingExcel, setPendingExcel] = useState<{ file: File; sheets: string[] } | null>(null);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [useColorfulMode, setUseColorfulMode] = useState<boolean>(() =>
    loadFromStorage<boolean>('useColorfulMode', false)
  );

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('availableActivities', availableActivities);
  }, [availableActivities]);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('selectedActivities', selectedActivities);
  }, [selectedActivities]);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('loadedFiles', loadedFiles);
  }, [loadedFiles]);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('materiasCompletadas', materiasCompletadas);
  }, [materiasCompletadas]);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('colorOverrides', colorOverrides);
  }, [colorOverrides]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage('showAntecedentes', showAntecedentes);
  }, [showAntecedentes]);

  useEffect(() => {
    if (isFirstRender.current) return;
    saveToStorage('useColorfulMode', useColorfulMode);
  }, [useColorfulMode]);

  const handleColorChange = (asignatura: string, colorId: string) => {
    setColorOverrides(prev => ({ ...prev, [asignatura]: colorId }));
  };

  const materiasCompletadasSet = React.useMemo(() => new Set(materiasCompletadas), [materiasCompletadas]);

  const toggleMateriaCompletada = (materiaId: string) => {
    setMateriasCompletadas((prev) =>
      prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId]
    );
  };

  const handleDataLoaded = (newActivities: Activity[], newFiles: LoadedFile[]) => {
    setAvailableActivities(prev => {
      const mergedMap = new Map(prev.map(a => [a.id, a]));
      for (const act of newActivities) {
        mergedMap.set(act.id, act);
      }
      return Array.from(mergedMap.values());
    });

    setLoadedFiles(prev => {
      const fileMap = new Map(prev.map(f => [f.name, f]));
      for (const nf of newFiles) {
        fileMap.set(nf.name, nf);
      }
      return Array.from(fileMap.values());
    });
  };

  const handleMappingNeeded = (pending: PendingMappingFile) => {
    setPendingMapping(pending);
  };

  const handleExcelSheetsNeeded = (file: File, sheets: string[]) => {
    setPendingExcel({ file, sheets });
  };

  const handleExcelConfirm = async (selectedSheets: string[]) => {
    if (!pendingExcel) return;
    setCsvUploadError(null);
    try {
      const virtualFiles: File[] = [];
      for (const sheet of selectedSheets) {
        const virtualCsv = await convertSheetToCSV(pendingExcel.file, sheet);
        virtualFiles.push(virtualCsv);
      }
      
      // Pass the virtual files to the existing CSV pipeline
      await processCsvFiles(
        virtualFiles,
        () => setCsvUploadError(null),
        handleExcelSheetsNeeded,
        setCsvUploadError,
        handleDataLoaded,
        handleMappingNeeded
      );
    } catch (err: any) {
      console.error('Error processing Excel', err);
      setCsvUploadError(err.message || 'Hubo un error al extraer las hojas de Excel.');
    }
    setPendingExcel(null);
  };

  const handleExcelCancel = () => {
    setPendingExcel(null);
  };

  const handleMappingConfirm = async (mapping: ColumnMapping) => {
    if (!pendingMapping) return;
    setCsvUploadError(null);
    try {
      const fingerprint = fingerprintHeaders(pendingMapping.preview.headers);
      const savedMappings = loadFromStorage<Record<string, ColumnMapping>>('columnMappings', {});
      savedMappings[fingerprint] = mapping;
      saveToStorage('columnMappings', savedMappings);

      await processFileAfterMapping(pendingMapping.file, mapping, handleDataLoaded);
    } catch (err: any) {
      console.error('Error processing CSV after mapping', err);
      setCsvUploadError(err.message || 'Hubo un error al procesar el archivo CSV.');
    }
    setPendingMapping(null);
  };

  const handleMappingCancel = () => {
    setPendingMapping(null);
  };

  const handleRemoveFile = (fileName: string) => {
    setConfirmState({
      isOpen: true,
      title: `¿Eliminar "${fileName}"?`,
      message: `Se eliminarán las materias asociadas a este archivo CSV de tu oferta disponible.`,
      variant: 'danger',
      onConfirm: () => {
        setAvailableActivities(prev => prev.filter(a => a.sourceFile !== fileName));
        setSelectedActivities(prev => prev.filter(a => a.sourceFile !== fileName));
        setLoadedFiles(prev => prev.filter(f => f.name !== fileName));
        setConfirmState(null);
      },
    });
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivities(prev => [...prev, activity]);
  };

  const handleRemoveActivity = (activityId: string) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const handleReset = () => {
    setConfirmState({
      isOpen: true,
      title: '¿Reiniciar Horario Seleccionado?',
      message: 'Esta acción desmarcará todas las materias agregadas a tu calendario semanal.',
      variant: 'danger',
      onConfirm: () => {
        setSelectedActivities([]);
        setConfirmState(null);
      },
    });
  };

  const handleClearData = () => {
    setConfirmState({
      isOpen: true,
      title: '¿Limpiar Todo el Calendario y CSVs?',
      message: 'Se eliminarán todas las asignaturas cargadas y selecciones de tu sesión actual.',
      variant: 'danger',
      onConfirm: () => {
        setAvailableActivities([]);
        setSelectedActivities([]);
        setLoadedFiles([]);
        setConfirmState(null);
      },
    });
  };


  const handleExport = async () => {
    const el = document.getElementById('calendar-export-area');
    if (!el || isExporting) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const isDark = document.documentElement.classList.contains('dark');

      const targetWidth = Math.max(1200, el.clientWidth);
      let exportNode = el;
      let tempContainer: HTMLDivElement | null = null;

      if (el.clientWidth < 1200) {
        tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '1200px';
        // Use opacity 0 instead of visibility hidden, as visibility hidden sometimes causes html-to-image to skip rendering contents
        tempContainer.style.opacity = '0';
        tempContainer.style.pointerEvents = 'none';
        
        exportNode = el.cloneNode(true) as HTMLElement;
        exportNode.style.width = '1200px';
        exportNode.style.minWidth = '1200px';
        exportNode.style.height = 'max-content';
        
        tempContainer.appendChild(exportNode);
        document.body.appendChild(tempContainer);
        
        // Allow the browser to calculate layout/computed styles for the clone
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const dataUrl = await toPng(exportNode, {
        backgroundColor: isDark ? '#111827' : '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
        width: targetWidth,
      });

      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = 'horario_academico.png';
      link.href = blobUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Error exporting calendar', err);
      alert('Hubo un error al exportar el calendario.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalCreditos = selectedActivities.reduce((acc, curr) => {
    const match = curr.creditos.match(/\d+/);
    return acc + (match ? parseInt(match[0], 10) : 0);
  }, 0);

  return (
    <div className="flex flex-col h-screen w-full max-w-[100vw] bg-[var(--bg-app)] text-[var(--text-main)] font-sans overflow-hidden transition-colors duration-200">
      {/* Top Header */}
      <header className="flex items-center justify-between px-2 sm:px-6 py-2 sm:py-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0 z-20 shadow-[var(--shadow-sm)]">
        <div className="flex items-center space-x-1 sm:space-x-2.5">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(prev => !prev)}
            className="p-1 sm:p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] lg:hidden hover:border-[var(--border-strong)] transition-all"
            aria-label="Abrir panel de opciones"
            title="Panel de opciones"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <h1 
              className="text-xs sm:text-lg font-bold italic tracking-tight text-[var(--text-main)] leading-none truncate"
              style={{ fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }}
            >
              Horario Académico
            </h1>
            <p className="hidden sm:block text-[11px] text-[var(--text-muted)] font-medium mt-1 truncate">
              Planificación y optimización
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Antecedentes Checkbox Toggle (Hidden on very small screens, visible in drawer) */}
          <label className="hidden lg:flex items-center space-x-2 text-xs font-medium text-[var(--text-main)] cursor-pointer px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all select-none">
            <input
              type="checkbox"
              checked={showAntecedentes}
              onChange={(e) => setShowAntecedentes(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <span>
              Validar Prerrequisitos: <span className={showAntecedentes ? "text-[var(--color-primary)] font-semibold" : "text-[var(--text-muted)]"}>{showAntecedentes ? "ON" : "OFF"}</span>
            </span>
          </label>

          {/* Colorful Mode Toggle Button */}
          <button
            onClick={() => setUseColorfulMode(prev => !prev)}
            className={`p-1 sm:p-2 rounded-lg border transition-all flex items-center justify-center ${
              useColorfulMode 
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]" 
                : "border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
            }`}
            title="Alternar colores automáticos"
            aria-label="Toggle colorful mode"
          >
            <Palette className={`w-4 h-4 ${useColorfulMode ? "opacity-100" : "opacity-70"}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1 sm:p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] hover:border-[var(--border-strong)] transition-all flex items-center justify-center"
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Uploader Component */}
          <Uploader
            onDataLoaded={handleDataLoaded}
            onMappingNeeded={handleMappingNeeded}
            onExcelSheetsNeeded={handleExcelSheetsNeeded}
            onError={setCsvUploadError}
            onClearError={() => setCsvUploadError(null)}
          />

          {/* Export PNG */}
          {availableActivities.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center px-2 py-1.5 sm:px-3.5 sm:py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Generando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Exportar PNG</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90] lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar (Static in Desktop, Sliding Drawer in Mobile) */}
        <aside className={`
          fixed inset-y-0 left-0 z-[100] w-80 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-5 flex flex-col space-y-6 overflow-y-auto shrink-0 shadow-2xl transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:w-72 lg:shadow-none lg:z-10
        `}>
          {/* Header Mobile Drawer Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-semibold text-[var(--text-main)]">Opciones y Resumen</span>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md"
              aria-label="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Checkboxes inside Drawer */}
          <div className="lg:hidden pb-3 border-b border-[var(--border-subtle)] space-y-2">
            <label className="flex items-center justify-between text-xs font-medium text-[var(--text-main)] cursor-pointer p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] select-none">
              <span>Validar Prerrequisitos</span>
              <input
                type="checkbox"
                checked={showAntecedentes}
                onChange={(e) => setShowAntecedentes(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs font-medium text-[var(--text-main)] cursor-pointer p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] select-none">
              <span className="flex items-center space-x-2">
                <Palette className={`w-3.5 h-3.5 ${useColorfulMode ? "text-[var(--color-primary)]" : "text-[var(--text-muted)]"}`} />
                <span>Modo Colorido</span>
              </span>
              <input
                type="checkbox"
                checked={useColorfulMode}
                onChange={(e) => setUseColorfulMode(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </label>
          </div>

          {/* Summary Cards */}
          <section>
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Resumen del Horario
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-xl font-semibold text-[var(--text-main)]">{totalCreditos}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Créditos</p>
              </div>
              <div className="bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-xl font-semibold text-[var(--text-main)]">{selectedActivities.length}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Materias</p>
              </div>
            </div>
          </section>

          {/* Files List */}
          <section className="flex-1 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Archivos CSV ({loadedFiles.length})
                </h3>
                {loadedFiles.length > 0 && (
                  <button
                    onClick={handleClearData}
                    className="text-[11px] text-[var(--color-danger)] font-medium hover:underline"
                  >
                    Borrar todos
                  </button>
                )}
              </div>

              {loadedFiles.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {loadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="bg-[var(--bg-app)] border border-[var(--border-subtle)] p-2.5 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <FileSpreadsheet className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-[var(--text-main)] truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {file.count} opciones
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.name)}
                        className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 rounded transition-colors shrink-0"
                        title={`Eliminar ${file.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3 rounded-lg flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>Sin CSVs cargados</span>
                </div>
              )}

              {csvUploadError && (
                <div className="mt-2.5 flex items-start justify-between gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs text-red-500">
                  <p className="leading-snug">{csvUploadError}</p>
                  <button
                    onClick={() => setCsvUploadError(null)}
                    className="shrink-0 font-semibold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Prerequisite History Card Button */}
              {showAntecedentes && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsPrerequisiteModalOpen(true)}
                    className="w-full p-3 bg-[var(--bg-app)] text-[var(--text-main)] rounded-lg text-xs font-medium hover:border-[var(--border-strong)] transition-all border border-[var(--border-subtle)] flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <GraduationCap className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      <div className="text-left">
                        <span className="block font-medium">Prerrequisitos</span>
                        <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
                          {materiasCompletadasSet.size} materias aprobadas
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--color-primary)] font-medium group-hover:underline">
                      Gestionar →
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Reset Action */}
          {selectedActivities.length > 0 && (
            <section className="pt-4 border-t border-[var(--border-subtle)] mt-auto">
              <button
                onClick={handleReset}
                className="w-full py-2 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Calendario</span>
              </button>
            </section>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[var(--bg-app)] p-2.5 sm:p-4 overflow-hidden flex flex-col">
          {availableActivities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-[var(--border-strong)] rounded-xl bg-[var(--bg-surface)]">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-main)] mb-1">
                Comienza cargando tu oferta académica
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6">
                Sube uno o varios archivos CSV con las asignaturas disponibles para armar y optimizar tu horario.
              </p>
            </div>
          ) : (
            <Calendar
              availableActivities={availableActivities}
              selectedActivities={selectedActivities}
              onSelectActivity={handleSelectActivity}
              onRemoveActivity={handleRemoveActivity}
              materiasCompletadas={materiasCompletadasSet}
              showAntecedentes={showAntecedentes}
              colorOverrides={colorOverrides}
              onColorChange={handleColorChange}
              useColorfulMode={useColorfulMode}
              onScroll={handleCalendarScroll}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] px-4 sm:px-6 py-2 flex justify-between items-center text-[10px] sm:text-[11px] text-[var(--text-muted)] shrink-0 z-20">
        <div className="flex space-x-3 sm:space-x-4 truncate">
          <span>{availableActivities.length} actividades disponibles</span>
          <span>•</span>
          <span>{selectedActivities.length} seleccionadas</span>
        </div>
        <div className="hidden sm:block">
          Horario Académico • Impeccable Design
        </div>
      </footer>

      <AnimatePresence>
        {pendingMapping && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none">
              <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
            </div>
          }>
            <ColumnMappingDialog
              headers={pendingMapping.preview.headers}
              sampleRows={pendingMapping.preview.sampleRows}
              initialMapping={pendingMapping.initialMapping}
              fileName={pendingMapping.file.name}
              onConfirm={handleMappingConfirm}
              onCancel={handleMappingCancel}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingExcel && (
          <ExcelSheetDialog
            fileName={pendingExcel.file.name}
            sheets={pendingExcel.sheets}
            onConfirm={handleExcelConfirm}
            onCancel={handleExcelCancel}
          />
        )}
      </AnimatePresence>

      {/* Prerequisite Checklist Popup Modal */}
      <PrerequisiteChecklist
        isOpen={isPrerequisiteModalOpen}
        onClose={() => setIsPrerequisiteModalOpen(false)}
        completadas={materiasCompletadasSet}
        onToggle={toggleMateriaCompletada}
        onImportProgress={(ids) => setMateriasCompletadas(ids)}
      />

      {/* Global Action Confirmation Dialog */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* Floating Action Button (FAB) for Quick Selection */}
      <AnimatePresence>
        {availableActivities.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSubjectModalOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] transition-shadow overflow-hidden"
            style={{ height: '56px' }}
          >
            <div className="flex items-center justify-center px-4">
              <ListPlus className="w-6 h-6 shrink-0" />
              <AnimatePresence initial={false}>
                {isFabExpanded && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 12 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                  >
                    Lista Rápida
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <SubjectSelectionModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        availableActivities={availableActivities}
        selectedActivities={selectedActivities}
        materiasCompletadas={materiasCompletadasSet}
        showAntecedentes={showAntecedentes}
        onSelectActivity={handleSelectActivity}
        onRemoveActivity={handleRemoveActivity}
      />
    </div>
  );
}




