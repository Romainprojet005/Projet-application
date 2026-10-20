// Questions déjà vues : gardées sur l'appareil pour qu'elles reviennent plus rarement.
// On tire d'abord parmi les questions jamais vues (au hasard), puis parmi les plus anciennes.
// Rien ne part sur un serveur.

const KEY = 'sdl-vu';
const MAX_PAR_JEU = 400;

function lire() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function ecrire(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}

const melanger = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Identifiant stable d'une question : son id, sinon son texte
export const cle = (item) => {
  if (item == null) return '';
  if (typeof item !== 'object') return String(item);
  return String(item.id ?? item.q ?? item.text ?? item.question ?? item.word ?? item.answer ?? item.name ?? JSON.stringify(item)).slice(0, 80);
};

// Classe `items` : jamais vus d'abord (mélangés), puis les vus du plus ancien au plus récent.
export function trierParNouveaute(jeu, items, keyFn = cle) {
  const vus = lire()[jeu] || [];
  const rang = new Map(vus.map((k, i) => [k, i]));
  const neufs = [], anciens = [];
  for (const it of items) (rang.has(keyFn(it)) ? anciens : neufs).push(it);
  anciens.sort((a, b) => rang.get(keyFn(a)) - rang.get(keyFn(b)));
  return [...melanger(neufs), ...anciens];
}

// Note ces questions comme vues (les plus récentes en fin de liste)
export function marquerVus(jeu, items, keyFn = cle) {
  const d = lire();
  const ks = items.map(keyFn);
  const set = new Set(ks);
  d[jeu] = [...(d[jeu] || []).filter((k) => !set.has(k)), ...ks].slice(-MAX_PAR_JEU);
  ecrire(d);
}

// Tire `n` questions en privilégiant les nouvelles, et les note comme vues
export function tirer(jeu, items, n, keyFn = cle) {
  const choix = trierParNouveaute(jeu, items, keyFn).slice(0, n);
  marquerVus(jeu, choix, keyFn);
  return melanger(choix);
}

// Une seule question parmi `items` (même logique)
export function tirerUn(jeu, items, keyFn = cle) {
  return tirer(jeu, items, 1, keyFn)[0];
}
