import React from 'react';
import { Platform } from 'react-native';
import { characters } from '../data/jeux';
import { familyOf } from './BoosterCard';

// ── Habillage commun des écrans de jeu (web) ──────────────────────────
// Calque décoratif posé au-dessus de l'écran courant, sans capter les clics :
// filet or en haut, halo léger à la couleur de la famille du jeu, trame d'étoiles.

// Préfixe du nom de route → clé du jeu dans characters.js (les plus longs d'abord)
const ROUTE_GAMES = [
  ['TrouveLaRegle', 'trouveLaRegle'], ['QuiEstLePlus', 'quiestleplus'], ['Personality', 'personality'],
  ['Confessions', 'confessions'], ['Verites', 'verites'], ['MotDePasse', 'motdepasse'], ['Undercover', 'undercover'],
  ['EmojiQuiz', 'emojiquiz'], ['CineFlash', 'cineflash'], ['LolSelect', 'lolselect'],
  ['Tribunal', 'tribunal'], ['TriPotes', 'tripotes'], ['Amitie', 'amitie'], ['Buzzer', 'buzzer'],
  ['Oracle', 'oracle'], ['Blind', 'blindtest'], ['Blanc', 'blanc_manger'], ['Verre', 'verre'],
  ['Defis', 'defis'], ['Quiz', 'quiz'], ['Vote', 'vote'], ['Mime', 'mime'],
];

export function gameForRoute(routeName) {
  if (!routeName) return null;
  const hit = ROUTE_GAMES.find(([prefix]) => routeName.startsWith(prefix));
  return hit ? characters.find(c => c.game === hit[1]) ?? null : null;
}

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-skin-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-skin-css';
  st.textContent = `
    .sdl-skin { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
    /* Filet or en haut de l'écran, comme le cadre des cartes de légende */
    .sdl-skin-band { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: #D4AF37; opacity: .85; }
    .sdl-skin-stripe { position: absolute; left: 0; right: 0; top: 2px; height: 1px; background: var(--skin-accent); opacity: .5; }
    /* Halo très léger à la couleur de la famille du jeu */
    .sdl-skin-aura { position: absolute; left: 50%; top: -300px; width: 760px; height: 520px;
      transform: translateX(-50%); border-radius: 50%; opacity: .10;
      background: radial-gradient(ellipse at center, var(--skin-accent) 0%, transparent 65%); }
    /* Fine trame d'étoiles or */
    .sdl-skin-stars { position: absolute; inset: 0; opacity: .5;
      background-image: radial-gradient(rgba(212,175,55,.35) 1px, transparent 1.3px);
      background-size: 28px 28px;
      -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 35%);
      mask-image: linear-gradient(180deg, #000 0%, transparent 35%); }
    body.sdl-eco .sdl-skin-aura, body.sdl-eco .sdl-skin-stars { display: none; }
  `;
  document.head.appendChild(st);
}

export default function GameSkin({ routeName }) {
  if (Platform.OS !== 'web') return null;
  const game = gameForRoute(routeName);
  if (!game) return null;
  const accent = familyOf(game).color;
  return (
    <div
      className="sdl-skin"
      aria-hidden="true"
      style={{ '--skin-accent': accent }}
    >
      <div className="sdl-skin-aura" />
      <div className="sdl-skin-stars" />
      <div className="sdl-skin-band" />
      <div className="sdl-skin-stripe" />
    </div>
  );
}
