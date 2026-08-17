// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du tournoi
//
// Le résultat (qui gagne, qui perd chaque duel) est intégralement déterminé
// par la force des joueurs (`power`, ajustée à leur année) et la synergie
// d'équipe (coéquipiers réels / même écurie). Le texte n'influence JAMAIS
// le résultat : parmi les formulations valides pour un duel déjà tranché,
// on en tire une au hasard pour varier le récit d'une partie à l'autre.
//
// Générique équipe A / équipe B : utilisé aussi bien en solo (A = vous,
// B = IA générée) qu'en multijoueur à distance (A / B = les deux joueurs).
// ─────────────────────────────────────────────────────────────────────────

import { LOL_PLAYERS, LOL_PLAYERS_BY_ID, ROLE_ORDER, ROLE_META, relationBetween, RIVALRIES } from './lolPlayers';

const STRONG_BONUS = 4;
const MILD_BONUS   = 1.5;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Équipe rivale (mode solo) ────────────────────────────────────────────
// Composée avec les joueurs non sélectionnés, un par poste tiré au hasard —
// garantit une équipe complète et différente à chaque partie.
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
// Cas particulier : la même légende s'affronte elle-même à deux époques différentes
const MIRROR_TEMPLATES = [
  ({ w, l, role }) => `${ROLE_META[role].emoji} DUEL D'ÉPOQUES EN ${ROLE_META[role].label.toUpperCase()} : ${w.name} ${w.year} affronte ${l.name} ${l.year} — la même légende, deux générations. C'est la version ${w.year} qui l'emporte, portée par ${w.signature}.`,
  ({ w, l, role }) => `${ROLE_META[role].emoji} DUEL D'ÉPOQUES EN ${ROLE_META[role].label.toUpperCase()} : face à son propre miroir de ${l.year}, ${w.name} version ${w.year} prouve qu'il n'a pas volé sa réputation — ${w.signature}.`,
];

function laneLine(playerA, playerB, role, aIsWinner) {
  const w = aIsWinner ? playerA : playerB;
  const l = aIsWinner ? playerB : playerA;
  if (playerA.personId && playerA.personId === playerB.personId) {
    return pick(MIRROR_TEMPLATES)({ w, l, role });
  }
  const gap = Math.abs(playerA.power - playerB.power);
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

function findRivalryLine(teamA, teamB) {
  for (const { pair, story } of RIVALRIES) {
    const [a, b] = pair;
    const inA = ROLE_ORDER.map(r => teamA[r]);
    const inB = ROLE_ORDER.map(r => teamB[r]);
    const cross = (inA.includes(a) && inB.includes(b)) || (inA.includes(b) && inB.includes(a));
    if (cross) return `⚔️ ${story}`;
  }
  return null;
}

// ── Simulation complète ──────────────────────────────────────────────────
// teamA / teamB : { TOP: playerId, JGL: playerId, ... }
// labelA / labelB : noms affichés dans le récit (ex. "Votre équipe" / "L'équipe adverse",
// ou en multijoueur les prénoms des deux joueurs).
export function simulateMatch(teamA, teamB, labelA = 'Votre équipe', labelB = "L'équipe adverse") {
  const statsA = teamTotal(teamA);
  const statsB = teamTotal(teamB);

  const lanes = ROLE_ORDER.map(role => {
    const playerA = LOL_PLAYERS_BY_ID[teamA[role]];
    const playerB = LOL_PLAYERS_BY_ID[teamB[role]];
    const aIsWinner = playerA.power >= playerB.power;
    return {
      role,
      playerA, playerB, aIsWinner,
      line: laneLine(playerA, playerB, role, aIsWinner),
    };
  });

  const laneWinsA = lanes.filter(l => l.aIsWinner).length;
  const laneWinsB = lanes.length - laneWinsA;

  let overallWinner = statsA.total > statsB.total ? 'A'
                     : statsB.total > statsA.total ? 'B'
                     : (laneWinsA >= laneWinsB ? 'A' : 'B');

  const lines = [];
  lines.push(...lanes.map(l => l.line));

  const synA = synergyLine(labelA, statsA.synergy);
  const synB = synergyLine(labelB, statsB.synergy);
  if (synA) lines.push(synA);
  if (synB) lines.push(synB);

  const rivalry = findRivalryLine(teamA, teamB);
  if (rivalry) lines.push(rivalry);

  // Ligne de bascule : réconcilie le score des duels avec le résultat final
  const winnerLaneCount = overallWinner === 'A' ? laneWinsA : laneWinsB;
  const loserLaneCount  = overallWinner === 'A' ? laneWinsB : laneWinsA;
  const winnerLabel = overallWinner === 'A' ? labelA : labelB;
  const loserLabel  = overallWinner === 'A' ? labelB : labelA;

  if (winnerLaneCount < loserLaneCount) {
    lines.push(`📊 Sur les duels individuels, ${loserLabel} l'emporte ${loserLaneCount}-${winnerLaneCount}. Mais au tableau final, c'est la profondeur collective et les synergies de ${winnerLabel} qui font basculer le tournoi.`);
  } else {
    lines.push(`📊 Résultat logique : ${winnerLabel} domine aussi les duels individuels, ${winnerLaneCount}-${loserLaneCount}.`);
  }

  lines.push(`🏆 ${winnerLabel} remporte le tournoi ! Indice de force final : ${statsA.total.toFixed(1)} — ${statsB.total.toFixed(1)}.`);

  return {
    lanes,
    lines,
    statsA,
    statsB,
    laneWinsA,
    laneWinsB,
    winner: overallWinner,
  };
}
