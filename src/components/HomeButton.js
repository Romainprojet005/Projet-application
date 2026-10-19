import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// ── Bouton « Menu » permanent (web) ───────────────────────────────────
// Toujours visible en haut au centre (les coins sont pris par « Quitter » et les compteurs),
// sur tous les écrans sauf le menu lui-même.
// Sur la page de réglages d'un jeu, il ramène au menu directement. Pendant une
// partie, un premier toucher demande confirmation (« Quitter ? ») pour ne pas
// perdre la partie par erreur ; sans second toucher, il se replie après 3 s.

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-home-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-home-css';
  st.textContent = `
    .sdl-home { position: fixed; z-index: 60; top: max(3px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 6px; height: 30px; min-width: 30px; padding: 0 8px; box-sizing: border-box;
      border-radius: 99px; border: 1px solid rgba(212,175,55,.45); background: rgba(14,12,26,.82);
      -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
      color: #E6C766; font: 600 13px/1 'Outfit', system-ui, sans-serif; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.55); -webkit-tap-highlight-color: transparent; }
    .sdl-home svg { flex: none; display: block; }
    .sdl-home:hover { border-color: #E6C766; }
    .sdl-home:focus-visible { outline: 2px solid #F4DC8C; outline-offset: 2px; }
    .sdl-home.confirm { background: #D4AF37; border-color: #D4AF37; color: #1A1408; }
  `;
  document.head.appendChild(st);
}

const NO_BUTTON = /^(Menu|Welcome)$/;

export default function HomeButton({ routeName, onHome }) {
  const [confirm, setConfirm] = useState(false);
  const timer = useRef(null);

  // Changement d'écran : on replie la demande de confirmation
  useEffect(() => { setConfirm(false); clearTimeout(timer.current); }, [routeName]);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (Platform.OS !== 'web' || !routeName || NO_BUTTON.test(routeName)) return null;

  const inGame = !/Setup$/.test(routeName);
  const press = () => {
    if (!inGame || confirm) { setConfirm(false); onHome(); return; }
    setConfirm(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirm(false), 3000);
  };

  return (
    <button
      type="button"
      className={`sdl-home${confirm ? ' confirm' : ''}`}
      onClick={press}
      aria-label={confirm ? 'Confirmer : quitter la partie et revenir au menu' : 'Revenir au menu'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-7 9 7" /><path d="M5 10v10h5v-6h4v6h5V10" />
      </svg>
      {confirm && <span>Quitter ?</span>}
    </button>
  );
}
