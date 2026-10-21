// Sons et vibrations légers, désactivables dans les réglages.
// Les sons sont synthétisés à la volée (Web Audio) : aucun fichier à télécharger.
import { Platform } from 'react-native';
import { lirePrefs } from '../services/preferences';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
let ctx = null;
function audio() {
  if (!isWeb) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) { try { ctx = new AC(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// Une note : fréquence, début, durée, type d'onde, volume
function note(c, f, t0, d, type = 'sine', vol = 0.12) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, c.currentTime + t0);
  g.gain.setValueAtTime(0.0001, c.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + t0);
  o.stop(c.currentTime + t0 + d + 0.02);
}

const SONS = {
  tap:     (c) => note(c, 660, 0, 0.06, 'triangle', 0.05),
  bon:     (c) => { note(c, 660, 0, 0.12, 'triangle'); note(c, 990, 0.09, 0.2, 'triangle'); },
  faux:    (c) => { note(c, 220, 0, 0.16, 'sawtooth', 0.06); note(c, 165, 0.12, 0.24, 'sawtooth', 0.06); },
  revele:  (c) => { [523, 659, 784].forEach((f, i) => note(c, f, i * 0.07, 0.22, 'sine', 0.09)); },
  passe:   (c) => note(c, 392, 0, 0.18, 'sine', 0.07),
  tic:     (c) => note(c, 1200, 0, 0.04, 'square', 0.03),
  fin:     (c) => { note(c, 220, 0, 0.5, 'sawtooth', 0.05); },
  victoire:(c) => { [523, 659, 784, 1047].forEach((f, i) => note(c, f, i * 0.11, i === 3 ? 0.6 : 0.18, 'triangle', 0.1)); },
  // Carrousel : petit cran de roue à chaque carte qui passe
  defile:  (c) => note(c, 1500, 0, 0.025, 'triangle', 0.035),
  // Carte retournée : souffle court qui monte
  carte:   (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(300, c.currentTime); o.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.16); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.18); },
  jouer:   (c) => { note(c, 392, 0, 0.1, 'triangle', 0.08); note(c, 523, 0.07, 0.1, 'triangle', 0.08); note(c, 784, 0.14, 0.25, 'triangle', 0.09); },
  ouvrir:  (c) => note(c, 880, 0, 0.08, 'sine', 0.05),
  // Roue des défis / tirage au sort
  roue:    (c) => note(c, 900 + Math.random() * 300, 0, 0.03, 'square', 0.025),
  tire:    (c) => { note(c, 784, 0, 0.12, 'triangle', 0.09); note(c, 1175, 0.1, 0.3, 'triangle', 0.09); },
  // Verre maudit
  remplir: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(260, c.currentTime); o.frequency.exponentialRampToValueAtTime(620, c.currentTime + 0.35);
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.07, c.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.42); },
  boire:   (c) => { [0, 0.12, 0.24].forEach((t) => note(c, 180, t, 0.09, 'sine', 0.1)); },
  // Révélation dramatique (espion, verdict, tricheurs)
  drame:   (c) => { note(c, 147, 0, 0.5, 'sawtooth', 0.045); note(c, 220, 0.25, 0.5, 'sawtooth', 0.045); note(c, 294, 0.5, 0.7, 'triangle', 0.08); },
  vote:    (c) => note(c, 740, 0, 0.07, 'triangle', 0.06),
};

const VIBRATIONS = {
  tap: 8, bon: [20, 40, 30], faux: [60, 40, 60], revele: 30, passe: 15, tic: 5, fin: 200, victoire: [30, 50, 30, 50, 80],
  defile: 4, carte: 12, jouer: [15, 30, 25], ouvrir: 8, roue: 3, tire: [25, 40, 60], remplir: [10, 30, 10, 30, 10],
  boire: [40, 60, 40, 60, 40], drame: [80, 60, 120], vote: 10,
};

const dernier = {};
export function retour(nom) {
  const t = Date.now();
  if (t - (dernier[nom] || 0) < 35) return;
  dernier[nom] = t;
  const p = lirePrefs();
  if (p.sons) {
    const c = audio();
    if (c && SONS[nom]) { try { SONS[nom](c); } catch {} }
  }
  if (p.vibrations && isWeb && navigator.vibrate && VIBRATIONS[nom] != null) {
    try { navigator.vibrate(VIBRATIONS[nom]); } catch {}
  }
}
