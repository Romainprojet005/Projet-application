// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — registre des jeux disponibles
//
// Un seul moteur de draft/tournoi (lolDraftEngine.js + lolSimulation.js)
// sert les deux jeux : chaque écran résout d'abord son `game` via getGame()
// puis passe cet objet aux fonctions du moteur, qui n'importent plus rien
// en dur depuis lolPlayers.js. Ajouter un futur 3e jeu ne demande donc que
// data + une entrée ici, sans toucher au moteur ni aux écrans.
// ─────────────────────────────────────────────────────────────────────────

import {
  LOL_PLAYERS, LOL_PLAYERS_BY_ID, ROLE_ORDER, ROLE_META,
  getFilteredPool, relationBetween, RIVALRIES,
} from './lolPlayers';
import {
  ROCKET_PLAYERS, ROCKET_PLAYERS_BY_ID, ROCKET_SLOT_ORDER, ROCKET_SLOT_META,
  getFilteredPoolRocket, relationBetweenRocket, ROCKET_RIVALRIES,
} from './rocketPlayers';

export const SELECT_GAMES = {
  lol: {
    id: 'lol',
    label: 'League of Legends',
    shortLabel: 'LoL',
    emoji: '🎮',
    squadSize: ROLE_ORDER.length,
    squadLabel: `${ROLE_ORDER.length} rôles`,
    slots: ROLE_ORDER,
    slotMeta: ROLE_META,
    // LoL partitionne le vivier par poste : un slot ne montre que les
    // joueurs dont le `role` correspond exactement à ce slot.
    slotPool: (pool, slot) => pool.filter(p => p.role === slot),
    players: LOL_PLAYERS,
    playersById: LOL_PLAYERS_BY_ID,
    getFilteredPool,
    relationBetween,
    RIVALRIES,
    accent: '#C89B3C',
    accentLight: '#F0D68C',
    accentDark: '#8B6914',
    scoreEmoji: '⚔️',
    flavor: {
      minDurationSec: 19 * 60, maxDurationSec: 47 * 60,
      baseMinutes: 34, marginMinutes: 12, jitterMinutes: 3,
      loserBase: 8, loserVar: 6, winnerBaseBonus: 4, winnerMarginMult: 18, winnerVar: 4,
    },
  },
  rocketleague: {
    id: 'rocketleague',
    label: 'Rocket League',
    shortLabel: 'RL',
    emoji: '🚀',
    squadSize: ROCKET_SLOT_ORDER.length,
    squadLabel: `${ROCKET_SLOT_ORDER.length} joueurs`,
    slots: ROCKET_SLOT_ORDER,
    slotMeta: ROCKET_SLOT_META,
    // Pas de poste fixe en Rocket League : les 3 slots partagent le même
    // vivier, n'importe quel joueur peut occuper n'importe quel slot.
    slotPool: (pool) => pool,
    players: ROCKET_PLAYERS,
    playersById: ROCKET_PLAYERS_BY_ID,
    getFilteredPool: getFilteredPoolRocket,
    relationBetween: relationBetweenRocket,
    RIVALRIES: ROCKET_RIVALRIES,
    accent: '#FF6A1A',
    accentLight: '#FFB27A',
    accentDark: '#B84C0F',
    scoreEmoji: '🥅',
    flavor: {
      minDurationSec: 5 * 60, maxDurationSec: 12 * 60,
      baseMinutes: 8, marginMinutes: 2.5, jitterMinutes: 1.5,
      loserBase: 1, loserVar: 2, winnerBaseBonus: 1, winnerMarginMult: 3, winnerVar: 1,
    },
  },
};

export const DEFAULT_GAME_ID = 'lol';

export function getGame(gameId) {
  return SELECT_GAMES[gameId] || SELECT_GAMES[DEFAULT_GAME_ID];
}

export const GAME_LIST = Object.values(SELECT_GAMES);
