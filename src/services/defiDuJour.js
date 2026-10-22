// « Défi du jour » : 5 épreuves de 3 questions, les mêmes pour tout le monde le même jour (heure de Paris).
// Tirage déterministe à partir de la date ; résultat, série de jours et record gardés sur l'appareil.
import { parisDay } from './acces';
import { TOUTES_LES_CHANSONS } from '../data/blindTestSongs';
import { EMOJI_QUIZ_ITEMS } from '../data/emojiQuizData';
import { quizCategories } from '../data/quizQuestions';
import { ALL_PERSONALITIES } from '../data/personalityData';
import personalityImages from '../data/personalityImages';
import { MOT_DE_PASSE_CARDS } from '../data/motDePasseData';

export const PAR_EPREUVE = 3;

// Les 5 épreuves, dans l'ordre
export const EPREUVES = [
  { id: 'blind',   nom: 'Blind test',        consigne: 'Reconnaissez la chanson.',            duree: 20, symbole: '♪' },
  { id: 'emoji',   nom: 'Emojis',            consigne: 'Que cachent ces emojis ?',            duree: 15, symbole: '☺' },
  { id: 'quiz',    nom: 'Culture générale',  consigne: 'Choisissez la bonne réponse.',        duree: 15, symbole: '?' },
  { id: 'star',    nom: 'Célébrité floue',   consigne: 'Qui se cache derrière le flou ?',     duree: 15, symbole: '◐' },
  { id: 'mot',     nom: 'Le mot caché',      consigne: 'Ces cinq indices décrivent un mot.', duree: 15, symbole: '#' },
];

// Générateur pseudo-aléatoire déterministe
function graine(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function melanger(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// 3 fausses réponses + la bonne, mélangées ; renvoie { options, bonne }
function choix(bonne, leurres, rnd) {
  const autres = melanger([...new Set(leurres.filter((l) => l && l !== bonne))], rnd).slice(0, 3);
  const options = melanger([bonne, ...autres], rnd);
  return { options, bonne: options.indexOf(bonne) };
}

export function jourDuDefi(now = new Date()) { return parisDay(now); }

// Le défi d'un jour donné : liste de 15 questions { epreuve, ...contenu, options, bonne }
export function defiDuJour(jour = jourDuDefi()) {
  const rnd = graine(jour * 2654435761 + 97);
  const questions = [];

  // Blind test : chansons de catégories variées ; leurres pris dans la même catégorie
  const chansons = melanger(TOUTES_LES_CHANSONS, rnd).slice(0, PAR_EPREUVE);
  for (const s of chansons) {
    const cat = String(s.id).split('-')[0];
    const memes = TOUTES_LES_CHANSONS.filter((x) => String(x.id).startsWith(cat + '-')).map((x) => x.title);
    questions.push({ epreuve: 'blind', chanson: s, reponse: `${s.title} — ${s.artist}`, ...choix(s.title, memes, rnd) });
  }

  // Emojis
  for (const it of melanger(EMOJI_QUIZ_ITEMS, rnd).slice(0, PAR_EPREUVE)) {
    const memes = EMOJI_QUIZ_ITEMS.filter((x) => x.category === it.category).map((x) => x.answer);
    questions.push({ epreuve: 'emoji', emojis: Array.isArray(it.emojis) ? it.emojis : [it.emojis], reponse: it.answer, ...choix(it.answer, memes, rnd) });
  }

  // Culture générale (catégories tout public)
  const quiz = Object.entries(quizCategories).filter(([, c]) => !c.adult)
    .flatMap(([k, c]) => c.questions.map((q) => ({ ...q, cat: c.label })));
  for (const q of melanger(quiz, rnd).slice(0, PAR_EPREUVE)) {
    questions.push({ epreuve: 'quiz', question: q.q, anecdote: q.anecdote, reponse: q.choices[q.answer], options: q.choices, bonne: q.answer });
  }

  // Célébrités (seulement celles qui ont une image)
  const stars = ALL_PERSONALITIES.filter((p) => personalityImages[p.id]);
  for (const p of melanger(stars, rnd).slice(0, PAR_EPREUVE)) {
    const memes = stars.filter((x) => x.category === p.category).map((x) => x.name);
    const leurres = memes.length >= 4 ? memes : stars.map((x) => x.name);
    questions.push({ epreuve: 'star', star: p.id, reponse: p.name, ...choix(p.name, leurres, rnd) });
  }

  // Le mot caché (cartes tout public de Mot de passe)
  const cartes = MOT_DE_PASSE_CARDS.filter((c) => c.category !== 'adult');
  for (const c of melanger(cartes, rnd).slice(0, PAR_EPREUVE)) {
    const mots = cartes.map((x) => x.word);
    questions.push({ epreuve: 'mot', indices: c.forbidden, reponse: c.word, ...choix(c.word, mots, rnd) });
  }
  return questions;
}

// Points d'une réponse : 3 dans le premier tiers du temps, 2 au deuxième, 1 ensuite, 0 si faux
export function points(juste, ecoule, duree) {
  if (!juste) return 0;
  if (ecoule <= duree / 3) return 3;
  if (ecoule <= (duree * 2) / 3) return 2;
  return 1;
}
export const MAX_POINTS = EPREUVES.length * PAR_EPREUVE * 3;

// ── Résultats sur l'appareil ──
const KEY = 'sdl-defi';
function lire() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function ecrire(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }

// { jour, score, detail: [points…], serie, record, joues }
export function etatDefi(jour = jourDuDefi()) {
  const d = lire();
  const serie = d.dernierJour === jour || d.dernierJour === jour - 1 ? d.serie || 0 : 0;
  return {
    dejaJoue: d.dernierJour === jour,
    score: d.dernierJour === jour ? d.score : null,
    detail: d.dernierJour === jour ? d.detail || [] : [],
    serie,
    record: d.record || 0,
    joues: d.joues || 0,
  };
}

export function enregistrerDefi(score, detail, jour = jourDuDefi()) {
  const d = lire();
  if (d.dernierJour === jour) return etatDefi(jour);
  const serie = d.dernierJour === jour - 1 ? (d.serie || 0) + 1 : 1;
  ecrire({ dernierJour: jour, score, detail, serie, record: Math.max(d.record || 0, score), joues: (d.joues || 0) + 1 });
  return etatDefi(jour);
}

// Défi commencé mais pas terminé : il compte quand même (on ne peut pas recommencer pour faire mieux)
const KEY_EN_COURS = 'sdl-defi-en-cours';
export function noterAvancement(detail, jour = jourDuDefi()) {
  try { localStorage.setItem(KEY_EN_COURS, JSON.stringify({ jour, detail })); } catch {}
}
export function terminerAbandon(jour = jourDuDefi()) {
  let e = null;
  try { e = JSON.parse(localStorage.getItem(KEY_EN_COURS)); localStorage.removeItem(KEY_EN_COURS); } catch {}
  if (!e || e.jour !== jour || etatDefi(jour).dejaJoue) return null;
  const detail = [...e.detail, ...Array(EPREUVES.length * PAR_EPREUVE - e.detail.length).fill(0)];
  return enregistrerDefi(detail.reduce((a, b) => a + b, 0), detail, jour);
}
export function oublierAvancement() { try { localStorage.removeItem(KEY_EN_COURS); } catch {} }

// Texte à partager : une case par question (3 points, 2, 1 ou raté)
export function texteDePartage(score, detail, serie, jour = jourDuDefi()) {
  const date = new Date(jour * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const cases = { 3: '🟩', 2: '🟨', 1: '🟧', 0: '⬛' };
  const lignes = EPREUVES.map((e, i) => `${e.symbole} ${detail.slice(i * PAR_EPREUVE, (i + 1) * PAR_EPREUVE).map((p) => cases[p] ?? '⬛').join('')}`);
  return `La Soirée des Légendes · Défi du ${date}\n${lignes.join('\n')}\n${score} / ${MAX_POINTS} points${serie > 1 ? ` · série de ${serie} jours` : ''}\nhttps://soireedeslegendes.com/defi`;
}

// Temps avant le prochain défi (minuit, heure de Paris)
export function avantProchainDefi(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false });
  const [h, m] = fmt.format(now).split(':').map(Number);
  const reste = 24 * 60 - (h * 60 + m);
  return { heures: Math.floor(reste / 60), minutes: reste % 60 };
}
