import { Platform } from 'react-native';

// ── Animations du site (web) ──────────────────────────────────────────
// Uniquement en CSS et seulement sur opacity / transform : le navigateur les
// calcule sur la carte graphique, sans recalcul de mise en page → pas de lag.
// Toutes sont coupées en mode éco (body.sdl-eco) et si l'appareil demande de
// réduire les animations (prefers-reduced-motion).

// Paramètres communs, réutilisés par la navigation (fondu d'écran)
export const SCREEN_ENTER = {
  animationKeyframes: [{ from: { opacity: 0, transform: [{ translateY: 10 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } }],
  animationDuration: '260ms',
  animationTimingFunction: 'cubic-bezier(.2,.7,.3,1)',
};

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-anim-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-anim-css';
  st.textContent = `
    @keyframes sdl-rise   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    @keyframes sdl-fade   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sdl-pop    { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
    @keyframes sdl-shine  { 0%, 72% { transform: translateX(-130%) skewX(-20deg); } 100% { transform: translateX(260%) skewX(-20deg); } }
    @keyframes sdl-home-in { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%); } }

    /* Pages de réglages : les blocs apparaissent l'un après l'autre */
    [data-anim="rise"] > * { animation: sdl-rise .45s cubic-bezier(.2,.7,.3,1) both; }
    [data-anim="rise"] > *:nth-child(2) { animation-delay: .05s; }
    [data-anim="rise"] > *:nth-child(3) { animation-delay: .10s; }
    [data-anim="rise"] > *:nth-child(4) { animation-delay: .15s; }
    [data-anim="rise"] > *:nth-child(5) { animation-delay: .20s; }
    [data-anim="rise"] > *:nth-child(6) { animation-delay: .25s; }
    [data-anim="rise"] > *:nth-child(n+7) { animation-delay: .30s; }

    /* Menu : arrivée en douceur (rien ne se rejoue pendant le défilement des cartes, déjà gourmand) */
    .sdl-top  { animation: sdl-fade .5s ease-out both; }
    .sdl-hero { animation: sdl-rise .55s .08s cubic-bezier(.2,.7,.3,1) both; }
    .sdl-info { animation: sdl-rise .55s .16s cubic-bezier(.2,.7,.3,1) both; }

    /* Bouton Jouer : reflet doré qui le traverse de temps en temps */
    .sdl-play { position: relative; }
    .sdl-play::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 45%; pointer-events: none;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
      will-change: transform; animation: sdl-shine 4.5s 1.5s ease-in-out infinite; }
    .sdl-play:disabled::after { display: none; }

    /* Fenêtres (Offres, Proposer un jeu, code) */
    .sdl-modal { animation: sdl-fade .2s ease-out both; }
    .sdl-box   { animation: sdl-pop .28s cubic-bezier(.2,.7,.3,1) both; }

    /* Bouton Menu permanent */
    .sdl-home { animation: sdl-home-in .35s .2s ease-out both; }

    /* Boutons : léger enfoncement au toucher (sauf éléments déjà transformés : cartes, flèches…) */
    [role="button"]:not(.sdl-flip-card):not([style*="transform"]),
    .sdl-top-btn, .sdl-fam, .sdl-btn { transition: transform .14s ease-out; }
    [role="button"]:not(.sdl-flip-card):not([style*="transform"]):active,
    .sdl-top-btn:active, .sdl-fam:active, .sdl-btn:active { transform: scale(.97); }

    /* Mode éco et « réduire les animations » : on coupe tout */
    body.sdl-eco [data-anim="rise"] > *, body.sdl-eco .sdl-top, body.sdl-eco .sdl-hero, body.sdl-eco .sdl-info,
    body.sdl-eco .sdl-modal, body.sdl-eco .sdl-box, body.sdl-eco .sdl-home { animation: none; }
    body.sdl-eco .sdl-play::after { display: none; }
    @media (prefers-reduced-motion: reduce) {
      [data-anim="rise"] > *, .sdl-top, .sdl-hero, .sdl-info, .sdl-modal, .sdl-box, .sdl-home { animation: none !important; }
      .sdl-play::after { display: none; }
      [role="button"], .sdl-top-btn, .sdl-fam, .sdl-btn { transition: none !important; }
    }
  `;
  document.head.appendChild(st);
}
