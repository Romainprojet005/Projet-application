// ── Langue du site ────────────────────────────────────────────────────
// La langue vient de l'adresse : tout ce qui est sous /en/ est en anglais, le reste en français.
// Elle est fixée au chargement de la page ; changer de langue recharge la page sur l'autre adresse.
import { Platform } from 'react-native';

const path = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.pathname : '/';

export const LANG = /^\/en(\/|$)/.test(path) ? 'en' : 'fr';
export const IS_EN = LANG === 'en';

// t('Texte français', 'English text') : le français reste lisible dans le code, l'anglais à côté
export const t = (fr, en) => (IS_EN && en != null ? en : fr);

// Préfixe des chemins de l'app : '' en français, 'en/' en anglais
export const PATH_PREFIX = IS_EN ? 'en/' : '';

// Jeux traduits en anglais (identifiant `game` de src/data/characters.js)
export const GAMES_EN = ['undercover', 'tripotes', 'defis', 'vote'];

// Adresse de la même page dans l'autre langue (la version anglaise n'existe que pour les jeux traduits)
export function otherLangUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '/';
  const p = window.location.pathname;
  if (IS_EN) return p.replace(/^\/en(\/|$)/, '/') || '/';
  const game = p.split('/')[1];
  return GAMES_EN.includes(game) ? `/en/${game}/` : '/en/';
}

export function switchLanguage() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { localStorage.setItem('sdl-lang', IS_EN ? 'fr' : 'en'); } catch {}
    window.location.href = otherLangUrl();
  }
}
