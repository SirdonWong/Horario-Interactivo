# Horario Académico

Herramienta interactiva para armar tu horario del semestre a partir de la oferta académica en CSV o Excel, con detección de conflictos, seguimiento de prerrequisitos y exportación a imagen.

Esto es un proyecto hecho por un estudiante. **No es una herramienta oficial de la universidad ni de la facultad**.

## ¿Qué hace?

- **Carga tu oferta académica** desde uno o varios archivos CSV o Excel (`.xlsx`), sin necesidad de que el formato sea exacto: si las columnas no coinciden con lo esperado, la app te deja mapearlas manualmente.
- **Arma tu horario visualmente**, con detección automática de traslapes entre materias.
- **Personaliza el color** de cada materia individualmente, con soporte para modo claro y oscuro.
- **Revisa tus prerrequisitos pendientes** contra la malla curricular — *ver limitación importante abajo*.
- **Exporta tu horario final como PNG** para compartirlo o guardarlo.
- Todo se guarda automáticamente en tu navegador (no hay servidor, no hay cuentas, no se sube nada a ningún lado).

## *Limitación importante:* prerrequisitos

La validación de prerrequisitos usa una malla curricular específica (la de Psicología). Si estudias otra carrera:

- **Sí puedes usar** la carga de oferta, el armado visual del horario, la detección de conflictos, los colores y la exportación a PNG — todo eso funciona igual sin importar tu carrera.
- **La validación de prerrequisitos no te va a servir** — puede marcar advertencias incorrectas o no reconocer tus materias, porque está comparando contra una malla que no es la tuya. Si esto te aparece y no te corresponde, simplemente ignora esa sección o desactívala con el switch "Validar Prerrequisitos" en la parte superior.

## Cómo usarlo

1. Consigue el archivo de oferta académica del semestre (CSV o Excel); normalmente lo comparte tu facultad o coordinación. La app no trae ningún archivo de oferta precargado; cada quien sube el suyo.
2. Entra a la app y usa el botón **"Cargar Archivo(s)"**.
3. Si la app no reconoce automáticamente las columnas de tu archivo, te va a pedir que confirmes manualmente a qué corresponde cada una (Asignatura, Grupo, Horario, etc.); es un paso de una sola vez por archivo.
4. Selecciona las materias que quieras agregar a tu horario haciendo clic en ellas desde el listado.
5. Ajusta colores, revisa conflictos, y exporta cuando esté listo.

Tu selección y tus archivos cargados quedan guardados en tu navegador; si cierras la pestaña y vuelves después, todo sigue ahí. Esto también significa que **es local a ese navegador y ese dispositivo**: no se sincroniza entre tu computadora y tu celular, por ejemplo.

## Correr el proyecto localmente

**Requisitos:** Node.js (versión 18 o superior recomendada).

```bash
npm install
npm run dev
```

Esto levanta la app en `http://localhost:3000`.

Para generar el build de producción:

```bash
npm run build
npm run preview
```

No se requiere ninguna variable de entorno ni API key; todo el procesamiento (CSV, horarios, prerrequisitos) corre localmente en el navegador.

## Stack técnico

React 19, TypeScript, Vite, Tailwind CSS, Framer Motion.

## Reportar un problema

Si algo no funciona como esperabas o tu archivo de oferta no carga bien, avísale directamente a quien te compartió esta herramienta.
