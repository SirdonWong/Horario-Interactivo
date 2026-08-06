# PRODUCT.md

## 1. Visión y Público Objetivo

### Target User
Estudiantes universitarios que planifican y optimizan su horario semestral previo al proceso de inscripción/carga de asignaturas. Acceden desde cualquier dispositivo (smartphone, tablet o laptop) y buscan armar la combinación de clases más eficiente, cómoda y libre de conflictos sin lidiar con interfaces complejas.

### Core Value Proposition
Una herramienta intuitiva y ultra-eficiente para la creación de horarios académicos:
- **Carga sin fricción:** Soporta múltiples archivos CSV con la oferta académica actual y auto-mapeo inteligente de columnas.
- **Planificación interactiva por bloque:** Al hacer clic o seleccionar cualquier horario/celda del día, muestra al instante todas las asignaturas y grupos disponibles en ese momento.
- **Validación automática e instantánea:** Detecta traslapes de horario y verifica el cumplimiento de prerrequisitos/antecedentes según las materias aprobadas.
- **Gestión rápida de progreso:** Permite marcar materias aprobadas manualmente en una checklist o importar/exportar un archivo `JSON` con el historial académico acumulado.
- **Exportación en 1-clic:** Genera una imagen PNG del horario final listo para consultar o compartir.

---

## 2. Principios de Producto y UX

1. **Utilidad y Claridad Visual por Encima de la Redundancia:**
   - La interfaz debe ser sobria, minimalista y directa. Cero distracciones o elementos decorativos innecesarios.
2. **Accesibilidad Multi-Dispositivo:**
   - Diseño completamente responsivo que garantice la misma facilidad de uso tanto en pantallas táctiles móviles pequeñas como en monitores de escritorio.
3. **Simplicidad para Usuarios Inexpertos:**
   - Flujos claros con asistencia contextual. Errores o incompatibilidades de horario se comunican de forma amable e instructiva.
4. **Respeto al Estado y Privacidad del Usuario:**
   - Persistencia local inmediata (`localStorage`) con respaldo portátil vía importación/exportación JSON y exportación a imagen PNG.

---

## 3. Preservación y Funcionalidades Sagradas (Durable Constraints)

El rediseño del sistema **DEBE** preservar de forma estricta las siguientes funcionalidades e interacciones:

- [x] **Calendario semanal visual interactivo** (Lunes a Sábado, horas del día).
- [x] **Interacción por celda horaria:** Selección de una franja horaria para filtrar y visualizar las asignaturas disponibles en ese horario específico.
- [x] **Carga multi-CSV:** Capacidad de cargar uno o múltiples archivos CSV con la oferta académica.
- [x] **Modal de mapeo de columnas CSV:** Asistencia interactiva cuando las columnas del CSV no coincidan exactamente.
- [x] **Panel/Checklist de prerrequisitos por semestre:** Visualización de la malla y estado de aprobación de materias antecedente.
- [x] **Importación / Exportación JSON:** Cargar y descargar el estado de materias aprobadas en formato JSON.
- [x] **Exportación a PNG:** Descarga limpia en imagen del calendario resultante.
- [x] **Soporte Dark Mode / Light Mode:** Alternancia de tema sobrio y optimizado para legibilidad.
