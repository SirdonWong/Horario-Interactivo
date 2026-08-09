# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria e interactiva para planificar y optimizar horarios académicos universitarios. Permite cargar ofertas en CSV o Excel (`.xlsx`), seleccionar asignaturas/grupos en una grilla semanal deslizable con horas fijas (7:00 a 21:00), prevenir traslapes/conflictos de horario, gestionar prerrequisitos (con un switch `ON`/`OFF`), recorrer un tutorial guiado e interactivo por etapas, alternar temas y exportar el horario en múltiples formatos: PDF de 2 páginas (página 1: captura del calendario a resolución 2x; página 2: tabla vectorial con `jspdf-autotable`), impresión nativa (`window.print()`), Excel estilizado (`.xlsx` multilámina), iCalendar (`.ics`), CSV en UTF-8 con BOM y gráfico PNG.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`) con split manual de chunks (`vendor-xlsx`, `vendor-pdf` para `jspdf` + `html-to-image`, y `@radix-ui`)
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con tokens CSS en `:root` y `.dark`
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7`
  - **Animaciones UI / Motion:** `motion@^12.23.24` (importado desde `motion/react`)
  - **Librerías clave:** `papaparse@^5.5.4` (CSV), `xlsx-js-style@^1.2.0` (Excel matricial estilizado), `jspdf@^4.2.1` + `jspdf-autotable@^5.0.8` (PDF vectorial), `html-to-image@^1.11.13` (PNG/PDF Export), `lucide-react@^0.546.0` (Iconos), `clsx@^2.1.1` y `tailwind-merge@^3.6.0`

---

## 2. Estructura de archivos

```text
Horario-Académico/
├── .agents/                        # Reglas personalizadas del proyecto para agentes de IA.
│   └── AGENTS.md                   # Reglas globales de desarrollo, terminal y protocolo de verificación.
├── .gitignore                      # Archivos y carpetas excluidos del control de versiones.
├── DESIGN.md                       # Especificación del sistema de diseño (tokens de color, tipografía y temas).
├── PRODUCT.md                      # Definición de producto, propuesta de valor y visión del usuario.
├── PROJECT_CONTEXT.md              # Este archivo: documentación técnica completa del estado actual.
├── README.md                       # Guía pública de uso e información del proyecto.
├── index.html                      # Plantilla HTML base y punto de entrada para Vite.
├── package.json                    # Dependencias, scripts de construcción y metadatos del proyecto.
├── tsconfig.json                   # Configuración del compilador de TypeScript.
├── vite.config.ts                  # Configuración de Vite (alias, servidor dev en puerto 3000 y chunk splitting).
├── scratch/                        # Scripts de verificación y pruebas funcionales de runtime.
│   ├── test_creditos_fallback.mjs  # Prueba de inferencia de créditos entre filas.
│   ├── test_excel.mjs              # Prueba de parseo y conversión de libros Excel (.xlsx).
│   ├── test_http_and_html.mjs      # Prueba de conectividad HTTP en servidor local.
│   ├── test_ics.ts                 # Prueba de generación de eventos iCalendar (.ics) y formato de descripción.
│   ├── test_matrix_excel.mjs       # Prueba de generación de Excel matricial multilámina con xlsx-js-style.
│   ├── test_pdf_export_flow.mjs    # Prueba de integración del flujo de impresión y exportación a PDF.
│   ├── test_ui_flow.mjs            # Verificación de integración de componentes UI.
│   └── test_uploader_accessibility.mjs # Prueba estática de accesibilidad en el componente Uploader.
├── src/                            # Código fuente de la aplicación.
│   ├── App.tsx                     # Componente principal: estado global, persistencia, cola de hojas Excel, modales, theme toggle y layout.
│   ├── main.tsx                    # Punto de entrada React que monta App en el DOM.
│   ├── index.css                   # Importación de Tailwind v4, variables CSS custom, .exporting-mode y reglas de impresión (@media print).
│   ├── types.ts                    # Interfaces de TypeScript (`Activity`, `ActivitySchedule`, `TimeRange`, `LoadedFile`, `DayOfWeek`).
│   ├── components/                 # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx        # Tarjeta visual para clases agendadas (horario, profesor, tooltip, color picker y modo exportación).
│   │   ├── Calendar.tsx            # Grilla principal del calendario semanal (cabecera de días y columna de horas).
│   │   ├── ColumnMappingDialog.tsx # Modal accesible para mapear columnas CSV no reconocidas o de hojas de Excel (Radix Select + Motion).
│   │   ├── ConfirmDialog.tsx       # Modal de confirmación estilizado para reemplazar alertas nativas de navegador.
│   │   ├── DayColumn.tsx           # Columna diaria: renderiza celdas de hora, dropdown de opciones y tarjetas agendadas.
│   │   ├── ExcelSheetDialog.tsx    # Diálogo interactivo para seleccionar qué hojas de un libro Excel (.xlsx) importar.
│   │   ├── ExportDropdown.tsx      # Menú desplegable en el Header para elegir formato de exportación (PDF, Imprimir, PNG, Excel, ICS, CSV).
│   │   ├── PrerequisiteChecklist.tsx # Modal de gestión de materias aprobadas con acordeón por semestre y buscador.
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": buscador multi-campo para agregar asignaturas en masa.
│   │   ├── TourOrchestrator.tsx    # Orquestador del tutorial guiado (secuencia de etapas, re-resolución de targets y control responsivo del drawer).
│   │   ├── TourSpotlight.tsx       # Overlay del spotlight (hueco con anillo de color, sombra gigante para tema claro/oscuro y listener en el elemento real).
│   │   └── Uploader.tsx            # Componente para cargar archivos CSV/Excel con detección de columnas y feedback.
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
  id: string;             // Formato: Asignatura + "-" + Grupo
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

- **`src/App.tsx`**: Administra el estado global (actividades disponibles/seleccionadas, archivos cargados, materias completadas, banderas de configuración, cola de hojas pendientes de Excel `pendingSheetQueue`), sincronización en `localStorage`, exportaciones (PNG, PDF, ICS, CSV, Excel) e integración del layout.
- **`src/components/Calendar.tsx`**: Contenedor visual del calendario con columna fija de horas (7:00 a 21:00) y grilla de días.
- **`src/components/DayColumn.tsx`**: Renderiza las celdas horarias de un día específico, gestiona el desplegable de opciones disponibles por celda y la posición absoluta de materias seleccionadas con elevación por `:has(.active-card)`.
- **`src/components/ActivityCard.tsx`**: Tarjeta gráfica de cada materia agendada; calcula colores Neón/Glassmorphism, tooltips informativos, popover portaled para cambiar color y adaptación para exportación e impresión (`overflow-hidden`, `print:whitespace-normal`).
- **`src/components/SubjectSelectionModal.tsx`**: Modal de "Selección Rápida" con buscador multi-campo (materia, profesor, grupo, sala, horario) para agregar/remover asignaturas en masa.
- **`src/components/PrerequisiteChecklist.tsx`**: Modal emergente con acordeón por semestre para marcar materias aprobadas de la malla curricular y gestionar el avance.
- **`src/components/ColumnMappingDialog.tsx`**: Modal cargado dinámicamente que permite al usuario asociar manualmente las columnas de un CSV no reconocido o de hojas de Excel (muestra subtítulo `"Hoja: NombreHoja"` cuando aplica).
- **`src/components/ExcelSheetDialog.tsx`**: Diálogo para seleccionar qué hojas de un archivo `.xlsx` importar al sistema.
- **`src/components/ExportDropdown.tsx`**: Menú desplegable en el Header que centraliza la descarga del horario en PDF (`jsPDF`), Imprimir (`window.print()`), PNG (`html-to-image`), Excel (`.xlsx`), Calendario (`.ics`), CSV Materias y CSV Agenda.
- **`src/components/ConfirmDialog.tsx`**: Componente modal de confirmación con variantes visuales que reemplaza `window.confirm`.
- **`src/components/TourOrchestrator.tsx`**: Orquesta el tutorial paso a paso por etapas ("welcome", "loaded", "color"), gestiona la apertura/cierre automático del drawer móvil en pantallas pequeñas y oculta pausadamente el spotlight cuando `anyModalOpen` es verdadero.
- **`src/components/TourSpotlight.tsx`**: Renderiza la máscara visual del tutorial (hueco con anillo `--color-primary`, sombra responsiva según tema claro/oscuro) y adjunta un event listener al elemento real del DOM para avanzar de paso manteniendo la interacción original.
- **`src/components/Uploader.tsx`**: Maneja la carga drag-and-drop o por selección de archivos CSV/Excel y coordina la verificación de columnas.
- **`src/utils/export.ts`**: Lógica de exportación multiformato:
  - **`exportToPDF`**: Descarga directa de PDF en 2 páginas A4 landscape (`jsPDF` + `jspdf-autotable` + `html-to-image`).
  - **`exportToICS` / `generateICSContent`**: Generador de archivos de calendario `.ics` compatibles con Google Calendar, Apple Calendar y Outlook.
  - **`exportToExcel`**: Generador de libros Excel estilizados (`xlsx-js-style`) con 3 pestañas (*Materias Inscritas*, *Calendario Semanal* y *Lista de Sesiones*).
  - **`exportToCSV`**: Exportación en formato CSV UTF-8 con BOM.
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

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L92-L105) (Líneas 92 a 105)

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

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L216-L245) (Líneas 216 a 245)

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
              className="absolute left-0 right-0 z-10 hover:z-[60] focus-within:z-[60] has-[.active-card]:z-[100] px-1"
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

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L102) (Línea 102)

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

    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('data' in parsed)) {
      console.warn(`[storage] "${key}" sin versión de esquema, se descarta.`);
      return fallback;
    }

    const versioned = parsed as VersionedPayload<T>;
    if (versioned.version !== SCHEMA_VERSION) {
      console.warn(`[storage] "${key}" con esquema desactualizado (v${versioned.version} ≠ v${SCHEMA_VERSION}), se descarta.`);
      return fallback;
    }

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

- **Gestión Accesible de Cierre de Menú de Celdas (`Calendar.tsx` / `DayColumn.tsx`):** Elevación del estado `activeCell` (`{ day: DayOfWeek; hour: number } | null`) a `Calendar.tsx`. Al desplegar un menú, se activa un backdrop transparente (`fixed inset-0 z-[60]`) que intercepta cualquier toque en el mapa/grilla para desarmar el menú activo sin abrir celdas no deseadas. Incorpora además un botón `X` de cierre en la cabecera del desplegable y soporte para la tecla `Escape`.
- **Exportación a PDF Nativa y Vectorial en 2 Páginas (`exportToPDF`):** Implementación de descarga directa de PDF en formato A4 landscape. Utiliza la clase `.exporting-mode` para tomar una captura limpia del calendario a 2x resolución (Página 1) sin truncar nombres de materias y ocultando controles de edición, y genera una tabla vectorial estilizada usando `jspdf-autotable` (Página 2) con indicador de totales (**36** Créditos Totales **6** Materias) y línea divisoria superior.
- **Exportación a Calendario iCalendar (`.ics`):** Módulo de generación de archivos de calendario `.ics` (`exportToICS` / `generateICSContent`). Crea eventos recurrentes semanales (`RRULE:FREQ=WEEKLY`), UIDs únicos, horarios `DTSTART`/`DTEND` locales y descripción unificada en una sola línea (`Modalidad | Grupo | Créditos | Profesor | Sala`).
- **Modo de Impresión Nativo (`window.print()`):** Opción "Imprimir" en `ExportDropdown.tsx` con reglas `@media print` dedicadas en `index.css`: `@page { margin: 5mm; size: landscape; }`, anulación de `height: 100vh` y `overflow: hidden` en `#root`, `print-app-root` y `print-main-wrapper` para evitar recortar la segunda página, forzado de `min-width: 720px` para vista móvil, y eliminación de paddings en la grilla para maximizar el área imprimible de la hoja 1.
- **Captura Visual Limpia sin Truncamiento (`.exporting-mode`):** Reglas CSS que se aplican temporalmente durante la captura con `html-to-image` (para PNG y PDF página 1). Anula `truncate` transformándolo en `white-space: normal !important` para envolver títulos largos de materias dentro del bloque, y oculta automáticamente los activadores de color (`[data-tour="color-picker-trigger"]`) y los botones de eliminar (`X`).
- **Pipeline de Mapeo Continuo para Excel Multilámina (`pendingSheetQueue`):** Al cargar archivos Excel `.xlsx` con múltiples hojas que requieren mapeo interactivo de columnas, el sistema encola las hojas restantes en el estado `pendingSheetQueue`, inyecta el subtítulo `"Hoja: NombreHoja"` en `ColumnMappingDialog` y reanuda secuencialmente el procesamiento para cada hoja sin descartar material pendiente.
- **Mapeo dinámico e interactivo de columnas CSV (`ColumnMappingDialog.tsx`):** En lugar de rechazar archivos con nombres de columnas no estándar, el sistema detecta diferencias, almacena una firma/fingerprint de encabezados en `localStorage` y muestra un modal interactivo usando `@radix-ui/react-select` animado con Motion.
- **Inferencia automática de créditos entre filas (`csv.ts`):** Si un CSV incluye la columna de créditos vacía en algunas filas pero con valor en otra fila de la misma asignatura, el sistema propaga automáticamente los créditos conocidos.
- **Sustitución de modales y avisos nativos por `<ConfirmDialog />`:** `window.confirm` se reemplazó por un modal visualmente coherente con animaciones de entrada/salida y variantes de peligro, advertencia e información.
- **Búsqueda Multi-campo en Lista Rápida (`SubjectSelectionModal.tsx`):** Se amplió el filtro de búsqueda para permitir consultar por grupo (soporta "A" o "Grupo A"), sala y horarios semanales formateados en texto.
- **Control global del toggle de prerrequisitos (`showAntecedentes`):** Permite desactivar (`OFF`) la validación de prerrequisitos para ocultar advertencias y permitir seleccionar asignaturas ya aprobadas sin atenuación ni bloqueos.
- **Optimizaciones de Bundle Splitting en Vite (`vite.config.ts`):** Las librerías pesadas se separaron en chunks diferidos (`vendor-xlsx` para Excel y `vendor-pdf` para `jspdf` + `html-to-image`), mientras que `ColumnMappingDialog` se importa de forma perezosa (`React.lazy` + `Suspense`).
- **Exportación Estilizada y Matricial (Excel `.xlsx` y `.csv`) (`ExportDropdown.tsx` / `export.ts`):** Menú desplegable en el Header para descargar el horario como archivo CSV en UTF-8 con BOM (`\ufeff`) para compatibilidad en Windows, o como un libro de Excel estilizado (`xlsx-js-style`) con 3 pestañas (*Materias Inscritas*, *Calendario Semanal* y *Lista de Sesiones*).
- **Prevención de Asignaturas Duplicadas (`SubjectSelectionModal.tsx` / `DayColumn.tsx`):** Al seleccionar un grupo de una asignatura, los demás grupos de la misma materia en horarios no empalmados se inhabilitan automáticamente mostrando la leyenda *"Ya seleccionada"*.
- **Gestión de Capas e Interacción Móvil con CSS `:has()` (`DayColumn.tsx` / `ActivityCard.tsx`):** Corrección de solapamiento de profundidad (`z-index`) mediante `has-[.active-card]:z-[100]`.
- **Sistema de Tutorial Guiado e Interactivo (`TourOrchestrator.tsx` / `TourSpotlight.tsx` / `tourStorage.ts`):** Tutorial guiado en 3 etapas secuenciales (`welcome`, `loaded`, `color`), detección de elementos visibles y apertura responsiva del drawer.

---

## 7. Pendientes / incompleto

- **Comentarios TODO / FIXME en el código:** No existen comentarios `TODO` o `FIXME` pendientes en el código fuente actual.
- **Estado de cobertura funcional:** Todas las características esenciales (carga de CSV/Excel, mapeo interactivo de columnas por hoja, tutorial guiado paso a paso, calendario 7-21h, filtrado por celda, prevención de conflictos, prerrequisitos, exportación a PDF directo en 2 páginas, impresión nativa `window.print()`, PNG limpio, Excel `.xlsx`, `.ics` iCalendar, CSV en UTF-8 con BOM y persistencia en `localStorage`) se encuentran 100% completadas y operativas.
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

### Ejecutar scripts de pruebas funcionales / integración (Runtime)

```powershell
npx tsx scratch/test_ics.ts
node scratch/test_ui_flow.mjs
node scratch/test_http_and_html.mjs
node scratch/test_creditos_fallback.mjs
node scratch/test_uploader_accessibility.mjs
node scratch/test_excel.mjs
node scratch/test_matrix_excel.mjs
node scratch/test_pdf_export_flow.mjs
```

---

## 9. Elementos sin deploy

Las mejoras y correcciones desarrolladas que compilan limpiamente en desarrollo pero están pendientes de su próximo despliegue en producción:

- **Módulo de Exportación Directa a PDF Vectorial (`src/utils/export.ts`):**
  - Carga diferida de `jspdf`, `jspdf-autotable` y `html-to-image` en el chunk `vendor-pdf`.
  - Página 1: Captura gráfica a resolución 2x del calendario aprovechando `.exporting-mode` para desplegar títulos de materias completos sin `...` y ocultar botones de edición.
  - Página 2: Tabla vectorial nativa de materias inscritas con métricas formateadas en negrita y línea divisoria superior.
- **Módulo de Exportación a Calendario iCalendar (`.ics`):**
  - Generador de eventos semanales recurrentes con IDs únicos y descripción unificada en una sola línea.
- **Optimización de Impresión Nativa (`window.print()`):**
  - Reglas `@media print` en `index.css` que restablecen el flujo de bloque, eliminan bordes y sombras alrededor de la cuadrícula en la hoja 1, forzan salto de página en `.print-only-subjects` (hoja 2) y aplican márgenes de 5 mm.
- **Pipeline de Carga Excel Multilámina:**
  - Encolado de hojas de trabajo (`pendingSheetQueue`) y propagación del parámetro `sheetName` a los modales de mapeo.
- **Scripts de Prueba y Verificación (`scratch/`):**
  - `scratch/test_ics.ts`: Verificación funcional de la generación de archivos iCalendar `.ics`.
