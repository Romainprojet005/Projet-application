import React from 'react';
import { Platform } from 'react-native';

// ── Carte "booster" (web) ─────────────────────────────────────────────
// Toutes les tailles sont en em : font-size = largeur / 21, donc la carte
// se redimensionne d'un bloc (210 px de large → 1em = 10 px).

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-booster-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-booster-css';
  st.textContent = `
    .bc {
      position: relative; border-radius: 1.1em; overflow: hidden;
      display: flex; flex-direction: column;
      background: var(--bc-dark);
      box-shadow: 0 1.8em 4em rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06);
      font-family: 'Outfit', system-ui, sans-serif; color: #efeaf8;
      -webkit-tap-highlight-color: transparent;
    }
    .bc-band {
      flex: none; position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background:
        repeating-linear-gradient(90deg, rgba(255,255,255,.09) 0 .2em, transparent .2em .6em),
        linear-gradient(180deg, var(--bc-accent), var(--bc-dark));
    }
    .bc-band.top { height: 4.4em; }
    .bc-band.bottom { height: 2.2em;
      background:
        repeating-linear-gradient(90deg, rgba(255,255,255,.09) 0 .2em, transparent .2em .6em),
        linear-gradient(0deg, var(--bc-accent), var(--bc-dark)); }
    .bc-brand { font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 1.3em;
      letter-spacing: .12em; line-height: 1; color: #fff; text-shadow: 0 .1em 0 rgba(0,0,0,.5); }
    .bc-brand-sub { font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: .62em;
      letter-spacing: .32em; line-height: 1.6; color: #fbe7b0; }
    .bc-badge { position: absolute; right: .7em; top: .7em; padding: .2em .5em; border-radius: .35em;
      background: #0d0c16; color: #fff; font-weight: 600; font-size: .8em; letter-spacing: .04em; }
    .bc-stripe { flex: none; height: .4em; background: linear-gradient(90deg, #b9c6ff, #fff, #b9c6ff); }
    .bc-art { flex: 1; position: relative; overflow: hidden;
      background: radial-gradient(circle at 50% 38%, var(--bc-accent) 0%, var(--bc-dark) 46%, #0b0a1a 100%); }
    .bc-streak { position: absolute; left: -30%; width: 160%; }
    .bc-streak.a { top: 20%; height: 1.8em; transform: rotate(-26deg); opacity: .65;
      background: linear-gradient(90deg, transparent, var(--bc-accent), transparent); }
    .bc-streak.b { top: 56%; height: .9em; transform: rotate(18deg); opacity: .3;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent); }
    .bc-ring { position: absolute; left: 50%; top: 36%; transform: translate(-50%, -50%); border-radius: 50%; }
    .bc-ring.outer { width: 11em; height: 11em; border: .15em solid rgba(251,231,176,.75);
      box-shadow: 0 0 2.4em var(--bc-accent); }
    .bc-ring.inner { width: 8.8em; height: 8.8em; border: .1em dashed rgba(251,231,176,.45); }
    .bc-emoji { position: absolute; left: 0; right: 0; top: 36%; transform: translateY(-50%);
      text-align: center; font-size: 4.6em; line-height: 1;
      filter: drop-shadow(0 0 .25em rgba(0,0,0,.6)); }
    .bc-plate { position: absolute; left: .8em; right: .8em; bottom: 1em;
      display: flex; flex-direction: column; align-items: center; gap: .35em; text-align: center; }
    .bc-persona { font-size: .72em; font-weight: 600; letter-spacing: .2em; text-transform: uppercase;
      color: #fbe7b0; text-shadow: 0 .1em .3em rgba(0,0,0,.8); }
    .bc-title { font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 1.85em; line-height: 1.02;
      text-transform: uppercase; color: #fff;
      text-shadow: 0 .08em 0 #0b0a1a, .06em 0 0 #0b0a1a, -.06em 0 0 #0b0a1a, 0 -.06em 0 #0b0a1a, 0 0 .5em rgba(0,0,0,.7); }
    .bc-sheen { position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(115deg, transparent 32%, rgba(255,255,255,.2) 46%, transparent 58%); }

    .bc-back { position: absolute; inset: 0; border-radius: 1.1em; box-sizing: border-box;
      padding: 1.6em 1.5em; display: flex; flex-direction: column; gap: .9em; text-align: left;
      background: radial-gradient(circle at 50% 0%, var(--bc-dark), #12101f 72%);
      border: .15em solid rgba(251,231,176,.6); font-family: 'Outfit', system-ui, sans-serif; color: #efeaf8;
      box-shadow: 0 1.8em 4em rgba(0,0,0,.6); }
    .bc-back-kicker { font-size: .72em; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #fbe7b0; }
    .bc-back-title { font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 1.7em; line-height: 1.05;
      text-transform: uppercase; color: #fff; }
    .bc-back-rule { height: .15em; width: 3em; background: #e8c66a; }
    .bc-back-desc { margin: 0; font-size: 1.12em; line-height: 1.45; color: #ddd6f0; flex: 1; overflow: hidden; }
    .bc-chips { display: flex; gap: .6em; flex-wrap: wrap; }
    .bc-chip { padding: .35em .8em; border-radius: 99em; border: .1em solid rgba(251,231,176,.5);
      font-size: .95em; font-weight: 600; color: #fbe7b0; }

    .bc-soon { position: absolute; inset: 0; background: rgba(5,4,16,.62); display: flex;
      align-items: center; justify-content: center; z-index: 5; }
    .bc-soon span { font-size: .9em; letter-spacing: .3em; color: rgba(255,255,255,.6);
      border: 1px solid rgba(255,255,255,.25); padding: .6em 1.4em; border-radius: 99em; }

    body.sdl-eco .bc-sheen, body.sdl-eco .bc-streak { display: none; }
    body.sdl-eco .bc-ring.outer { box-shadow: none; }
  `;
  document.head.appendChild(st);
}

function cardVars(character, width) {
  const accent = character.color || '#D4AF37';
  return {
    '--bc-accent': accent,
    '--bc-dark': `color-mix(in oklab, ${accent} 34%, #0b0a1a)`,
    width,
    height: Math.round(width * 310 / 210),
    fontSize: `${(width / 21).toFixed(2)}px`,
  };
}

export function BoosterFront({ character, idx, width, className = '' }) {
  const n = String(idx + 1).padStart(2, '0');
  return (
    <div className={`bc ${className}`} style={cardVars(character, width)}>
      <div className="bc-band top">
        <span className="bc-brand">LA SOIRÉE</span>
        <span className="bc-brand-sub">DES LÉGENDES</span>
        <span className="bc-badge">N° {n}</span>
      </div>
      <div className="bc-stripe" />
      <div className="bc-art">
        <div className="bc-streak a" />
        <div className="bc-streak b" />
        <div className="bc-ring outer" />
        <div className="bc-ring inner" />
        <div className="bc-emoji" aria-hidden="true">{character.emoji}</div>
        <div className="bc-plate">
          <span className="bc-persona">{character.title}</span>
          <span className="bc-title">{character.gameName}</span>
        </div>
      </div>
      <div className="bc-band bottom" />
      <div className="bc-sheen" />
      {!character.available && <div className="bc-soon"><span>BIENTÔT</span></div>}
    </div>
  );
}

export function BoosterBack({ character, idx, width, className = '' }) {
  const n = String(idx + 1).padStart(2, '0');
  return (
    <div className={`bc-back ${className}`} style={cardVars(character, width)}>
      <span className="bc-back-kicker">N° {n} · {character.title}</span>
      <span className="bc-back-title">{character.gameName}</span>
      <span className="bc-back-rule" />
      <p className="bc-back-desc">{character.description}</p>
      <div className="bc-chips">
        <span className="bc-chip">{character.players || '2–12'} joueurs</span>
        <span className="bc-chip">{character.time || '15 min'}</span>
      </div>
    </div>
  );
}
