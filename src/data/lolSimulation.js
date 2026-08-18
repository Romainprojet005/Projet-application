// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — moteur du tournoi
//
// Générique : sert aussi bien le tournoi LoL (5 duels de poste) que le
// tournoi Rocket League (3 duels) — chaque écran passe l'objet `game`
// résolu via `getGame()` (voir selectGames.js).
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

const STRONG_BONUS = 4;
const MILD_BONUS   = 1.5;
const ADAPT_BONUS  = 5;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Équipe rivale (mode solo) ────────────────────────────────────────────
// Composée avec les joueurs non sélectionnés, un par slot tiré au hasard —
// garantit une équipe complète et différente à chaque partie. `used`
// empêche qu'un même joueur soit tiré deux fois sur un vivier partagé
// entre slots (Rocket League) ; sans effet sur un vivier partitionné (LoL).
export function generateRivalTeam(game, userTeam) {
  const rival = {};
  const used = new Set();
  game.slots.forEach(slot => {
    const candidates = game.slotPool(game.players, slot)
      .filter(p => p.id !== userTeam[slot] && !used.has(p.id));
    const chosen = pick(candidates);
    rival[slot] = chosen.id;
    used.add(chosen.id);
  });
  return rival;
}

function teamSynergy(game, teamIds) {
  let bonus = 0;
  const strongPairs = [];
  const mildPairs = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const rel = game.relationBetween(teamIds[i], teamIds[j]);
      if (rel === 'strong') { bonus += STRONG_BONUS; strongPairs.push([teamIds[i], teamIds[j]]); }
      if (rel === 'mild')   { bonus += MILD_BONUS;   mildPairs.push([teamIds[i], teamIds[j]]); }
    }
  }
  return { bonus, strongPairs, mildPairs };
}

function teamTotal(game, team, bonus = 0) {
  const ids = game.slots.map(s => team[s]);
  const powerSum = ids.reduce((s, id) => s + game.playersById[id].power, 0);
  const synergy = teamSynergy(game, ids);
  return { total: Math.round((powerSum + synergy.bonus + bonus) * 10) / 10, powerSum, synergy, adjustBonus: bonus };
}

// ── Gabarits de récit (variantes cosmétiques, tirées au hasard) ─────────
const STOMP_TEMPLATES = [
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${w.name} écrase littéralement ${l.name} — ${w.signature}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${l.name} n'a jamais existé face à ${w.name}, porté par ${w.signature}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${w.name} impose un rythme que ${l.name} ne peut pas suivre, plombé par ${l.weakness}.`,
];
const WIN_TEMPLATES = [
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${w.name} prend l'avantage sur ${l.name} grâce à ${w.signature}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${l.name} tient un moment, mais ${l.weakness} finit par payer face à ${w.name}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : duel disputé, ${w.name} s'en sort mieux sur la durée.`,
];
const CLOSE_TEMPLATES = [
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : ${w.name} et ${l.name} se rendent coup pour coup — écart minime jusqu'au bout, léger avantage ${w.name}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : rien ne sépare ${w.name} et ${l.name}, si ce n'est un détail — ${w.signature}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} ${tag} : duel équilibré entre ${w.name} et ${l.name}, ${w.name} finit juste devant.`,
];
// Cas particulier : la même légende s'affronte elle-même à deux époques différentes
const MIRROR_TEMPLATES = [
  ({ w, l, tag, meta }) => `${meta.emoji} DUEL D'ÉPOQUES ${tag} : ${w.name} ${w.year} affronte ${l.name} ${l.year} — la même légende, deux générations. C'est la version ${w.year} qui l'emporte, portée par ${w.signature}.`,
  ({ w, l, tag, meta }) => `${meta.emoji} DUEL D'ÉPOQUES ${tag} : face à son propre miroir de ${l.year}, ${w.name} version ${w.year} prouve qu'il n'a pas volé sa réputation — ${w.signature}.`,
];

// Étiquette affichée avant les deux-points dans une ligne de duel : pour
// LoL, "EN TOP" / "EN JUNGLE" (un vrai poste) ; pour Rocket League (pas de
// poste), directement le libellé du slot ("DUEL 1").
function slotTag(game, slot) {
  const meta = game.slotMeta[slot];
  return game.id === 'lol' ? `EN ${meta.label.toUpperCase()}` : meta.label.toUpperCase();
}

function laneLine(game, playerA, playerB, slot, aIsWinner) {
  const w = aIsWinner ? playerA : playerB;
  const l = aIsWinner ? playerB : playerA;
  const meta = game.slotMeta[slot];
  const tag = slotTag(game, slot);
  if (playerA.personId && playerA.personId === playerB.personId) {
    return pick(MIRROR_TEMPLATES)({ w, l, tag, meta });
  }
  const gap = Math.abs(playerA.power - playerB.power);
  const bank = gap >= 8 ? STOMP_TEMPLATES : gap >= 3 ? WIN_TEMPLATES : CLOSE_TEMPLATES;
  return pick(bank)({ w, l, tag, meta });
}

function synergyLine(game, teamLabel, synergy) {
  const pair = synergy.strongPairs[0] || synergy.mildPairs[0];
  if (!pair) return null;
  const [a, b] = pair.map(id => game.playersById[id]);
  const strong = synergy.strongPairs.length > 0;
  return strong
    ? `✨ ${a.name} et ${b.name} (${a.team} ${a.year}) retrouvent leurs automatismes de l'époque — ${teamLabel} joue avec une cohésion qui ne s'improvise pas.`
    : `🤝 ${a.name} et ${b.name} ne se sont jamais affrontés en match officiel, mais partagent la même culture d'écurie — ${teamLabel} en tire un léger avantage collectif.`;
}

// ── Score imaginé et durée de manche (habillage narratif) ────────────────
// N'influence jamais le vainqueur (déjà tranché avant d'être appelé) :
// un plus grand écart de force donne un score plus large et une manche
// plus courte (l'équipe dominante conclut vite) ; une manche serrée dure
// plus longtemps et le score reste proche, comme une vraie partie. Les
// bornes numériques viennent de `game.flavor` (kills LoL vs buts RL).
function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function generateGameFlavor(game, gap) {
  const f = game.flavor;
  const margin = Math.max(0, Math.min(40, gap)) / 40; // 0 (serré) → 1 (écrasant)

  const durationMinutes = f.baseMinutes - margin * f.marginMinutes + (Math.random() * f.jitterMinutes * 2 - f.jitterMinutes);
  const durationSeconds = Math.max(f.minDurationSec, Math.min(f.maxDurationSec,
    Math.round(durationMinutes * 60 + Math.random() * 59)));

  const loserScore = Math.round(f.loserBase + Math.random() * f.loserVar);
  const winnerScore = loserScore + Math.round(f.winnerBaseBonus + margin * f.winnerMarginMult + Math.random() * f.winnerVar);

  return { duration: formatDuration(durationSeconds), winnerScore, loserScore };
}

function findRivalryLine(game, teamA, teamB) {
  for (const { pair, story } of game.RIVALRIES) {
    const [a, b] = pair;
    const inA = game.slots.map(s => teamA[s]);
    const inB = game.slots.map(s => teamB[s]);
    const cross = (inA.includes(a) && inB.includes(b)) || (inA.includes(b) && inB.includes(a));
    if (cross) return `⚔️ ${story}`;
  }
  return null;
}

// ── Simulation d'une manche ───────────────────────────────────────────────
// teamA / teamB : { [slot]: playerId, ... } — slots donnés par `game.slots`.
// labelA / labelB : noms affichés dans le récit (ex. "Votre équipe" / "L'équipe adverse",
// ou en multijoueur les prénoms des deux joueurs).
// bonusA / bonusB : ajustement stratégique optionnel (utilisé en BO3 par l'équipe
// battue à la manche précédente) — reste 100% déterministe, aucun tirage aléatoire.
export function simulateMatch(game, teamA, teamB, labelA = 'Votre équipe', labelB = "L'équipe adverse", bonusA = 0, bonusB = 0) {
  const statsA = teamTotal(game, teamA, bonusA);
  const statsB = teamTotal(game, teamB, bonusB);

  const lanes = game.slots.map(slot => {
    const playerA = game.playersById[teamA[slot]];
    const playerB = game.playersById[teamB[slot]];
    const aIsWinner = playerA.power >= playerB.power;
    return {
      role: slot,
      playerA, playerB, aIsWinner,
      line: laneLine(game, playerA, playerB, slot, aIsWinner),
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

  // Index où commencent les lignes de duels (une par slot, dans l'ordre de
  // `game.slots`) — utilisé côté UI pour dévoiler la composition adverse
  // slot par slot, au même rythme que le récit.
  const laneLineStartIndex = lines.length;
  lines.push(...lanes.map(l => l.line));

  const synA = synergyLine(game, labelA, statsA.synergy);
  const synB = synergyLine(game, labelB, statsB.synergy);
  if (synA) lines.push(synA);
  if (synB) lines.push(synB);

  const rivalry = findRivalryLine(game, teamA, teamB);
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

  const flavor = generateGameFlavor(game, Math.abs(statsA.total - statsB.total));
  const killsA = overallWinner === 'A' ? flavor.winnerScore : flavor.loserScore;
  const killsB = overallWinner === 'A' ? flavor.loserScore : flavor.winnerScore;

  lines.push(`🏆 ${winnerLabel} remporte la manche ${flavor.winnerScore}-${flavor.loserScore} en ${flavor.duration} ! Indice de force : ${statsA.total.toFixed(1)} — ${statsB.total.toFixed(1)}.`);

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
export function simulateBo3(game, teamA, teamB, labelA = 'Votre équipe', labelB = "L'équipe adverse") {
  const games = [];
  let scoreA = 0;
  let scoreB = 0;
  let bonusA = 0;
  let bonusB = 0;

  while (scoreA < 2 && scoreB < 2) {
    const result = simulateMatch(game, teamA, teamB, labelA, labelB, bonusA, bonusB);
    games.push(result);
    if (result.winner === 'A') scoreA++; else scoreB++;

    bonusA = result.winner === 'B' ? ADAPT_BONUS : 0;
    bonusB = result.winner === 'A' ? ADAPT_BONUS : 0;
  }

  const seriesWinner = scoreA > scoreB ? 'A' : 'B';
  return { games, scoreA, scoreB, seriesWinner };
}
