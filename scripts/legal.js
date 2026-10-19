// Génère les pages légales statiques : dist/mentions-legales/ et dist/confidentialite/.
// Pages en HTML simple (lisibles sans JavaScript, et par les moteurs de recherche).
//
// ⚠ Si le site devient payant ou affiche de la publicité, l'éditeur n'est plus un
// « particulier non professionnel » : il faudra afficher son identité (nom, adresse,
// SIRET…) et ajouter des CGV. Si la publicité Google est activée, il faudra aussi un
// bandeau de consentement aux cookies.
const fs   = require('fs');
const path = require('path');

const CONTACT   = 'soireedeslegendes@gmail.com'; // ← adresse de contact affichée sur le site
const SITE      = 'La Soirée des Légendes';
const URL       = 'https://soireedeslegendes.com';
const MAJ       = '19 octobre 2026';               // date de dernière mise à jour des textes

const dist = path.join(__dirname, '..', 'dist');
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`;

const page = (slug, title, description, body) => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} | ${SITE}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${URL}/${slug}/" />
<meta name="theme-color" content="#0E0C1A" />
<link rel="icon" type="image/png" href="/favicon.png" />
<style>
  :root { --bg: #0E0C1A; --card: #16132A; --line: #2A2545; --text: #F3EEE2; --muted: #A9A3BF; --gold: #D4AF37; --gold-l: #E6C766; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
  .back { display: inline-block; color: var(--gold-l); text-decoration: none; font-weight: 600; margin-bottom: 24px; }
  .back:hover, a:hover { text-decoration: underline; }
  .kick { display: block; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  h1 { font-family: "Bodoni Moda", Didot, Georgia, serif; font-size: clamp(30px, 7vw, 42px); line-height: 1.1; margin: 0 0 8px; }
  .maj { color: var(--muted); font-size: 14px; margin: 0 0 32px; }
  h2 { font-size: 19px; margin: 36px 0 10px; color: var(--gold-l); }
  p, li { color: #DDD7EA; }
  a { color: var(--gold-l); }
  ul { padding-left: 20px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; margin: 12px 0; }
  .card p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 15px; }
  th, td { text-align: left; vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--line); }
  th { color: var(--muted); font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; }
  .scroll { overflow-x: auto; }
  footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--line); color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<main>
  <a class="back" href="/">← Retour aux jeux</a>
  <span class="kick">${SITE}</span>
  <h1>${title}</h1>
  <p class="maj">Dernière mise à jour : ${MAJ}</p>
${body}
  <footer><a href="/mentions-legales/">Mentions légales</a> · <a href="/confidentialite/">Confidentialité</a> · Contact : ${mail}</footer>
</main>
</body>
</html>
`;

const mentions = page('mentions-legales', 'Mentions légales',
  `Mentions légales du site ${SITE} : éditeur, hébergeur et propriété intellectuelle.`, `
  <h2>Éditeur du site</h2>
  <p>Le site <strong>${URL.replace('https://', '')}</strong> est édité à titre non professionnel par un particulier.
  Conformément à l’article 6, III, 2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie
  numérique (LCEN), l’éditeur a choisi de ne pas rendre publique son identité ; celle-ci a été communiquée à l’hébergeur
  ci-dessous.</p>
  <div class="card">
    <p><strong>Contact de l’éditeur :</strong> ${mail}</p>
    <p><strong>Directeur de la publication :</strong> l’éditeur du site, joignable à la même adresse.</p>
  </div>

  <h2>Hébergeur</h2>
  <div class="card">
    <p><strong>Netlify, Inc.</strong></p>
    <p>101 2nd Street, San Francisco, CA 94105, États-Unis</p>
    <p>Site : <a href="https://www.netlify.com" rel="noopener">www.netlify.com</a> · Contact : <a href="mailto:privacy@netlify.com">privacy@netlify.com</a></p>
  </div>

  <h2>Accès au site</h2>
  <p>Le site est gratuit et accessible sans inscription. L’éditeur s’efforce d’en assurer la disponibilité, sans
  obligation de résultat : il peut être interrompu pour maintenance ou pour toute autre raison, sans préavis.</p>

  <h2>Propriété intellectuelle</h2>
  <p>La structure du site, ses textes, ses jeux et leur présentation sont la propriété de l’éditeur, sauf mention
  contraire. Toute reproduction ou réutilisation sans autorisation est interdite.</p>
  <p>Certains jeux utilisent des contenus de tiers (extraits musicaux lus depuis YouTube, images de films ou de
  personnalités publiques) à des fins d’illustration et de divertissement. Ces contenus restent la propriété de leurs
  auteurs. Si vous êtes ayant droit et souhaitez le retrait d’un contenu, écrivez à ${mail} : il sera retiré
  rapidement.</p>

  <h2>Contenus des joueurs</h2>
  <p>Les prénoms, réponses et textes saisis pendant les parties sont sous la responsabilité de ceux qui les écrivent.
  Pour signaler un contenu illicite, écrivez à ${mail}.</p>

  <h2>Données personnelles</h2>
  <p>Le traitement des données personnelles est décrit dans la <a href="/confidentialite/">politique de confidentialité</a>.</p>
`);

const confidentialite = page('confidentialite', 'Politique de confidentialité',
  `Données collectées par ${SITE}, durées de conservation et vos droits (RGPD).`, `
  <p>${SITE} est un site de jeux de soirée gratuit, utilisable sans compte. Il collecte le moins de données possible :
  cette page explique lesquelles, pourquoi, et combien de temps elles sont gardées.</p>

  <h2>Responsable du traitement</h2>
  <p>L’éditeur du site (voir les <a href="/mentions-legales/">mentions légales</a>), joignable à ${mail}.</p>

  <h2>Données collectées</h2>
  <div class="scroll"><table>
    <tr><th>Quoi</th><th>Pourquoi</th><th>Durée</th></tr>
    <tr><td><strong>Jeux sur un seul téléphone</strong> : prénoms des joueurs, réponses</td>
        <td>Faire fonctionner la partie</td><td>Rien n’est envoyé : tout reste sur le téléphone, le temps de la partie</td></tr>
    <tr><td><strong>Jeux multi-téléphones</strong> : prénom ou pseudo choisi, code de la salle, votes, réponses et textes écrits pendant la partie</td>
        <td>Partager la partie entre les téléphones des joueurs</td><td>Supprimés automatiquement 24 heures après la création de la salle</td></tr>
    <tr><td><strong>« Proposer un jeu »</strong> : nom et description du jeu, nombre de joueurs, et si vous le donnez, un prénom ou un e-mail</td>
        <td>Lire votre idée et, si vous l’avez souhaité, vous répondre</td><td>2 ans au maximum</td></tr>
    <tr><td><strong>Statistiques</strong> : jeu ouvert ou lancé, mode (un ou plusieurs téléphones), nombre de joueurs</td>
        <td>Savoir quels jeux plaisent</td><td>Aucune donnée personnelle (ni nom, ni adresse IP, ni identifiant d’appareil)</td></tr>
    <tr><td><strong>Mesure de performance</strong> de l’hébergeur (Netlify) : vitesse de chargement des pages</td>
        <td>Suivre la rapidité du site</td><td>Mesures anonymes, sans cookie</td></tr>
  </table></div>
  <p>Ces traitements reposent sur l’intérêt légitime de l’éditeur à faire fonctionner le site (article 6.1.f du RGPD),
  et sur votre consentement pour le contact que vous choisissez de laisser dans « Proposer un jeu ».
  Vos données ne sont jamais vendues, ni utilisées pour de la publicité.</p>

  <h2>Cookies et stockage sur votre appareil</h2>
  <p>Le site ne dépose <strong>aucun cookie publicitaire ni de mesure d’audience</strong>. Il enregistre seulement
  sur votre appareil (stockage local du navigateur) les éléments nécessaires à son fonctionnement, qui ne demandent
  pas de consentement :</p>
  <ul>
    <li>une clé secrète qui protège les salles multi-téléphones que vous rejoignez ;</li>
    <li>vos accès aux jeux (jeux gratuits du jour, code d’accès) ;</li>
    <li>votre préférence d’affichage (mode économie) ;</li>
    <li>une copie du site, pour qu’il reste utilisable si le réseau coupe.</li>
  </ul>
  <p>Vous pouvez tout effacer à tout moment depuis les réglages de votre navigateur (données du site).</p>

  <h2>Services tiers</h2>
  <ul>
    <li><strong>Netlify</strong> (États-Unis) : hébergement du site. Comme tout serveur web, il reçoit votre adresse IP
      pour vous envoyer les pages.</li>
    <li><strong>Supabase</strong> : base de données des salles multi-téléphones, des idées et des statistiques.</li>
    <li><strong>Google Fonts</strong> (Google) : polices d’écriture ; votre navigateur les télécharge chez Google, qui
      reçoit votre adresse IP.</li>
    <li><strong>YouTube</strong> (Google) : lecture des extraits du Blind test, en mode « confidentialité renforcée »
      (youtube-nocookie.com). En lançant un extrait, vous accédez à un service de YouTube, soumis à la
      <a href="https://policies.google.com/privacy?hl=fr" rel="noopener">politique de confidentialité de Google</a>.</li>
  </ul>
  <p>Certains de ces prestataires sont situés hors de l’Union européenne. Les transferts sont encadrés par le cadre
  de protection des données UE–États-Unis (Data Privacy Framework) ou par les clauses contractuelles types de la
  Commission européenne.</p>

  <h2>Vos droits</h2>
  <p>Vous pouvez demander l’accès, la rectification ou l’effacement de vos données, ou vous opposer à leur
  traitement, en écrivant à ${mail}. Les données des parties multi-téléphones n’étant liées à aucun compte,
  précisez le code de la salle et le pseudo utilisé.</p>
  <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL
  (<a href="https://www.cnil.fr/fr/plaintes" rel="noopener">www.cnil.fr</a>).</p>

  <h2>Mineurs</h2>
  <p>Certains jeux ou modes sont réservés aux adultes (mention 18+). Les moins de 15 ans ne doivent pas laisser
  de contact dans « Proposer un jeu » sans l’accord d’un parent.</p>
`);

for (const [slug, html] of [['mentions-legales', mentions], ['confidentialite', confidentialite]]) {
  fs.mkdirSync(path.join(dist, slug), { recursive: true });
  fs.writeFileSync(path.join(dist, slug, 'index.html'), html, 'utf8');
}

// Ajout au plan du site
const sitemap = path.join(dist, 'sitemap.xml');
if (fs.existsSync(sitemap)) {
  const xml = fs.readFileSync(sitemap, 'utf8');
  if (!xml.includes('/mentions-legales/')) {
    const extra = ['mentions-legales', 'confidentialite']
      .map((s) => `  <url><loc>${URL}/${s}/</loc></url>`).join('\n');
    fs.writeFileSync(sitemap, xml.replace('</urlset>', `${extra}\n</urlset>`), 'utf8');
  }
}

console.log(`Pages légales : /mentions-legales/ et /confidentialite/ (contact ${CONTACT})`);
