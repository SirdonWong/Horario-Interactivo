import http from 'http';

console.log('--- TEST DE RESPUESTA HTTP LOCALHOST:3000 ---');

http.get('http://localhost:3000', (res) => {
  console.log(`STATUS HTTP: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('id="root"')) {
      console.log('✅ Servidor Vite respondiendo adecuadamente a solicitudes HTTP en localhost:3000');
    } else {
      console.log('⚠️ Respuesta inesperada del servidor.');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error al conectar a localhost:3000:', err.message);
});
