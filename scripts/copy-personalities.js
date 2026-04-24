// Copies assets/personalities/ into dist/personalities/
const fs   = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'assets', 'personalities');
const dest = path.join(__dirname, '..', 'dist', 'personalities');

fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src);
for (const f of files) {
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
}
console.log(`Copied ${files.length} images to dist/personalities/`);
