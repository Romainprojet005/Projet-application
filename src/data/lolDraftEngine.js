// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du draft
//
// Règles :
// - Les 5 postes sont affichés en parallèle, chacun avec un trio de 3
//   cartes. Le choix de départ porte donc sur 5 × 3 = 15 joueurs.
// - Choisir une carte verrouille son poste : les 3 joueurs de CE trio
//   disparaissent (le choisi rejoint l'équipe, les 2 autres sont écartés).
//   Le nombre de postes ouverts diminue donc de un, et la vitrine passe
//   ainsi de 15 à 12, puis 9, 6 et enfin 3 joueurs à chaque sélection.
// - Choisir une carte relance AUSSI automatiquement les trios de tous les
//   AUTRES postes encore ouverts (nouveaux candidats à chaque sélection).
// - 3 relances au total sur toute la partie, en plus de ces relances
//   automatiques. Une relance manuelle remplace EN UNE FOIS les trios de
//   tous les postes encore ouverts par 3 nouveaux joueurs chacun.
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

// Rafraîchit le trio de chaque poste listé dans `roles` : les 3 candidats
// actuellement affichés sont brûlés (jamais reproposés) et remplacés par 3
// nouveaux, tirés du reste du vivier. Si un poste n'a plus assez de
// candidats frais, son trio est simplement laissé tel quel. Mute `trios`
// (copie) et `burnedSet` (Set) fournis en paramètres.
function refreshTrios(trios, burnedSet, roles) {
  roles.forEach(role => {
    const currentTrio = trios[role];
    if (!currentTrio) return;
    const tentativeBurned = new Set(burnedSet);
    currentTrio.forEach(id => tentativeBurned.add(id));

    const freshPool = LOL_PLAYERS.filter(p => p.role === role && !tentativeBurned.has(p.id));
    if (freshPool.length >= TRIO_SIZE) {
      currentTrio.forEach(id => burnedSet.add(id));
      trios[role] = shuffle(freshPool).slice(0, TRIO_SIZE).map(p => p.id);
    }
  });
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

  // Un choix relance automatiquement tous les autres postes encore ouverts.
  refreshTrios(trios, burnedSet, Object.keys(trios));

  const picksMade = state.picksMade + 1;
  const finished = ROLE_ORDER.every(r => team[r]);

  return { ...state, team, trios, burned: [...burnedSet], picksMade, finished };
}

export function canReroll(state) {
  return !state.finished && state.rerollsLeft > 0 && Object.keys(state.trios).length > 0;
}

// Relance globale : rafraîchit le trio de CHAQUE poste encore ouvert en une
// seule relance. Si un poste n'a plus assez de candidats frais, son trio
// est simplement laissé tel quel (rien n'est brûlé pour lui) — les autres
// postes sont tout de même relancés et la relance est consommée.
export function rerollAll(state) {
  if (!canReroll(state)) return state;

  const burnedSet = new Set(state.burned);
  const trios = { ...state.trios };
  refreshTrios(trios, burnedSet, Object.keys(trios));

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
