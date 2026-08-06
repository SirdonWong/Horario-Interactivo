import { isValidMateriaId } from './curriculum';

const TIPO_ARCHIVO = 'academitrack-progreso';
const VERSION_ARCHIVO = 1;

export function exportProgress(materiasCompletadas: string[]): void {
  const payload = {
    tipo: TIPO_ARCHIVO,
    version: VERSION_ARCHIVO,
    exportado: new Date().toISOString(),
    materiasCompletadas,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `progreso-antecedentes-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ParseProgressResult {
  ok: boolean;
  materiasCompletadas?: string[];
  error?: string;
  idsDescartados?: number;
}

export function parseProgressFile(contenido: string): ParseProgressResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contenido);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' };
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as any).tipo !== TIPO_ARCHIVO ||
    !Array.isArray((parsed as any).materiasCompletadas)
  ) {
    return { ok: false, error: 'El archivo no tiene el formato esperado de un progreso exportado desde esta app.' };
  }

  const idsCrudos: string[] = (parsed as any).materiasCompletadas;
  const idsValidos = idsCrudos.filter((id) => typeof id === 'string' && isValidMateriaId(id));
  const descartados = idsCrudos.length - idsValidos.length;

  return {
    ok: true,
    materiasCompletadas: idsValidos,
    idsDescartados: descartados > 0 ? descartados : undefined,
  };
}
