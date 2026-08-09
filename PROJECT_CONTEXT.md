# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria e interactiva para planificar y optimizar horarios académicos universitarios. Permite cargar ofertas en CSV o Excel (`.xlsx`), seleccionar asignaturas/grupos en una grilla semanal deslizable con horas fijas (7:00 a 21:00), prevenir traslapes/conflictos de horario, gestionar prerrequisitos (con un switch `ON`/`OFF`), recorrer un tutorial guiado e interactivo por etapas, alternar temas y exportar el horario en múltiples formatos: PDF (impresión nativa), Excel estilizado (`.xlsx` multilámina), CSV en UTF-8 con BOM y gráfico PNG.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`) con split manual de chunks (`vendor-xlsx` y `@radix-ui`)
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con tokens CSS en `:root` y `.dark`
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7`
  - **Animaciones UI / Motion:** `motion@^12.23.24` (importado desde `motion/react`)
  - **Librerías clave:** `papaparse@^5.5.4` (CSV), `xlsx-js-style@^1.2.0` (Excel matricial estilizado), `html-to-image@^1.11.13` (PNG Export), `lucide-react@^0.546.0` (Iconos), `clsx@^2.1.1` y `tailwind-merge@^3.6.0`

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
│   ├── test_matrix_excel.mjs       # Prueba de generación de Excel matricial multilámina con xlsx-js-style.
│   ├── test_pdf_export_flow.mjs    # Prueba de integración del flujo de impresión y exportación a PDF.
│   ├── test_ui_flow.mjs            # Verificación de integración de componentes UI.
│   └── test_uploader_accessibility.mjs # Prueba estática de accesibilidad en el componente Uploader.
├── src/                            # Código fuente de la aplicación.
│   ├── App.tsx                     # Componente principal: estado global, persistencia, modales, theme toggle y layout general.
│   ├── main.tsx                    # Punto de entrada React que monta App en el DOM.
│   ├── index.css                   # Importación de Tailwind v4, variables CSS custom y reglas de impresión (@media print).
│   ├── types.ts                    # Interfaces de TypeScript (`Activity`, `ActivitySchedule`, `TimeRange`, `LoadedFile`, `DayOfWeek`).
│   ├── components/                 # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx        # Tarjeta visual para clases agendadas (horario, profesor, tooltip y color picker).
│   │   ├── Calendar.tsx            # Grilla principal del calendario semanal (cabecera de días y columna de horas).
│   │   ├── ColumnMappingDialog.tsx # Modal accesible para mapear columnas CSV no reconocidas (Radix Select + Motion).
│   │   ├── ConfirmDialog.tsx       # Modal de confirmación estilizado para reemplazar alertas nativas de navegador.
│   │   ├── DayColumn.tsx           # Columna diaria: renderiza celdas de hora, dropdown de opciones y tarjetas agendadas.
│   │   ├── ExcelSheetDialog.tsx    # Diálogo interactivo para seleccionar hojas de libros Excel (.xlsx).
│   │   ├── ExportDropdown.tsx      # Menú desplegable en el Header para elegir formato de exportación (PDF, Excel, CSV, PNG).
│   │   ├── PdfExportDialog.tsx     # Modal guía de recomendación y disparador de la ventana de impresión nativa (window.print()).
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
│       ├── dummy.ts                # Stub de módulo para resolver alias en Vite/Rollup (fs.writeFileSync).
│       ├── excel.ts                # Helper lazy-loaded (xlsx) para convertir hojas de Excel a formato CSV.
│       ├── export.ts               # Generador de reportes estilizados en Excel (.xlsx con xlsx-js-style) y CSV en UTF-8 con BOM.
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

- **`src/App.tsx`**: Administra el estado global (actividades disponibles/seleccionadas, archivos cargados, materias completadas, banderas de configuración, control del drawer móvil), sincronización en `localStorage`, exportación PNG/PDF y layout general.
- **`src/components/Calendar.tsx`**: Contenedor visual del calendario con columna fija de horas (7:00 a 21:00) y grilla de días.
- **`src/components/DayColumn.tsx`**: Renderiza las celdas horarias de un día específico, gestiona el desplegable de opciones disponibles por celda y la posición absoluta de materias seleccionadas con elevación por `:has(.active-card)`.
- **`src/components/ActivityCard.tsx`**: Tarjeta gráfica de cada materia agendada; calcula colores Neón/Glassmorphism, tooltips informativos, popover portaled para cambiar color y adaptación para impresión (`break-words` y `print-truncate-none`).
- **`src/components/SubjectSelectionModal.tsx`**: Modal de "Selección Rápida" con buscador multi-campo (materia, profesor, grupo, sala, horario) para agregar/remover asignaturas en masa.
- **`src/components/PrerequisiteChecklist.tsx`**: Modal emergente con acordeón por semestre para marcar materias aprobadas de la malla curricular y gestionar el avance.
- **`src/components/ColumnMappingDialog.tsx`**: Modal cargado dinámicamente que permite al usuario asociar manualmente las columnas de un CSV no reconocido.
- **`src/components/ExcelSheetDialog.tsx`**: Diálogo para seleccionar qué hojas de un archivo `.xlsx` importar al sistema.
- **`src/components/ExportDropdown.tsx`**: Menú desplegable en el Header que centraliza la descarga del horario en PDF, Excel (.xlsx), CSV y PNG.
- **`src/components/PdfExportDialog.tsx`**: Modal con instrucciones y recomendaciones de orientación gráfica previo a abrir la ventana de impresión nativa (`window.print()`).
- **`src/components/ConfirmDialog.tsx`**: Componente modal de confirmación con variantes visuales que reemplaza `window.confirm`.
- **`src/components/TourOrchestrator.tsx`**: Orquesta el tutorial paso a paso por etapas ("welcome", "loaded", "color"), gestiona la apertura/cierre automático del drawer móvil en pantallas pequeñas y oculta pausadamente el spotlight cuando `anyModalOpen` es verdadero.
- **`src/components/TourSpotlight.tsx`**: Renderiza la máscara visual del tutorial (hueco con anillo `--color-primary`, sombra responsiva según tema claro/oscuro) y adjunta un event listener al elemento real del DOM para avanzar de paso manteniendo la interacción original.
- **`src/components/Uploader.tsx`**: Maneja la carga drag-and-drop o por selección de archivos CSV/Excel y coordina la verificación de columnas.
- **`src/utils/export.ts`**: Lógica de generación de libros Excel estilizados (`xlsx-js-style`) con 3 pestañas (Materias, Calendario Matriz, Lista de Sesiones) y descargas CSV UTF-8 con BOM.
- **`src/utils/dummy.ts`**: Stub de módulo para la resolución de alias en Vite/Rollup (`fs.writeFileSync`).
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

- **Bloqueo e inhabilitación en la UI:**
  - **En el desplegable de celda ([`DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L185-L199)):**
    ```typescript
    const selectedSchedules = selectedActivities.flatMap(sa => sa.schedules);
    const isConflict = hasConflict(act.schedules, selectedSchedules);
    ...
    onClick={() => {
      if (isConflict || isApproved) return;
      onSelectActivity(act);
      setActiveHour(null);
    }}
    ```
  - **En el modal de selección rápida ([`SubjectSelectionModal.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/SubjectSelectionModal.tsx#L130-L140)):**
    ```typescript
    const isConflicting = !isSelected && !isCompletada && hasConflict(activity.schedules, allSelectedSchedules);
    const isDisabled = isConflicting || isCompletada;
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

- **Efectos de sincronización continua:** [`src/App.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/App.tsx#L108-L144) (Líneas 108 a 144)

```typescript
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
```

---

## 6. Cambios respecto al plan original

- **Mapeo dinámico e interactivo de columnas CSV (`ColumnMappingDialog.tsx`):** En lugar de rechazar archivos con nombres de columnas no estándar, el sistema detecta diferencias, almacena una firma/fingerprint de encabezados en `localStorage` y muestra un modal interactivo usando `@radix-ui/react-select` animado con Motion.
- **Inferencia automática de créditos entre filas (`csv.ts`):** Si un CSV incluye la columna de créditos vacía en algunas filas pero con valor en otra fila de la misma asignatura, el sistema propaga automáticamente los créditos conocidos.
- **Sustitución de modales y avisos nativos por `<ConfirmDialog />`:** `window.confirm` se reemplazó por un modal visualmente coherente con animaciones de entrada/salida y variantes de peligro, advertencia e información.
- **Búsqueda Multi-campo en Lista Rápida (`SubjectSelectionModal.tsx`):** Se amplió el filtro de búsqueda para permitir consultar por grupo (soporta "A" o "Grupo A"), sala y horarios semanales formateados en texto.
- **Control global del toggle de prerrequisitos (`showAntecedentes`):** Permite desactivar (`OFF`) la validación de prerrequisitos para ocultar advertencias y permitir seleccionar asignaturas ya aprobadas sin atenuación ni bloqueos.
- **Optimizaciones de Bundle Splitting en Vite (`vite.config.ts`):** La librería `xlsx` se separó en un chunk diferido (`vendor-xlsx`) y `ColumnMappingDialog` se importa de forma perezosa (`React.lazy` + `Suspense`) para agilizar la carga inicial.
- **Exportación Estilizada y Matricial (Excel `.xlsx` y `.csv`) (`ExportDropdown.tsx` / `export.ts`):** Menú desplegable en el Header para descargar el horario como archivo CSV en UTF-8 con BOM (`\ufeff`) para compatibilidad en Windows, o como un **libro de Excel estilizado (usando `xlsx-js-style`)** con 3 pestañas: *Materias Inscritas*, *Calendario Semanal* (matriz visual con celdas combinadas y colores dinámicos pastel) y *Lista de Sesiones*.
- **Prevención de Asignaturas Duplicadas (`SubjectSelectionModal.tsx` / `DayColumn.tsx`):** Al seleccionar un grupo de una asignatura, los demás grupos de la misma materia en horarios no empalmados se inhabilitan automáticamente mostrando la leyenda *"Ya seleccionada"*, impidiendo inscribir la misma clase en múltiples grupos.
- **Resolución de Interop CommonJS/ESM en Vite (`export.ts` / `vite.config.ts`):** Para mantener compatibilidad estricta con la build de producción de Vite, la librería de Excel se importa dinámicamente forzando la extracción desde `.default` en caso de empaquetamiento Rollup. Asimismo, se inyectan alias a un módulo `dummy.ts` (sin mock de `fs.writeFileSync`) para suprimir advertencias del navegador sin romper el fallback a descargas de tipo Blob en el cliente web.
- **Exportación a PDF / Impresión Nativa Optimizada (`ExportDropdown.tsx` / `index.css` / `App.tsx`):** Implementación de exportación a PDF mediante `window.print()`. Incluye reglas completas en `@media print` para ocultar la interfaz web (sidebar, botones, modal), separar el horario y el resumen de asignaturas en páginas distintas, desactivar posicionamiento `sticky` para evitar solapamientos, adaptar el calendario al ancho de la hoja (impidiendo paginación horizontal), eliminar leyendas/pies de página predeterminados del navegador con `@page { margin: 0 }`, y aplicar ajuste de texto (`break-words`) con escalado de fuente en las tarjetas de materia.
- **Gestión de Capas e Interacción Móvil con CSS `:has()` (`DayColumn.tsx` / `ActivityCard.tsx`):** Corrección de solapamiento de profundidad (`z-index`) en dispositivos móviles. Al interactuar o mantener seleccionada una materia para ver su tooltip de detalles o selector de color, la pseudo-clase CSS `has-[.active-card]:z-[100]` eleva el `z-index` del contenedor padre a 100, garantizando que la tarjeta activa flote por encima de cualquier otro bloque.
- **Sistema de Tutorial Guiado e Interactivo (`TourOrchestrator.tsx` / `TourSpotlight.tsx` / `tourStorage.ts`):**
  - Implementación de un tutorial guiado en 3 etapas secuenciales (`welcome`, `loaded`, `color`).
  - Detección de visibilidad en el viewport real (`getVisibleTarget`), filtrando elementos fuera de pantalla.
  - Apertura automática del drawer lateral en dispositivos móviles/tablets al llegar al paso de prerrequisitos (`prereq-toggle`) con retardo ajustado a la transición CSS de 300ms, y cierre limpio al avanzar/saltar el paso.
  - Pausa continua del spotlight cuando hay algún modal abierto (`anyModalOpen === true`) y re-resolución dinámica del target al cerrar los modales.
  - Integración de event listeners directos en los elementos reales del DOM para avanzar el paso al hacer clic mientras se ejecuta la acción original de la app.
  - Sombra responsiva de doble anillo en el spotlight (anillo de 2px `var(--color-primary)` + sombra difusa con opacidad adapada a modo claro `0.3` y modo oscuro `0.55`).

---

## 7. Pendientes / incompleto

- **Comentarios TODO / FIXME en el código:** No existen comentarios `TODO` o `FIXME` pendientes en el código fuente actual.
- **Estado de cobertura funcional:** Todas las características esenciales (carga de CSV/Excel, mapeo interactivo, tutorial guiado paso a paso, calendario 7-21h, filtrado por celda, fusión visual de bloques contiguos, prevención de conflictos, prerrequisitos, exportación a PDF/PNG/XLSX/CSV y persistencia en `localStorage`) se encuentran completamente implementadas y operativas.
- **Próximas funciones a implementar / extensiones:**
  - Implementación de algoritmos de generación automática de combinaciones sin traslapes (planificador automático).
  - Soporte para exportación/sincronización de eventos en formato iCalendar (`.ics`).

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

Las mejoas y correcciones desarrolladas que compilan limpiamente en desarrollo pero están pendientes de su próximo despliegue en producción:

- **Sistema de Tutorial Guiado e Interactivo (Tour Spotlights):**
  - `TourOrchestrator.tsx`, `TourSpotlight.tsx` & `tourStorage.ts`: Orquestador de 3 etapas (`welcome`, `loaded`, `color`), persistencia en `localStorage`, integración de event listeners en elementos del DOM real, overlay con sombra responsiva según el tema (0.3 / 0.55), apertura automática de drawer en pantallas táctiles y pausa mientras existan modales abiertos (`anyModalOpen`).
- **Módulo de Exportación a PDF e Impresión Nativa:**
  - `PdfExportDialog.tsx` & `ExportDropdown.tsx`: Modal guía interactivo con indicación de orientación (Horizontal/Vertical) e integración con `window.print()`.
  - Reglas de impresión `@media print` en `index.css`: Ocultamiento de la UI (sidebar, header, botones, modales, toasts), separación estricta del calendario y la lista de asignaturas inscritas en páginas independientes, desactivación de posiciones `sticky` para evitar duplicación de horas/días, supresión de leyendas/fechas/URL predeterminadas del navegador mediante `@page { margin: 0 }` y ajuste de padding a 2mm.
  - Formateo de tarjetas en PDF (`ActivityCard.tsx`): Ajuste de texto con `break-words` y `print-truncate-none` para desplegar nombres completos de materias, reducción de fuente a 8px y conservación de sala y docente.
- **Ajuste Responsivo del Header Móvil (`App.tsx`):**
  - Incorporación de `min-w-0` y comportamiento `truncate` inteligente en la barra superior para garantizar que el botón de exportación permanezca 100% visible en pantallas estrechas sin desbordamientos.
- **Gestión de Capas e Interacción Móvil con CSS `:has()` (`DayColumn.tsx` / `ActivityCard.tsx`):**
  - Aplicación de `.active-card` al abrir tooltips de detalle o selectores de color, combinada con la regla `has-[.active-card]:z-[100]` en el contenedor absoluto para asegurar que la tarjeta activa flote por encima de cualquier bloque adyacente en dispositivos táctiles.
- **Scripts de Prueba y Verificación (`scratch/`):**
  - `scratch/test_pdf_export_flow.mjs`: Script de verificación funcional para simular la estructura de datos y el flujo de exportación PDF.
