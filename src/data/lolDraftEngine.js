// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du draft
//
// Règles :
// - Les 5 postes sont affichés en parallèle, chacun avec un trio de 3
//   cartes. Le choix de départ porte donc sur 5 × 3 = 15 joueurs.
// - Choisir une carte verrouille son poste : les 3 joueurs de CE trio
//   disparaissent (le choisi rejoint l'équipe, les 2 autres sont écartés)
//   — les trios des autres postes ne bougent pas. La vitrine passe ainsi
//   de 15 à 12, puis 9, 6 et enfin 3 joueurs, à chaque sélection.
// - 3 relances au total sur toute la partie, à dépenser poste par poste :
//   relancer un trio le remplace par 3 nouveaux joueurs (les 3 précédents
//   ne sont plus jamais proposés), sans toucher aux autres trios affichés.
// - Un joueur affiché n'est jamais reproposé une fois écarté (choix,
//   relance ou remplacé).
// ─────────────────────────────────────────────────────────────────────────

import { LOL_PLAYERS, LOL_PLAYERS_BY_ID, ROLE_ORDER } from './lolPlayers';

export const TRIO_SIZE    = 3;
export const MAX_REROLLS  = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawTrio(role, burnedSet) {
  const pool = LOL_PLAYERS.filter(p => p.role === role && !burnedSet.has(p.id));
  return shuffle(pool).slice(0, TRIO_SIZE).map(p => p.id);
}

export function createDraftState() {
  const team = { TOP: null, JGL: null, MID: null, ADC: null, SUP: null };
  const burnedSet = new Set();
  const trios = {};
  ROLE_ORDER.forEach(role => { trios[role] = drawTrio(role, burnedSet); });

  return {
    team,
    trios,               // { ROLE: [id,id,id] } — seulement les postes encore ouverts
    burned: [...burnedSet],
    rerollsLeft: MAX_REROLLS,
    picksMade: 0,
    finished: false,
  };
}

export function pickPlayer(state, playerId) {
  if (state.finished) return state;
  const player = LOL_PLAYERS_BY_ID[playerId];
  if (!player) return state;
  const role = player.role;
  if (state.team[role] || !state.trios[role]?.includes(playerId)) return state;

  const burnedSet = new Set(state.burned);
  state.trios[role].forEach(id => { if (id !== playerId) burnedSet.add(id); });

  const team = { ...state.team, [role]: playerId };
  const trios = { ...state.trios };
  delete trios[role];

  const picksMade = state.picksMade + 1;
  const finished = ROLE_ORDER.every(r => team[r]);

  return { ...state, team, trios, burned: [...burnedSet], picksMade, finished };
}

export function canRerollRole(state, role) {
  if (state.finished || state.rerollsLeft <= 0) return false;
  if (state.team[role] || !state.trios[role]) return false;
  const burnedSet = new Set(state.burned);
  state.trios[role].forEach(id => burnedSet.add(id));
  const freshPool = LOL_PLAYERS.filter(p => p.role === role && !burnedSet.has(p.id));
  return freshPool.length >= TRIO_SIZE;
}

export function rerollRole(state, role) {
  if (!canRerollRole(state, role)) return state;

  const burnedSet = new Set(state.burned);
  state.trios[role].forEach(id => burnedSet.add(id));

  const freshPool = LOL_PLAYERS.filter(p => p.role === role && !burnedSet.has(p.id));
  const newTrio = shuffle(freshPool).slice(0, TRIO_SIZE).map(p => p.id);
  const trios = { ...state.trios, [role]: newTrio };

  return { ...state, trios, burned: [...burnedSet], rerollsLeft: state.rerollsLeft - 1 };
}

export function getTrioPlayers(state, role) {
  return (state.trios[role] || []).map(id => LOL_PLAYERS_BY_ID[id]);
}

export function getShownCount(state) {
  return Object.keys(state.trios).length * TRIO_SIZE;
}

export function getTeamPlayers(team) {
  return ROLE_ORDER.map(r => (team[r] ? LOL_PLAYERS_BY_ID[team[r]] : null));
}
