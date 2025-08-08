// Backend test scripti
const http = require('http');

console.log('🔍 Backend sunucusu test ediliyor...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend çalışıyor! Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log('📊 Response:', chunk.toString());
  });
});

req.on('error', (err) => {
  console.log('❌ Backend çalışmıyor!', err.message);
  console.log('💡 Çözüm: cd c:\\satinalma\\procurement_system_nodejs && npm start');
});

req.setTimeout(3000, () => {
  console.log('⏱️ Timeout - Backend muhtemelen çalışmıyor');
  req.destroy();
});

req.end();
