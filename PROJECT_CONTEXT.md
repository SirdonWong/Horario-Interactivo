# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria y minimalista (basada en los principios de **Impeccable Design**) para planificar y optimizar horarios académicos universitarios. Permite cargar múltiples archivos CSV y Excel (`.xlsx`) con la oferta académica (obligatorias, optativas y libres), seleccionar asignaturas y grupos de forma interactiva en una grilla semanal deslizable con horas fijas, prevenir automáticamente traslapes/conflictos de horario, personalizar el color de cada materia con estilo **Neón / Translúcido Glassmorphic** en modo oscuro, verificar y advertir sobre antecedentes/prerrequisitos pendientes (obligatorias mediante malla curricular, y optativas extrayéndolos al vuelo de su descripción en el documento) con un interruptor global en el encabezado `TRUE`/`FALSE` que controla estrictamente el bloqueo y las etiquetas "Ya aprobada", desplegar la información completa de sesiones semanales múltiples ("Martes y Jueves 12:00-14:00"), gestionar materias aprobadas mediante un **pop-up modal emergente de prerrequisitos** con buscador instantáneo, acordeón animado, selección masiva por semestre y animaciones fluidas con **Motion**, reemplazar alertas emergentes nativas por un componente modal **`<ConfirmDialog />`** animado, incorporar un seleccionador de hojas para archivos Excel con resaltado interactivo de filas y checkboxes acentuados (`accent`), alternar entre **Dark Mode y Light Mode**, adaptar fluidamente la interfaz a teléfonos móviles mediante un **Drawer deslizable** y **Dropdowns Inteligentes** con anchos proporcionales e interactivos en **Radix UI**, detectar automáticamente las columnas del archivo subido y mostrar un diálogo de mapeo manual accesible cuando no se reconocen (con caché por fingerprint de encabezados en `localStorage`), guardar el estado en `localStorage` con control de versión de esquema (`v1`), y exportar el horario final como imagen PNG con indicador visual de carga.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`)
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con sistema de tokens CSS `:root` y `.dark` (estilo Neón translúcido para swatches en modo oscuro).
  - **Primitivas UI Accesibles:** `@radix-ui/react-select@^2.3.7` para menús desplegables del modal de mapeo de columnas.
  - **Animaciones UI / Motion:** `motion` (`motion/react@^12.23.24`) para entradas/salidas de modales, colapsos de acordeón, barras de progreso, cuadros de confirmación, popovers portaled y feedback táctil (*tap scale*).
  - **Librerías clave:**
    - `papaparse@^5.5.4` (parseo y normalización de archivos CSV)
    - `xlsx` (parseo de archivos Excel `.xlsx` cargados dinámicamente)
    - `html-to-image@^1.11.13` (exportación del calendario a imagen PNG)
    - `lucide-react@^0.546.0` (iconografía de la interfaz: `Sun`, `Moon`, `Menu`, `X`, `GraduationCap`, `Search`, `ChevronDown`, `Loader2`, `AlertTriangle`, `HelpCircle`, `FileSpreadsheet`, etc.)
  - **Librerías auxiliares y utilidades:** `clsx@^2.1.1` y `tailwind-merge@^3.6.0` (combinación condicional de clases CSS).

---

## 2. Estructura de archivos

```text

Horario-Académico/
├── .agents/                    # Reglas personalizadas del proyecto para agentes de IA.
│   └── AGENTS.md               # Reglas globales (gestión de puertos, sintaxis PowerShell, protocolo 2 niveles, control de propuestas vs ejecución).
├── .gitignore                  # Exclusiones de control de versiones Git.
├── DESIGN.md                   # Sistema de diseño Impeccable (tokens de color, tipografía, Dark/Light mode).
├── PRODUCT.md                  # Estrategia de producto y propuesta de valor única.
├── index.html                  # HTML principal y contenedor raíz de la aplicación Vite.
├── package.json                # Dependencias, scripts del proyecto y configuración de paquetes.
├── README.md                   # Descripción rápida del repositorio.
├── tsconfig.json               # Configuración de TypeScript (incluye resolveJsonModule: true).
├── vite.config.ts              # Configuración del bundler Vite.
├── scratch/                    # Scripts de verificación y pruebas funcionales de integración.
│   ├── test_http_and_html.mjs  # Prueba de conectividad HTTP 200 en localhost:3000.
│   └── test_ui_flow.mjs        # Script de verificación de integridad de componentes UI.
├── src/                        # Código fuente de la aplicación.
│   ├── App.tsx                 # Estado global, theme toggle, mobile drawer, export PNG spinner, modal prerrequisitos, ConfirmDialog.
│   ├── main.tsx                # Punto de entrada de React que renderiza App.tsx en el DOM.
│   ├── index.css               # Importaciones base de Tailwind CSS + tokens de variables CSS (:root y .dark con paletas Neón).
│   ├── types.ts                # Interfaces de TypeScript y constantes de días/horas.
│   ├── components/             # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx    # Tarjeta gráfica para clases agendadas (badge de Grupo, tooltip con detalles, a11y keyboard, aviso de antecedentes y Color Picker en portal z-[200]).
│   │   ├── Calendar.tsx        # Estructura del calendario (grid min-w-[720px], sticky left time column z-40, sticky header z-[70]/z-[80], horizontal scroll).
│   │   ├── ColumnMappingDialog.tsx # Modal de mapeo de columnas CSV con Radix UI Select + Framer Motion (`AnimatedSelect`) y proporciones móviles fluidas.
│   │   ├── ConfirmDialog.tsx   # Modal de confirmación estilizado y animado (reemplazo de window.confirm).
│   │   ├── DayColumn.tsx       # Columna de un día: menú flotante de celda activa (z-[65]), tarjetas agendadas z-10 (hover z-[60]) y respetuoso del toggle showAntecedentes.
│   │   ├── ExcelSheetDialog.tsx # Diálogo iterativo para seleccionar hojas de cálculo con resaltado interactivo de filas y checkboxes acentuados (`accent`).
│   │   ├── PrerequisiteChecklist.tsx # Modal emergente con buscador, acordeón por semestre, selección masiva y Motion.
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": listado con buscador, filtrado por materias aprobadas (respetando showAntecedentes) y conflictos de horario.
│   │   └── Uploader.tsx        # Carga de CSV y Excel con interceptor para hojas, preview → fingerprint → cache/auto-suggest → dialog.
│   ├── data/                   # Catálogos de datos estáticos.
│   │   ├── aliasAsignaturas.ts # Tabla de normalización/mapeo de nombres del CSV a la malla (incluye typos reales).
│   │   ├── mallaCurricular.json # Plan de estudios oficial (materias obligatorias, antecedentes, créditos, hitos).
│   │   └── malla_curricular_psicologia_mefi.json # Respaldo / fuente original de la malla curricular.
│   ├── lib/                    # Configuración de librerías auxiliares.
│   │   └── utils.ts            # Helper cn() para la concatenación de clases Tailwind.
│   └── utils/                  # Lógica de soporte y módulos de cálculo.
│       ├── colors.ts           # Asignación de paleta de colores predefinida por asignatura.
│       ├── columnMapping.ts    # Campos canónicos, fingerprinting, auto-sugerencia y validación de mapeo de columnas.
│       ├── csv.ts              # Preview de encabezados, parseo con ColumnMapping opcional, limpieza de BOM.
│       ├── curriculum.ts       # Resolución de IDs contra catálogo combinado (obligatorias+optativas) y prerrequisitos.
│       ├── excel.ts            # Utilidades lazy-loaded para extracción de hojas y conversión hoja-a-CSV en el cliente.
│       ├── progress.ts         # Exportación e importación del avance curricular (checklist) en formato JSON.
│       ├── storage.ts          # Persistencia en localStorage con versionado de esquema.
│       └── time.ts             # Conversión de texto a minutos, formateo semanal agrupado (formatWeeklySchedules), traslapes y conflictos.
├── test-fixtures/              # Archivos y fixtures de prueba para regresión y mapeos.
│   └── OFERTA_OPTATIVAS_MODIFIED.csv # CSV modificado con headers renombrados para probar el diálogo de mapeo.
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
    Las tarjetas de color en modo oscuro emplean un fondo traslúcido compuesto por el color puro de la paleta al 15% de opacidad (`rgba(..., 0.15)`) combinado con texto vibrante (nivel 400 de Tailwind, ej. `#f472b6` para Rosa, `#818cf8` para Índigo). Esto evita que los colores se perciban como vino/negro y garantiza fidelidad total a su nombre.
- **Persistencia en `App.tsx`:**
  - Estado `theme` inicializado desde `localStorage.getItem('theme')` o preferencia del sistema (`prefers-color-scheme`).
  - Aplica o remueve la clase `.dark` sobre `document.documentElement`.
  - Botón selector en la barra superior con iconos `Sun` / `Moon`.

---

## 4. Jerarquía Visual y Capas de Apilamiento (Z-Index Architecture)

Para evitar solapamientos visuales y asegurar una interacción limpia en escritorios y móviles, la aplicación mantiene un orden estricto de profundiades `z-index`:

- **Nivel Fondo y Base (`z-0` a `z-20`):**
  - `z-0`: Grilla de líneas horizontales de fondo del calendario.
  - `z-10`: Tarjetas de materias (`ActivityCard`) en reposo y Sidebar en versión escritorio (`lg:z-10`).
  - `z-20`: Header superior y Footer de la aplicación.
- **Nivel Calendario y Scroll (`z-40` a `z-80`):**
  - `z-40`: Columna lateral fija de horas (`sticky left-0`).
  - `z-50`: Tooltips emergentes de detalles en `ActivityCard`.
  - `z-[60]`: Estado `hover` y enfoque de tarjetas de materias en el calendario (`hover:z-[60]`).
  - `z-[65]`: Celda activa del calendario y menú desplegable de "Materias Disponibles" (`DayColumn.tsx`), colocado por encima de tarjetas en hover para evitar bloqueos.
  - `z-[70]`: Encabezado sticky de días de la semana (Lunes-Domingo).
  - `z-[80]`: Celda de origen (esquina superior izquierda) del calendario.
- **Nivel Navegación Móvil y Botones Flotantes (`z-[90]` a `z-[100]`):**
  - `z-[90]`: Botón flotante "Lista Rápida" (esquina inferior derecha) y fondo velado (*backdrop*) del menú móvil.
  - `z-[100]`: Menú desplegable lateral (Drawer) en dispositivos móviles.
- **Nivel Modales y Popovers Globales (`z-[200]` a `z-[300]`):**
  - `z-[200]`: Diálogos emergentes principales (`ConfirmDialog`, `ExcelSheetDialog`, `PrerequisiteChecklist`, `SubjectSelectionModal`, `ColumnMappingDialog` contenedor backdrop y Popover de Color Picker de `ActivityCard`).
  - `z-[300]`: Menús flotantes de selección en Radix UI (`AnimatedSelect` en `ColumnMappingDialog.tsx`).

---

## 5. Lógica central y persistencia

### A. Control Estricto del Toggle "Validar Prerrequisitos" (`showAntecedentes`)

- Cuando `showAntecedentes` es `true`, el sistema consulta `materiasCompletadas` para mostrar las asignaturas aprobadas de forma atenuada con la etiqueta "Ya aprobada" e inhabilita su selección tanto en los desplegables de hora como en la Lista Rápida (`SubjectSelectionModal`).
- Cuando `showAntecedentes` es `false`, se deshabilita por completo la verificación de materias completadas en la grilla y modales. Las asignaturas aprobadas ya no muestran el rótulo "Ya aprobada" ni sufren atenuación/bloqueo, permitiendo agregarlas libremente a la agenda.

### B. Formateo de sesiones semanales múltiples

Ubicación: `src/utils/time.ts` (`formatWeeklySchedules`)

Agrupa rangos horarios idénticos en días consecutivos o dispersos (ej. "Lunes y Miércoles 08:00-10:00, Viernes 08:00-10:00").

### C. Persistencia con Versionado de Esquema

Ubicación: `src/utils/storage.ts` (`SCHEMA_VERSION = 1`)

Mantiene la sincronización de materias seleccionadas, avances de prerrequisitos, firmas de mapeo de columnas y tema mediante payloads versionados que previenen errores por desactualización de formato.

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
- **Integración de Radix UI Select + Framer Motion:** Reemplazo de selectores nativos por primitivas accesibles `@radix-ui/react-select` animadas (`AnimatedSelect`) en `ColumnMappingDialog.tsx`, con manejo de valores renderizados explícitamente y comportamiento proporcional adaptado a móviles.
- **Normalización y Robustez de Z-Index:** Reestructuración jerárquica desde `z-0` hasta `z-[300]` para garantizar que popups de celdas (`z-[65]`), botón flotante (`z-[90]`), modales (`z-[200]`) y menús de Radix (`z-[300]`) no sufran bloqueos o superposiciones indebidas por tarjetas en estado `hover` (`z-[60]`).
- **Respeto Absoluto del Toggle de Prerrequisitos:** Corrección en `DayColumn.tsx` y `SubjectSelectionModal.tsx` para inhibir las leyendas y bloqueos de "Ya aprobada" cuando `showAntecedentes` está desactivado (`FALSE`).
- **Rediseño del Seleccionador de Hojas de Excel (`ExcelSheetDialog.tsx`):** Compatibilidad con Tailwind v4 usando `accent-[var(--color-primary)]` y resaltado dinámico de filas seleccionadas con fondos traslúcidos azules.
- **Portales y Animaciones en Popovers:** Corrección del Color Picker en `ActivityCard.tsx` invirtiendo el anidamiento para portalar `<AnimatePresence>` al `document.body` con elevación `z-[200]`.
- **Sustitución de `window.confirm` por `<ConfirmDialog />`:** Modal de confirmación sobrio animado con Motion para reemplazar avisos nativos.

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
```
