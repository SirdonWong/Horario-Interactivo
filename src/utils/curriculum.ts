import mallaObligatorias from '../data/mallaCurricular.json';
import { aliasAsignaturas } from '../data/aliasAsignaturas';
 
function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
 
// Solo obligatorias — son estables semestre a semestre. Las optativas/libres
// ya NO tienen catálogo propio porque su oferta cambia cada periodo; sus
// antecedentes se detectan al vuelo desde el texto de la oferta (ver abajo).
const materiaById = new Map(mallaObligatorias.materias.map((m) => [m.id, m]));
const materiaByNormalizedName = new Map(mallaObligatorias.materias.map((m) => [normalize(m.nombre), m.id]));
 
export function resolveMateriaId(asignaturaCSV: string): string | null {
  const norm = normalize(asignaturaCSV);
  if (materiaByNormalizedName.has(norm)) return materiaByNormalizedName.get(norm)!;
  if (aliasAsignaturas[norm]) return aliasAsignaturas[norm];
  return null;
}
 
export function isValidMateriaId(id: string): boolean {
  return materiaById.has(id);
}
 
export function getMateriaNotas(asignaturaCSV: string): string | null {
  const materiaId = resolveMateriaId(asignaturaCSV);
  if (!materiaId || materiaId.startsWith('HITO:')) return null;
  const materia = materiaById.get(materiaId);
  return materia?.notas ?? null;
}
 
// Intenta extraer nombres de materias candidatas del texto libre de la
// columna Antecedentes de la oferta (ej. "2 antecedentes: Psicopatología,
// Evaluación de inteligencia y habilidades cognitivas"). Deliberadamente
// permisivo: toma todo lo que sigue a los primeros dos puntos ":" y lo separa
// por coma o punto y coma. Si el texto no tiene ese patrón, o los candidatos
// no resuelven contra el catálogo de obligatorias, no se genera ningún
// aviso — se omite en silencio en vez de arriesgar un falso positivo. Esto
// también descarta con naturalidad los casos que no son materias (notas de
// registro, requisitos administrativos, umbrales de crédito en texto suelto).
function extraerCandidatosDeTexto(antecedentesTexto: string): string[] {
  if (!antecedentesTexto) return [];
  const idx = antecedentesTexto.indexOf(':');
  if (idx === -1) return [];
  const despuesDeDosPuntos = antecedentesTexto.slice(idx + 1);
  return despuesDeDosPuntos
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
 
// asignaturaCSV: el nombre de la actividad tal como viene en su propia fila.
// antecedentesTexto: el texto libre de la columna Antecedentes de esa misma fila.
export function getPendingPrerequisites(
  asignaturaCSV: string,
  antecedentesTexto: string | undefined,
  completadas: Set<string>
): string[] {
  const materiaId = resolveMateriaId(asignaturaCSV);
 
  if (materiaId) {
    // Camino estructurado: la actividad en sí es una obligatoria conocida
    // (o el caso especial de Prácticas profesionales -> hito por créditos).
    if (materiaId.startsWith('HITO:')) {
      const hitoId = materiaId.replace('HITO:', '');
      const hito = mallaObligatorias.hitos.find((h) => h.id === hitoId);
      if (!hito) return [];
      const creditosAcumulados = sumCreditosObligatoriasCompletadas(completadas);
      return creditosAcumulados >= hito.creditos_obligatorios_requeridos
        ? []
        : [`${hito.nombre} (requiere ${hito.creditos_obligatorios_requeridos} créditos, llevas ${creditosAcumulados})`];
    }
 
    const materia = materiaById.get(materiaId);
    if (!materia) return [];
    return materia.antecedentes
      .filter((id) => !completadas.has(id))
      .map((id) => materiaById.get(id)?.nombre ?? id);
  }
 
  // Camino al vuelo: la actividad no se reconoce como obligatoria (lo más
  // probable es que sea una optativa o libre). Se intenta extraer
  // antecedentes de su propio texto, solo contra obligatorias conocidas.
  const candidatos = extraerCandidatosDeTexto(antecedentesTexto ?? '');
  const pendientes: string[] = [];
  for (const candidato of candidatos) {
    const candidatoId = resolveMateriaId(candidato);
    if (!candidatoId || candidatoId.startsWith('HITO:')) continue;
    if (completadas.has(candidatoId)) continue;
    const materiaCandidata = materiaById.get(candidatoId);
    if (materiaCandidata) pendientes.push(materiaCandidata.nombre);
  }
  return pendientes;
}
 
function sumCreditosObligatoriasCompletadas(completadas: Set<string>): number {
  let total = 0;
  for (const id of completadas) {
    const m = materiaById.get(id);
    if (m) total += m.creditos;
  }
  return total;
}
