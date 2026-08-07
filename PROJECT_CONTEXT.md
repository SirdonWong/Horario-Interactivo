# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria y minimalista (basada en los principios de **Impeccable Design**) para planificar y optimizar horarios académicos universitarios. Permite cargar múltiples archivos CSV y Excel (`.xlsx`) con la oferta académica (obligatorias, optativas y libres), seleccionar asignaturas y grupos de forma interactiva en una grilla semanal deslizable con horas fijas, prevenir automáticamente traslapes/conflictos de horario, personalizar el color de cada materia con estilo **Neón / Translúcido Glassmorphic** en modo oscuro, verificar y advertir sobre antecedentes/prerrequisitos pendientes (obligatorias mediante malla curricular, y optativas extrayéndolos al vuelo de su descripción en el documento) con un interruptor global en el encabezado `ON`/`OFF` que controla estrictamente el bloqueo y las etiquetas "Ya aprobada", desplegar la información completa de sesiones semanales múltiples ("Martes y Jueves 12:00-14:00"), gestionar materias aprobadas mediante un **pop-up modal emergente de prerrequisitos** con buscador instantáneo, acordeón animado, selección masiva por semestre y animaciones fluidas con **Motion**, reemplazar alertas emergentes nativas por un componente modal **`<ConfirmDialog />`** animado, incorporar un seleccionador de hojas para archivos Excel con resaltado interactivo de filas y checkboxes acentuados (`accent`), alternar entre **Dark Mode y Light Mode**, adaptar fluidamente la interfaz a teléfonos móviles mediante un **Drawer deslizable** y **Dropdowns Inteligentes** con anchos proporcionales e interactivos en **Radix UI**, detectar automáticamente las columnas del archivo subido y mostrar un diálogo de mapeo manual accesible cuando no se reconocen (con caché por fingerprint de encabezados en `localStorage`), guardar el estado en `localStorage` con control de versión de esquema (`v1`), exportar el horario final como imagen PNG con indicador visual de carga, proporcionar un **modo colorido** (`useColorfulMode`) que asigna colores automáticos por asignatura con paleta de swatches predefinida (activable desde el botón `Palette` en el encabezado o desde el Drawer móvil), y ofrecer un **botón flotante (FAB) de Lista Rápida** que se contrae/expande al hacer scroll para añadir múltiples materias de forma continua.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`)
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con sistema de tokens CSS `:root` y `.dark` (estilo Neón translúcido para swatches en modo oscuro).
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7` para menús desplegables del modal de mapeo de columnas.
  - **Animaciones UI / Motion:** `motion@^12.23.24` (importado como `motion/react`) para entradas/salidas de modales, colapsos de acordeón, barras de progreso, cuadros de confirmación, popovers portaled, feedback táctil (*tap scale*) y FAB con expansión/contracción al scroll.
  - **Librerías clave:**
    - `papaparse@^5.5.4` (parseo y normalización de archivos CSV)
    - `xlsx@^0.18.5` (parseo de archivos Excel `.xlsx` cargados dinámicamente)
    - `html-to-image@^1.11.13` (exportación del calendario a imagen PNG)
    - `lucide-react@^0.546.0` (iconografía de la interfaz: `Sun`, `Moon`, `Menu`, `X`, `GraduationCap`, `Search`, `ChevronDown`, `Loader2`, `AlertTriangle`, `HelpCircle`, `FileSpreadsheet`, `Download`, `Upload`, `Trash2`, `RotateCcw`, `Calendar`, `Palette`, `ListPlus`, `Plus`, `Table`, `Check`)
  - **Librerías auxiliares y utilidades:** `clsx@^2.1.1` y `tailwind-merge@^3.6.0` (combinación condicional de clases CSS).

---

## 2. Estructura de archivos

```text

Horario-Académico/
├── .agents/                    # Reglas personalizadas del proyecto para agentes de IA.
│   └── AGENTS.md               # Reglas globales (gestión de puertos, sintaxis PowerShell, protocolo 2 niveles, control de propuestas vs ejecución).
├── .gitignore                  # Exclusiones de control de versiones Git.
├── .vscode/                    # Configuración del editor VS Code.
│   ├── launch.json             # Configuración de depuración.
│   └── settings.json           # Ajustes del editor para el workspace.
├── DESIGN.md                   # Sistema de diseño Impeccable (tokens de color, tipografía, Dark/Light mode).
├── PRODUCT.md                  # Estrategia de producto y propuesta de valor única.
├── PROJECT_CONTEXT.md          # Este archivo: contexto completo del proyecto.
├── README.md                   # Descripción pública del repositorio orientada al usuario final.
├── index.html                  # HTML principal y contenedor raíz de la aplicación Vite.
├── package.json                # Dependencias, scripts del proyecto y configuración de paquetes.
├── tsconfig.json               # Configuración de TypeScript (incluye resolveJsonModule: true).
├── vite.config.ts              # Configuración del bundler Vite (plugins, alias @, chunk splitting para xlsx, HMR condicional).
├── assets/                     # Directorio de activos (actualmente vacío, solo contiene .aistudio/).
├── dist/                       # Directorio de salida del build de producción (generado por `vite build`).
├── scratch/                    # Scripts de verificación y pruebas funcionales de integración.
│   ├── test_creditos_fallback.mjs  # Prueba de inferencia de créditos cuando la fila los omite.
│   ├── test_http_and_html.mjs      # Prueba de conectividad HTTP 200 en localhost:3000.
│   ├── test_ui_flow.mjs            # Script de verificación de integridad de componentes UI.
│   └── test_uploader_accessibility.mjs # Verificación estática del componente Uploader (label HTML nativo, sr-only).
├── src/                        # Código fuente de la aplicación.
│   ├── App.tsx                 # Estado global, theme toggle, colorful mode toggle, mobile drawer, export PNG spinner, modal prerrequisitos, ConfirmDialog, FAB Lista Rápida.
│   ├── main.tsx                # Punto de entrada de React que renderiza App.tsx en el DOM.
│   ├── index.css               # Importación base de Tailwind CSS (`@import "tailwindcss"`) + tokens de variables CSS (:root y .dark con paletas Neón) + scrollbar custom.
│   ├── types.ts                # Interfaces de TypeScript (`Activity`, `ActivitySchedule`, `TimeRange`, `LoadedFile`, `DayOfWeek`) y constantes de días/horas.
│   ├── components/             # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx    # Tarjeta gráfica para clases agendadas (badge de Grupo, tooltip con detalles, a11y keyboard, aviso de antecedentes, Color Picker en portal z-[200] con paleta de swatches).
│   │   ├── Calendar.tsx        # Estructura del calendario (grid min-w-[720px], sticky left time column z-40, sticky header z-[70]/z-[80], horizontal scroll, propagación de useColorfulMode y onScroll).
│   │   ├── ColumnMappingDialog.tsx # Modal de mapeo de columnas CSV con Radix UI Select + Motion (`AnimatedSelect`) con proporciones móviles fluidas, z-[200] backdrop y z-[300] menús flotantes.
│   │   ├── ConfirmDialog.tsx   # Modal de confirmación estilizado y animado con variantes (danger, warning, info) como reemplazo de window.confirm.
│   │   ├── DayColumn.tsx       # Columna de un día: menú flotante de celda activa (z-[65]), tarjetas agendadas z-10 (hover z-[60]), posicionamiento inteligente de dropdown según columna, y respeto del toggle showAntecedentes.
│   │   ├── ExcelSheetDialog.tsx # Diálogo iterativo para seleccionar hojas de cálculo con resaltado interactivo de filas, checkboxes acentuados (`accent`), selección masiva (Todas/Ninguna) y Motion tap scale.
│   │   ├── PrerequisiteChecklist.tsx # Modal emergente con buscador, acordeón por semestre, selección masiva, barras de progreso animadas con Motion, exportación/importación JSON de avance, y ConfirmDialog para confirmación de importación.
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": listado completo con buscador (materia o profesor), filtrado por materias aprobadas (respetando showAntecedentes), detección de conflictos de horario, badges de estado (Agregada, Ya aprobada, Conflicto).
│   │   └── Uploader.tsx        # Carga de CSV y Excel con interceptor para hojas, label HTML nativo con input sr-only, fingerprint → cache/auto-suggest → dialog. Exporta helpers `processCsvFiles` y `processFileAfterMapping` para uso desde App.tsx.
│   ├── data/                   # Catálogos de datos estáticos.
│   │   ├── aliasAsignaturas.ts # Tabla de normalización/mapeo de nombres del CSV a la malla (incluye typos reales y caso especial HITO:practica_profesional).
│   │   ├── mallaCurricular.json # Plan de estudios oficial (materias obligatorias, antecedentes, créditos, hitos).
│   │   └── malla_curricular_psicologia_mefi.json # Respaldo / fuente original de la malla curricular (idéntico a mallaCurricular.json).
│   ├── lib/                    # Configuración de librerías auxiliares.
│   │   └── utils.ts            # Helper cn() para la concatenación de clases Tailwind (clsx + tailwind-merge).
│   └── utils/                  # Lógica de soporte y módulos de cálculo.
│       ├── colors.ts           # Paleta de 14 colores predefinida (`ASSIGNMENT_COLORS`), asignación cíclica por asignatura y resolución de color efectivo (`getEffectiveColorId`) que prioriza: override manual > colorful mode > sin color.
│       ├── columnMapping.ts    # Campos canónicos (`CAMPOS_CANONICOS`), fingerprinting, auto-sugerencia fuzzy, validación de confianza alta (`mappingIsHighConfidence`) y validación mínima esencial (`mappingCoversEssentials`).
│       ├── csv.ts              # Preview de encabezados (`previewCSV`), parseo completo con ColumnMapping opcional, limpieza de BOM, normalización de headers legacy, inferencia de créditos entre filas de la misma asignatura y conversión fila→Activity.
│       ├── curriculum.ts       # Resolución de IDs contra catálogo de obligatorias con normalización y alias, verificación de hitos por créditos, extracción al vuelo de antecedentes de optativas desde texto libre.
│       ├── excel.ts            # Utilidades lazy-loaded (`import('xlsx')`) para extracción de hojas y conversión hoja-a-CSV en el cliente.
│       ├── progress.ts         # Exportación e importación del avance curricular (checklist) en formato JSON (`academitrack-progreso` v1) con validación de IDs contra el catálogo.
│       ├── storage.ts          # Persistencia en localStorage con versionado de esquema (`SCHEMA_VERSION = 1`), validación de forma (array-check) y descarte seguro de datos corruptos.
│       └── time.ts             # Normalización de caracteres Unicode en horarios, parseo multi-formato de rangos horarios (16:00-18:00, 8:00 a 2:00, am/pm), formateo semanal agrupado (`formatWeeklySchedules`), detección de traslapes y conflictos.
├── test-fixtures/              # Archivos y fixtures de prueba para regresión y mapeos.
│   ├── CREDITOS_FILA_CABECERA.csv      # CSV de prueba para validar la inferencia de créditos entre filas.
│   └── OFERTA_OPTATIVAS_MODIFIED.csv   # CSV modificado con headers renombrados para probar el diálogo de mapeo.
├── test_schedule.csv           # Archivo CSV de prueba con datos de oferta académica obligatoria.
└── OFERTA_OPTATIVAS_Y_LIBRES.csv       # CSV real de oferta de optativas y libres (headers reconocibles).

```

---

## 3. Modelo de datos y sistema de temas

### Sistema de Temas (Dark Mode / Light Mode)

La aplicación implementa un sistema de temas persistente definido en `DESIGN.md` y `src/index.css`:

- **Tokens CSS Custom Properties:**
  - `:root` para **Light Mode** (`--bg-app: #f8fafc`, `--bg-surface: #ffffff`, `--text-main: #0f172a`, `--border-subtle: #e2e8f0`, swatches pastel en `--swatch-*-bg` y text en `--swatch-*-text`).
  - `.dark` para **Dark Mode** (`--bg-app: #090d16`, `--bg-surface: #111827`, `--text-main: #f9fafb`, `--border-subtle: #1f2937`, etc.).
  - **Estilo Neón / Translúcido Glassmorphic en `.dark`:**
    Las tarjetas de color en modo oscuro emplean un fondo traslúcido compuesto por el color puro de la paleta al 15% de opacidad (`rgba(..., 0.15)`) combinado con texto vibrante (nivel 400 de Tailwind, ej. `#f472b6` para Pink, `#818cf8` para Índigo). Esto evita que los colores se perciban como vino/negro y garantiza fidelidad total a su nombre.
  - **Nota:** `DESIGN.md` lista `--bg-surface` en Dark Mode como `#1E293B` (Slate 800), pero `src/index.css` define realmente `--bg-surface: #111827` (Slate 900 / Gray 900). El código fuente es la fuente de verdad.
- **Persistencia en `App.tsx`:**
  - Estado `theme` inicializado desde `localStorage.getItem('theme')` o preferencia del sistema (`prefers-color-scheme`).
  - Aplica o remueve la clase `.dark` sobre `document.documentElement`.
  - Botón selector en la barra superior con iconos `Sun` / `Moon`.

### Modelo de Datos Principal (`src/types.ts`)

- **`Activity`**: `id` (Asignatura-Grupo), `modalidad`, `asignatura`, `creditos`, `grupo`, `profesor`, `antecedentes`, `sala`, `horarioTexto`, `schedules: ActivitySchedule[]`, `color`, `sourceFile?`.
- **`ActivitySchedule`**: `day: DayOfWeek`, `timeRange: TimeRange`.
- **`TimeRange`**: `start` (minutos desde medianoche), `end`, `originalText`.
- **`LoadedFile`**: `id`, `name`, `count`.
- **`DayOfWeek`**: `'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'`.
- **`HOURS`**: Array de 7 a 21 (15 horas visibles en el calendario).

---

## 4. Jerarquía Visual y Capas de Apilamiento (Z-Index Architecture)

Para evitar solapamientos visuales y asegurar una interacción limpia en escritorios y móviles, la aplicación mantiene un orden estricto de profundidades `z-index`:

- **Nivel Fondo y Base (`z-0` a `z-20`):**
  - `z-0`: Grilla de líneas horizontales de fondo del calendario.
  - `z-10`: Tarjetas de materias (`ActivityCard`) en reposo y Sidebar en versión escritorio (`lg:z-10`).
  - `z-20`: Header superior y Footer de la aplicación.
- **Nivel Calendario y Scroll (`z-40` a `z-80`):**
  - `z-40`: Columna lateral fija de horas (`sticky left-0`).
  - `z-50`: Tooltips emergentes de detalles en `ActivityCard` y botón FAB "Lista Rápida" (`fixed bottom-6 right-6 z-50`).
  - `z-[60]`: Estado `hover` y enfoque de tarjetas de materias en el calendario (`hover:z-[60]`, `focus-within:z-[60]`).
  - `z-[65]`: Celda activa del calendario y menú desplegable de "Materias Disponibles" (`DayColumn.tsx`), colocado por encima de tarjetas en hover para evitar bloqueos.
  - `z-[70]`: Encabezado sticky de días de la semana (Lunes-Domingo).
  - `z-[80]`: Celda de origen (esquina superior izquierda) del calendario.
- **Nivel Navegación Móvil y Botones Flotantes (`z-[90]` a `z-[100]`):**
  - `z-[90]`: Fondo velado (*backdrop*) del menú lateral móvil.
  - `z-[100]`: Menú desplegable lateral (Drawer) en dispositivos móviles.
- **Nivel Modales y Popovers Globales (`z-[200]` a `z-[300]`):**
  - `z-[200]`: Diálogos emergentes principales (`ConfirmDialog`, `ExcelSheetDialog`, `PrerequisiteChecklist`, `SubjectSelectionModal`, `ColumnMappingDialog` contenedor backdrop y Popover de Color Picker de `ActivityCard`).
  - `z-[300]`: Menús flotantes de selección en Radix UI (`AnimatedSelect` en `ColumnMappingDialog.tsx`).

---

## 5. Lógica central y persistencia

### A. Control Estricto del Toggle "Validar Prerrequisitos" (`showAntecedentes`)

- Cuando `showAntecedentes` es `true`, el sistema consulta `materiasCompletadas` para mostrar las asignaturas aprobadas de forma atenuada con la etiqueta "Ya aprobada" e inhabilita su selección tanto en los desplegables de hora como en la Lista Rápida (`SubjectSelectionModal`).
- Cuando `showAntecedentes` es `false`, se deshabilita por completo la verificación de materias completadas en la grilla y modales. Las asignaturas aprobadas ya no muestran el rótulo "Ya aprobada" ni sufren atenuación/bloqueo, permitiendo agregarlas libremente a la agenda.
- El toggle se presenta como un checkbox con la leyenda `ON` / `OFF` en el encabezado (desktop) y dentro del Drawer (móvil).

### B. Modo Colorido (`useColorfulMode`)

- Estado booleano persistido en `localStorage` que activa la asignación automática de colores de la paleta (`ASSIGNMENT_COLORS`) a cada asignatura.
- Cuando está activo, las tarjetas `ActivityCard` reciben un fondo/texto basado en su swatch asignado; cuando está inactivo, las tarjetas usan el color neutro base a menos que el usuario haya sobreescrito manualmente el color.
- Se controla desde el botón `Palette` en el encabezado (desktop) y desde un checkbox en el Drawer (móvil).

### C. Formateo de sesiones semanales múltiples

Ubicación: `src/utils/time.ts` (`formatWeeklySchedules`)

Agrupa rangos horarios idénticos en días consecutivos o dispersos (ej. "Lunes y Miércoles 08:00-10:00, Viernes 08:00-10:00").

### D. Inferencia de Créditos entre Filas

Ubicación: `src/utils/csv.ts` (`processCSVRows`)

Cuando una fila de un CSV tiene el campo de créditos vacío pero otra fila del mismo archivo con la misma asignatura sí lo tiene, el sistema infiere y reutiliza ese valor (con advertencia en consola).

### E. Persistencia con Versionado de Esquema

Ubicación: `src/utils/storage.ts` (`SCHEMA_VERSION = 1`)

Mantiene la sincronización de materias seleccionadas, avances de prerrequisitos, firmas de mapeo de columnas, tema, colorful mode y color overrides mediante payloads versionados que previenen errores por desactualización de formato. Incluye validación de forma (array-check) y descarte seguro de datos corruptos o sin versión.

### F. Resolución de Prerrequisitos

Ubicación: `src/utils/curriculum.ts`

- **Obligatorias:** Se resuelven contra `mallaCurricular.json` usando normalización + alias desde `aliasAsignaturas.ts`.
- **Optativas:** Se extraen candidatos de antecedentes al vuelo del texto libre de la columna "Antecedentes" (busca nombres después de `:` y separa por `,`/`;`), y solo se reportan los que resuelven contra obligatorias conocidas.
- **Hitos:** Caso especial para "Prácticas profesionales" que valida acumulación de créditos obligatorios en vez de materias individuales.

---

## 6. Reglas del proyecto (.agents/AGENTS.md)

1. **Verificación y Gestión de Puertos:** Detección de puertos libres (`Get-NetTCPConnection`), consulta al usuario e identificación de procesos (`Stop-Process`) antes de iniciar dev servers.
2. **Sintaxis de Terminal PowerShell:** Uso exclusivo de cmdlets nativos de PowerShell (`Get-Content`, `Select-String`) y ejecución de scripts de prueba desde archivos `.mjs` aislados en `scratch/`.
3. **Protocolo de Verificación en 2 Niveles:** Nivel 1 (Estático `npm run lint` + `npm run build`) y Nivel 2 (Runtime Funcional con scripts en `scratch/`).
4. **Control de Ejecución de Propuestas vs. Implementación Directa:**
   - **Solicitud explícita de "Propuesta":** Generar `implementation_plan.md` y esperar la autorización explícita **SIN implementar cambios en el código**.
   - **Solicitud directa de acción:** Ejecutar e implementar directamente en el código sin requerir pausas previas de aprobación.

---

## 7. Cambios respecto a versiones anteriores

- **Modo Oscuro Neón / Translúcido (Glassmorphism):** Rediseño de las variables CSS de swatches en `.dark` usando `rgba(..., 0.15)` y tonos de texto vibrantes (400) para asegurar fidelidad exacta a nombres de colores (Rosa, Fucsia, etc.).
- **Integración de Radix UI Select + Motion:** Reemplazo de selectores nativos por primitivas accesibles `@radix-ui/react-select` animadas (`AnimatedSelect`) en `ColumnMappingDialog.tsx`, con manejo de valores renderizados explícitamente y comportamiento proporcional adaptado a móviles.
- **Normalización y Robustez de Z-Index:** Reestructuración jerárquica desde `z-0` hasta `z-[300]` para garantizar que popups de celdas (`z-[65]`), FAB (`z-50`), modales (`z-[200]`) y menús de Radix (`z-[300]`) no sufran bloqueos o superposiciones indebidas por tarjetas en estado `hover` (`z-[60]`).
- **Respeto Absoluto del Toggle de Prerrequisitos:** Corrección en `DayColumn.tsx` y `SubjectSelectionModal.tsx` para inhibir las leyendas y bloqueos de "Ya aprobada" cuando `showAntecedentes` está desactivado (`OFF`).
- **Rediseño del Seleccionador de Hojas de Excel (`ExcelSheetDialog.tsx`):** Compatibilidad con Tailwind v4 usando `accent-[var(--color-primary)]` y resaltado dinámico de filas seleccionadas con fondos traslúcidos azules.
- **Portales y Animaciones en Popovers:** Corrección del Color Picker en `ActivityCard.tsx` invirtiendo el anidamiento para portalar `<AnimatePresence>` al `document.body` con elevación `z-[200]`.
- **Sustitución de `window.confirm` por `<ConfirmDialog />`:** Modal de confirmación sobrio animado con Motion con variantes `danger`, `warning`, `info` para reemplazar avisos nativos.
- **Modo Colorido (`useColorfulMode`):** Toggle para asignación automática de colores por asignatura, controlable desde botón `Palette` en header y checkbox en Drawer móvil.
- **Botón FAB de "Lista Rápida":** Botón flotante (`ListPlus`) en esquina inferior derecha que se contrae al hacer scroll hacia abajo y se expande al hacer scroll hacia arriba, abriendo el `SubjectSelectionModal` para selección continua de múltiples materias.
- **Inferencia de Créditos entre Filas:** Cuando una fila del CSV no tiene créditos pero otra fila de la misma asignatura sí, el sistema los infiere automáticamente.
- **Accesibilidad del Uploader:** Refactorización del componente para usar un `<label>` HTML nativo vinculado al input con `sr-only` en vez de un `onClick` programático.
- **Chunk Splitting para xlsx:** Configuración en `vite.config.ts` para separar `xlsx` en un chunk independiente (`vendor-xlsx`) y reducir el tamaño del bundle principal.

---

## 8. Cómo correr y verificar el proyecto

### Modo de desarrollo

```powershell
npm run dev
```

### Verificación estática de tipos (Lint)

```powershell
npm run lint
```

### Compilación para producción

```powershell
npm run build
```

### Pruebas de Integración y Runtime

```powershell
node scratch/test_ui_flow.mjs
node scratch/test_http_and_html.mjs
node scratch/test_creditos_fallback.mjs
node scratch/test_uploader_accessibility.mjs
```
