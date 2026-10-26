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
const { SEO_JEUX } = loadData('seoJeux.js');
const { HOME_TITLE_EN, HOME_DESCRIPTION_EN, gameTitleEn, gameDescriptionEn } = loadData('seo.js');
const { CHARACTERS_EN } = loadData('charactersEn.js');
const { SEO_JEUX_EN } = loadData('seoJeuxEn.js');

const OG_IMAGE = `${SITE_URL}/og-image.png`;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Liens hreflang entre une page française et sa version anglaise (/en/…)
function alternates(alt) {
  if (!alt) return '';
  return `
    <link rel="alternate" hreflang="fr" href="${alt.fr}" />
    <link rel="alternate" hreflang="en" href="${alt.en}" />
    <link rel="alternate" hreflang="x-default" href="${alt.fr}" />`;
}

function head({ title, description, url, jsonLd, lang = 'fr', alt }) {
  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />${alternates(alt)}
    <meta name="theme-color" content="#0E0C1A" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="${lang === 'en' ? 'en_GB' : 'fr_FR'}" />
    <meta property="og:locale:alternate" content="${lang === 'en' ? 'fr_FR' : 'en_GB'}" />
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
function noscript(inner, lang) {
  const msg = lang === 'en' ? 'Enable JavaScript to play.' : 'Activez JavaScript pour jouer.';
  return `<noscript>\n      ${inner}\n      <p>${msg}</p>\n    </noscript>`;
}

function render(base, { title, description, url, jsonLd, body, lang = 'fr', alt }) {
  const html = base
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, () => head({ title, description, url, jsonLd, lang, alt }))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, () => noscript(body, lang));
  if (!html.includes('rel="canonical"')) throw new Error('<title> introuvable dans dist/index.html');
  return html;
}

const indexPath = path.join(dist, 'index.html');
const base = fs.readFileSync(indexPath, 'utf8');

// ── Accueil ──
// Jeux « en construction » : ni listés sur l'accueil, ni dans le plan du site
const visibles = characters.filter((c) => !c.construction);
const gameLinks = visibles
  .map((c) => `<li><a href="/${gamePath(c)}/">${esc(gameLabel(c))}</a> — ${esc(c.description)}</li>`)
  .join('\n        ');

// Jeux traduits (version anglaise sous /en/)
const visiblesEn = visibles
  .filter((c) => CHARACTERS_EN[c.game])
  .map((c) => ({ ...c, ...CHARACTERS_EN[c.game] }));
const traduit = (c) => Boolean(CHARACTERS_EN[c.game]);
const altJeu = (c) => ({ fr: `${SITE_URL}/${gamePath(c)}/`, en: `${SITE_URL}/en/${gamePath(c)}/` });
const altAccueil = { fr: `${SITE_URL}/`, en: `${SITE_URL}/en/` };

fs.writeFileSync(indexPath, render(base, {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  url: `${SITE_URL}/`,
  alt: altAccueil,
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
// Questions fréquentes communes, complétées par celles propres à chaque jeu (src/data/seoJeux.js)
function faqJeu(c) {
  const multi = c.phones === 'multi';
  const commun = [
    [`Comment jouer à ${gameLabel(c)} en ligne ?`, `Ouvrez la page sur ${SITE_URL.replace('https://', '')}, ajoutez les prénoms des joueurs et lancez la partie : tout se passe dans le navigateur, sans application à installer.`],
    [`Combien de joueurs pour ${gameLabel(c)} ?`, `De ${String(c.players).replace('–', ' à ')} joueurs, pour une partie d’environ ${c.time}.`],
    [`${gameLabel(c)} est-il gratuit ?`, multi ? 'Oui, les jeux à plusieurs téléphones sont toujours gratuits, sans inscription.' : 'Oui, sans inscription.'],
  ];
  return [...((SEO_JEUX[c.game] || {}).faq || []), ...commun];
}
function jsonLdJeu(c, url) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: gameLabel(c), item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqJeu(c).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];
}
function corpsJeu(c) {
  const d = SEO_JEUX[c.game] || {};
  const memeFamille = visibles.filter((x) => x.family === c.family && x.game !== c.game).slice(0, 5);
  return `<h1>${esc(gameLabel(c))} — ${esc(d.motCle || 'jeu de soirée en ligne')}</h1>
      <p>${esc(d.intro || c.description)}</p>
      <p>${esc(c.players)} joueurs · ${esc(c.time)} · sur ${c.phones === 'multi' ? 'un téléphone par joueur' : c.phones === 'both' ? 'un ou plusieurs téléphones' : 'un seul téléphone'}</p>
      ${d.regles ? `<h2>Règles du jeu</h2>
      <ol>${d.regles.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>` : ''}
      <h2>Questions fréquentes</h2>
      <dl>${faqJeu(c).map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl>
      ${memeFamille.length ? `<h2>Jeux du même genre</h2>
      <ul>${memeFamille.map((x) => `<li><a href="/${gamePath(x)}/">${esc(gameLabel(x))}</a></li>`).join('')}</ul>` : ''}
      <p><a href="/">Voir les ${visibles.length} jeux de ${esc(SITE_NAME)}</a></p>`;
}

for (const c of characters) {
  const p = gamePath(c);
  // Netlify sert dist/<jeu>/index.html à /<jeu>/ (et redirige /<jeu> vers /<jeu>/)
  const url = `${SITE_URL}/${p}/`;
  const dir = path.join(dist, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(base, {
    title: gameTitle(c),
    description: gameDescription(c),
    url,
    jsonLd: jsonLdJeu(c, url),
    body: corpsJeu(c),
    alt: traduit(c) ? altJeu(c) : undefined,
  }), 'utf8');
}

// ── Version anglaise : /en/ et /en/<jeu>/ (jeux traduits uniquement) ──
const enDir = path.join(dist, 'en');
fs.mkdirSync(enDir, { recursive: true });
fs.writeFileSync(path.join(enDir, 'index.html'), render(base, {
  lang: 'en',
  title: HOME_TITLE_EN,
  description: HOME_DESCRIPTION_EN,
  url: `${SITE_URL}/en/`,
  alt: altAccueil,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: `${SITE_URL}/en/`,
    description: HOME_DESCRIPTION_EN,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: 'en',
    image: OG_IMAGE,
  },
  body: `<h1>${esc(SITE_NAME)}</h1>
      <p>${esc(HOME_DESCRIPTION_EN)}</p>
      <ul>
        ${visiblesEn.map((c) => `<li><a href="/en/${gamePath(c)}/">${esc(gameLabel(c))}</a> — ${esc(c.description)}</li>`).join('\n        ')}
      </ul>
      <p><a href="/" hreflang="fr">Version française</a></p>`,
}), 'utf8');

function faqJeuEn(c) {
  const commun = [
    [`How do I play ${gameLabel(c)} online?`, `Open the page on ${SITE_URL.replace('https://', '')}/en/, add the players’ names and start the game: everything runs in the browser, no app to install.`],
    [`How many players for ${gameLabel(c)}?`, `From ${String(c.players).replace('–', ' to ')} players, for a game of about ${c.time}.`],
    [`Is ${gameLabel(c)} free?`, 'Yes, free and with no sign-up.'],
  ];
  return [...((SEO_JEUX_EN[c.game] || {}).faq || []), ...commun];
}

for (const c of visiblesEn) {
  const p = gamePath(c);
  const url = `${SITE_URL}/en/${p}/`;
  const d = SEO_JEUX_EN[c.game] || {};
  const autres = visiblesEn.filter((x) => x.game !== c.game);
  const faq = faqJeuEn(c);
  const dir = path.join(enDir, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(base, {
    lang: 'en',
    title: gameTitleEn(c),
    description: gameDescriptionEn(c),
    url,
    alt: altJeu(c),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/en/` },
          { '@type': 'ListItem', position: 2, name: gameLabel(c), item: url },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
    body: `<h1>${esc(gameLabel(c))} — ${esc(d.motCle || 'online party game')}</h1>
      <p>${esc(d.intro || c.description)}</p>
      <p>${esc(c.players)} players · ${esc(c.time)} · on one phone</p>
      ${d.regles ? `<h2>How to play</h2>
      <ol>${d.regles.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>` : ''}
      <h2>FAQ</h2>
      <dl>${faq.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl>
      <h2>More party games</h2>
      <ul>${autres.map((x) => `<li><a href="/en/${gamePath(x)}/">${esc(gameLabel(x))}</a></li>`).join('')}</ul>
      <p><a href="/${p}/" hreflang="fr">Version française</a></p>`,
  }), 'utf8');
}

// ── robots.txt et sitemap.xml ──
fs.writeFileSync(path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `${SITE_URL}/`, `${SITE_URL}/defi`, ...visibles.map((c) => `${SITE_URL}/${gamePath(c)}/`),
  `${SITE_URL}/en/`, ...visiblesEn.map((c) => `${SITE_URL}/en/${gamePath(c)}/`),
];
// Paires FR ↔ EN : annoncées aussi dans le sitemap (xhtml:link), comme le recommande Google
const paires = {};
for (const alt of [altAccueil, ...visiblesEn.map(altJeu)]) { paires[alt.fr] = alt; paires[alt.en] = alt; }
const liens = (u) => {
  const alt = paires[u];
  if (!alt) return '';
  return `\n    <xhtml:link rel="alternate" hreflang="fr" href="${alt.fr}"/>` +
    `\n    <xhtml:link rel="alternate" hreflang="en" href="${alt.en}"/>` +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${alt.fr}"/>\n  `;
};
fs.writeFileSync(path.join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod>${liens(u)}</url>`).join('\n') +
  '\n</urlset>\n', 'utf8');

// Clé IndexNow (Bing, Yandex, Seznam…) : publique par conception, elle prouve que le site
// nous appartient quand on leur signale des pages nouvelles ou modifiées
const INDEXNOW_KEY = 'c09b8e86f8ed4a346279b5f2aa722401';
fs.writeFileSync(path.join(dist, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');

// ── Manifest, icônes, image de partage ──
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
  name: SITE_NAME,
  short_name: 'Légendes',
  lang: 'fr',
  start_url: '/',
  display: 'standalone',
  background_color: '#0E0C1A',
  theme_color: '#0E0C1A',
  // Chrome (Android) exige des icônes 192 et 512 px pour proposer l'installation
  id: '/',
  scope: '/',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/app-icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
  ],
}, null, 2), 'utf8');

const assets = path.join(root, 'assets');
// Icônes d'onglet aux tailles attendues (Google : multiple de 48 px ; iPhone : 180 px).
// favicon.ico : demandé d'office par certains navigateurs (le PNG y est accepté).
fs.copyFileSync(path.join(assets, 'icon-48.png'), path.join(dist, 'favicon.png'));
fs.copyFileSync(path.join(assets, 'icon-48.png'), path.join(dist, 'favicon.ico'));
fs.copyFileSync(path.join(assets, 'icon-32.png'), path.join(dist, 'favicon-32.png'));
fs.copyFileSync(path.join(assets, 'icon-48.png'), path.join(dist, 'favicon-48.png'));
fs.copyFileSync(path.join(assets, 'icon-180.png'), path.join(dist, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(assets, 'icon.png'), path.join(dist, 'app-icon.png'));
fs.copyFileSync(path.join(assets, 'icon-192.png'), path.join(dist, 'icon-192.png'));
fs.copyFileSync(path.join(assets, 'icon-512.png'), path.join(dist, 'icon-512.png'));
fs.copyFileSync(path.join(assets, 'og-image.png'), path.join(dist, 'og-image.png'));

console.log(`SEO : accueil + ${characters.length} pages de jeux, /en/ + ${visiblesEn.length} pages anglaises, robots.txt, sitemap.xml, manifest`);
