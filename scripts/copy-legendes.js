// Copie les illustrations des cartes (assets/legendes/) dans dist/legendes/
const fs   = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'assets', 'legendes');
const dest = path.join(__dirname, '..', 'dist', 'legendes');

fs.mkdirSync(dest, { recursive: true });
const files = fs.readdirSync(src);
for (const f of files) fs.copyFileSync(path.join(src, f), path.join(dest, f));
console.log(`Copied ${files.length} legend images to dist/legendes/`);
