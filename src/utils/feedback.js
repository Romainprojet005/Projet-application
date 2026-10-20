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
};

const VIBRATIONS = {
  tap: 8, bon: [20, 40, 30], faux: [60, 40, 60], revele: 30, passe: 15, tic: 5, fin: 200, victoire: [30, 50, 30, 50, 80],
};

export function retour(nom) {
  const p = lirePrefs();
  if (p.sons) {
    const c = audio();
    if (c && SONS[nom]) { try { SONS[nom](c); } catch {} }
  }
  if (p.vibrations && isWeb && navigator.vibrate && VIBRATIONS[nom] != null) {
    try { navigator.vibrate(VIBRATIONS[nom]); } catch {}
  }
}
