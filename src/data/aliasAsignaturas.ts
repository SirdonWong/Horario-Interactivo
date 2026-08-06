// Mapea nombres de Asignatura tal como aparecen en el CSV de oferta semestral
// (que suelen tener typos, abreviaciones o truncamientos) hacia el id real de
// la materia en mallaCurricular.json. Las claves están normalizadas: minúsculas,
// sin tildes, sin puntuación (misma función normalize() que usa curriculum.ts).
//
// El valor "HITO:practica_profesional" es un caso especial: "Prácticas
// profesionales" no depende de otra materia, depende de acumular 191 créditos
// obligatorios (ver el bloque "hitos" en mallaCurricular.json).
//
// Si en el futuro una asignatura del CSV no muestra antecedentes pendientes
// y debería, probablemente falta agregarla aquí.

export const aliasAsignaturas: Record<string, string> = {
  "cambio y aprendizaje organizaional": "cambio_aprendizaje_organizacional",
  "desarrollo psicologico adultez y vejez": "desarrollo_psic_adultez_vejez",
  "desarrollo psicologico ninez y adolescencia": "desarrollo_psic_ninez_adolescencia",
  "desarrollo y sistematizacion del trabajo de campo": "desarrollo_sistematizacion_trabajo_campo_investigacion",
  "desarrolo del pendamiento cientifico": "desarrollo_pensamiento_cientifico",
  "evaulacion de inteligencia y habilidades cognitivas": "evaluacion_inteligencia_habilidades_cognitivas",
  "habilidades clinicas basicas": "habilidades_clinicas_basicas_psicologo",
  "innovacion y uso de las tics para la psicoeducacion": "innovacion_uso_tic_psicoeducacion",
  "manejo de disenos de herramientas de investigacion": "manejo_disenos_herramientas_investigacion",
  "neurociencias en la practica": "neurociencias_practica_psicologica",
  "procesos de ensenanza y aprendizaje": "procesos_ensenanza_aprendizaje_ambientes_educativos",
  "procesos neuropsicologicos del comportamiento": "procesos_neurologicos_comportamiento",
  "practicas de inclusion en diferentes contextos": "practicas_inclusion_diferentes_ambitos",
  "sexualidad y perspectiva de genero": "sexualidad_humana_perspectiva_genero",
  "practicas profesionales": "HITO:practica_profesional",
};
