import fs from 'fs';
import path from 'path';

console.log('--- TEST INTEGRIDAD DE COMPONENTES & ESTILOS IMPECCABLE ---');

const filesToCheck = [
  'src/index.css',
  'src/App.tsx',
  'src/components/Calendar.tsx',
  'src/components/DayColumn.tsx',
  'src/components/ActivityCard.tsx',
  'src/components/PrerequisiteChecklist.tsx',
  'src/components/Uploader.tsx',
  'src/components/ColumnMappingDialog.tsx'
];

let allPassed = true;

for (const relPath of filesToCheck) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Faltante: ${relPath}`);
    allPassed = false;
  } else {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.length === 0) {
      console.error(`❌ Archivo vacío: ${relPath}`);
      allPassed = false;
    } else {
      console.log(`✓ OK (${content.length} bytes): ${relPath}`);
    }
  }
}

if (allPassed) {
  console.log('\n✅ Todos los componentes del rediseño fueron verificados correctamente.');
} else {
  console.error('\n❌ Hubo fallos en algunos archivos.');
  process.exit(1);
}
