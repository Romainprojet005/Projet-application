// « Soirée enchaînée » : plusieurs jeux à la suite, avec un classement général.
// Gardée le temps de l'onglet (sessionStorage) : fermer le site abandonne la soirée.
import { useEffect, useState } from 'react';
import { characters } from '../data/characters';

const KEY = 'sdl-soiree';

// Écran de réglages de chaque jeu jouable en soirée (un seul téléphone)
export const SETUP_ROUTES = {
  undercover: 'UndercoverSetup', quiz: 'QuizSetup', amitie: 'AmitieSetup',
  personality: 'PersonalitySetup', emojiquiz: 'EmojiQuizSetup', motdepasse: 'MotDePasseSetup',
  blindtest: 'BlindTestSetup', vote: 'VoteSetup', quiestleplus: 'QuiEstLePlusSetup',
  oracle: 'OracleSetup', trouveLaRegle: 'TrouveLaRegleSetup', confessions: 'ConfessionsSetup',
  verites: 'VeritesSetup', defis: 'DefisSetup', blanc_manger: 'BlancSetup',
  tripotes: 'TriPotesSetup', verre: 'VerreSetup',
};
export const jeuxDeSoiree = () => characters.filter((c) => SETUP_ROUTES[c.game] && !c.construction);
export const nomDuJeu = (game) => {
  const c = characters.find((x) => x.game === game);
  const n = (c?.gameName || game).toLocaleLowerCase('fr');
  return n.charAt(0).toLocaleUpperCase('fr') + n.slice(1);
};

let etat = null;
try { etat = JSON.parse(sessionStorage.getItem(KEY)); } catch {}
const ecouteurs = new Set();
function sauver(e) {
  etat = e;
  try { e ? sessionStorage.setItem(KEY, JSON.stringify(e)) : sessionStorage.removeItem(KEY); } catch {}
  ecouteurs.forEach((fn) => fn(etat));
}
export const lireSoiree = () => etat;

export function demarrerSoiree(joueurs, jeux) {
  sauver({ joueurs, jeux, idx: 0, scores: Object.fromEntries(joueurs.map((n) => [n, 0])), detail: [], fini: false });
}
export function abandonnerSoiree() { sauver(null); }

// Le jeu en cours fait-il partie de la soirée ?
export const dansLaSoiree = (game) => !!etat && !etat.fini && etat.jeux[etat.idx] === game;

// Fin d'un jeu : points de soirée selon le classement (1er = autant de points que de joueurs classés)
export function enregistrerResultat(game, scores, { moinsGagne = false } = {}) {
  if (!dansLaSoiree(game) || etat.detail.some((d) => d.idx === etat.idx) || !scores) return;
  const noms = etat.joueurs.filter((n) => scores[n] != null);
  const tries = [...noms].sort((a, b) => (moinsGagne ? scores[a] - scores[b] : scores[b] - scores[a]));
  const gains = {};
  tries.forEach((n, i) => {
    // ex æquo : même rang que le premier joueur à égalité
    const rang = tries.findIndex((m) => scores[m] === scores[n]);
    gains[n] = tries.length - rang;
  });
  const total = { ...etat.scores };
  Object.entries(gains).forEach(([n, g]) => { total[n] = (total[n] || 0) + g; });
  sauver({ ...etat, scores: total, detail: [...etat.detail, { idx: etat.idx, game, gains }] });
}

// Passe au jeu suivant ; renvoie la route de son écran de réglages, ou null si la soirée est finie
export function jeuSuivant() {
  if (!etat) return null;
  const idx = etat.idx + 1;
  if (idx >= etat.jeux.length) { sauver({ ...etat, fini: true }); return null; }
  sauver({ ...etat, idx });
  return SETUP_ROUTES[etat.jeux[idx]];
}

export function useSoiree() {
  const [e, setE] = useState(etat);
  useEffect(() => { ecouteurs.add(setE); setE(etat); return () => ecouteurs.delete(setE); }, []);
  return e;
}
