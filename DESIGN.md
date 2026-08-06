# DESIGN.md

## 1. Directrices Estéticas y Principios de Diseño

### Concepto: *Sobriedad Funcional y Precisión Académica*
- **Minimalista y Utilitario:** Estructura limpia basada en rejillas ordenadas, alto contraste en la lectura de datos, espacios de respiración equilibrados y cero adornos innecesarios.
- **Soporte de Tema Dual:** Sistema de color verdaderamente semántico con Light Mode y Dark Mode nativos, cambiando suavemente mediante variables CSS / Tailwind.
- **Jerarquía Tipográfica Clara:** Distinción inmediata entre horas, nombres de asignaturas, claves de grupo, estado de prerrequisitos y alertas de traslape.

---

## 2. Paleta de Colores y Tokens Semánticos

### Light Mode (Limpio, Papel Técnico)
- **Fondo Principal (`bg-app`):** `#F8FAFC` (Slate 50)
- **Fondo de Superficie/Tarjetas (`bg-surface`):** `#FFFFFF` (White)
- **Bordes y Divisores (`border-subtle`):** `#E2E8F0` (Slate 200)
- **Texto Principal (`text-main`):** `#0F172A` (Slate 900)
- **Texto Secundario (`text-muted`):** `#64748B` (Slate 500)
- **Acento Primario (`color-primary`):** `#2563EB` (Blue 600)
- **Acento de Éxito / Materia Aprobada:** `#16A34A` (Green 600)
- **Acento de Alerta / Traslape:** `#DC2626` (Red 600)
- **Acento de Advertencia / Prerrequisito Pendiente:** `#D97706` (Amber 600)

### Dark Mode (Sobrio, Pro Studio)
- **Fondo Principal (`bg-app`):** `#090D16` (Obsidian / Slate 950 ultra oscuro)
- **Fondo de Superficie/Tarjetas (`bg-surface`):** `#1E293B` (Slate 800)
- **Bordes y Divisores (`border-subtle`):** `#334155` (Slate 700)
- **Texto Principal (`text-main`):** `#F8FAFC` (Slate 50)
- **Texto Secundario (`text-muted`):** `#94A3B8` (Slate 400)
- **Acento Primario (`color-primary`):** `#3B82F6` (Blue 500)
- **Acento de Éxito / Materia Aprobada:** `#22C55E` (Green 500)
- **Acento de Alerta / Traslape:** `#EF4444` (Red 500)
- **Acento de Advertencia / Prerrequisito Pendiente:** `#F59E0B` (Amber 500)

---

## 3. Tipografía y Micro-Interacciones

### Tipografía
- **Familia Tipográfica:** Sans-serif moderna e industrial (Inter / system-ui, `-apple-system`, `BlinkMacSystemFont`).
- **Escala de Fuentes:**
  - `Title`: 1.25rem - 1.5rem (Semibold / Bold)
  - `Header Celda/Día`: 0.875rem (Medium / Semibold, Uppercase / Tracking-wide)
  - `Texto Principal / Materia`: 0.875rem (Regular / Medium)
  - `Meta / Horario / Grupo`: 0.75rem (Regular / Mono si aplica)

### Micro-Interacciones
- **Transición de Tema:** Transición suave de 200ms en cambios de color de fondo y texto (`transition-colors duration-200`).
- **Hover en Celdas y Tarjetas:** Elevación imperceptible o sutil cambio de borde (`hover:border-primary/50`).
- **Selección de Celda Horaria:** Borde de enfoque activo de 2px con sombra sutil de acento para destacar el bloque filtrado.

---

## 4. Estructura de Layout y Componentes

1. **Encabezado Superior (Header & Controls):**
   - Título sobrio de la app.
   - Selector / Interruptor global de Tema (Light / Dark).
   - Acciones principales agrupadas: Subir CSV(s), Importar/Exportar JSON, Exportar a PNG.
2. **Layout Principal (Grid Responsiva de 2 Columnas):**
   - **Columna Izquierda / Panel Principal (Calendario Semanal):**
     - Vista matricial de días y horas.
     - Selección interactiva de celdas.
     - Indicador claro de bloques agendados vs. bloques libres.
   - **Columna Derecha / Drawer Auxiliar (Filtro por Bloque & Prerrequisitos):**
     - Muestra materias disponibles para la celda horaria seleccionada.
     - Checklist organizado por semestres con progreso visual de asignaturas aprobadas.
3. **Modales y Diálogos:**
   - **Mapeo de CSV:** Estilo modal limpio con tabla comparativa de previsualización de datos y dropdowns claros de asignación de columnas.
