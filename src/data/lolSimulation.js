// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du tournoi
//
// Le résultat (qui gagne, qui perd chaque duel) est intégralement déterminé
// par la force des joueurs (`power`, ajustée à leur année) et la synergie
// d'équipe (coéquipiers réels / même écurie). Le texte n'influence JAMAIS
// le résultat : parmi les formulations valides pour un duel déjà tranché,
// on en tire une au hasard pour varier le récit d'une partie à l'autre.
// ─────────────────────────────────────────────────────────────────────────

import { LOL_PLAYERS, LOL_PLAYERS_BY_ID, ROLE_ORDER, ROLE_META, relationBetween, RIVALRIES } from './lolPlayers';

const STRONG_BONUS = 4;
const MILD_BONUS   = 1.5;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Équipe rivale ────────────────────────────────────────────────────────
// Composée avec les 10 joueurs non sélectionnés (2 par poste restants),
// un par poste tiré au hasard — garantit une équipe complète et différente
// à chaque partie, même avec la même sélection du joueur.
export function generateRivalTeam(userTeam) {
  const rival = {};
  ROLE_ORDER.forEach(role => {
    const leftovers = LOL_PLAYERS.filter(p => p.role === role && p.id !== userTeam[role]);
    const chosen = pick(leftovers);
    rival[role] = chosen.id;
  });
  return rival;
}

function teamSynergy(teamIds) {
  let bonus = 0;
  const strongPairs = [];
  const mildPairs = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const rel = relationBetween(teamIds[i], teamIds[j]);
      if (rel === 'strong') { bonus += STRONG_BONUS; strongPairs.push([teamIds[i], teamIds[j]]); }
      if (rel === 'mild')   { bonus += MILD_BONUS;   mildPairs.push([teamIds[i], teamIds[j]]); }
    }
  }
  return { bonus, strongPairs, mildPairs };
}

function teamTotal(team) {
  const ids = ROLE_ORDER.map(r => team[r]);
  const powerSum = ids.reduce((s, id) => s + LOL_PLAYERS_BY_ID[id].power, 0);
  const synergy = teamSynergy(ids);
  return { total: Math.round((powerSum + synergy.bonus) * 10) / 10, powerSum, synergy };
}

// ── Gabarits de récit (variantes cosmétiques, tirées au hasard) ─────────
const STOMP_TEMPLATES = [
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${w.name} écrase littéralement ${l.name} — ${w.signature}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${l.name} n'a jamais existé face à ${w.name}, porté par ${w.signature}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${w.name} impose un rythme que ${l.name} ne peut pas suivre, plombé par ${l.weakness}.`,
];
const WIN_TEMPLATES = [
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${w.name} prend l'avantage sur ${l.name} grâce à ${w.signature}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${l.name} tient un moment, mais ${l.weakness} finit par payer face à ${w.name}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : duel disputé, ${w.name} s'en sort mieux sur la durée.`,
];
const CLOSE_TEMPLATES = [
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : ${w.name} et ${l.name} se rendent coup pour coup — lane serrée jusqu'au bout, léger avantage ${w.name}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : rien ne sépare ${w.name} et ${l.name}, si ce n'est un détail — ${w.signature}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} EN ${ROLE_META[role].label.toUpperCase()} : combat équilibré entre ${w.name} et ${l.name}, ${w.name} finit juste devant.`,
];

function laneLine(userPlayer, rivalPlayer, role, userIsWinner) {
  const w = userIsWinner ? userPlayer : rivalPlayer;
  const l = userIsWinner ? rivalPlayer : userPlayer;
  const gap = Math.abs(userPlayer.power - rivalPlayer.power);
  const bank = gap >= 8 ? STOMP_TEMPLATES : gap >= 3 ? WIN_TEMPLATES : CLOSE_TEMPLATES;
  return pick(bank)({ w, l, role });
}

function synergyLine(teamLabel, synergy) {
  const pair = synergy.strongPairs[0] || synergy.mildPairs[0];
  if (!pair) return null;
  const [a, b] = pair.map(id => LOL_PLAYERS_BY_ID[id]);
  const strong = synergy.strongPairs.length > 0;
  return strong
    ? `✨ ${a.name} et ${b.name} (${a.team} ${a.year}) retrouvent leurs automatismes de l'époque — ${teamLabel} joue avec une cohésion qui ne s'improvise pas.`
    : `🤝 ${a.name} et ${b.name} ne se sont jamais affrontés en match officiel, mais partagent la même culture d'écurie — ${teamLabel} en tire un léger avantage collectif.`;
}

function findRivalryLine(userTeam, rivalTeam) {
  for (const { pair, story } of RIVALRIES) {
    const [a, b] = pair;
    const inUser = ROLE_ORDER.map(r => userTeam[r]);
    const inRival = ROLE_ORDER.map(r => rivalTeam[r]);
    const cross = (inUser.includes(a) && inRival.includes(b)) || (inUser.includes(b) && inRival.includes(a));
    if (cross) return `⚔️ ${story}`;
  }
  return null;
}

// ── Simulation complète ──────────────────────────────────────────────────
export function simulateMatch(userTeam, rivalTeam) {
  const userStats  = teamTotal(userTeam);
  const rivalStats = teamTotal(rivalTeam);

  const lanes = ROLE_ORDER.map(role => {
    const userPlayer  = LOL_PLAYERS_BY_ID[userTeam[role]];
    const rivalPlayer = LOL_PLAYERS_BY_ID[rivalTeam[role]];
    const userIsWinner = userPlayer.power >= rivalPlayer.power;
    return {
      role,
      userPlayer, rivalPlayer, userIsWinner,
      line: laneLine(userPlayer, rivalPlayer, role, userIsWinner),
    };
  });

  const laneWinsUser  = lanes.filter(l => l.userIsWinner).length;
  const laneWinsRival = lanes.length - laneWinsUser;

  let overallWinner = userStats.total > rivalStats.total ? 'user'
                     : rivalStats.total > userStats.total ? 'rival'
                     : (laneWinsUser >= laneWinsRival ? 'user' : 'rival');

  const lines = [];
  lines.push(...lanes.map(l => l.line));

  const uSyn = synergyLine('votre équipe', userStats.synergy);
  const rSyn = synergyLine("l'équipe adverse", rivalStats.synergy);
  if (uSyn) lines.push(uSyn);
  if (rSyn) lines.push(rSyn);

  const rivalry = findRivalryLine(userTeam, rivalTeam);
  if (rivalry) lines.push(rivalry);

  // Ligne de bascule : réconcilie le score des duels avec le résultat final
  const winnerLaneCount = overallWinner === 'user' ? laneWinsUser : laneWinsRival;
  const loserLaneCount  = overallWinner === 'user' ? laneWinsRival : laneWinsUser;
  const winnerLabel = overallWinner === 'user' ? 'Votre équipe' : "L'équipe adverse";
  const loserLabel  = overallWinner === 'user' ? "L'équipe adverse" : 'Votre équipe';

  if (winnerLaneCount < loserLaneCount) {
    lines.push(`📊 Sur les duels individuels, ${loserLabel.toLowerCase()} l'emporte ${loserLaneCount}-${winnerLaneCount}. Mais au tableau final, c'est la profondeur collective et les synergies de ${winnerLabel.toLowerCase()} qui font basculer le tournoi.`);
  } else {
    lines.push(`📊 Résultat logique : ${winnerLabel} domine aussi les duels individuels, ${winnerLaneCount}-${loserLaneCount}.`);
  }

  lines.push(`🏆 ${winnerLabel} remporte le tournoi ! Indice de force final : ${userStats.total.toFixed(1)} — ${rivalStats.total.toFixed(1)}.`);

  return {
    lanes,
    lines,
    userStats,
    rivalStats,
    laneWinsUser,
    laneWinsRival,
    winner: overallWinner,
  };
}
