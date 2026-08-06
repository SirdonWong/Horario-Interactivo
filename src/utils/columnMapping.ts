export interface CampoCanonico {
  key: string;
  label: string;
  requerido: boolean;
}

export const CAMPOS_CANONICOS: CampoCanonico[] = [
  { key: 'modalidad', label: 'Modalidad', requerido: false },
  { key: 'asignatura', label: 'Asignatura', requerido: true },
  { key: 'creditos', label: 'Créditos', requerido: false },
  { key: 'grupo', label: 'Grupo', requerido: true },
  { key: 'profesor', label: 'Profesor', requerido: false },
  { key: 'antecedentes', label: 'Antecedentes', requerido: false },
  { key: 'sala', label: 'Sala', requerido: false },
  { key: 'horario', label: 'Horario (texto descriptivo)', requerido: false },
  { key: 'lunes', label: 'Lunes', requerido: false },
  { key: 'martes', label: 'Martes', requerido: false },
  { key: 'miercoles', label: 'Miércoles', requerido: false },
  { key: 'jueves', label: 'Jueves', requerido: false },
  { key: 'viernes', label: 'Viernes', requerido: false },
  { key: 'sabado', label: 'Sábado', requerido: false },
  { key: 'domingo', label: 'Domingo', requerido: false },
];

export type ColumnMapping = Record<string, string | null>;

function normalizeHeader(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

// Huella del encabezado, para recordar un mapeo ya confirmado por el usuario
// y no volver a preguntar si sube otro CSV con la misma estructura de columnas.
export function fingerprintHeaders(headers: string[]): string {
  return headers.map(normalizeHeader).sort().join('|');
}

const SUGERENCIAS_POR_CAMPO: Record<string, string[]> = {
  modalidad: ['modalidad'],
  asignatura: ['asignatura', 'materia', 'nombre'],
  creditos: ['creditos', 'credito'],
  grupo: ['grupo'],
  profesor: ['profesor', 'docente', 'maestro'],
  antecedentes: ['antecedentes', 'antecedente', 'prerrequisitos'],
  sala: ['sala', 'aula', 'salon'],
  horario: ['horario'],
  lunes: ['lunes'],
  martes: ['martes'],
  miercoles: ['miercoles'],
  jueves: ['jueves'],
  viernes: ['viernes'],
  sabado: ['sabado'],
  domingo: ['domingo'],
};

// Sugiere automáticamente qué columna real del CSV corresponde a cada campo
// canónico. No es a prueba de errores — es la mejor suposición para
// pre-rellenar el diálogo; el usuario confirma o corrige.
export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const normalizedHeaders = headers.map((h) => ({ original: h, norm: normalizeHeader(h) }));
  const mapping: ColumnMapping = {};

  for (const campo of CAMPOS_CANONICOS) {
    const candidatos = SUGERENCIAS_POR_CAMPO[campo.key] || [campo.key];
    const match = normalizedHeaders.find((h) => candidatos.includes(h.norm));
    mapping[campo.key] = match ? match.original : null;
  }

  return mapping;
}

// true si TODOS los campos canónicos (excepto Domingo, que es opcional/nuevo)
// se mapearon automáticamente -> se puede procesar sin mostrar el diálogo.
export function mappingIsHighConfidence(mapping: ColumnMapping): boolean {
  return CAMPOS_CANONICOS.filter((c) => c.key !== 'domingo').every((c) => mapping[c.key] !== null);
}

// true si al menos los campos obligatorios (asignatura, grupo) están
// mapeados y al menos un día de la semana quedó mapeado — mínimo para no
// perder horarios silenciosamente. Se usa para habilitar o no el botón de
// confirmar en el diálogo.
export function mappingCoversEssentials(mapping: ColumnMapping): boolean {
  const requeridos = CAMPOS_CANONICOS.filter((c) => c.requerido);
  const todosLosRequeridos = requeridos.every((c) => mapping[c.key] !== null);
  const diasKeys = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const almenosUnDia = diasKeys.some((k) => mapping[k] !== null);
  return todosLosRequeridos && almenosUnDia;
}
