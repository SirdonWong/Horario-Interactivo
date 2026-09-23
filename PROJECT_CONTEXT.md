# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web interactiva ("**Horario Interactivo**") para planificar y optimizar horarios universitarios a partir de ofertas en CSV o Excel (`.xlsx`, `.xls`) y materias personalizadas manuales. Permite seleccionar asignaturas en una grilla semanal deslizable (7:00 a 21:00), detectar traslapes de horario y agrupar visualmente actividades solapadas en bloques combinados, marcar sesiones asíncronas (con exención selectiva de conflictos frente a materias libres o personalizadas), validar prerrequisitos con switch global y acordeón semestral, y exportar la agenda en PDF vectorial de 2 páginas, impresión nativa (`window.print()`), Excel multilámina estilizado, iCalendar (`.ics`), imagen PNG y CSV con BOM.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`, `@vitejs/plugin-react@^5.0.4`) con chunk splitting manual (`vendor-xlsx`, `vendor-pdf` para `jspdf` + `html-to-image`, y `@radix-ui`), y `rollup-plugin-visualizer` para análisis de bundle (`scratch/bundle-report.html`).
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con tokens y variables CSS en `:root` y `.dark`.
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7`
  - **Animaciones UI / Motion:** Motion (`motion@^12.23.24`, importado desde `motion/react`)
  - **Librerías clave:** `papaparse@^5.5.4` (CSV), `xlsx-js-style@^1.2.0` (Excel matricial estilizado), `jspdf@^4.2.1` + `jspdf-autotable@^5.0.8` (PDF vectorial), `html-to-image@^1.11.13` (exportación PNG/PDF), `lucide-react@^0.546.0` (Iconos), `clsx@^2.1.1` y `tailwind-merge@^3.6.0`.

---

## 2. Estructura de archivos

```text
Horario-Académico/
├── .agents/                        # Reglas de proyecto para agentes de IA.
│   └── AGENTS.md                   # Reglas de desarrollo en Windows PowerShell, gestión de puertos y protocolo de verificación.
├── .env.local                      # Variables de entorno locales.
├── .gitignore                      # Archivos y carpetas excluidos de control de versiones.
├── DESIGN.md                       # Especificación del sistema de diseño (tokens de color, tipografía y temas).
├── PRODUCT.md                      # Definición de producto, propuesta de valor y visión del usuario.
├── PROJECT_CONTEXT.md              # Este archivo: documentación técnica integral del estado real del código.
├── README.md                       # Guía pública de uso e información del proyecto.
├── index.html                      # Plantilla HTML base y punto de entrada para Vite (Título: Horario Interactivo).
├── package.json                    # Dependencias, scripts de ejecución/construcción y metadatos.
├── tsconfig.json                   # Configuración del compilador de TypeScript.
├── vite.config.ts                  # Configuración de Vite (alias, servidor dev en puerto 3000, visualizer y chunk splitting).
├── scratch/                        # Scripts de verificación funcional en runtime y análisis del bundle.
│   ├── analyze_report.mjs          # Analizador de distribución de peso de paquetes en bundle-report.html.
│   ├── bundle-report.html          # Reporte gráfico interactivo generado por rollup-plugin-visualizer.
│   ├── parse_report.mjs            # Parser auxiliar de datos para reportes.
│   ├── test-export.mjs             # Prueba sintética de funciones de exportación de datos.
│   ├── test_async_conflict.mjs     # Prueba funcional de reglas de conflicto y exención de sesiones asíncronas.
│   ├── test_creditos_fallback.mjs  # Verificación de inferencia de créditos entre filas de la misma asignatura.
│   ├── test_excel.mjs              # Prueba de parseo y conversión de libros Excel (.xlsx).
│   ├── test_grouping.mjs           # Prueba unitaria del algoritmo DSU de agrupamiento de solapes horarios.
│   ├── test_http_and_html.mjs      # Prueba de conectividad HTTP en servidor local.
│   ├── test_ics.ts                 # Prueba de generación de eventos iCalendar (.ics).
│   ├── test_manual_activities.mjs  # Prueba de creación, edición y parseo de materias/eventos manuales.
│   ├── test_matrix_excel.mjs       # Prueba de generación de Excel matricial multilámina con xlsx-js-style.
│   ├── test_output.xlsx            # Archivo de salida generado durante pruebas de Excel.
│   ├── test_pdf_export_flow.mjs    # Prueba de integración del flujo de impresión y exportación a PDF.
│   ├── test_real_ics.mjs           # Prueba funcional con la lógica real de exportación a iCalendar.
│   ├── test_ui_flow.mjs            # Verificación de integración de componentes UI.
│   ├── test_uploader_accessibility.mjs # Prueba estática de accesibilidad en el componente Uploader.
│   └── verify_components.mjs       # Verificación de eliminación de checkboxes nativos y toggles en modales.
├── src/                            # Código fuente de la aplicación.
│   ├── App.tsx                     # Componente raíz: estado global, persistencia, FAB flotante, colas de hojas Excel, exportación y modales.
│   ├── main.tsx                    # Punto de entrada React que monta App en el DOM.
│   ├── index.css                   # Importación de Tailwind v4, variables CSS, .exporting-mode y reglas @media print.
│   ├── types.ts                    # Interfaces TypeScript (`Activity`, `ActivitySchedule`, `TimeRange`, `LoadedFile`, `DayOfWeek`).
│   ├── components/                 # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx        # Tarjeta visual de clase agendada (color picker, toggle asíncrono, tooltip y elevación hover).
│   │   ├── Calendar.tsx            # Grilla principal semanal (horas 7-21, backdrop para descarte de menú y delegación de eventos).
│   │   ├── ColumnMappingDialog.tsx # Modal dinámico accesible para mapear columnas no reconocidas (Radix Select + Motion).
│   │   ├── ConfirmDialog.tsx       # Diálogo modal de confirmación con variantes visuales que sustituye window.confirm.
│   │   ├── DayColumn.tsx           # Columna diaria: celdas horarias, dropdown de opciones y agrupación visual de solapes en bloques.
│   │   ├── ExcelSheetDialog.tsx    # Diálogo interactivo tipo tarjeta para elegir qué hojas de un .xlsx importar.
│   │   ├── ExportDropdown.tsx      # Menú desplegable del Header para exportar en PDF, Imprimir, PNG, Excel, ICS o CSV.
│   │   ├── ManualActivityFormModal.tsx # Formulario modal para crear y editar asignaturas/eventos personalizados manualmente.
│   │   ├── PrerequisiteChecklist.tsx # Modal de materias aprobadas con tarjetas seleccionables, acordeón y switch pill por semestre.
│   │   ├── SettingsModal.tsx       # Modal de configuración de la app (toggle para exentar conflictos de materias con sesiones asíncronas).
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": buscador multi-campo para agregar asignaturas en masa.
│   │   ├── TourOrchestrator.tsx    # Orquestador del tutorial guiado interactivo (etapas welcome, loaded y color con supresión inteligente).
│   │   ├── TourSpotlight.tsx       # Overlay con máscara de recorte y anillo de color que enfoca elementos objetivo en el tutorial.
│   │   └── Uploader.tsx            # Componente de carga drag-and-drop de archivos CSV y Excel (.csv, .xlsx, .xls) con feedback.
│   ├── data/                       # Catálogos de datos estáticos.
│   │   ├── aliasAsignaturas.ts     # Tabla de equivalencias y normalización de nombres de asignaturas.
│   │   └── mallaCurricular.json    # Plan de estudios oficial con materias obligatorias, créditos y prerrequisitos.
│   ├── lib/                        # Integración de utilidades.
│   │   └── utils.ts                # Helper `cn` (clsx + tailwind-merge) para composición condicional de clases CSS.
│   └── utils/                      # Módulos de lógica de negocio y cálculo.
│       ├── colors.ts               # Paleta de 14 colores predefinidos y lógica de resolución de swatches.
│       ├── columnMapping.ts        # Encabezados canónicos, auto-sugerencias fuzzy y persistencia de firmas de mapeo.
│       ├── csv.ts                  # Parseo de CSV con PapaParse, remoción de BOM UTF-8 e inferencia de créditos.
│       ├── curriculum.ts           # Verificación de prerrequisitos, resolución de IDs canónicos y cálculo de optativas.
│       ├── dummy.ts                # Stub de módulo para resolver alias en Vite/Rollup (`fs`, `stream`, `crypto`).
│       ├── excel.ts                # Conversión de hojas de Excel a archivos CSV virtuales mediante import dinámico de xlsx.
│       ├── export.ts               # Exportación multiformato: PDF de 2 páginas, Calendario .ics, Excel multilámina y CSV.
│       ├── manualActivities.ts     # Ciclo de vida de actividades manuales (creación con id `manual:UUID`, edición, parseo y persistencia).
│       ├── progress.ts             # Exportación e importación del avance del checklist en formato JSON.
│       ├── storage.ts              # Wrapper de `localStorage` con validación estricta y versionado de esquema (`SCHEMA_VERSION = 1`).
│       ├── time.ts                 # Parseo horario flexible, agrupamiento DSU de solapes y reglas de conflicto con exención asíncrona.
│       └── tourStorage.ts          # Persistencia del progreso del tutorial guiado (`welcomeSeen`, `loadedSeen`, `colorSeen`).
```

---

## 3. Modelo de datos

### Tipos de TypeScript (`src/types.ts`)

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
  isAsync?: boolean; // true si esta sesión específica es asíncrona / trabajo en plataforma
}

export interface LoadedFile {
  id: string;
  name: string;
  count: number;
}

export interface Activity {
  id: string;             // CSV/Excel: Asignatura + "-" + Grupo | Manuales: `manual:${crypto.randomUUID()}`
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
```

> **Nota sobre actividades manuales:** En la interfaz `Activity`, no existe una propiedad booleana `isManual`. La condición manual se determina mediante la convención del identificador: `activity.id.startsWith('manual:')`.

### Tipos de soporte para agrupación, tutorial y actividades manuales

- **Item de grupo horario (`src/utils/time.ts`):**
  ```typescript
  export interface ScheduleGroupItem {
    activity: Activity;
    schedule: ActivitySchedule;
  }
  ```
- **Progreso del tutorial (`src/utils/tourStorage.ts`):**
  ```typescript
  export interface TourProgress {
    welcomeSeen: boolean;
    loadedSeen: boolean;
    colorSeen: boolean;
  }
  ```
- **Valores del formulario manual (`src/utils/manualActivities.ts`):**
  ```typescript
  export interface ManualActivityFormValues {
    asignatura: string;
    grupo: string;
    modalidad: string;
    profesor: string;
    creditos: string;
    sala: string;
    antecedentes: string;
    horarios: Partial<Record<DayOfWeek, string>>;
  }
  ```

### Esquema de Columnas CSV Reconocidas (`src/utils/columnMapping.ts`)

Encabezados canónicos que el sistema mapea desde archivos CSV o libros de Excel:

- `asignatura`: Nombre de la materia (Obligatoria).
- `grupo`: Código o identificador de grupo (Obligatoria).
- `modalidad`: Modalidad de impartición (Presencial, Virtual, Libre, etc.).
- `creditos`: Créditos de la materia (si viene vacía en una fila, se infiere automáticamente de otra fila de la misma asignatura).
- `profesor`: Nombre del docente.
- `antecedentes`: Requisitos previos descritos en texto.
- `sala`: Aula o espacio asignado.
- Columnas por día: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` (al menos un día con horario válido para agendar la opción).

---

## 4. Componentes y módulos clave

- **`src/App.tsx`**: Orquesta el estado global de la aplicación (materias disponibles/seleccionadas, archivos cargados, checklist de aprobadas, actividades manuales, modo colorido, switches de prerrequisitos y de sesiones asíncronas `markAsyncEnabled`, cola de mapeo de hojas Excel `pendingSheetQueue`), botón flotante (FAB) con animación de scroll, sincronización versionada en `localStorage` y disparo de exportaciones.
- **`src/components/Calendar.tsx`**: Contenedor principal del horario semanal con columna de horas fijas (7:00 a 21:00), elevación del estado `activeCell` y backdrop transparente global (`z-[60]`) que descarta menús abiertos al hacer clic fuera.
- **`src/components/DayColumn.tsx`**: Renderiza las celdas horarias de un día, gestiona el desplegable de opciones por celda y la posición absoluta de materias seleccionadas, agrupando actividades solapadas mediante `groupOverlappingActivities` en bloques con borde de advertencia (`.overlap-group-wrapper`).
- **`src/components/ActivityCard.tsx`**: Tarjeta visual de clase agendada; renderiza estilos Neón/Glassmorphism, botón de eliminación, selector de color flotante portaled, tooltip informativo de prerrequisitos y botón toggle de sesión asíncrona (icono WiFi) cuando `markAsyncEnabled` está activo.
- **`src/components/SubjectSelectionModal.tsx`**: Modal de "Selección Rápida" con buscador multi-campo (materia, grupo, profesor, sala, horario) para añadir o quitar materias en masa respetando exclusividades y conflictos con `activitiesConflict`.
- **`src/components/PrerequisiteChecklist.tsx`**: Modal de materias cursadas organizado por semestres mediante acordeón, con tarjetas seleccionables estilizadas y toggle switch estilo pill en cabeceras.
- **`src/components/SettingsModal.tsx`**: Diálogo de configuración accesible para activar o desactivar la exención de conflictos en materias con sesiones asíncronas (`markAsyncEnabled`).
- **`src/components/ManualActivityFormModal.tsx`**: Modal con formulario interactivo para registrar o editar materias y eventos personalizados con horarios diarios, créditos, profesor, aula y asignación de color.
- **`src/components/ExcelSheetDialog.tsx`**: Diálogo interactivo para elegir qué hojas de un archivo `.xlsx` importar usando filas de tarjetas seleccionables sin checkboxes nativos.
- **`src/components/ColumnMappingDialog.tsx`**: Modal lazy-loaded (`React.lazy`) para mapear columnas de archivos CSV no estándar o de hojas de Excel en cola (`pendingSheetQueue`), con selectors accesibles de Radix UI.
- **`src/components/ExportDropdown.tsx`**: Menú en el Header que centraliza la descarga en PDF de 2 páginas (`jsPDF`), impresión nativa (`window.print()`), imagen PNG, Excel multilámina (`xlsx-js-style`), calendario (`.ics`) y CSVs UTF-8 con BOM.
- **`src/components/ConfirmDialog.tsx`**: Modal estilizado de confirmación con variantes (`danger`, `warning`, `info`) para reemplazar llamadas bloqueantes a `window.confirm`.
- **`src/components/TourOrchestrator.tsx`**: Controlador del tutorial guiado interactivo en tres etapas ("welcome", "loaded", "color"), con apertura/cierre responsivo del drawer móvil y auto-supresión al detectar datos previos del usuario en el primer render.
- **`src/components/TourSpotlight.tsx`**: Máscara visual SVG/CSS que recorta un hueco con anillo de acento sobre el elemento del DOM enfocado por el tutorial.
- **`src/components/Uploader.tsx`**: Zona de carga drag-and-drop y selector de archivos CSV/Excel (`.csv`, `.xlsx`, `.xls`) con validación y feedback visual.
- **`src/utils/time.ts`**: Normalización y parseo de horarios ("16:00-18:00", "8:00 a 2:00 pm"), cálculo de solapes horarios (`checkOverlap`), agrupación de sesiones por conectividad de traslape (`groupOverlappingActivities`, `getGroupTimeSpan`) y lógica de conflicto con exenciones asíncronas (`activitiesConflict`, `isConflictExemptActivity`).
- **`src/utils/manualActivities.ts`**: Creación, actualización, parseo y serialización de actividades manuales con identificador `manual:${crypto.randomUUID()}`.
- **`src/utils/export.ts`**: Módulo de exportación a PDF en 2 páginas (`jspdf` + `jspdf-autotable`), Calendario iCalendar `.ics` con reglas recurrentes `RRULE`, Excel multilámina (`xlsx-js-style`) y CSV UTF-8 con BOM.
- **`src/utils/csv.ts`**: Parseo de CSVs mediante PapaParse, remoción de caracteres BOM UTF-8 e inferencia de créditos entre filas de la misma asignatura.
- **`src/utils/columnMapping.ts`**: Mapeo fuzzy de encabezados, diccionarios de sinónimos canónicos y almacenamiento de firmas reconocidas en `localStorage`.
- **`src/utils/curriculum.ts`**: Verificación de prerrequisitos obligatorios y electivos contra `mallaCurricular.json` y alias en `aliasAsignaturas.ts`.
- **`src/utils/storage.ts`**: Wrapper seguro de `localStorage` con versionado obligatorio (`SCHEMA_VERSION = 1`) y descarte de payloads sin formato válido.
- **`src/utils/tourStorage.ts`**: Persistencia y lectura de etapas vistas del tutorial interactivo.
- **`src/utils/colors.ts`**: Gestión de paleta Neón de 14 swatches, hashes deterministas por asignatura y precedencia de personalización de color.
- **`src/utils/dummy.ts`**: Stub liviano para sustitución de módulos nativos de Node.js (`fs`, `stream`, `crypto`) en el empaquetado del navegador.
- **`src/utils/excel.ts`**: Procesamiento lazy de libros Excel con conversión por hoja a CSV virtual.
- **`src/utils/progress.ts`**: Serialización de materias aprobadas a archivos `.json` para importar/exportar avance de carrera.

---

## 5. Lógica central (código real, no resumen)

### A. Filtrado de actividades disponibles por día/hora en el dropdown de cada celda

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L75-L88) (Líneas 75 a 88)

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

### B. Fusión visual de celdas y agrupamiento de actividades solapadas

Cuando una actividad ocupa más de una hora, se calcula su porcentaje de inicio y duración respecto al día completo (15 horas: 7:00 a 21:00). Si existen actividades que se solapan en horario (por ejemplo, sesiones asíncronas exentas), se agrupan mediante `groupOverlappingActivities` y se renderizan dentro de un contenedor `.overlap-group-wrapper` con borde rojo de alerta y distribución flex vertical:

- **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L214-L291) (Líneas 214 a 291)

```typescript
        {/* Selected Activities rendered absolutely, agrupadas por solape */}
        {groupOverlappingActivities(activitiesForThisDay).map((group) => {
          const calendarStartOffset = 7 * 60; // 07:00 AM
          const totalCalendarMinutes = 15 * 60; // 15 horas (07:00 a 21:00)

          if (group.length === 1) {
            const { activity, schedule } = group[0];
            const topMinutes = schedule.timeRange.start - calendarStartOffset;
            const durationMinutes = schedule.timeRange.end - schedule.timeRange.start;
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
                  markAsyncEnabled={markAsyncEnabled}
                  onToggleAsync={onToggleAsync}
                />
              </div>
            );
          }

          // Grupo con 2 o más actividades solapadas: bloque combinado
          const span = getGroupTimeSpan(group);
          const topMinutes = span.start - calendarStartOffset;
          const durationMinutes = span.end - span.start;
          const topPercent = (topMinutes / totalCalendarMinutes) * 100;
          const heightPercent = (durationMinutes / totalCalendarMinutes) * 100;
          const groupKey = group.map(g => `${g.activity.id}::${g.schedule.day}::${g.schedule.timeRange.start}::${g.schedule.timeRange.end}`).join('|');

          return (
            <div
              key={groupKey}
              className="overlap-group-wrapper absolute left-0 right-0 z-10 hover:z-[60] focus-within:z-[60] has-[.active-card]:z-[60] px-1"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              <div className="flex flex-col h-full w-full gap-0.5 border-2 border-[var(--color-danger)] rounded-md overflow-hidden">
                {group.map(({ activity, schedule }) => (
                  <div
                    key={`${activity.id}::${schedule.day}::${schedule.timeRange.start}::${schedule.timeRange.end}`}
                    className="flex-1 min-h-0"
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
                      markAsyncEnabled={markAsyncEnabled}
                      onToggleAsync={onToggleAsync}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
```

---

### C. Exclusividad de grupos/horarios (ocultar otras opciones de la misma Asignatura al elegir una)

La exclusividad se garantiza en dos niveles: en el filtrado base de opciones por celda, y en la resolución canónica de nombres de asignaturas dentro de `DayColumn.tsx` y `SubjectSelectionModal.tsx`.

1. **Filtrado base en celda:**
   - **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L85) (Línea 85)
   ```typescript
   if (selectedActivities.some(sa => sa.asignatura === act.asignatura)) return false;
   ```

2. **Resolución canónica y bloqueo en dropdown de celda:**
   - **Archivo:** [`src/components/DayColumn.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L52-L59) y [`#L158-L183`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/DayColumn.tsx#L158-L183) (Líneas 52 a 59 y 158 a 183)
   ```typescript
   // Creación del conjunto de asignaturas ya seleccionadas (por ID canónico o nombre en minúsculas)
   const selectedAsignaturas = useMemo(() => {
     const set = new Set<string>();
     selectedActivities.forEach(a => {
       const key = resolveMateriaId(a.asignatura) || a.asignatura.trim().toLowerCase();
       set.add(key);
     });
     return set;
   }, [selectedActivities]);

   // Verificación en el mapeo de opciones dentro del desplegable
   const actKey = resolveMateriaId(act.asignatura) || act.asignatura.trim().toLowerCase();
   const isSameSubjectSelected = selectedAsignaturas.has(actKey);
   ...
   onClick={(e) => {
     e.stopPropagation();
     if (isConflict || isApproved || isSameSubjectSelected) return;
     onSelectActivity(act);
     onCloseCell();
   }}
   ```

3. **Exclusividad en Lista Rápida (`SubjectSelectionModal.tsx`):**
   - **Archivo:** [`src/components/SubjectSelectionModal.tsx`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/SubjectSelectionModal.tsx#L45-L52) y [`#L135-L155`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/components/SubjectSelectionModal.tsx#L135-L155) (Líneas 45 a 52 y 135 a 155)
   ```typescript
   const isSelected = selectedIds.has(activity.id);
   const isOtraCatedraSeleccionada = !isSelected && selectedAsignaturas.has(materiaKey);
   ...
   const isDisabled = isOtraCatedraSeleccionada || isConflicting || isCompletada;
   ```

---

### D. Detección y bloqueo de conflictos de horario

- **Archivo:** [`src/utils/time.ts`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/utils/time.ts#L140-L153), [`#L204-L231`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/utils/time.ts#L204-L231) y [`#L246-L295`](file:///c:/Users/weded/antigravity/Horario-Acad%C3%A9mico/src/utils/time.ts#L246-L295)

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

/**
 * Determina si una actividad está exenta de conflictos de horario cuando la
 * sesión que choca contra ella es asíncrona. Están exentas las Actividades
 * Personalizadas (id con prefijo "manual:") y las materias con modalidad
 * "Libre" (comparación insensible a mayúsculas/minúsculas).
 */
export function isConflictExemptActivity(activity: Activity): boolean {
  if (activity.id.startsWith('manual:')) return true;
  return activity.modalidad.trim().toLowerCase() === 'libre';
}

/**
 * Compara dos actividades completas (no arrays de horarios sueltos) y
 * determina si tienen un traslape real, considerando las excepciones de
 * sesiones asíncronas. Una sesión marcada isAsync exime el traslape
 * ÚNICAMENTE si la otra actividad involucrada es una Actividad Personalizada
 * o tiene modalidad "Libre" — no exime traslapes entre dos materias
 * normales de facultad aunque ambas estén marcadas como asíncronas.
 */
export function activitiesConflict(a: Activity, b: Activity): boolean {
  for (const sA of a.schedules) {
    for (const sB of b.schedules) {
      if (sA.day !== sB.day) continue;
      if (!checkOverlap(sA.timeRange, sB.timeRange)) continue;

      const exempt =
        (sA.isAsync === true && isConflictExemptActivity(b)) ||
        (sB.isAsync === true && isConflictExemptActivity(a));

      if (!exempt) return true;
    }
  }
  return false;
}

/**
 * Agrupa sesiones de UN MISMO DÍA por conectividad de solape: si A choca con
 * B, y B choca con C, los tres quedan en el mismo grupo aunque A y C no
 * choquen directamente entre sí. Asume que TODOS los items ya pertenecen al
 * mismo día — quien llama a esta función es responsable de filtrar por día
 * antes de invocarla; esta función no compara el campo `day` en absoluto,
 * solo timeRange.
 */
export function groupOverlappingActivities(items: ScheduleGroupItem[]): ScheduleGroupItem[][] {
  const n = items.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }

  function union(i: number, j: number) {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (checkOverlap(items[i].schedule.timeRange, items[j].schedule.timeRange)) {
        union(i, j);
      }
    }
  }

  const groupsMap = new Map<number, ScheduleGroupItem[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groupsMap.has(root)) groupsMap.set(root, []);
    groupsMap.get(root)!.push(items[i]);
  }

  return Array.from(groupsMap.values());
}

/**
 * Dado un grupo (ya agrupado por groupOverlappingActivities), calcula el
 * rango de tiempo total que cubre: desde el inicio más temprano hasta el
 * fin más tardío de todas las sesiones del grupo.
 */
export function getGroupTimeSpan(group: ScheduleGroupItem[]): { start: number; end: number } {
  let start = Infinity;
  let end = -Infinity;
  for (const item of group) {
    start = Math.min(start, item.schedule.timeRange.start);
    end = Math.max(end, item.schedule.timeRange.end);
  }
  return { start, end };
}
```

---

### E. Guardado y recuperación en localStorage

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

- **Feature de Sesiones Asíncronas y Exención Selectiva de Conflictos (`activitiesConflict`, `isConflictExemptActivity`, `SettingsModal.tsx`, `ActivityCard.tsx`):** Originalmente todo choque horario bloqueaba la selección o arrojaba error. Se implementó una lógica de excepción: sesiones individuales marcadas con `isAsync: true` se eximen de conflicto si chocan contra una Actividad Personalizada (`manual:`) o una materia de modalidad `"Libre"`. Para habilitar la marcación de asíncronas en las tarjetas de actividad, se agregó el modal de ajustes `SettingsModal.tsx` con el switch `markAsyncEnabled`, persistido en `localStorage`.
- **Agrupamiento Visual de Solapes en Calendario (`groupOverlappingActivities`, `DayColumn.tsx`, `index.css`):** Cuando dos o más actividades coinciden en horario y día en el calendario (por ejemplo, por exención asíncrona), ya no se apilan de forma invisible una encima de otra. Se agrupan usando un algoritmo de conjuntos disjuntos (DSU) y se renderizan en un contenedor combinado `.overlap-group-wrapper` con borde rojo y distribución flex vertical. En modo exportación (`.exporting-mode`), se anula la altura porcentual fija forzando `height: auto !important` para que ninguna actividad quede recortada.
- **Supresión Inteligente del Tutorial para Usuarios Existentes (`TourOrchestrator.tsx`):** Se resolvió el comportamiento donde recargar la página en desarrollo o producción re-disparaba etapas del tutorial (especialmente la de colores). Al montar el orquestador, si ya existen materias disponibles o seleccionadas, se marcan automáticamente como vistas las etapas correspondientes en `tourStorage` evitando molestias.
- **Sustitución de Checkboxes Nativos por Tarjetas e Insumos Visuales Seleccionables (`PrerequisiteChecklist.tsx` / `ExcelSheetDialog.tsx`):** Se eliminaron los checkboxes nativos del navegador. En `PrerequisiteChecklist.tsx`, cada asignatura es una tarjeta interactiva con resalte en azul primario (`bg-[var(--color-primary-light)]`, `border-[var(--color-primary)]`), mientras que la acción masiva por semestre en la cabecera utiliza un toggle switch estilo pill deslizable. En `ExcelSheetDialog.tsx`, las hojas de Excel se seleccionan mediante filas tipo tarjeta con acento de borde lateral.
- **Creación y Edición de Materias/Eventos Personalizados (`ManualActivityFormModal.tsx` / `manualActivities.ts`):** Incorporación de un formulario modal completo para crear o editar actividades personalizadas directamente en la app con configuración por día, créditos, profesor, aula y coloración neón.
- **Renombrado y Marca Oficial ("Horario Interactivo"):** Actualización del título y branding general del sistema a "Horario Interactivo" en `index.html`, Header principal, `TourOrchestrator` y exportadores.
- **Elevación Hover y Posicionamiento Portaled (`ActivityCard.tsx` / `DayColumn.tsx`):** Unificación de elevación a `z-[60]` (`has-[.active-card]:z-[60]`). Tooltips y selectores de color se renderizan con `React.createPortal` calculando bordes dinámicos para abrirse hacia arriba si falta espacio inferior en pantalla.
- **Gestión Accesible de Cierre de Celdas (`Calendar.tsx` / `DayColumn.tsx`):** Elevación del estado `activeCell` a `Calendar.tsx` con un backdrop transparente (`fixed inset-0 z-[60]`) que intercepta clics fuera del menú para cerrarlo sin seleccionar accidentalmente otra celda.
- **Botón Flotante de Acción Rápida (FAB) con Detección de Scroll (`App.tsx`):** Botón flotante para abrir la Lista Rápida que colapsa con el scroll hacia abajo y se expande al subir.
- **Exportación a PDF Nativa y Vectorial en 2 Páginas (`exportToPDF`):** Descarga de PDF en formato A4 apaisado: Página 1 con captura visual en 2x usando `.exporting-mode` y Página 2 con tabla estructurada vectorial mediante `jspdf-autotable`.
- **Exportación a Calendario iCalendar (`.ics`):** Módulo de generación de eventos recurrentes semanales (`RRULE:FREQ=WEEKLY`) con UIDs únicos y descripción estructurada.
- **Modo de Impresión Nativo (`window.print()`):** Opción "Imprimir" con estilos `@media print` en `index.css`: `@page { margin: 5mm; size: landscape; }`, anulación de `height: 100vh` e higiene de márgenes.
- **Pipeline de Mapeo Continuo para Excel Multilámina (`pendingSheetQueue`):** Encolado automático de hojas pendientes que requieren mapeo de columnas en `pendingSheetQueue` con subtítulo `"Hoja: NombreHoja"`.
- **Inferencia automática de créditos entre filas (`csv.ts`):** Propagación de créditos entre filas de la misma materia cuando una fila carece del dato.
- **Sustitución de alertas nativas por `<ConfirmDialog />`:** Sustitución de `window.confirm` por un modal accesible con variantes de estilo.

---

## 7. Pendientes / incompleto

- **Comentarios TODO / FIXME en el código:** No existen comentarios `TODO` o `FIXME` en el código fuente actual.
- **Estado de cobertura actual:** Las funcionalidades del núcleo y los Bloques 1 al 4b de la feature de sesiones asíncronas están 100% implementadas, compiladas y verificadas en runtime (incluyendo la prueba unitaria DSU `scratch/test_grouping.mjs` y la prueba de reglas de conflicto `scratch/test_async_conflict.mjs`).
- **Próximas funciones / extensiones planificadas:**
  - Posibles bloques subsecuentes para la feature de sesiones asíncronas (como filtros avanzados o tratamiento diferenciado en exportaciones impresas si se requiere).
  - Algoritmos de generación automática de combinaciones sin traslapes (planificador automático/solver de horarios).

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
node scratch/test_async_conflict.mjs
node scratch/test_grouping.mjs
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
