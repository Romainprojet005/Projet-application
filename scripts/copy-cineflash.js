// Copies web/cineflash/ into dist/cineflash/
const fs   = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'web', 'cineflash');
const dest = path.join(__dirname, '..', 'dist', 'cineflash');

fs.mkdirSync(dest, { recursive: true });

const movies = fs.readdirSync(src);
let total = 0;
for (const movie of movies) {
  const movieSrc  = path.join(src, movie);
  const movieDest = path.join(dest, movie);
  if (!fs.statSync(movieSrc).isDirectory()) continue;
  fs.mkdirSync(movieDest, { recursive: true });
  const files = fs.readdirSync(movieSrc);
  for (const f of files) {
    fs.copyFileSync(path.join(movieSrc, f), path.join(movieDest, f));
    total++;
  }
}
console.log(`Copied ${total} cineflash images (${movies.length} films) to dist/cineflash/`);
