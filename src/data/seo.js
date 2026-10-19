// Textes SEO partagés entre l'app (titre de l'onglet) et scripts/seo.js (balises du HTML généré).
// Garder uniquement des `export const` : scripts/seo.js lit ce fichier sans bundler.

export const SITE_URL = 'https://soireedeslegendes.com';

export const SITE_NAME = 'La Soirée des Légendes';

export const HOME_TITLE = 'La Soirée des Légendes — 19 jeux de soirée entre amis sur téléphone';

export const HOME_DESCRIPTION =
  "19 jeux de soirée à jouer entre amis sur un seul téléphone : Undercover, blind test, quiz, mime, " +
  'confessions, défis… De 2 à 12 joueurs, directement dans le navigateur, sans application à installer.';

// Chemin du jeu dans l'URL : identique à son écran de paramétrage dans AppNavigator (linking).
export const gamePath = (c) => (c.game === 'blanc_manger' ? 'blanc' : c.game.toLowerCase());

// « CINÉ-FLASH » → « Ciné-flash »
export const gameLabel = (c) => c.gameName.charAt(0) + c.gameName.slice(1).toLowerCase();

export const gameTitle = (c) => `${gameLabel(c)} — jeu de soirée en ligne | ${SITE_NAME}`;

export const gameDescription = (c) =>
  `${c.description} ${c.players} joueurs · ${c.time}. À jouer sur téléphone, sans application.`;
