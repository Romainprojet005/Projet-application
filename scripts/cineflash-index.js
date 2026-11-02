// Recense les photos de web/cineflash/[Titre]/ → src/data/cineflashImages.json
// ({ "Titre": nombre d'images }). Ciné-Flash ne propose que les titres qui ont des photos :
// pour ajouter un film ou un animé, il suffit de déposer son dossier d'images.
const fs   = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'web', 'cineflash');
const dest = path.join(__dirname, '..', 'src', 'data', 'cineflashImages.json');
const IMG  = /^[1-9]\.(jpe?g|png|webp)$/i;

const index = {};
for (const title of fs.readdirSync(src).sort()) {
  const dir = path.join(src, title);
  if (!fs.statSync(dir).isDirectory()) continue;
  const n = fs.readdirSync(dir).filter(f => IMG.test(f)).length;
  if (n) index[title] = n;
}

fs.writeFileSync(dest, JSON.stringify(index, null, 2) + '\n');
console.log(`Ciné-Flash : ${Object.keys(index).length} titres avec photos`);
