import React from 'react';
import { Platform } from 'react-native';
import { PHONE_LABELS } from '../services/acces';

// ── Carte de légende (web) ────────────────────────────────────────────
// Refonte « écran unique » : carte nuit, cadre or, emblème de la famille du jeu.
// Toutes les tailles sont en em : font-size = largeur / 21, donc la carte
// se redimensionne d'un bloc (210 px de large → 1em = 10 px).

export const FAMILIES = {
  bluff:  { label: 'Bluff',  color: '#B9A2FF', veil: 'rgba(185,162,255,.12)' },
  savoir: { label: 'Savoir', color: '#4FD8A4', veil: 'rgba(79,216,164,.12)' },
  social: { label: 'Social', color: '#7CC4FF', veil: 'rgba(124,196,255,.12)' },
  defi:   { label: 'Défis',  color: '#FF8A8A', veil: 'rgba(255,138,138,.12)' },
};

export function familyOf(character) {
  return FAMILIES[character.family] || FAMILIES.savoir;
}

// Emblèmes géométriques des familles (trait 1,5 px, couleur héritée)
export function FamilyEmblem({ family, size = '1em' }) {
  const common = {
    viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true,
    style: { display: 'block' },
  };
  if (family === 'bluff') {
    return <svg {...common}><path d="M12 3 21 12 12 21 3 12Z" /><path d="M12 3v18" /></svg>;
  }
  if (family === 'social') {
    return <svg {...common}><circle cx="9" cy="12" r="5.5" /><circle cx="15" cy="12" r="5.5" /></svg>;
  }
  if (family === 'defi') {
    return <svg {...common}><path d="M12 2c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>;
}

// Pictogramme téléphone : un seul, ou deux superposés pour le multi-téléphones
export function PhoneIcon({ mode = 'one', size = '1em' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' };
  const svg = { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true, style: { display: 'block', flex: 'none' } };
  if (mode === 'one') {
    return <svg {...svg}><rect x="7" y="3" width="10" height="18" rx="2" {...p} /><path d="M11 18h2" {...p} /></svg>;
  }
  return (
    <svg {...svg}>
      <rect x="3" y="5" width="9" height="15" rx="2" {...p} />
      <rect x="12" y="3" width="9" height="15" rx="2" {...p} />
      <path d="M6.5 17h2M15.5 15h2" {...p} />
    </svg>
  );
}

export function LockIcon({ size = '1em' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-legend-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-legend-css';
  st.textContent = `
    .bc {
      position: relative; box-sizing: border-box; border-radius: 1.8em; overflow: hidden;
      display: flex; flex-direction: column; align-items: center;
      padding: 1.6em 1.6em 1.4em;
      background: #1A1730; border: 1px solid #2E2A4A;
      box-shadow: 0 1.8em 4em -1.2em rgba(0,0,0,.85);
      font-family: 'Outfit', system-ui, sans-serif; color: #F3EEE2;
      -webkit-tap-highlight-color: transparent;
    }
    .bc::before {
      content: ''; position: absolute; inset: .8em; border-radius: 1.2em; pointer-events: none;
      border: 1px solid #D4AF37; opacity: .35; transition: opacity .3s ease;
    }
    .sdl-slot.is-front .bc { box-shadow: 0 0 0 1px rgba(212,175,55,.5), 0 1.4em 4em -.8em rgba(212,175,55,.4); }
    .sdl-slot.is-front .bc::before { opacity: .9; }
    .bc-top { align-self: stretch; display: flex; justify-content: space-between; align-items: center; position: relative; }
    .bc-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; font-size: 1.15em;
      letter-spacing: .18em; color: #E6C766; }
    .bc-fam { display: inline-flex; align-items: center; gap: .45em; padding: .25em .7em .25em .55em;
      border-radius: .6em; font-weight: 500; font-size: 1.1em; line-height: 1.4; }
    .bc-medal { width: 9.4em; height: 9.4em; border-radius: 50%; display: grid; place-items: center;
      margin: auto 0 1em; position: relative; }
    .bc-medal svg { width: 4.6em; height: 4.6em; }
    .bc-medal.has-art { width: 12em; height: 12em; margin-bottom: .8em; padding: 0; overflow: hidden;
      border: .12em solid currentColor; box-shadow: 0 0 0 .35em rgba(212,175,55,.12), 0 .6em 2em -.6em rgba(0,0,0,.8); }
    .bc-art { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 50%;
      -webkit-user-drag: none; user-select: none; pointer-events: none; }
    .bc-who { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; font-size: .95em;
      letter-spacing: .2em; text-transform: uppercase; color: #A9A3BF; text-align: center; position: relative; }
    .bc-title { font-family: 'Bodoni Moda', Didot, Georgia, serif; font-weight: 700; font-size: 2.05em; line-height: 1.08;
      letter-spacing: .04em; text-transform: uppercase; text-align: center; margin: .25em 0 .5em; position: relative; }
    .bc-meta { font-size: 1.25em; color: #A9A3BF; position: relative; }
    .bc-phones { display: inline-flex; align-items: center; gap: .4em; margin-top: .5em; position: relative;
      font-size: 1.05em; font-weight: 500; color: #F3EEE2; padding: .3em .8em; border-radius: 99em;
      border: 1px solid #2E2A4A; }
    .bc-phones svg { width: 1.35em; height: 1.35em; color: #E6C766; }
    .bc-num-wrap { display: inline-flex; align-items: center; gap: .5em; }
    .bc-lock { display: inline-grid; place-items: center; width: 2.2em; height: 2.2em; border-radius: 50%;
      background: #08070F; border: 1px solid #6B6590; color: #E6C766; }
    .bc-lock svg { width: 1.2em; height: 1.2em; }
    .bc.is-locked .bc-medal, .bc.is-locked .bc-title, .bc.is-locked .bc-who { opacity: .55; }

    .bc-back { position: absolute; inset: 0; box-sizing: border-box; border-radius: 1.8em;
      padding: 2em 1.9em; display: flex; flex-direction: column; gap: .9em; text-align: left;
      background: #1A1730; border: 1px solid #D4AF37;
      font-family: 'Outfit', system-ui, sans-serif; color: #F3EEE2;
      box-shadow: 0 1.8em 4em -1.2em rgba(0,0,0,.85); }
    .bc-back-kicker { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: .95em; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase; color: #E6C766; }
    .bc-back-title { font-family: 'Bodoni Moda', Didot, Georgia, serif; font-weight: 700; font-size: 2em; line-height: 1.05;
      text-transform: uppercase; color: #F3EEE2; overflow-wrap: anywhere; }
    .bc-back-rule { height: .15em; width: 3em; background: #D4AF37; }
    .bc-back-desc { margin: 0; font-size: 1.3em; line-height: 1.45; color: #A9A3BF; flex: 1; overflow: hidden; }
    .bc-chips { display: flex; gap: .6em; flex-wrap: wrap; }
    .bc-chip { padding: .4em .9em; border-radius: .6em; border: 1px solid #2E2A4A;
      font-size: 1.1em; font-weight: 500; color: #F3EEE2; }

    .bc-soon { position: absolute; inset: 0; background: rgba(8,7,15,.7); display: flex;
      align-items: center; justify-content: center; z-index: 5; }
    .bc-soon span { font-size: 1em; letter-spacing: .3em; color: #F3EEE2;
      border: 1px solid #6B6590; padding: .6em 1.4em; border-radius: 99em; background: #08070F; }
  `;
  document.head.appendChild(st);
}

function cardVars(width) {
  return {
    width,
    height: Math.round(width * 310 / 210),
    fontSize: `${(width / 21).toFixed(2)}px`,
  };
}

// Réduit le nom du jeu quand un mot est long, pour ne jamais le couper en deux
function titleSize(name = '') {
  const longest = Math.max(...name.split(/\s+/).map(w => w.length));
  return longest > 10 ? { fontSize: `${Math.max(1.4, 2.05 * 10 / longest).toFixed(2)}em` } : undefined;
}

export function BoosterFront({ character, idx, width, className = '', locked = false }) {
  const n = String(idx + 1).padStart(2, '0');
  const fam = familyOf(character);
  const mode = character.phones || 'one';
  return (
    <div className={`bc ${className}${locked ? ' is-locked' : ''}`} style={cardVars(width)}>
      <div className="bc-top">
        <span className="bc-num-wrap">
          <span className="bc-num">N° {n}</span>
          {locked && <span className="bc-lock" aria-label="Verrouillé"><LockIcon /></span>}
        </span>
        <span className="bc-fam" style={{ color: fam.color, background: fam.veil }}>
          <FamilyEmblem family={character.family} size="1.1em" />{fam.label}
        </span>
      </div>
      <div className="bc-medal has-art" style={{ color: fam.color, background: '#0E0C1A' }}>
        <img className="bc-art" src={`/legendes/${character.game}.webp`} alt="" decoding="async" draggable={false} />
      </div>
      <span className="bc-who">{character.title}</span>
      <span className="bc-title" style={titleSize(character.gameName)}>{character.gameName}</span>
      <span className="bc-meta">{character.players || '2–12'} joueurs · {character.time || '15 min'}</span>
      <span className="bc-phones"><PhoneIcon mode={mode} />{mode === 'both' ? '1 ou + téléphones' : PHONE_LABELS[mode]}</span>
      {!character.available && <div className="bc-soon"><span>BIENTÔT</span></div>}
    </div>
  );
}

export function BoosterBack({ character, idx, width, className = '' }) {
  const n = String(idx + 1).padStart(2, '0');
  return (
    <div className={`bc-back ${className}`} style={cardVars(width)}>
      <span className="bc-back-kicker">N° {n} · {character.title}</span>
      <span className="bc-back-title" style={titleSize(character.gameName)}>{character.gameName}</span>
      <span className="bc-back-rule" />
      <p className="bc-back-desc">{character.description}</p>
      <div className="bc-chips">
        <span className="bc-chip">{character.players || '2–12'} joueurs</span>
        <span className="bc-chip">{character.time || '15 min'}</span>
      </div>
    </div>
  );
}
