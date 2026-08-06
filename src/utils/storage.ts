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
