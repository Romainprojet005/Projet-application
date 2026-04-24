// Downloads all personality images via Wikipedia REST API + curl
// Run: node scripts/download-personalities.js
const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'personalities');
const IMG_JS  = path.join(__dirname, '..', 'src', 'data', 'personalityImages.js');

const UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REF = 'https://en.wikipedia.org/';

const PERSONALITIES = [
  // CINÉMA INTERNATIONAL
  { id: 'leo_dicaprio',       name: 'Leonardo DiCaprio' },
  { id: 'angelina_jolie',     name: 'Angelina Jolie' },
  { id: 'brad_pitt',          name: 'Brad Pitt' },
  { id: 'scarlett_johansson', name: 'Scarlett Johansson' },
  { id: 'tom_cruise',         name: 'Tom Cruise' },
  { id: 'dwayne_johnson',     name: 'Dwayne Johnson' },
  { id: 'emma_watson',        name: 'Emma Watson' },
  { id: 'will_smith',         name: 'Will Smith',         wiki: 'Will_Smith' },
  { id: 'robert_downey',      name: 'Robert Downey Jr.' },
  { id: 'keanu_reeves',       name: 'Keanu Reeves' },
  { id: 'meryl_streep',       name: 'Meryl Streep' },
  { id: 'johnny_depp',        name: 'Johnny Depp' },
  { id: 'natalie_portman',    name: 'Natalie Portman' },
  { id: 'ryan_reynolds',      name: 'Ryan Reynolds' },
  { id: 'chris_evans',        name: 'Chris Evans',        wiki: 'Chris_Evans_(actor)' },
  // MUSIQUE INTERNATIONALE
  { id: 'taylor_swift',       name: 'Taylor Swift' },
  { id: 'beyonce',            name: 'Beyoncé' },
  { id: 'drake',              name: 'Drake',              wiki: 'Drake_(musician)' },
  { id: 'ed_sheeran',         name: 'Ed Sheeran' },
  { id: 'billie_eilish',      name: 'Billie Eilish' },
  { id: 'the_weeknd',         name: 'The Weeknd' },
  { id: 'rihanna',            name: 'Rihanna' },
  { id: 'justin_bieber',      name: 'Justin Bieber' },
  { id: 'adele',              name: 'Adele' },
  { id: 'kanye_west',         name: 'Kanye West' },
  { id: 'eminem',             name: 'Eminem' },
  { id: 'lady_gaga',          name: 'Lady Gaga' },
  { id: 'ariana_grande',      name: 'Ariana Grande' },
  { id: 'bruno_mars',         name: 'Bruno Mars' },
  { id: 'shakira',            name: 'Shakira' },
  // SPORT INTERNATIONAL
  { id: 'cristiano_ronaldo',  name: 'Cristiano Ronaldo' },
  { id: 'lionel_messi',       name: 'Lionel Messi' },
  { id: 'lebron_james',       name: 'LeBron James' },
  { id: 'serena_williams',    name: 'Serena Williams' },
  { id: 'usain_bolt',         name: 'Usain Bolt' },
  { id: 'michael_jordan',     name: 'Michael Jordan' },
  { id: 'novak_djokovic',     name: 'Novak Djokovic' },
  { id: 'roger_federer',      name: 'Roger Federer' },
  { id: 'neymar',             name: 'Neymar' },
  { id: 'rafael_nadal',       name: 'Rafael Nadal' },
  { id: 'tiger_woods',        name: 'Tiger Woods' },
  // POLITIQUE INTERNATIONALE
  { id: 'barack_obama',       name: 'Barack Obama' },
  { id: 'joe_biden',          name: 'Joe Biden' },
  { id: 'donald_trump',       name: 'Donald Trump' },
  { id: 'vladimir_poutine',   name: 'Vladimir Putin' },
  { id: 'xi_jinping',         name: 'Xi Jinping' },
  // SCIENCE & TECH
  { id: 'albert_einstein',    name: 'Albert Einstein' },
  { id: 'marie_curie',        name: 'Marie Curie' },
  { id: 'elon_musk',          name: 'Elon Musk' },
  { id: 'bill_gates',         name: 'Bill Gates' },
  { id: 'mark_zuckerberg',    name: 'Mark Zuckerberg' },
  { id: 'steve_jobs',         name: 'Steve Jobs' },
  { id: 'jeff_bezos',         name: 'Jeff Bezos' },
  // CINÉMA FRANÇAIS
  { id: 'omar_sy',            name: 'Omar Sy' },
  { id: 'marion_cotillard',   name: 'Marion Cotillard' },
  { id: 'jean_dujardin',      name: 'Jean Dujardin' },
  { id: 'lea_seydoux',        name: 'Léa Seydoux' },
  { id: 'vincent_cassel',     name: 'Vincent Cassel' },
  { id: 'gad_elmaleh',        name: 'Gad Elmaleh' },
  { id: 'audrey_tautou',      name: 'Audrey Tautou' },
  { id: 'isabelle_adjani',    name: 'Isabelle Adjani' },
  { id: 'louis_de_funes',     name: 'Louis de Funès' },
  // MUSIQUE FRANÇAISE
  { id: 'stromae',            name: 'Stromae' },
  { id: 'aya_nakamura',       name: 'Aya Nakamura' },
  { id: 'david_guetta',       name: 'David Guetta' },
  { id: 'johnny_hallyday',    name: 'Johnny Hallyday' },
  { id: 'indila',             name: 'Indila' },
  { id: 'jul',                name: 'Jul',               wiki: 'Jul_(rapper)' },
  { id: 'mylene_farmer',      name: 'Mylène Farmer' },
  { id: 'daft_punk',          name: 'Daft Punk' },
  { id: 'mc_solaar',          name: 'MC Solaar' },
  { id: 'dj_snake',           name: 'DJ Snake' },
  // SPORT FRANÇAIS
  { id: 'kylian_mbappe',      name: 'Kylian Mbappé' },
  { id: 'zinedine_zidane',    name: 'Zinedine Zidane' },
  { id: 'antoine_griezmann',  name: 'Antoine Griezmann' },
  { id: 'tony_parker',        name: 'Tony Parker' },
  { id: 'teddy_riner',        name: 'Teddy Riner' },
  { id: 'amelie_mauresmo',    name: 'Amélie Mauresmo' },
  { id: 'yannick_noah',       name: 'Yannick Noah' },
  // POLITIQUE FRANÇAISE
  { id: 'emmanuel_macron',    name: 'Emmanuel Macron' },
  { id: 'marine_le_pen',      name: 'Marine Le Pen' },
  { id: 'nicolas_sarkozy',    name: 'Nicolas Sarkozy' },
  { id: 'francois_hollande',  name: 'François Hollande' },
  { id: 'jean_luc_melenchon', name: 'Jean-Luc Mélenchon' },
];

function curlGet(url) {
  const r = spawnSync('curl', [
    '-sL',
    '--max-time', '15',
    '-A', UA,
    '-H', `Referer: ${REF}`,
    url,
  ], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  return r.stdout;
}

function curlDownload(url, dest) {
  const r = spawnSync('curl', [
    '-sL',
    '--max-time', '30',
    '-A', UA,
    '-H', `Referer: ${REF}`,
    '-H', 'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
    '-o', dest,
    '-w', '%{http_code}',
    url,
  ], { maxBuffer: 10 * 1024 * 1024 });
  const code = parseInt((r.stdout || '').toString().trim(), 10);
  return code;
}

function getImageUrl(p) {
  const wiki = p.wiki || p.name.replace(/ /g, '_');
  for (const lang of ['en', 'fr']) {
    try {
      const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`;
      const body   = curlGet(apiUrl);
      const data   = JSON.parse(body);
      const src    = data?.thumbnail?.source;
      if (src) return src;
    } catch (_) {}
  }
  return null;
}

function extFromUrl(url) {
  const base = url.split('?')[0].split('/').pop().toLowerCase();
  if (base.endsWith('.png')) return 'png';
  if (base.endsWith('.gif')) return 'gif';
  if (base.endsWith('.webp')) return 'webp';
  return 'jpg';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const lines   = [];
  const failed  = [];

  for (const p of PERSONALITIES) {
    // Check if already downloaded with any extension
    const existing = ['jpg', 'png', 'gif', 'webp']
      .map(e => path.join(OUT_DIR, `${p.id}.${e}`))
      .find(f => { try { return fs.statSync(f).size > 5000; } catch (_) { return false; } });

    if (existing) {
      const ext = path.extname(existing).slice(1);
      console.log(`SKIP  ${p.id} (${ext})`);
      lines.push(`  ${p.id}: require('../../assets/personalities/${p.id}.${ext}'),`);
      continue;
    }

    process.stdout.write(`GET   ${p.name}... `);

    const imgUrl = getImageUrl(p);
    if (!imgUrl) {
      console.log('no URL from API');
      failed.push(p.id);
      await sleep(500);
      continue;
    }

    const ext  = extFromUrl(imgUrl);
    const dest = path.join(OUT_DIR, `${p.id}.${ext}`);

    const code = curlDownload(imgUrl, dest);

    // Validate file size (> 5KB = real image)
    let size = 0;
    try { size = fs.statSync(dest).size; } catch (_) {}

    if (code === 200 && size > 5000) {
      console.log(`OK (${Math.round(size / 1024)}KB, ${ext})`);
      lines.push(`  ${p.id}: require('../../assets/personalities/${p.id}.${ext}'),`);
    } else {
      console.log(`FAIL (HTTP ${code}, ${size}B)`);
      try { fs.unlinkSync(dest); } catch (_) {}
      failed.push(p.id);
    }

    await sleep(1500);
  }

  // Generate personalityImages.js
  const content = `// Auto-generated – do not edit manually
// Run: node scripts/download-personalities.js
export default {
${lines.join('\n')}
};
`;
  fs.writeFileSync(IMG_JS, content, 'utf8');

  console.log(`\nWrote ${IMG_JS}`);
  if (failed.length) console.log(`Failed (${failed.length}): ${failed.join(', ')}`);
  console.log(`\nDone: ${lines.length} downloaded, ${failed.length} failed`);
}

main().catch(e => { console.error(e); process.exit(1); });
