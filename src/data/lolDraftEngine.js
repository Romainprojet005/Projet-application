// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du draft
//
// Règles :
// - 15 joueurs au total (3 par poste). Le sélectionneur doit composer une
//   équipe de 5 (un par poste : TOP/JGL/MID/ADC/SUP).
// - À chaque instant, une fenêtre de cartes est proposée. Choisir une carte
//   OU relancer consomme TOUTE la fenêtre affichée : ces joueurs ne seront
//   plus jamais proposés (un même joueur n'est donc jamais présenté deux
//   fois).
// - Chaque sélection réduit la taille de la fenêtre suivante de 3.
// - 3 relances au total sur toute la partie.
// - Garde-fou : un joueur ne peut jamais être « brûlé » s'il est le dernier
//   candidat restant pour son poste — la partie reste toujours finissable.
// ─────────────────────────────────────────────────────────────────────────

import { LOL_PLAYERS, LOL_PLAYERS_BY_ID, ROLE_ORDER } from './lolPlayers';

export const INITIAL_WINDOW_SIZE = 9;
export const WINDOW_SHRINK       = 3;
export const MIN_WINDOW_SIZE     = 3;
export const MAX_REROLLS         = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function neededRoles(team) {
  return ROLE_ORDER.filter(r => !team[r]);
}

function windowSizeFor(picksMade) {
  return Math.max(MIN_WINDOW_SIZE, INITIAL_WINDOW_SIZE - WINDOW_SHRINK * picksMade);
}

// Construit une fenêtre de candidats : au moins un par poste manquant
// (si disponible), puis complète aléatoirement jusqu'à la taille voulue.
function generateWindow({ team, pickedIds, burnedIds, size }) {
  const roles = neededRoles(team);
  const excluded = new Set([...pickedIds, ...burnedIds]);
  const available = LOL_PLAYERS.filter(p => roles.includes(p.role) && !excluded.has(p.id));

  const guaranteed = [];
  roles.forEach(role => {
    const candidates = shuffle(available.filter(p => p.role === role && !guaranteed.some(g => g.id === p.id)));
    if (candidates.length) guaranteed.push(candidates[0]);
  });

  const rest = shuffle(available.filter(p => !guaranteed.some(g => g.id === p.id)));
  const combined = [...guaranteed, ...rest].slice(0, Math.min(size, available.length));
  return shuffle(combined).map(p => p.id);
}

export function createDraftState() {
  const team = { TOP: null, JGL: null, MID: null, ADC: null, SUP: null };
  const state = {
    team,
    pickedIds: [],
    burnedIds: [],
    rerollsLeft: MAX_REROLLS,
    picksMade: 0,
    windowSize: windowSizeFor(0),
    shownIds: [],
    finished: false,
  };
  state.shownIds = generateWindow({ team, pickedIds: [], burnedIds: [], size: state.windowSize });
  return state;
}

// Brûle les joueurs de la fenêtre affichée (hors éventuel joueur choisi),
// sauf s'ils sont le DERNIER candidat restant pour leur poste.
function burnWindow(state, keepId) {
  const pickedSet = new Set(state.pickedIds);
  const burnedSet = new Set(state.burnedIds);
  const toBurn = state.shownIds.filter(id => id !== keepId);

  toBurn.forEach(id => {
    const player = LOL_PLAYERS_BY_ID[id];
    const remainingForRole = LOL_PLAYERS.filter(p =>
      p.role === player.role && p.id !== id && !pickedSet.has(p.id) && !burnedSet.has(p.id)
    ).length;
    if (remainingForRole >= 1) burnedSet.add(id); // sûr de brûler, il reste au moins un autre candidat
    // sinon : dernier du poste → protégé, il pourra réapparaître plus tard
  });

  return [...burnedSet];
}

export function pickPlayer(state, playerId) {
  if (state.finished) return state;
  const player = LOL_PLAYERS_BY_ID[playerId];
  if (!player || !state.shownIds.includes(playerId) || state.team[player.role]) return state;

  const burnedIds = burnWindow(state, playerId);
  const team = { ...state.team, [player.role]: playerId };
  const pickedIds = [...state.pickedIds, playerId];
  const picksMade = state.picksMade + 1;
  const finished = ROLE_ORDER.every(r => team[r]);
  const windowSize = windowSizeFor(picksMade);

  return {
    ...state,
    team,
    pickedIds,
    burnedIds,
    picksMade,
    windowSize,
    finished,
    shownIds: finished ? [] : generateWindow({ team, pickedIds, burnedIds, size: windowSize }),
  };
}

export function rerollWindow(state) {
  if (state.finished || state.rerollsLeft <= 0) return state;
  const burnedIds = burnWindow(state, null);
  const rerollsLeft = state.rerollsLeft - 1;
  return {
    ...state,
    burnedIds,
    rerollsLeft,
    shownIds: generateWindow({ team: state.team, pickedIds: state.pickedIds, burnedIds, size: state.windowSize }),
  };
}

export function getShownPlayers(state) {
  return state.shownIds.map(id => LOL_PLAYERS_BY_ID[id]);
}

export function getTeamPlayers(team) {
  return ROLE_ORDER.map(r => (team[r] ? LOL_PLAYERS_BY_ID[team[r]] : null));
}
