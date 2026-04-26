/**
 * Serveur local — La Soirée des Légendes
 * Lance avec : node server.js  (ou npm run preview)
 * Puis ouvre l'URL affichée sur ton téléphone (même Wi-Fi)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT    = 3000;
const DIST    = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath);

  // SPA fallback : toute URL inconnue → index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const mobileUrl = `http://${ip}:${PORT}`;

  console.log('\n');
  console.log('  🎭  La Soirée des Légendes');
  console.log('  ─────────────────────────────────────');
  console.log(`  💻  Local  :  http://localhost:${PORT}`);
  console.log(`  📱  Mobile :  ${mobileUrl}`);
  console.log('  ─────────────────────────────────────');
  console.log('  Ctrl+C pour arrêter\n');

  try {
    const QR = require('qrcode-terminal');
    QR.generate(mobileUrl, { small: true });
  } catch (e) {}
});
