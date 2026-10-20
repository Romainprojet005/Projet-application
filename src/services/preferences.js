// Réglages de l'appareil : sons, vibrations, écran sombre renforcé, écran toujours allumé.
// Gardés dans le navigateur, rien n'est envoyé.
import { Platform } from 'react-native';

const KEY = 'sdl-reglages';
const DEFAUTS = { sons: true, vibrations: true, sombre: false, veille: true };
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let prefs = { ...DEFAUTS };
try { prefs = { ...DEFAUTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch {}

const ecouteurs = new Set();
export const lirePrefs = () => prefs;
export function ecouterPrefs(fn) { ecouteurs.add(fn); return () => ecouteurs.delete(fn); }
export function changerPref(nom, valeur) {
  prefs = { ...prefs, [nom]: valeur };
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {}
  appliquerSombre();
  ecouteurs.forEach((fn) => fn(prefs));
}

// ── Écran sombre renforcé : fond noir et luminosité réduite (soirée dans le noir) ──
function appliquerSombre() {
  if (!isWeb) return;
  document.documentElement.classList.toggle('sdl-sombre', !!prefs.sombre);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', prefs.sombre ? '#000000' : '#0E0C1A');
}
if (isWeb && !document.getElementById('sdl-sombre-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-sombre-css';
  st.textContent = `
    html.sdl-sombre, html.sdl-sombre body { background: #000 !important; }
    html.sdl-sombre #root { filter: brightness(.72) contrast(1.05); }
  `;
  document.head.appendChild(st);
  appliquerSombre();
}

// ── Écran toujours allumé pendant une partie (Wake Lock) ──
let verrou = null;
let demandes = 0;
async function prendreVerrou() {
  if (!isWeb || !prefs.veille || verrou || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    verrou = await navigator.wakeLock.request('screen');
    verrou.addEventListener('release', () => { verrou = null; });
  } catch { verrou = null; }
}
function relacher() {
  try { verrou?.release(); } catch {}
  verrou = null;
}
if (isWeb) {
  document.addEventListener('visibilitychange', () => { if (demandes > 0) prendreVerrou(); });
}
// À appeler à l'entrée d'une partie ; renvoie la fonction de sortie
export function garderEcranAllume() {
  demandes++;
  prendreVerrou();
  return () => { demandes = Math.max(0, demandes - 1); if (!demandes) relacher(); };
}
ecouterPrefs((p) => { if (!p.veille) relacher(); else if (demandes) prendreVerrou(); });
