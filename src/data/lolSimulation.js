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

function teamTotal(team, bonus = 0) {
  const ids = ROLE_ORDER.map(r => team[r]);
  const powerSum = ids.reduce((s, id) => s + LOL_PLAYERS_BY_ID[id].power, 0);
  const synergy = teamSynergy(ids);
  return { total: Math.round((powerSum + synergy.bonus + bonus) * 10) / 10, powerSum, synergy, adjustBonus: bonus };
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

// ── Score imaginé et durée de manche (habillage narratif) ────────────────
// N'influence jamais le vainqueur (déjà tranché avant d'être appelé) :
// un plus grand écart de force donne un score plus large et une manche
// plus courte (l'équipe dominante conclut vite) ; une manche serrée dure
// plus longtemps et le score de kills reste proche, comme une vraie partie.
function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function generateGameFlavor(gap) {
  const margin = Math.max(0, Math.min(40, gap)) / 40; // 0 (serré) → 1 (écrasant)

  const durationMinutes = 34 - margin * 12 + (Math.random() * 6 - 3);
  const durationSeconds = Math.max(19 * 60, Math.min(47 * 60,
    Math.round(durationMinutes * 60 + Math.random() * 59)));

  const loserKills = Math.round(8 + Math.random() * 6);
  const winnerKills = loserKills + Math.round(4 + margin * 18 + Math.random() * 4);

  return { duration: formatDuration(durationSeconds), winnerKills, loserKills };
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

// ── Simulation d'une manche ───────────────────────────────────────────────
// teamA / teamB : { TOP: playerId, JGL: playerId, ... }
// labelA / labelB : noms affichés dans le récit (ex. "Votre équipe" / "L'équipe adverse",
// ou en multijoueur les prénoms des deux joueurs).
// bonusA / bonusB : ajustement stratégique optionnel (utilisé en BO3 par l'équipe
// battue à la manche précédente) — reste 100% déterministe, aucun tirage aléatoire.
export function simulateMatch(teamA, teamB, labelA = 'Votre équipe', labelB = "L'équipe adverse", bonusA = 0, bonusB = 0) {
  const statsA = teamTotal(teamA, bonusA);
  const statsB = teamTotal(teamB, bonusB);

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

  if (bonusA > 0) lines.push(`🔁 Battue la manche précédente, ${labelA} a ajusté sa préparation — draft retravaillé, plan de jeu affûté.`);
  if (bonusB > 0) lines.push(`🔁 Battue la manche précédente, ${labelB} a ajusté sa préparation — draft retravaillé, plan de jeu affûté.`);

  // Index où commencent les 5 lignes de duels (une par poste, dans l'ordre
  // TOP/JGL/MID/ADC/SUP) — utilisé côté UI pour dévoiler la composition
  // adverse poste par poste, au même rythme que le récit.
  const laneLineStartIndex = lines.length;
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

  const flavor = generateGameFlavor(Math.abs(statsA.total - statsB.total));
  const killsA = overallWinner === 'A' ? flavor.winnerKills : flavor.loserKills;
  const killsB = overallWinner === 'A' ? flavor.loserKills : flavor.winnerKills;

  lines.push(`🏆 ${winnerLabel} remporte la manche ${flavor.winnerKills}-${flavor.loserKills} en ${flavor.duration} ! Indice de force : ${statsA.total.toFixed(1)} — ${statsB.total.toFixed(1)}.`);

  return {
    lanes,
    lines,
    statsA,
    statsB,
    laneWinsA,
    laneWinsB,
    winner: overallWinner,
    killsA,
    killsB,
    duration: flavor.duration,
    laneLineStartIndex,
  };
}

// ── Série complète en Best-of-3 ───────────────────────────────────────────
// Enchaîne jusqu'à 3 manches (première équipe à 2 victoires remporte la
// série). Reste déterministe : la manche 1 se joue sur les forces brutes,
// l'équipe battue reçoit un bonus d'adaptation pour la manche suivante
// (illustre un vrai ajustement stratégique — pas un tirage au sort), ce qui
// peut suffire à renverser des séries serrées sans jamais rendre le résultat
// arbitraire.
const ADAPT_BONUS = 5;

export function simulateBo3(teamA, teamB, labelA = 'Votre équipe', labelB = "L'équipe adverse") {
  const games = [];
  let scoreA = 0;
  let scoreB = 0;
  let bonusA = 0;
  let bonusB = 0;

  while (scoreA < 2 && scoreB < 2) {
    const result = simulateMatch(teamA, teamB, labelA, labelB, bonusA, bonusB);
    games.push(result);
    if (result.winner === 'A') scoreA++; else scoreB++;

    bonusA = result.winner === 'B' ? ADAPT_BONUS : 0;
    bonusB = result.winner === 'A' ? ADAPT_BONUS : 0;
  }

  const seriesWinner = scoreA > scoreB ? 'A' : 'B';
  return { games, scoreA, scoreB, seriesWinner };
}
