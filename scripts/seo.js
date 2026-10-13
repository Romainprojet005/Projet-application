// SEO de dist/ (après patch-html.js) :
// - balises <head> de l'accueil (langue, description, aperçu de partage, données structurées)
// - une page HTML par jeu (dist/<jeu>/index.html) avec son propre titre et sa description
// - robots.txt, sitemap.xml, manifest, favicon et image de partage
const fs   = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

// Charge un fichier de src/data (uniquement des `export const`) sans bundler
function loadData(file) {
  const code = fs.readFileSync(path.join(root, 'src', 'data', file), 'utf8')
    .replace(/export const (\w+)/g, 'const $1 = exports.$1');
  const exports = {};
  new Function('exports', code)(exports);
  return exports;
}

const { characters } = loadData('characters.js');
const {
  SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESCRIPTION,
  gamePath, gameLabel, gameTitle, gameDescription,
} = loadData('seo.js');

const OG_IMAGE = `${SITE_URL}/og-image.png`;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function head({ title, description, url, jsonLd }) {
  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#0E0C1A" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
}

// Contenu lisible sans JavaScript (robots, aperçus) ; l'app le remplace dès qu'elle démarre
function noscript(inner) {
  return `<noscript>\n      ${inner}\n      <p>Activez JavaScript pour jouer.</p>\n    </noscript>`;
}

function render(base, { title, description, url, jsonLd, body }) {
  const html = base
    .replace(/<html lang="[^"]*"/, '<html lang="fr"')
    .replace(/<title>[\s\S]*?<\/title>/, () => head({ title, description, url, jsonLd }))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, () => noscript(body));
  if (!html.includes('rel="canonical"')) throw new Error('<title> introuvable dans dist/index.html');
  return html;
}

const indexPath = path.join(dist, 'index.html');
const base = fs.readFileSync(indexPath, 'utf8');

// ── Accueil ──
const gameLinks = characters
  .map((c) => `<li><a href="/${gamePath(c)}">${esc(gameLabel(c))}</a> — ${esc(c.description)}</li>`)
  .join('\n        ');

fs.writeFileSync(indexPath, render(base, {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  url: `${SITE_URL}/`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: HOME_DESCRIPTION,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr',
    image: OG_IMAGE,
  },
  body: `<h1>${esc(SITE_NAME)}</h1>
      <p>${esc(HOME_DESCRIPTION)}</p>
      <ul>
        ${gameLinks}
      </ul>`,
}), 'utf8');

// ── Une page par jeu ──
for (const c of characters) {
  const p = gamePath(c);
  const url = `${SITE_URL}/${p}`;
  const dir = path.join(dist, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(base, {
    title: gameTitle(c),
    description: gameDescription(c),
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: gameLabel(c), item: url },
      ],
    },
    body: `<h1>${esc(gameLabel(c))} — ${esc(c.title)}</h1>
      <p>${esc(c.description)}</p>
      <p>${esc(c.players)} joueurs · ${esc(c.time)}</p>
      <p><a href="/">Voir les 22 jeux de ${esc(SITE_NAME)}</a></p>`,
  }), 'utf8');
}

// ── robots.txt et sitemap.xml ──
fs.writeFileSync(path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE_URL}/`, ...characters.map((c) => `${SITE_URL}/${gamePath(c)}`)];
fs.writeFileSync(path.join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  '\n</urlset>\n', 'utf8');

// ── Manifest, icônes, image de partage ──
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
  name: SITE_NAME,
  short_name: 'Légendes',
  lang: 'fr',
  start_url: '/',
  display: 'standalone',
  background_color: '#0E0C1A',
  theme_color: '#0E0C1A',
  icons: [{ src: '/app-icon.png', sizes: '1024x1024', type: 'image/png' }],
}, null, 2), 'utf8');

const assets = path.join(root, 'assets');
fs.copyFileSync(path.join(assets, 'icon.png'), path.join(dist, 'favicon.png'));
fs.copyFileSync(path.join(assets, 'icon.png'), path.join(dist, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(assets, 'icon.png'), path.join(dist, 'app-icon.png'));
fs.copyFileSync(path.join(assets, 'og-image.png'), path.join(dist, 'og-image.png'));

console.log(`SEO : accueil + ${characters.length} pages de jeux, robots.txt, sitemap.xml, manifest`);
