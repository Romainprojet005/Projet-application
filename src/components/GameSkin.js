import React from 'react';
import { Platform } from 'react-native';
import { characters } from '../data/characters';

// ── Habillage commun des écrans de jeu (web) ──────────────────────────
// Calque décoratif posé au-dessus de l'écran courant, sans capter les clics :
// bande crantée façon booster en haut, halo à la couleur du jeu, étoiles.

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
    .sdl-skin-band { position: absolute; left: 0; right: 0; top: 0; height: 6px;
      background:
        repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 2px, transparent 2px 6px),
        linear-gradient(90deg, var(--skin-dark), var(--skin-accent), var(--skin-dark));
      box-shadow: 0 0 18px var(--skin-accent); }
    .sdl-skin-stripe { position: absolute; left: 0; right: 0; top: 6px; height: 1px;
      background: linear-gradient(90deg, transparent, #fbe7b0, transparent); opacity: .6; }
    .sdl-skin-aura { position: absolute; left: 50%; top: -260px; width: 760px; height: 520px;
      transform: translateX(-50%); border-radius: 50%; mix-blend-mode: screen; opacity: .28;
      background: radial-gradient(ellipse at center, var(--skin-accent) 0%, transparent 65%);
      transition: background .6s ease; }
    .sdl-skin-stars { position: absolute; inset: 0; mix-blend-mode: screen; opacity: .55;
      background-image:
        radial-gradient(1.2px 1.2px at 8% 12%, #fff, transparent),
        radial-gradient(1px 1px at 22% 34%, #ffffffaa, transparent),
        radial-gradient(1.4px 1.4px at 71% 8%, #fff, transparent),
        radial-gradient(1px 1px at 90% 26%, #ffffffaa, transparent),
        radial-gradient(1px 1px at 4% 62%, #ffffff88, transparent),
        radial-gradient(1px 1px at 96% 70%, #ffffff88, transparent),
        radial-gradient(1.2px 1.2px at 12% 92%, #ffffffaa, transparent),
        radial-gradient(1px 1px at 86% 94%, #ffffff88, transparent); }
    body.sdl-eco .sdl-skin-aura, body.sdl-eco .sdl-skin-stars { display: none; }
  `;
  document.head.appendChild(st);
}

export default function GameSkin({ routeName }) {
  if (Platform.OS !== 'web') return null;
  const game = gameForRoute(routeName);
  if (!game) return null;
  const accent = game.color || '#E8C66A';
  return (
    <div
      className="sdl-skin"
      aria-hidden="true"
      style={{ '--skin-accent': accent, '--skin-dark': `color-mix(in oklab, ${accent} 30%, #0b0a1a)` }}
    >
      <div className="sdl-skin-aura" />
      <div className="sdl-skin-stars" />
      <div className="sdl-skin-band" />
      <div className="sdl-skin-stripe" />
    </div>
  );
}
