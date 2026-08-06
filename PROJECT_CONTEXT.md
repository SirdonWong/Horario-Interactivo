# PROJECT_CONTEXT.md

## 1. Resumen general

- **Qué hace la app:** Aplicación web sobria y minimalista (basada en los principios de **Impeccable Design**) para planificar y optimizar horarios académicos universitarios. Permite cargar múltiples archivos CSV y Excel (`.xlsx`) con la oferta académica (obligatorias, optativas y libres), seleccionar asignaturas y grupos de forma interactiva en una grilla semanal deslizable con horas fijas, prevenir automáticamente traslapes/conflictos de horario, personalizar el color de cada materia (con alternancia entre estilo neutral monocromático y modo colorido), verificar y advertir sobre antecedentes/prerrequisitos pendientes (obligatorias mediante malla curricular, y optativas extrayéndolos al vuelo de su descripción en el documento) (con un interruptor global en el encabezado `TRUE`/`FALSE`), desplegar la información completa de sesiones semanales múltiples ("Martes y Jueves 12:00-14:00"), gestionar materias aprobadas mediante un **pop-up modal emergente de prerrequisitos** con buscador instantáneo, acordeón animado, selección masiva por semestre y animaciones fluidas con **Motion**, reemplazar alertas emergentes nativas por un componente modal **`<ConfirmDialog />`** animado, incorporar un seleccionador de hojas para archivos Excel, alternar entre **Dark Mode y Light Mode**, adaptar fluidamente la interfaz a teléfonos móviles mediante un **Drawer deslizable** y **Dropdowns Inteligentes** (con auto-centrado de vista, control elástico proporcional del `z-index` y anchos variables `vw`), detectar automáticamente las columnas del archivo subido y mostrar un diálogo de mapeo manual cuando no se reconocen (con caché por fingerprint de encabezados en `localStorage`), guardar el estado en `localStorage` con control de versión de esquema (`v1`), y exportar el horario final como imagen PNG con indicador visual de carga.
- **Stack tecnológico:**
  - **Framework / UI:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - **Lenguaje:** TypeScript 5.8 (`typescript@~5.8.2`)
  - **Bundler / Build Tool:** Vite 6 (`vite@^6.2.3`)
  - **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`) con sistema de tokens CSS `:root` y `.dark` para diseño Impeccable (Light / Dark mode).
  - **Animaciones UI / Motion:** `motion` (`motion/react@^12.23.24`) para entradas/salidas de modales, colapsos de acordeón, barras de progreso, cuadros de confirmación y feedback táctil (*tap scale*).
  - **Librerías clave:**
    - `papaparse@^5.5.4` (parseo y normalización de archivos CSV)
    - `xlsx` (parseo de archivos Excel `.xlsx` cargados dinámicamente)
    - `html-to-image@^1.11.13` (exportación del calendario a imagen PNG)
    - `lucide-react@^0.546.0` (iconografía de la interfaz: `Sun`, `Moon`, `Menu`, `X`, `GraduationCap`, `Search`, `ChevronDown`, `Loader2`, `AlertTriangle`, `HelpCircle`, etc.)
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
│   ├── index.css               # Importaciones base de Tailwind CSS + tokens de variables CSS (:root y .dark).
│   ├── types.ts                # Interfaces de TypeScript y constantes de días/horas.
│   ├── components/             # Componentes de la interfaz de usuario.
│   │   ├── ActivityCard.tsx    # Tarjeta gráfica para clases agendadas (badge de Grupo, tooltip con Modalidad/Grupo/Créditos/Profesor/Sala, a11y keyboard y aviso de antecedentes).
│   │   ├── Calendar.tsx        # Estructura del calendario (grid min-w-[720px], sticky left time column z-30, horizontal scroll).
│   │   ├── ColumnMappingDialog.tsx # Modal para mapeo manual de columnas CSV (a11y focus trap + escape listener).
│   │   ├── ConfirmDialog.tsx   # Modal de confirmación estilizado y animado (reemplazo de window.confirm).
│   │   ├── DayColumn.tsx       # Columna de un día: dropdowns a11y interactivos móviles con auto-centrado y manejo inteligente de widths/z-index.
│   │   ├── ExcelSheetDialog.tsx # Diálogo iterativo para seleccionar múltiples hojas de cálculo desde un solo `.xlsx`.
│   │   ├── PrerequisiteChecklist.tsx # Modal emergente con buscador, acordeón por semestre, selección masiva y Motion.
│   │   ├── SubjectSelectionModal.tsx # Modal de "Selección Rápida": listado con buscador, filtrado por materias aprobadas y conflictos de horario.
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
  - `:root` para **Light Mode** (`--bg-app: #f8fafc`, `--bg-surface: #ffffff`, `--text-main: #0f172a`, `--border-subtle: #e2e8f0`, etc.).
  - `.dark` para **Dark Mode** (`--bg-app: #090d16`, `--bg-surface: #121826`, `--text-main: #f1f5f9`, `--border-subtle: #1e293b`, etc.).
- **Persistencia en `App.tsx`:**
  - Estado `theme` inicializado desde `localStorage.getItem('theme')` o preferencia del sistema (`prefers-color-scheme`).
  - Aplica o remueve la clase `.dark` sobre `document.documentElement`.
  - Botón selector en la barra superior con iconos `Sun` / `Moon`.

### Esquema del CSV y sistema de mapeo de columnas

El parser soporta **15 campos canónicos** definidos en `src/utils/columnMapping.ts`. Dos son obligatorios (`Asignatura`, `Grupo`) y al menos un día de la semana debe estar mapeado. El resto es opcional:

- `Modalidad`: Modalidad de la materia (ej. "Presencial", "OPTATIVA").
- `Asignatura` (**obligatorio**): Nombre de la materia.
- `Créditos`: Número de créditos académicos.
- `Grupo` (**obligatorio**): Código o número de grupo.
- `Profesor`: Nombre del docente.
- `Antecedentes`: Requisitos previos o asignaturas requeridas.
- `Sala`: Aula o espacio asignado.
- `Horario`: Texto descriptivo original del horario.
- `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes`, `Sábado`, `Domingo`: Rangos horarios por día.

**Flujo de mapeo al subir un CSV:**

1. Se lee preview (encabezados + 3 filas) vía `previewCSV()` sin parsear todo el archivo.
2. Se calcula `fingerprintHeaders(headers)` — huella ordenada y normalizada de los encabezados.
3. Se busca en `localStorage` clave `columnMappings` (un `Record<fingerprint, ColumnMapping>`) si ya hay un mapeo confirmado para ese fingerprint → usarlo directo.
4. Si no hay mapeo guardado, se calcula `suggestColumnMapping(headers)` por coincidencia normalizada.
5. Si `mappingIsHighConfidence(mapping)` (todos los campos excepto Domingo mapeados) → procesar directo y guardar fingerprint.
6. Si no → abrir `<ColumnMappingDialog />` con vista previa y sugerencias pre-rellenadas. El botón "Confirmar" solo se habilita si `mappingCoversEssentials()` (Asignatura + Grupo + ≥1 día). Al confirmar, se guarda el fingerprint.

### Esquema de la Malla Curricular (`src/data/mallaCurricular.json`)

```typescript

export interface MateriaMalla {
  id: string;
  nombre: string;
  creditos: number;
  semestre: number;
  antecedentes: string[];
  desbloquea: string[];
}

export interface HitoMalla {
  id: string;
  nombre: string;
  creditos_obligatorios_requeridos: number;
  descripcion: string;
}

```



### Interfaces en TypeScript (`src/types.ts`)

```typescript

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 to 21

export interface TimeRange {
  start: number; // Minutos desde la medianoche (ej. 420 = 7:00 AM)
  end: number;   // Minutos desde la medianoche (ej. 540 = 9:00 AM)
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
  id: string; // Generado mediante `${asignatura}-${grupo}`
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

---

## 4. Arquitectura UI/UX Impeccable y Componentes Clave

### A. Modal Emergente de Historial de Prerrequisitos (`PrerequisiteChecklist.tsx`)

Transformado en un modal emergente centrado estilo pop-up:

- **Estructura Diálogo Modal:** `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4`.
- **Cierre por Backdrop Click:** Evento `onClick` sobre el contenedor principal (`e.target === e.currentTarget`) que cierra el modal al presionar fuera del cuadro.
- **Teclado / a11y:** Cierre con la tecla `Escape`, botón de cierre `X` y atributos ARIA (`role="dialog"`, `aria-modal="true"`).
- **Animaciones Motion (`motion/react`):**
  - Entrada y salida del modal con efecto *Spring* (`AnimatePresence` + `motion.div` con `scale: 0.96 -> 1` y `opacity: 0 -> 1`).
  - Colapso/expansión animada de semestres con transiciones de altura (`height: 'auto' -> 0`) y rotación de flechas 180°.
  - Micro-interacción táctil en materias (`whileTap={{ scale: 0.98 }}`).
  - Barra de progreso animada por semestre según las materias aprobadas.
- **Buscador Instantáneo:** Filtra materias por nombre en tiempo real sin importar el semestre.
- **Selección Masiva por Semestre:** Checkbox en la cabecera de cada semestre para aprobar o desaprobar todas sus materias de un solo clic.

### B. Componente Diálogo de Confirmación Reusable (`ConfirmDialog.tsx`)

- Reemplaza los avisos nativos del navegador (`window.confirm`) por una ventana flotante de confirmación sobria y animada.
- **Animaciones Motion:** Entrada y salida con escala *spring* y difuminado de fondo (*backdrop blur*).
- **Variantes Visuales:** `danger` (rojo), `warning` (ámbar) e `info` (azul) con iconos `AlertTriangle` / `HelpCircle`.
- **Cierre:** Soporta cierre por tecla `Escape`, clic exterior (*backdrop*) o botón `X` / "Cancelar".
- **Usos Activos:** Confirmación de importación de JSON en `PrerequisiteChecklist.tsx`, y confirmación de "Reiniciar Calendario" / "Eliminar CSV" / "Limpiar Todo" en `App.tsx`.

### C. Tarjeta Interactiva en la Barra Lateral (`App.tsx`)

- Reemplaza el antiguo acordeón del sidebar por un botón/tarjeta sobria con icono `GraduationCap` que muestra el número de materias aprobadas y al pulsar abre el modal emergente.

### D. Layout Responsivo Móvil & Calendario Deslizable

- **Mobile Drawer:** En pantallas pequeñas (< 768px), la barra lateral se oculta y se despliega como un panel lateral desizable (`isMobileSidebarOpen`) accionado por un botón de menú hamburguesa (`Menu`) en la cabecera.
- **Calendario con Ancho Garantizado & Horas Fijas (`Calendar.tsx`):**
  - Contenedor con `min-w-[720px]` y desplazamiento horizontal (`overflow-x-auto`) en dispositivos móviles.
  - La columna de horas se mantiene fija a la izquierda mediante `sticky left-0 z-30` con fondo opaco `bg-[var(--bg-surface)]` y sombra.
  - La celda superior izquierda se mantiene fija en `sticky top-0 left-0 z-40`.
  - Las tarjetas de materias agendadas en `DayColumn.tsx` usan `z-10` (hover `z-20`), deslizándose por detrás de la columna fija de horas sin solapamientos visuales.

### E. Exportación PNG con Spinner (`App.tsx`)

- Botón de descarga PNG que activa el estado `isExporting`, deshabilita el botón e inserta un icono giratorio `Loader2`.
- Resuelve la descarga en Chrome mediante conversión del Data URL en `Blob` y `URL.createObjectURL(blob)`.

---

## 5. Lógica central y persistencia

### A. Formateo de sesiones semanales múltiples en el desplegable de materias

Ubicación: `src/utils/time.ts`

```typescript

export function formatWeeklySchedules(schedules: ActivitySchedule[]): string {
  if (!schedules || schedules.length <= 1) return '';

  const groupsByTime = new Map<string, DayOfWeek[]>();

  for (const s of schedules) {
    const timeStr = `${formatTime(s.timeRange.start)}-${formatTime(s.timeRange.end)}`;
    if (!groupsByTime.has(timeStr)) {
      groupsByTime.set(timeStr, []);
    }
    const daysList = groupsByTime.get(timeStr)!;
    if (!daysList.includes(s.day)) {
      daysList.push(s.day);
    }
  }

  const parts: string[] = [];

  for (const [timeStr, days] of groupsByTime.entries()) {
    let daysStr = '';
    if (days.length === 1) {
      daysStr = days[0];
    } else if (days.length === 2) {
      daysStr = `${days[0]} y ${days[1]}`;
    } else {
      const last = days[days.length - 1];
      const rest = days.slice(0, days.length - 1).join(', ');
      daysStr = `${rest} y ${last}`;
    }
    parts.push(`${daysStr} ${timeStr}`);
  }

  return parts.join(', ');
}

```

### B. Sistema de control de versiones y guardado/recuperación en localStorage

Ubicación: `src/utils/storage.ts`

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

## 6. Reglas del proyecto (.agents/AGENTS.md)

1. **Verificación y Gestión de Puertos:** Detección de puertos libres (`Get-NetTCPConnection`), consulta al usuario e identificación de procesos (`Stop-Process`) antes de iniciar dev servers.
2. **Sintaxis de Terminal PowerShell:** Uso exclusivo de cmdlets nativos de PowerShell (`Get-Content`, `Select-String`) y ejecución de scripts de prueba desde archivos `.mjs` aislados en `scratch/`.
3. **Protocolo de Verificación en 2 Niveles:** Nivel 1 (Estático `npm run lint` + `npm run build`) y Nivel 2 (Runtime Funcional con scripts en `scratch/`).
4. **Control de Ejecución de Propuestas vs. Implementación Directa:**
   - **Solicitud explícita de "Propuesta":** Generar `implementation_plan.md` y esperar la autorización explícita **SIN implementar cambios en el código**.
   - **Solicitud directa de acción:** Ejecutar e implementar directamente en el código sin requerir pausas previas de aprobación.

---

## 7. Cambios respecto a versiones anteriores

- **Rediseño Minimalista Impeccable:** Creación de `PRODUCT.md` y `DESIGN.md`. Eliminación de colores genéricos por una paleta HSL con modos Claro y Oscuro.
- **Transformación de Prerrequisitos:** El checklist pasó de ser un acordeón en la barra lateral a un modal emergente interactivo completo con buscador, selección masiva, semestres colapsables y animaciones Motion.
- **Sustitución de `window.confirm` por `<ConfirmDialog />`:** Creación de un modal de confirmación sobrio animado con Motion para reemplazar todas las ventanas nativas emergentes del navegador.
- **Catálogo de Optativas Dinámico:** Se eliminó el catálogo en duro de materias optativas; ahora sus prerrequisitos se extraen al vuelo analizando la descripción en el CSV.
- **Responsividad Móvil Inteligente:** Adición del Drawer deslizable para el menú, scroll horizontal con horas `sticky` en el calendario, anchos proporcionales en los menús desplegables (`vw`), y centrado dinámico al seleccionarlos (`scrollIntoView`).
- **Modal de Selección Rápida:** Implementación de un modal con barra de búsqueda para añadir varias materias consecutivamente desde una lista, con dimensiones puramente responsivas (`vw/vh`) en móvil y un diseño libre de emojis para mayor legibilidad.
- **Saneamiento del Repositorio:** Eliminación de dependencias no utilizadas (como express, html2canvas, @google/genai, dotenv, tsx) provenientes de la plantilla original, borrado de archivos redundantes (`.env`, `metadata.json`) y anonimización de nombres de profesores en los archivos de prueba para la privacidad de los datos.
- **Ocultamiento Contextual Inteligente:** Las materias ya aprobadas se visualizan atenuadas (opacidad 50%, "Ya aprobada", sin botón de añadir) en los menús desplegables del calendario y en el modal de Selección Rápida para reducir carga cognitiva sin causar confusión.
- **Jerarquía Visual Consistente:** Consolidación estructural de los valores de profundidad (`z-[200]`) para asegurar que todos los modales (incluyendo *Prerrequisitos*, *Confirmación*, *Mapeo*, *Selección Rápida* y *Selección de Excel*) flotan siempre impecablemente por encima de los encabezados fijos (`z-[80]`) del calendario, integrando en paralelo transiciones completas mediante *Motion* de Framer a componentes emergentes adicionales como `<ExcelSheetDialog />`.
- **Accesibilidad Mejorada:** Soporte de navegación por teclado (`tabIndex`, `role="button"`, `onKeyDown` para `Enter`/`Space`/`Escape`) en tarjetas y celdas.

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
