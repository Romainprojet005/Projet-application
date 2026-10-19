// Génère dist/sw.js : le service worker qui rend le site utilisable hors ligne.
// - À l'installation, il met de côté le cœur de l'appli (page, code JS, polices, icônes).
// - Ensuite, chaque image ou fichier affiché est gardé au passage : ce qui a été vu
//   en ligne reste disponible si le réseau coupe pendant la soirée.
// - Les pages sont toujours demandées au réseau d'abord (pour avoir la dernière version),
//   avec repli sur la copie gardée si le réseau ne répond pas.
// Le nom du cache dépend du build : chaque mise en ligne remplace l'ancien cache.
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const dist = path.join(__dirname, '..', 'dist');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const url = (p) => encodeURI('/' + path.relative(dist, p).split(path.sep).join('/'));

// Polices réellement chargées par App.js (useFonts) : les autres graisses ne servent pas.
const FONTS = [
  'BodoniModa_600SemiBold', 'BodoniModa_700Bold',
  'Outfit_400Regular', 'Outfit_500Medium', 'Outfit_600SemiBold',
  'CormorantGaramond_600SemiBold_Italic', 'CormorantGaramond_400Regular_Italic',
  'JetBrainsMono_400Regular',
];

const code  = walk(path.join(dist, '_expo')).filter((p) => /\.(js|css)$/.test(p));
const fonts = walk(path.join(dist, 'assets')).filter((p) =>
  p.endsWith('.ttf') && FONTS.some((f) => path.basename(p).startsWith(f + '.')));

const precache = [
  '/', '/manifest.webmanifest', '/favicon.png', '/favicon-32.png', '/favicon-48.png', '/app-icon.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png',
  ...code.map(url), ...fonts.map(url),
];

const version = crypto.createHash('sha1')
  .update(precache.join('\n'))
  .update(fs.readFileSync(path.join(dist, 'index.html')))
  .digest('hex').slice(0, 10);

const sw = `// Généré par scripts/build-sw.js — ne pas modifier à la main.
const CACHE = 'sdl-${version}';
const PRECACHE = ${JSON.stringify(precache, null, 2)};
// Polices Google (feuille de style + fichiers) : gardées pour l'affichage hors ligne.
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sdl-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Garde une copie de la réponse si elle est exploitable.
function keep(request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const u = new URL(request.url);
  const sameOrigin = u.origin === self.location.origin;

  // Pages : réseau d'abord, sinon la copie de la page, sinon l'accueil (l'appli gère l'adresse).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => keep(request, res))
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  // Fichiers du site et polices Google : la copie gardée d'abord (affichage immédiat),
  // et mise à jour en arrière-plan quand le réseau répond.
  if ((sameOrigin && !u.pathname.startsWith('/.netlify/')) || FONT_HOSTS.includes(u.hostname)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request).then((res) => keep(request, res));
        if (hit) { network.catch(() => {}); return hit; }
        return network;
      })
    );
  }
  // Le reste (Supabase, YouTube, Wikimedia) passe directement par le réseau.
});
`;

fs.writeFileSync(path.join(dist, 'sw.js'), sw, 'utf8');
console.log(`Service worker : ${precache.length} fichiers mis de côté (cache ${version})`);
