# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria e interactiva ("**Horario Interactivo**") para planificar y optimizar horarios académicos universitarios. Permite cargar ofertas en CSV o Excel (`.xlsx`, `.xls`), agregar o editar materias personalizadas manualmente, seleccionar asignaturas/grupos en una grilla semanal deslizable con horas fijas (7:00 a 21:00), prevenir traslapes/conflictos de horario, gestionar prerrequisitos (con modales de tarjetas seleccionables y switch pill `ON`/`OFF`), consultar el catálogo completo mediante un modal de "Selección Rápida", recorrer un tutorial guiado e interactivo por etapas, alternar temas (Claro / Oscuro) y exportar el horario en múltiples formatos: PDF de 2 páginas (página 1: captura del calendario a resolución 2x; página 2: tabla vectorial con `jspdf-autotable`), impresión nativa (`window.print()`), Excel estilizado (`.xlsx` multilámina), iCalendar (`.ics`), CSV en UTF-8 con BOM y gráfico PNG.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`, `@vitejs/plugin-react@^5.0.4`) con split manual de chunks (`vendor-xlsx`, `vendor-pdf` para `jspdf` + `html-to-image`, y `@radix-ui`), y `rollup-plugin-visualizer` para análisis de bundle (`scratch/bundle-report.html`).
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con tokens CSS en `:root` y `.dark`.
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7`
  - **Animaciones UI / Motion:** `motion@^12.23.24` (importado desde `motion/react`)
  - **Librerías clave:** `papaparse@^5.5.4` (CSV), `xlsx-js-style@^1.2.0` (Excel matricial estilizado), `jspdf@^4.2.1` + `jspdf-autotable@^5.0.8` (PDF vectorial), `html-to-image@^1.11.13` (PNG/PDF Export), `lucide-react@^0.546.0` (Iconos), `clsx@^2.1.1` y `tailwind-merge@^3.6.0`

---

## 2. Estructura de archivos

```text
Horario-Académico/
├── .agents/                        # Reglas personalizadas del proyecto para agentes de IA.
│   └── AGENTS.md                   # Reglas globales de desarrollo, terminal y protocolo de verificación.
├── .env.local                      # Configuración de variables de entorno locales.
├── .gitignore                      # Archivos y carpetas excluidos del control de versiones.
├── DESIGN.md                       # Especificación del sistema de diseño (tokens de color, tipografía y temas).
├── PRODUCT.md                      # Definición de producto, propuesta de valor y visión del usuario.
├── PROJECT_CONTEXT.md              # Este archivo: documentación técnica completa del estado actual.
├── README.md                       # Guía pública de uso e información del proyecto.
├── index.html                      # Plantilla HTML base y punto de entrada para Vite (Título: Horario Interactivo).
├── package.json                    # Dependencias, scripts de construcción y metadatos del proyecto.
├── tsconfig.json                   # Configuración del compilador de TypeScript.
├── vite.config.ts                  # Configuración de Vite (alias, servidor dev en puerto 3000, visualizer y chunk splitting).
├── scratch/                        # Scripts de verificación, pruebas funcionales de runtime y análisis.
│   ├── analyze_report.mjs          # Script para analizar la distribución y peso de paquetes en el bundle report.
│   ├── bundle-report.html          # Reporte gráfico interactivo generado por rollup-plugin-visualizer.
│   ├── parse_report.mjs            # Parser auxiliar de datos para reportes.
│   ├── test-export.mjs             # Prueba sintética de funciones de exportación de datos.
│   ├── test_creditos_fallback.mjs  # Prueba de inferencia de créditos entre filas.
│   ├── test_excel.mjs              # Prueba de parseo y conversión de libros Excel (.xlsx).
│   ├── test_http_and_html.mjs      # Prueba de conectividad HTTP en servidor local.
│   ├── test_ics.ts                 # Prueba de generación de eventos iCalendar (.ics) y formato de descripción.
│   ├── test_manual_activities.mjs  # Prueba funcional de creación, edición y parseo de actividades manuales.
│   ├── test_matrix_excel.mjs       # Prueba de generación de Excel matricial multilámina con xlsx-js-style.
│   ├── test_output.xlsx            # Archivo de salida generado durante pruebas de Excel.
│   ├── test_pdf_export_flow.mjs    # Prueba de integración del flujo de impresión y exportación a PDF.
│   ├── test_real_ics.mjs           # Prueba funcional con la lógica real de exportación a iCalendar.
│   ├── test_ui_flow.mjs            # Verificación de integración de componentes UI.
│   ├── test_uploader_accessibility.mjs # Prueba estática de accesibilidad en el componente Uploader.
│   └── verify_components.mjs       # Verificación de eliminación de checkboxes nativos y toggles en modales.
├── src/                            # Código fuente de la aplicación.
│   ├── App.tsx                     # Componente principal: estado global, marca Horario Interactivo, FAB flotante, colas Excel, modales y layout.
│   ├── main.tsx                    # Punto de entrada React que monta App en el DOM.
│   ├── index.css                   # Importación de Tailwind v4, variables CSS custom, .exporting-mode y reglas de impresión (@media print).
│   ├── types.ts                    # Interfaces de TypeScript (`Activity`, `ActivitySchedule`, `TimeRange`, `LoadedFile`, `DayOfWeek`).
│   ├── components/                 # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx        # Tarjeta visual para clases agendadas (elevación hover, tooltips y popovers portaled, color picker).
│   │   ├── Calendar.tsx            # Grilla principal del calendario semanal (cabecera de días, columna de horas y backdrop transparente para descarte).
│   │   ├── ColumnMappingDialog.tsx # Modal accesible para mapear columnas CSV no reconocidas o de hojas de Excel (Radix Select + Motion).
│   │   ├── ConfirmDialog.tsx       # Modal de confirmación estilizado para reemplazar alertas nativas de navegador.
│   │   ├── DayColumn.tsx           # Columna diaria: celdas de hora, dropdown de opciones y tarjetas agendadas con `:has(.active-card)`.
│   │   ├── ExcelSheetDialog.tsx    # Diálogo para seleccionar hojas de un libro Excel (.xlsx) mediante filas interactivas tipo tarjeta.
│   │   ├── ExportDropdown.tsx      # Menú desplegable en el Header para elegir formato de exportación (PDF, Imprimir, PNG, Excel, ICS, CSV).
│   │   ├── ManualActivityFormModal.tsx # Modal de formulario para crear y editar materias/eventos personalizados manualmente.
│   │   ├── PrerequisiteChecklist.tsx # Modal de gestión de materias aprobadas con tarjetas seleccionables, acordeón y pill toggle por semestre.
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": buscador multi-campo para agregar asignaturas en masa.
│   │   ├── TourOrchestrator.tsx    # Orquestador del tutorial guiado (secuencia de etapas, re-resolución de targets y control responsivo del drawer).
│   │   ├── TourSpotlight.tsx       # Overlay del spotlight (hueco con anillo de color, sombra gigante para tema claro/oscuro y listener en el elemento real).
│   │   └── Uploader.tsx            # Componente para cargar archivos CSV/Excel (.csv, .xlsx, .xls) con detección de columnas y feedback.
│   ├── data/                       # Catálogos de datos.
│   │   ├── aliasAsignaturas.ts     # Tabla de equivalencias y normalización de nombres entre CSV y la malla.
│   │   └── mallaCurricular.json    # Plan de estudios oficial (materias obligatorias, créditos y prerrequisitos).
│   ├── lib/                        # Integración de utilidades.
│   │   └── utils.ts                # Helper `cn` (clsx + tailwind-merge) para unir clases CSS.
│   └── utils/                      # Módulos de lógica y cálculo.
│       ├── colors.ts               # Paleta de 14 colores predefinidos y lógica de resolución de swatches.
│       ├── columnMapping.ts        # Canónicos, auto-sugerencias fuzzy y validación de firmas de encabezados CSV.
│       ├── csv.ts                  # Parseo de CSV (PapaParse), limpieza de BOM, normalización e inferencia de créditos.
│       ├── curriculum.ts           # Verificación de prerrequisitos, resolución de IDs y extracción de antecedentes.
│       ├── dummy.ts                # Stub de módulo para resolver alias en Vite/Rollup (`fs`, `stream`, `crypto`).
│       ├── excel.ts                # Helper lazy-loaded (`xlsx`) para convertir hojas de Excel a formato CSV virtual.
│       ├── export.ts               # Módulo de exportación: PDF en 2 páginas (`jsPDF` + `jspdf-autotable`), Calendarios `.ics`, Excel (.xlsx) y CSV.
│       ├── manualActivities.ts     # Creación, edición, conversión y validación de actividades agregadas manualmente.
│       ├── progress.ts             # Exportación e importación del avance del checklist en JSON.
│       ├── storage.ts              # Wrapper de `localStorage` con versionado de esquema (`SCHEMA_VERSION = 1`).
│       ├── time.ts                 # Normalización de textos de tiempo, parseo de rangos horarios y detección de traslapes/conflictos.
│       └── tourStorage.ts          # Persistencia del progreso del tutorial (`welcomeSeen`, `loadedSeen`, `colorSeen`) en `localStorage`.
```

---

## 3. Modelo de datos

### Tipos de TypeScript (`src/types.ts` & `src/utils/tourStorage.ts`)

```typescript
export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 a 21 (horas de inicio)

export interface TimeRange {
  start: number; // Minutos desde la medianoche (ej. 8:00 = 480)
  end: number;   // Minutos desde la medianoche (ej. 10:00 = 600)
  originalText: string;
}

export interface ActivitySchedule {
  day: DayOfWeek;
  timeRange: TimeRange;
}

export interface LoadedFile {
  id: string;
  name: string;
  count: number;
}

export interface Activity {
  id: string;             // Formato: Asignatura + "-" + Grupo (o "manual-<timestamp>" para personalizadas)
  modalidad: string;
  asignatura: string;
  creditos: string;
  grupo: string;
  profesor: string;
  antecedentes: string;
  sala: string;
  horarioTexto: string;
  schedules: ActivitySchedule[];
  color: string;
  sourceFile?: string;
  isManual?: boolean;     // Flag que distingue actividades personalizadas creadas manualmente
}

export interface TourProgress {
  welcomeSeen: boolean;
  loadedSeen: boolean;
  colorSeen: boolean;
}
```

### Esquema de Columnas CSV Reconocidas (`src/utils/columnMapping.ts`)

Campos canónicos que el sistema mapea desde los encabezados del CSV o Excel:

- `asignatura`: Nombre de la materia (Obligatoria).
- `grupo`: Código/Número del grupo (Obligatoria).
- `modalidad`: Modalidad de impartición (Presencial, Virtual, etc.).
- `creditos`: Cantidad de créditos (Si viene vacía en una fila, se infiere de otra fila de la misma asignatura).
- `profesor`: Nombre del docente.
- `antecedentes`: Requisitos previos descritos en texto libre.
- `sala`: Aula/Laboratorio asignado.
- Columnas por día: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` (al menos un día con horario válido para procesar la opción).

---

## 4. Componentes y módulos clave

- **`src/App.tsx`**: Administra el estado global bajo la marca "**Horario Interactivo**" (actividades disponibles/seleccionadas, archivos cargados, materias completadas, actividades manuales, banderas de configuración, cola de hojas pendientes de Excel `pendingSheetQueue`), botón flotante desplegable (FAB) para selección rápida con detección de scroll (`handleCalendarScroll`), sincronización en `localStorage`, exportaciones (PNG, PDF, ICS, CSV, Excel) e integración del layout.
- **`src/components/Calendar.tsx`**: Contenedor visual del calendario con columna fija de horas (7:00 a 21:00), elevación del estado `activeCell` y backdrop transparente para descarte global de desplegables.
- **`src/components/DayColumn.tsx`**: Renderiza las celdas horarias de un día específico, gestiona el desplegable de opciones disponibles por celda y la posición absoluta de materias seleccionadas con elevación `:has(.active-card):z-[60]`.
- **`src/components/ActivityCard.tsx`**: Tarjeta gráfica de cada materia agendada; calcula colores Neón/Glassmorphism, tooltips informativos y popovers de color renderizados en portales fuera del flujo principal (con lógica dinámica de cálculo de bordes para abrir hacia arriba si no hay espacio inferior), prevención de conflictos al tocar/hacer clic y adaptación para exportación e impresión (`overflow-hidden`, `print:whitespace-normal`).
- **`src/components/SubjectSelectionModal.tsx`**: Modal de "Selección Rápida" con buscador multi-campo (materia, profesor, grupo, sala, horario) para agregar/remover asignaturas en masa.
- **`src/components/PrerequisiteChecklist.tsx`**: Modal emergente con acordeón por semestre y tarjetas seleccionables sin checkboxes nativos, con pill toggle switch en cabecera de semestre y buscador para marcar materias aprobadas.
- **`src/components/ColumnMappingDialog.tsx`**: Modal cargado dinámicamente (`React.lazy`) que permite al usuario asociar manualmente las columnas de un CSV no reconocido o de hojas de Excel (muestra subtítulo `"Hoja: NombreHoja"` cuando aplica).
- **`src/components/ExcelSheetDialog.tsx`**: Diálogo para seleccionar qué hojas de un archivo `.xlsx` importar usando filas interactivas tipo tarjetas sin checkboxes nativos.
- **`src/components/ManualActivityFormModal.tsx`**: Modal de formulario responsivo para crear o editar actividades y materias personalizadas manualmente (configuración de horarios por día, créditos, grupo, aula y color).
- **`src/components/ExportDropdown.tsx`**: Menú desplegable en el Header que centraliza la descarga del horario en PDF (`jsPDF`), Imprimir (`window.print()`), PNG (`html-to-image`), Excel (`.xlsx`), Calendario (`.ics`), CSV Materias y CSV Agenda.
- **`src/components/ConfirmDialog.tsx`**: Componente modal de confirmación con variantes visuales que reemplaza `window.confirm`.
- **`src/components/TourOrchestrator.tsx`**: Orquesta el tutorial paso a paso por etapas ("welcome", "loaded", "color"), gestiona la apertura/cierre automático del drawer móvil en pantallas pequeñas y oculta pausadamente el spotlight cuando `anyModalOpen` es verdadero.
- **`src/components/TourSpotlight.tsx`**: Renderiza la máscara visual del tutorial (hueco con anillo `--color-primary`, sombra responsiva según tema claro/oscuro) y adjunta un event listener al elemento real del DOM para avanzar de paso manteniendo la interacción original.
- **`src/components/Uploader.tsx`**: Maneja la carga drag-and-drop o por selección de archivos CSV/Excel (`.csv`, `.xlsx`, `.xls`) con validación de extensiones, detección de columnas y feedback.
- **`src/utils/manualActivities.ts`**: Helper de creación, edición, parseo y validación para el ciclo de vida de actividades personalizadas (`createManualActivity`, `updateManualActivity`).
- **`src/utils/export.ts`**: Lógica de exportación multiformato (PDF de 2 páginas con `jsPDF` + `jspdf-autotable`, Calendarios `.ics`, Excel `.xlsx` estilizado con `xlsx-js-style` y CSV UTF-8 con BOM).
- **`src/utils/dummy.ts`**: Stub de módulo para la resolución de alias en Vite/Rollup (`fs`, `stream`, `crypto`).
- **`src/utils/csv.ts`**: Convierte texto CSV en objetos `Activity`, gestionando limpieza de BOM, encabezados legacy e inferencia de créditos.
- **`src/utils/time.ts`**: Parsea rangos horarios flexibles (ej. "16:00-18:00", "8:00 a 2:00 pm"), agrupa formatos semanales y detecta traslapes/conflictos.
- **`src/utils/curriculum.ts`**: Resuelve materias contra la malla obligatoria, evalúa créditos acumulados para hitos y extrae prerrequisitos de optativas al vuelo.
- **`src/utils/storage.ts`**: Encapsula lectura/escritura en `localStorage` con control de versión de esquema (`SCHEMA_VERSION = 1`).
- **`src/utils/tourStorage.ts`**: Administra el guardado y carga del progreso del tutorial guiado en `localStorage`.
- **`src/utils/colors.ts`**: Administra la paleta Neón de 14 swatches y la precedencia de colores (Manual > Colorido Automático > Fondo Base).

---

## 5. Lógica central (código real, no resumen)

### A. Filtrado de actividades disponibles por día/hora en el dropdown de cada celda

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L71-L84) (Líneas 71 a 84)

```typescript
  const getAvailableForHour = (hour: number) => {
    const hourStart = hour * 60;
    const hourEnd = (hour + 1) * 60;
    const hourRange = { start: hourStart, end: hourEnd, originalText: '' };

    return availableActivities.filter(act => {
      const scheduleOnDay = act.schedules.find(s => s.day === day);
      if (!scheduleOnDay) return false;
      if (!checkOverlap(scheduleOnDay.timeRange, hourRange)) return false;
      if (selectedActivities.some(sa => sa.id === act.id)) return false;
      if (selectedActivities.some(sa => sa.asignatura === act.asignatura)) return false;
      return true;
    });
  };
```

---

### B. Fusión visual de celdas cuando una actividad ocupa más de un bloque de hora

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L212-L242) (Líneas 212 a 242)

```typescript
        {/* Selected Activities rendered absolutely */}
        {activitiesForThisDay.map(({ activity, schedule }) => {
          const calendarStartOffset = 7 * 60; // 07:00 AM
          const topMinutes = schedule.timeRange.start - calendarStartOffset;
          const durationMinutes = schedule.timeRange.end - schedule.timeRange.start;
          
          const totalCalendarMinutes = 15 * 60; // 15 horas (07:00 a 21:00)
          const topPercent = (topMinutes / totalCalendarMinutes) * 100;
          const heightPercent = (durationMinutes / totalCalendarMinutes) * 100;

          return (
            <div
              key={activity.id}
              className="absolute left-0 right-0 z-10 hover:z-[60] focus-within:z-[60] has-[.active-card]:z-[60] px-1"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              <ActivityCard
                activity={activity}
                schedule={schedule}
                onRemove={onRemoveActivity}
                materiasCompletadas={materiasCompletadas}
                showAntecedentes={showAntecedentes}
                colorOverrides={colorOverrides}
                onColorChange={onColorChange}
                useColorfulMode={useColorfulMode}
              />
            </div>
          );
        })}
```

---

### C. Exclusividad de grupos/horarios (ocultar otras opciones de la misma Asignatura al elegir una)

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L81) (Línea 81)

```typescript
// Fragmento dentro de getAvailableForHour en DayColumn.tsx
if (selectedActivities.some(sa => sa.asignatura === act.asignatura)) return false;
```

---

### D. Detección y bloqueo de conflictos de horario

- **Archivo:** [`src/utils/time.ts`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/utils/time.ts#L140-L153) (Líneas 140 a 153)

```typescript
// Checks if two time ranges overlap
export function checkOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function hasConflict(scheduleA: ActivitySchedule[], scheduleB: ActivitySchedule[]): boolean {
  for (const sA of scheduleA) {
    for (const sB of scheduleB) {
      if (sA.day === sB.day && checkOverlap(sA.timeRange, sB.timeRange)) {
        return true;
      }
    }
  }
  return false;
}
```

---

### E. Guardado/recuperación en localStorage

- **Archivo:** [`src/utils/storage.ts`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/utils/storage.ts#L1-L49) (Líneas 1 a 49)

```typescript
export const SCHEMA_VERSION = 1;

interface VersionedPayload<T> {
  version: number;
  data: T;
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    // Formato anterior sin versión (o corrupto) → se descarta. NO se migra
    // automáticamente: preferimos perder el dato y regenerarlo (resubir CSV,
    // volver a marcar el checklist) a aceptar una forma que no podemos
    // verificar. Esto es intencional, no un descuido — no lo cambies sin
    // discutirlo primero.
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('data' in parsed)) {
      console.warn(`[storage] "${key}" sin versión de esquema, se descarta.`);
      return fallback;
    }

    const versioned = parsed as VersionedPayload<T>;
    if (versioned.version !== SCHEMA_VERSION) {
      console.warn(`[storage] "${key}" con esquema desactualizado (v${versioned.version} ≠ v${SCHEMA_VERSION}), se descarta.`);
      return fallback;
    }

    // Si esperamos un array (el fallback lo es) pero lo guardado no lo es,
    // los datos están corruptos o fueron editados a mano — se descartan en
    // vez de dejar que el resto de la app truene al intentar usar .map()/.filter().
    if (Array.isArray(fallback) && !Array.isArray(versioned.data)) {
      console.warn(`[storage] "${key}" con forma inesperada (se esperaba un array), se descarta.`);
      return fallback;
    }

    return versioned.data;
  } catch (e) {
    console.error(`[storage] Error al leer "${key}" de localStorage`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  const payload: VersionedPayload<T> = { version: SCHEMA_VERSION, data };
  localStorage.setItem(key, JSON.stringify(payload));
}
```

---

## 6. Cambios respecto al plan original

- **Sustitución de Checkboxes Nativos por Tarjetas e Insumos Visuales Seleccionables (`PrerequisiteChecklist.tsx` / `ExcelSheetDialog.tsx`):** Se eliminaron los `<input type="checkbox">` nativos del navegador. En `PrerequisiteChecklist.tsx`, cada asignatura es una tarjeta interactiva con resalte en azul primario (`bg-[var(--color-primary-light)]`, `border-[var(--color-primary)]`), mientras que la acción masiva por semestre en la cabecera utiliza un **toggle switch estilo pill** deslizable. En `ExcelSheetDialog.tsx`, las hojas de Excel se seleccionan mediante filas interactivas tipo tarjeta con acento de borde lateral.
- **Creación y Edición de Materias/Eventos Personalizados (`ManualActivityFormModal.tsx` / `manualActivities.ts`):** Incorporación de un modal con formulario dedicado para agregar o modificar asignaturas y eventos personalizados manualmente en la agenda con selección de horario por día, profesor, sala, créditos y asignación de color.
- **Renombrado y Marca Oficial ("Horario Interactivo"):** Actualización del título y branding general del sistema a "Horario Interactivo" en `index.html`, Header principal, `TourOrchestrator` y exportadores.
- **Ajuste Fino de Elevación Hover y Posicionamiento Portaled (`ActivityCard.tsx` / `DayColumn.tsx`):** Unificación de la elevación z-index de tarjetas a `z-[60]` (`has-[.active-card]:z-[60]`). Tooltips y popovers de color se renderizan mediante portales (`React.createPortal`) fuera del flujo CSS con cálculo dinámico para abrir hacia arriba si el espacio inferior es reducido.
- **Gestión Accesible de Cierre de Menú de Celdas (`Calendar.tsx` / `DayColumn.tsx`):** Elevación del estado `activeCell` a `Calendar.tsx` con backdrop transparente (`fixed inset-0 z-[60]`) que intercepta cualquier toque externo para cerrar desplegables sin activar celdas no deseadas, botón `X` de cierre y soporte para tecla `Escape`.
- **Botón Flotante de Acción Rápida (FAB) con Detección de Scroll (`App.tsx`):** Integración de un botón flotante desplegable para abrir `SubjectSelectionModal` que colapsa al deslizar hacia abajo y se expande al deslizar hacia arriba.
- **Exportación a PDF Nativa y Vectorial en 2 Páginas (`exportToPDF`):** Descarga directa de PDF en formato A4 landscape. Utiliza `.exporting-mode` para captura a 2x resolución (Página 1) y genera una tabla vectorial estilizada usando `jspdf-autotable` (Página 2) con totales y separadores visuales.
- **Exportación a Calendario iCalendar (`.ics`):** Módulo de generación de archivos de calendario `.ics` (`exportToICS` / `generateICSContent`) con eventos recurrentes semanales (`RRULE:FREQ=WEEKLY`), UIDs únicos y descripción estructurada.
- **Modo de Impresión Nativo (`window.print()`):** Opción "Imprimir" en `ExportDropdown.tsx` con reglas `@media print` dedicadas en `index.css`: `@page { margin: 5mm; size: landscape; }`, anulación de `height: 100vh` y `overflow: hidden`, e higiene de márgenes.
- **Captura Visual Limpia sin Truncamiento (`.exporting-mode`):** Reglas CSS que anulan `truncate` transformándolo en `white-space: normal !important` durante la captura de pantalla para PNG y PDF página 1, ocultando activadores de edición y botones de eliminación.
- **Pipeline de Mapeo Continuo para Excel Multilámina (`pendingSheetQueue`):** Encolado automático de hojas pendientes que requieren mapeo interactivo de columnas en `pendingSheetQueue` con subtítulo `"Hoja: NombreHoja"`.
- **Mapeo dinámico e interactivo de columnas CSV (`ColumnMappingDialog.tsx`):** Detección interactiva de columnas no estándar con persistencia de firmas en `localStorage` usando `@radix-ui/react-select` animado.
- **Inferencia automática de créditos entre filas (`csv.ts`):** Propagación automática de créditos conocidos entre filas de una misma asignatura cuando alguna fila viene vacía.
- **Sustitución de modales y avisos nativos por `<ConfirmDialog />`:** Sustitución de `window.confirm` por un modal con variantes de peligro, advertencia e información.
- **Búsqueda Multi-campo en Lista Rápida (`SubjectSelectionModal.tsx`):** Búsqueda por grupo, sala, profesor y horario formateado en texto.
- **Control global del toggle de prerrequisitos (`showAntecedentes`):** Interruptor global `ON`/`OFF` para activar/desactivar la validación de prerrequisitos.
- **Optimizaciones de Bundle Splitting en Vite (`vite.config.ts`):** Separación de chunks diferidos (`vendor-xlsx`, `vendor-pdf`) e importación perezosa (`React.lazy`) de modales.

---

## 7. Pendientes / incompleto

- **Comentarios TODO / FIXME en el código:** No existen comentarios `TODO` o `FIXME` pendientes en el código fuente actual.
- **Estado de cobertura funcional:** Todas las características esenciales (carga de CSV/Excel, adición/edición manual de materias, mapeo interactivo por hoja, tutorial guiado paso a paso, calendario 7-21h, filtrado por celda, prevención de conflictos, prerrequisitos con switch pill, exportación a PDF directo en 2 páginas, impresión nativa `window.print()`, PNG limpio, Excel `.xlsx`, `.ics` iCalendar, CSV en UTF-8 con BOM y persistencia en `localStorage`) se encuentran 100% completadas y operativas.
- **Próximas funciones a implementar / extensiones:**
  - Algoritmos de generación automática de combinaciones sin traslapes (planificador automático).

---

## 8. Cómo correr el proyecto

### Instalación de dependencias

```powershell
npm install
```

### Iniciar servidor de desarrollo (puerto 3000)

```powershell
npm run dev
```

### Verificación estática de tipos (TypeScript Lint)

```powershell
npm run lint
```

### Compilar para producción

```powershell
npm run build
```

### Previsualizar build de producción

```powershell
npm run preview
```

### Ejecutar scripts de pruebas funcionales / integración y análisis (Runtime)

```powershell
npx tsx scratch/test_ics.ts
node scratch/test_real_ics.mjs
node scratch/test_ui_flow.mjs
node scratch/test_http_and_html.mjs
node scratch/test_creditos_fallback.mjs
node scratch/test_uploader_accessibility.mjs
node scratch/test_excel.mjs
node scratch/test_matrix_excel.mjs
node scratch/test_pdf_export_flow.mjs
node scratch/test_manual_activities.mjs
node scratch/verify_components.mjs
node scratch/test-export.mjs
node scratch/analyze_report.mjs
```
