// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du draft
//
// Générique : sert aussi bien le draft LoL (5 postes, vivier partitionné
// par rôle) que le draft Rocket League (3 slots, vivier partagé) — chaque
// écran passe l'objet `game` résolu via `getGame()` (voir selectGames.js).
//
// Règles :
// - Les N slots du jeu (`game.slots`) sont affichés en parallèle, chacun
//   avec un trio de 3 cartes. Le choix de départ porte donc sur N × 3
//   joueurs (15 pour LoL, 9 pour Rocket League).
// - Choisir une carte verrouille son slot : les 3 joueurs de CE trio
//   disparaissent (le choisi rejoint l'équipe, les 2 autres sont écartés).
//   Le nombre de slots ouverts diminue donc de un à chaque sélection.
// - Choisir une carte relance AUSSI automatiquement les trios de tous les
//   AUTRES slots encore ouverts (nouveaux candidats à chaque sélection).
// - 3 relances au total sur toute la partie, en plus de ces relances
//   automatiques. Une relance manuelle remplace EN UNE FOIS les trios de
//   tous les slots encore ouverts par 3 nouveaux joueurs chacun.
// - Un joueur affiché n'est jamais reproposé une fois écarté (choix,
//   relance ou remplacé). Quand le vivier est partagé entre slots (Rocket
//   League), un joueur visible dans le trio d'un slot n'apparaît jamais
//   EN MÊME TEMPS dans le trio d'un autre slot.
// - Niveau de connaissance (`familiarity` : 100/75/50/25) : restreint le
//   vivier de départ aux joueurs les plus connus, via `game.getFilteredPool`.
// ─────────────────────────────────────────────────────────────────────────

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

// Rafraîchit le trio de chaque slot listé dans `slots` : les 3 candidats
// actuellement affichés sont brûlés (jamais reproposés) et remplacés par 3
// nouveaux, tirés du reste du vivier `pool`. Si un slot n'a plus assez de
// candidats frais, son trio est simplement laissé tel quel. Les ids déjà
// affichés dans un AUTRE slot (ouvert mais pas rafraîchi cette passe) sont
// exclus des candidats, pour ne jamais montrer le même joueur à deux
// endroits en même temps — pertinent surtout pour un vivier partagé
// (Rocket League) ; sans effet pour un vivier déjà partitionné (LoL).
// Mute `trios` (copie) et `burnedSet` (Set) fournis en paramètres.
function refreshTrios(game, pool, trios, burnedSet, slots) {
  // Instantané STABLE de tout ce qui est déjà affiché, tous slots ouverts
  // confondus (qu'ils soient rafraîchis cette passe ou non) — jamais traité
  // comme candidat "frais". Pris une fois avant toute mutation : sans ça,
  // rafraîchir le slot 1 pourrait sembler libérer les cartes encore
  // affichées (mais pas encore traitées) du slot 2, et les deux finiraient
  // par piocher dans le même reliquat trop réduit → doublons entre slots.
  const currentlyShown = new Set();
  Object.values(trios).forEach(ids => (ids || []).forEach(id => currentlyShown.add(id)));

  slots.forEach(slot => {
    const currentTrio = trios[slot];
    if (!currentTrio) return;

    const freshPool = game.slotPool(pool, slot).filter(p => !burnedSet.has(p.id) && !currentlyShown.has(p.id));
    if (freshPool.length >= TRIO_SIZE) {
      currentTrio.forEach(id => burnedSet.add(id));
      const ids = shuffle(freshPool).slice(0, TRIO_SIZE).map(p => p.id);
      trios[slot] = ids;
      ids.forEach(id => currentlyShown.add(id));
    }
    // Sinon : trio laissé tel quel, rien n'est brûlé — ses ids restent déjà
    // dans `currentlyShown` depuis l'instantané initial.
  });
}

// Reconstruit le vivier de la partie (figé au lancement du draft) à partir
// des ids mémorisés dans le state.
function poolFromState(game, state) {
  const idSet = new Set(state.poolIds);
  return game.players.filter(p => idSet.has(p.id));
}

export function createDraftState(game, familiarity = 100) {
  const pool = game.getFilteredPool(familiarity);
  const team = {};
  game.slots.forEach(slot => { team[slot] = null; });

  const burnedSet = new Set();
  const trios = {};
  const shown = new Set();
  game.slots.forEach(slot => {
    const candidates = game.slotPool(pool, slot).filter(p => !burnedSet.has(p.id) && !shown.has(p.id));
    const ids = shuffle(candidates).slice(0, TRIO_SIZE).map(p => p.id);
    ids.forEach(id => shown.add(id));
    trios[slot] = ids;
  });

  return {
    team,
    trios,               // { slot: [id,id,id] } — seulement les slots encore ouverts
    burned: [...burnedSet],
    rerollsLeft: MAX_REROLLS,
    picksMade: 0,
    finished: false,
    familiarity,
    poolIds: pool.map(p => p.id),
  };
}

export function pickPlayer(game, state, playerId) {
  if (state.finished) return state;
  const player = game.playersById[playerId];
  if (!player) return state;

  // Le slot d'origine se détermine par le trio qui contient actuellement
  // ce joueur (et non par un éventuel attribut "rôle" du joueur, absent
  // pour les jeux sans poste fixe comme Rocket League).
  const slot = game.slots.find(s => state.trios[s]?.includes(playerId));
  if (!slot || state.team[slot]) return state;

  // Brûle les 3 joueurs du trio, LE CHOISI COMPRIS : sur un vivier partagé
  // entre slots (Rocket League), un joueur déjà recruté dans l'équipe ne
  // doit plus jamais réapparaître comme candidat d'un autre slot. Sans
  // effet pour un vivier partitionné par poste (LoL), où ce joueur ne
  // pouvait de toute façon plus être retiré d'un autre poste.
  const burnedSet = new Set(state.burned);
  state.trios[slot].forEach(id => burnedSet.add(id));

  const team = { ...state.team, [slot]: playerId };
  const trios = { ...state.trios };
  delete trios[slot];

  // Un choix relance automatiquement tous les autres slots encore ouverts.
  refreshTrios(game, poolFromState(game, state), trios, burnedSet, Object.keys(trios));

  const picksMade = state.picksMade + 1;
  const finished = game.slots.every(s => team[s]);

  return { ...state, team, trios, burned: [...burnedSet], picksMade, finished };
}

export function canReroll(state) {
  return !state.finished && state.rerollsLeft > 0 && Object.keys(state.trios).length > 0;
}

// Relance globale : rafraîchit le trio de CHAQUE slot encore ouvert en une
// seule relance. Si un slot n'a plus assez de candidats frais, son trio
// est simplement laissé tel quel (rien n'est brûlé pour lui) — les autres
// slots sont tout de même relancés et la relance est consommée.
export function rerollAll(game, state) {
  if (!canReroll(state)) return state;

  const burnedSet = new Set(state.burned);
  const trios = { ...state.trios };
  refreshTrios(game, poolFromState(game, state), trios, burnedSet, Object.keys(trios));

  return { ...state, trios, burned: [...burnedSet], rerollsLeft: state.rerollsLeft - 1 };
}

export function getTrioPlayers(game, state, slot) {
  return (state.trios[slot] || []).map(id => game.playersById[id]);
}

export function getShownCount(state) {
  return Object.keys(state.trios).length * TRIO_SIZE;
}

export function getTeamPlayers(game, team) {
  return game.slots.map(s => (team[s] ? game.playersById[team[s]] : null));
}
