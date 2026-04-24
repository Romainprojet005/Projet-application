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
  '      * { touch-action: manipulation; }\n    </style>'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Patched dist/index.html (no-zoom)');

// Replace preview.html with the app
const previewPath = path.join(__dirname, '..', 'dist', 'preview.html');
fs.writeFileSync(previewPath, html, 'utf8');
console.log('Replaced dist/preview.html with app');
