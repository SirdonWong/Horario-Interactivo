import fs from 'fs';
import { execSync } from 'child_process';

const tsCode = `
import fs from 'fs';
import Papa from 'papaparse';
import { processCSVRows } from '../src/utils/csv';

const csv = fs.readFileSync('test-fixtures/CREDITOS_FILA_CABECERA.csv', 'utf8');
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy' });

const activities = processCSVRows(parsed.data, 'CREDITOS_FILA_CABECERA.csv');

let allPassed = true;

const maya = activities.filter(a => a.asignatura === 'Cultura Maya');
if (maya.length !== 2) {
  console.error('FAIL: Se esperaban 2 activities de Cultura Maya, se obtuvieron ' + maya.length);
  allPassed = false;
}
maya.forEach(a => {
  if (a.creditos !== '6 créditos') {
    console.error('FAIL: Cultura Maya Grupo ' + a.grupo + ' tiene creditos "' + a.creditos + '" en vez de "6 créditos"');
    allPassed = false;
  }
});

const otra = activities.filter(a => a.asignatura === 'Otra Materia');
if (otra.length !== 2) {
  console.error('FAIL: Se esperaban 2 activities de Otra Materia, se obtuvieron ' + otra.length);
  allPassed = false;
}
otra.forEach(a => {
  if (a.creditos !== '8 créditos') {
    console.error('FAIL: Otra Materia Grupo ' + a.grupo + ' tiene creditos "' + a.creditos + '" en vez de "8 créditos"');
    allPassed = false;
  }
});

if (activities.some(a => !a.grupo)) {
  console.error('FAIL: Hay activities sin grupo');
  allPassed = false;
}

// Sum logic
const selectedActivities = [maya[0], otra[0]];
const totalCreditos = selectedActivities.reduce((acc, curr) => {
  const match = curr.creditos.match(/\\d+/);
  return acc + (match ? parseInt(match[0], 10) : 0);
}, 0);

if (totalCreditos !== 14) {
  console.error('FAIL: La suma (' + totalCreditos + ') no coincide con 14');
  allPassed = false;
}

if (allPassed) {
  console.log('PASS: Todas las aserciones de creditos fallback funcionaron correctamente.');
} else {
  process.exit(1);
}
`;

fs.writeFileSync('scratch/run_test.ts', tsCode);
try {
  execSync('npx tsx scratch/run_test.ts', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
} finally {
  fs.unlinkSync('scratch/run_test.ts');
}
