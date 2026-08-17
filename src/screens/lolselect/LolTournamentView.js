// ─────────────────────────────────────────────────────────────────────────
// Vue de tournoi partagée — utilisée par le mode solo (vs IA) ET le mode
// multijoueur à distance. Reçoit une série déjà calculée (simulateBo3) et
// se contente de l'afficher : roster face à face → BO3 manche par manche,
// récit ligne par ligne → score de la série. Aucune logique de jeu ici.
// ─────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { ROLE_META, ROLE_ORDER, LOL_PLAYERS_BY_ID } from '../../data/lolPlayers';

const ACCENT       = '#C89B3C';
const ACCENT_LIGHT = '#F0D68C';
const ACCENT_DARK  = '#8B6914';
const HEXTECH      = '#0AC8B9';

function RosterColumn({ title, team, highlight }) {
  return (
    <View style={[styles.rosterCol, highlight && styles.rosterColHighlight]}>
      <Text style={styles.rosterTitle} numberOfLines={1}>{title}</Text>
      {ROLE_ORDER.map(r => {
        const p = LOL_PLAYERS_BY_ID[team[r]];
        if (!p) return null;
        return (
          <View key={r} style={styles.rosterRow}>
            <Text style={styles.rosterEmoji}>{ROLE_META[r].emoji}</Text>
            {p.image
              ? <Image source={{ uri: p.image }} style={styles.rosterPhoto} />
              : <View style={[styles.rosterPhoto, styles.rosterPhotoFallback]}><Text style={{ fontSize: 12 }}>{p.flag}</Text></View>}
            <View style={{ flex: 1 }}>
              <Text style={styles.rosterName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.rosterSub} numberOfLines={1}>{p.team} · {p.year}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function seriesScoreThrough(games, uptoIdx) {
  let a = 0, b = 0;
  for (let i = 0; i <= uptoIdx; i++) {
    if (games[i].winner === 'A') a++; else b++;
  }
  return { a, b };
}

export default function LolTournamentView({
  labelA, labelB, teamA, teamB, result, // result = simulateBo3(...) → { games, scoreA, scoreB, seriesWinner }
  youSide = null,
  onHome, onReplay, replayLabel = '🔄  Rejouer',
}) {
  const [phase, setPhase]     = useState('lineup'); // lineup → reveal → gameResult → final
  const [gameIdx, setGameIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [phase, gameIdx, lineIdx]);

  const { games } = result;
  const currentGame = games[gameIdx];

  const startTournament = useCallback(() => { setPhase('reveal'); setGameIdx(0); setLineIdx(1); }, []);

  const nextLine = useCallback(() => {
    if (lineIdx >= currentGame.lines.length) { setPhase('gameResult'); return; }
    fadeAnim.setValue(0);
    setLineIdx(i => i + 1);
  }, [lineIdx, currentGame]);

  const nextGame = useCallback(() => {
    if (gameIdx + 1 >= games.length) { setPhase('final'); return; }
    setGameIdx(i => i + 1);
    setLineIdx(1);
    setPhase('reveal');
  }, [gameIdx, games.length]);

  const isLastLine = lineIdx >= (currentGame?.lines.length || 0);

  if (phase === 'lineup') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <PageScroll contentContainerStyle={styles.scroll}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.vsTitle}>⚔️  LE GRAND TOURNOI — BO3</Text>
            <Text style={styles.vsSub}>{labelA} affronte {labelB} · première équipe à 2 manches gagne la série</Text>

            <View style={styles.rosterRow2}>
              <RosterColumn title={`🛡️ ${labelA.toUpperCase()}`} team={teamA} highlight={youSide !== 'B'} />
              <View style={styles.vsBadge}><Text style={styles.vsBadgeText}>VS</Text></View>
              <RosterColumn title={`🔥 ${labelB.toUpperCase()}`} team={teamB} highlight={youSide === 'B'} />
            </View>

            <TouchableOpacity onPress={startTournament} style={styles.launchBtn} activeOpacity={0.88}>
              <LinearGradient colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.launchGradient}>
                <Text style={styles.launchText}>🏁  LANCER LE BO3</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </PageScroll>
      </LinearGradient>
    );
  }

  if (phase === 'reveal') {
    const linesToShow = currentGame.lines.slice(0, lineIdx);
    const scoreBefore = gameIdx === 0 ? { a: 0, b: 0 } : seriesScoreThrough(games, gameIdx - 1);
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <PageScroll contentContainerStyle={styles.scroll}>
          <View style={styles.gameHeaderRow}>
            <Text style={styles.gameHeaderTitle}>MANCHE {gameIdx + 1}</Text>
            <View style={styles.seriesBadge}>
              <Text style={styles.seriesBadgeText}>{scoreBefore.a} – {scoreBefore.b}</Text>
            </View>
          </View>
          <Text style={styles.vsTitleSmall}>📝  RÉCIT DE LA MANCHE</Text>
          <View style={styles.narrativeBox}>
            {linesToShow.map((line, i) => (
              <Animated.Text
                key={i}
                style={[styles.narrativeLine, i === linesToShow.length - 1 && { opacity: fadeAnim }]}
              >
                {line}
              </Animated.Text>
            ))}
          </View>
          <TouchableOpacity onPress={nextLine} style={styles.nextBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>{isLastLine ? '🏆  Voir le résultat de la manche' : '➡️  Suite du récit'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </PageScroll>
      </LinearGradient>
    );
  }

  if (phase === 'gameResult') {
    const winnerIsA = currentGame.winner === 'A';
    const winnerLabel = winnerIsA ? labelA : labelB;
    const scoreNow = seriesScoreThrough(games, gameIdx);
    const seriesOver = gameIdx + 1 >= games.length;
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <PageScroll contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.finalCard, { opacity: fadeAnim }]}>
            <Text style={styles.finalEmoji}>🎮</Text>
            <Text style={styles.finalTitle}>MANCHE {gameIdx + 1} : {winnerLabel.toUpperCase()}</Text>
            <Text style={styles.finalSub}>Score de la série : {scoreNow.a} – {scoreNow.b}</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreCell}>
                <Text style={styles.scoreLabel} numberOfLines={1}>{labelA.toUpperCase()}</Text>
                <Text style={[styles.scoreValue, winnerIsA && { color: ACCENT_LIGHT }]}>{currentGame.statsA.total.toFixed(1)}</Text>
                <Text style={styles.scoreSub}>{currentGame.laneWinsA} duel{currentGame.laneWinsA > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.scoreSep}>—</Text>
              <View style={styles.scoreCell}>
                <Text style={styles.scoreLabel} numberOfLines={1}>{labelB.toUpperCase()}</Text>
                <Text style={[styles.scoreValue, !winnerIsA && { color: HEXTECH }]}>{currentGame.statsB.total.toFixed(1)}</Text>
                <Text style={styles.scoreSub}>{currentGame.laneWinsB} duel{currentGame.laneWinsB > 1 ? 's' : ''}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={nextGame} style={styles.homeBtn} activeOpacity={0.85}>
              <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.homeBtnGrad}>
                <Text style={styles.homeBtnText}>
                  {seriesOver ? '🏆  Voir le résultat final de la série' : `➡️  Manche ${gameIdx + 2}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </PageScroll>
      </LinearGradient>
    );
  }

  // phase === 'final'
  const winnerIsA = result.seriesWinner === 'A';
  const winnerLabel = winnerIsA ? labelA : labelB;
  const youWon = youSide ? result.seriesWinner === youSide : null;
  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.finalCard, { opacity: fadeAnim }]}>
          <Text style={styles.finalEmoji}>{youWon === null ? '🏆' : youWon ? '🏆' : '💔'}</Text>
          <Text style={styles.finalTitle}>{youWon === null ? 'FIN DE LA SÉRIE' : youWon ? 'VICTOIRE !' : 'DÉFAITE'}</Text>
          <Text style={styles.finalSub}>{winnerLabel} remporte la série {result.scoreA} – {result.scoreB}</Text>

          <View style={styles.recapList}>
            {games.map((g, i) => {
              const gWinnerIsA = g.winner === 'A';
              return (
                <View key={i} style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Manche {i + 1}</Text>
                  <Text style={styles.recapWinner}>{gWinnerIsA ? labelA : labelB}</Text>
                  <Text style={styles.recapScore}>{g.statsA.total.toFixed(1)} – {g.statsB.total.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={onHome} style={styles.homeBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.homeBtnGrad}>
              <Text style={styles.homeBtnText}>🏠  Retour au menu</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onReplay && (
            <TouchableOpacity onPress={onReplay} style={styles.replayBtn} activeOpacity={0.8}>
              <Text style={styles.replayBtnText}>{replayLabel}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 48, flexGrow: 1 },

  vsTitle: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: 1.5, textAlign: 'center' },
  vsTitleSmall: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.md },
  vsSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },

  gameHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  gameHeaderTitle: { fontSize: 13, fontWeight: '900', color: ACCENT_LIGHT, letterSpacing: 2 },
  seriesBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, backgroundColor: `${HEXTECH}20`, borderWidth: 1, borderColor: `${HEXTECH}50` },
  seriesBadgeText: { fontSize: 13, fontWeight: '900', color: HEXTECH },

  rosterRow2: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  rosterCol: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, gap: spacing.xs,
  },
  rosterColHighlight: { borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}10` },
  rosterTitle: { fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT, marginBottom: 4, textAlign: 'center' },
  rosterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rosterEmoji: { fontSize: 12 },
  rosterPhoto: { width: 26, height: 26, borderRadius: 13 },
  rosterPhotoFallback: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  rosterName: { fontSize: 11, fontWeight: '800', color: colors.text },
  rosterSub: { fontSize: 8, color: colors.textMuted },
  vsBadge: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: `${HEXTECH}20`,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${HEXTECH}50`,
  },
  vsBadgeText: { fontSize: 11, fontWeight: '900', color: HEXTECH },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: '#0A0815', letterSpacing: 2 },

  narrativeBox: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg, minHeight: 200,
  },
  narrativeLine: { fontSize: 14, color: colors.text, lineHeight: 21 },

  nextBtn: { borderRadius: radius.full, overflow: 'hidden' },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  finalCard: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.xl, marginTop: spacing.xl,
  },
  finalEmoji: { fontSize: 56 },
  finalTitle: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: 2, textAlign: 'center' },
  finalSub: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  scoreCell: { alignItems: 'center', maxWidth: 120 },
  scoreLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  scoreValue: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 2 },
  scoreSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  scoreSep: { fontSize: 20, color: colors.textMuted },

  recapList: { alignSelf: 'stretch', gap: spacing.xs, marginBottom: spacing.lg },
  recapRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  recapLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', width: 70 },
  recapWinner: { fontSize: 12, color: ACCENT_LIGHT, fontWeight: '800', flex: 1, textAlign: 'center' },
  recapScore: { fontSize: 11, color: colors.textMuted },

  homeBtn: { alignSelf: 'stretch', borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  homeBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  homeBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  replayBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  replayBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '700' },
});
