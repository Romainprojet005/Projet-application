// Patches dist/index.html: disables pinch-zoom via viewport meta tag
const fs   = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
  /content="width=device-width, initial-scale=1, shrink-to-fit=no"/,
  'content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no"'
);

// Also inject touch-action CSS to block double-tap zoom
html = html.replace(
  '</style>',
  '      * { touch-action: manipulation; }\n      #root { overflow: hidden; }\n      #root > div { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }\n' +
  // iPhone : un champ de saisie sous 16 px fait zoomer la page au toucher, et elle reste
  // zoomée (cartes du menu trop grandes au retour). L'appli Google ignore maximum-scale=1.
  '      @supports (-webkit-touch-callout: none) { input, textarea, select { font-size: 16px !important; } }\n    </style>'
);

// Inject SPA redirect handler: restores path encoded by 404.html
const spaScript = `
  <script>
    (function(l) {
      if (l.search[1] === '/') {
        var decoded = l.search.slice(1).split('&').map(function(s) {
          return s.replace(/~and~/g, '&');
        }).join('?');
        window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
      }
    }(window.location));
  </script>`;
html = html.replace('<script', spaScript + '\n  <script');

// Mode hors ligne (dist/sw.js, généré par scripts/build-sw.js) + appli plein écran
// une fois ajoutée à l'écran d'accueil de l'iPhone.
const appHead = `
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <meta name="apple-mobile-web-app-title" content="Légendes" />
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
    }
  </script>`;
html = html.replace('</head>', appHead + '\n</head>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Patched dist/index.html (no-zoom + SPA redirect)');

// Replace preview.html with the app
const previewPath = path.join(__dirname, '..', 'dist', 'preview.html');
fs.writeFileSync(previewPath, html, 'utf8');
console.log('Replaced dist/preview.html with app');

// Disable Jekyll so GitHub Pages serves _expo/ folder correctly
const nojekyllPath = path.join(__dirname, '..', 'dist', '.nojekyll');
fs.writeFileSync(nojekyllPath, '', 'utf8');
console.log('Created .nojekyll');

// 404.html: redirects unknown paths back to index.html with path encoded in query
// Standard SPA-on-GitHub-Pages trick (github.com/rafgraph/spa-github-pages)
const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>La Soirée des Légendes</title>
  <script>
    var pathSegmentsToKeep = 1;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
</html>`;
const notFoundPath = path.join(__dirname, '..', 'dist', '404.html');
fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8');
console.log('Created dist/404.html (SPA routing)');
