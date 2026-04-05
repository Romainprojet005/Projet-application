/**
 * Serveur local — La Soirée des Légendes
 * Lance avec : node server.js
 * Puis ouvre l'URL affichée sur ton téléphone (même Wi-Fi)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT = 3000;
const FILE = path.join(__dirname, 'preview.html');

/* ── Récupère l'IP locale ─────────────────────────────── */
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

/* ── Serveur ──────────────────────────────────────────── */
const server = http.createServer((req, res) => {
  fs.readFile(FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erreur : preview.html introuvable');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const mobileUrl = `http://${ip}:${PORT}`;

  console.log('\n');
  console.log('  🎭  La Soirée des Légendes — Aperçu');
  console.log('  ─────────────────────────────────────');
  console.log(`  💻  Local  :  http://localhost:${PORT}`);
  console.log(`  📱  Mobile :  ${mobileUrl}`);
  console.log('  ─────────────────────────────────────');
  console.log('  Ouvre cette URL sur ton téléphone');
  console.log('  (assure-toi d\'être sur le même Wi-Fi)');
  console.log('\n  Ctrl+C pour arrêter\n');

  /* QR code ASCII simple */
  try {
    const QR = require('qrcode-terminal');
    QR.generate(mobileUrl, { small: true });
  } catch (e) {
    /* qrcode-terminal pas installé, on affiche juste l'URL */
  }
});
