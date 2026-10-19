// ── Accès aux jeux : gratuits du jour, multi-téléphones, déblocages ───
import { characters } from '../data/characters';
import { PAYWALL_ACTIF, JEUX_GRATUITS_PAR_JOUR } from '../config/offres';

// Un jeu jouable sur plusieurs téléphones est toujours gratuit.
export const isMulti = (c) => c.phones === 'multi' || c.phones === 'both';

export const PHONE_LABELS = {
  one: '1 téléphone',
  multi: 'Multi-téléphones',
  both: '1 ou plusieurs téléphones',
};

// Jour courant à l'heure de Paris, en nombre de jours depuis 1970.
function parisDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now); // AAAA-MM-JJ
  const [y, m, d] = parts.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

// Petit générateur pseudo-aléatoire déterministe (même résultat pour tout le monde).
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Jeux « un seul téléphone » offerts aujourd'hui.
export function gratuitsDuJour(now = new Date()) {
  const pool = characters.filter(c => !isMulti(c)).map(c => c.game);
  const rnd = seeded(parisDay(now) * 2654435761);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, JEUX_GRATUITS_PAR_JOUR));
}

// Temps restant avant la prochaine rotation (minuit, heure de Paris).
export function avantRotation(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const [h, m] = fmt.format(now).split(':').map(Number);
  const reste = (24 * 60) - (h * 60 + m);
  return { heures: Math.floor(reste / 60), minutes: reste % 60 };
}

// ── Déblocages enregistrés sur l'appareil ─────────────────────────────
// Ces déblocages seront écrits par le paiement une fois celui-ci branché.
const KEY = 'sdl-acces';
function lire() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function enregistrerDeblocage(offreId, game) {
  const d = lire();
  const now = Date.now();
  if (offreId === 'jeu_24h' && game) d.jeux = { ...(d.jeux || {}), [game]: now + 864e5 };
  if (offreId === 'tous_24h') d.tous = now + 864e5;
  if (offreId === 'abonnement') d.abonnement = now + 31 * 864e5;
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}

// ── Code d'accès (couronne du logo) ──────────────────────────────────
// Le code n'est pas écrit en clair : on compare son empreinte SHA-256.
const CODE_HASH = 'fd2ed99a072e2450895b09d204b00b79549bfcb0c9caf49d9b225e9cad1d1be9';
export async function verifierCode(code) {
  try {
    const data = new TextEncoder().encode('sdl:' + String(code).trim());
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== CODE_HASH) return false;
    const d = lire();
    d.code = true;
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
    return true;
  } catch {
    return false;
  }
}

// Jeux « en construction » : verrouillés tant que le code d'accès n'a pas été saisi sur cet appareil
export const enConstruction = (c) => !!c?.construction && !lire().code;

// Statut d'accès d'un jeu :
//  'libre'    → cadenas désactivé (PAYWALL_ACTIF = false)
//  'multi'    → toujours gratuit (multi-téléphones)
//  'gratuit'  → offert aujourd'hui
//  'debloque' → débloqué par un achat
//  'verrouille'
export function statutAcces(c, gratuits = gratuitsDuJour()) {
  if (!PAYWALL_ACTIF) return 'libre';
  if (isMulti(c)) return 'multi';
  if (gratuits.has(c.game)) return 'gratuit';
  const d = lire();
  const now = Date.now();
  if (d.code || (d.abonnement || 0) > now || (d.tous || 0) > now || (d.jeux?.[c.game] || 0) > now) return 'debloque';
  return 'verrouille';
}
