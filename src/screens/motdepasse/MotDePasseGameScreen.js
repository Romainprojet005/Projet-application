import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';

const CYAN       = '#06B6D4';
const CYAN_DARK  = '#0E7490';
const CYAN_LIGHT = '#A5F3FC';
const BG         = OB_BG;

// ── Final leaderboard ──────────────────────────────────────────────
function FinalScreen({ players, scores, onPlayAgain, onMenu }) {
  const ranked = [...players].map((name, i) => ({ name, score: scores[i] || 0 })).sort((a, b) => b.score - a.score);
  const podiumAnim = useRef(new Animated.Value(0)).current;
  const rowAnims   = useRef(ranked.map(() => new Animated.Value(0))).current;
  const medals = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(podiumAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.stagger(100, rowAnims.map(a => Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }))),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <ScrollView contentContainerStyle={styles.finalScroll} showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { flex: 1 }}>
        <Animated.View style={[styles.finalHeader, {
          opacity: podiumAnim,
          transform: [{ scale: podiumAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
        }]}>
          <Text style={styles.finalEmoji}>🎭</Text>
          <Text style={styles.finalTitle}>MOT DE PASSE TERMINÉ !</Text>
          <Text style={styles.finalSub}>Cyrano de Bergerac applaudit</Text>
        </Animated.View>

        <View style={styles.rankList}>
          {ranked.map((player, i) => (
            <Animated.View key={i} style={{
              opacity: rowAnims[i],
              transform: [{ translateX: rowAnims[i].interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
            }}>
              <LinearGradient
                colors={i === 0 ? ['#001A1A', '#002828'] : ['#141414', '#1A1A1A']}
                style={[styles.rankRow, i === 0 && styles.rankRowFirst]}
              >
                <Text style={styles.rankMedal}>{medals[i] || `#${i + 1}`}</Text>
                <Text style={[styles.rankName, i === 0 && { color: CYAN_LIGHT }]}>{player.name}</Text>
                <View style={styles.rankScoreWrap}>
                  <Text style={[styles.rankScore, i === 0 && { color: CYAN }]}>{player.score}</Text>
                  <Text style={styles.rankScorePts}>mots</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <View style={styles.finalBtns}>
          <TouchableOpacity onPress={onPlayAgain} style={styles.finalBtnPrimary} activeOpacity={0.88}>
            <LinearGradient colors={[CYAN, CYAN_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.finalBtnGrad}>
              <Text style={styles.finalBtnText}>🎭  REJOUER</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onMenu} style={styles.finalBtnSecondary} activeOpacity={0.88}>
            <Text style={styles.finalBtnSecondaryText}>Retour au menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ── Main game ──────────────────────────────────────────────────────
export default function MotDePasseGameScreen({ navigation, route }) {
  const { players, cards, timerSecs } = route.params;

  const [phase,          setPhase]          = useState('handoff');
  const [playerIdx,      setPlayerIdx]      = useState(0);
  const [cardIdxDisplay, setCardIdxDisplay] = useState(0);
  const [scores,         setScores]         = useState(Array(players.length).fill(0));
  const [timeLeft,       setTimeLeft]       = useState(timerSecs);
  const [lastTurnResult, setLastTurnResult] = useState({ correct: 0, skipped: 0 });

  // Refs to avoid stale closures in interval callbacks
  const timerRef       = useRef(null);
  const turnCorrectRef = useRef(0);
  const turnSkippedRef = useRef(0);
  const cardIdxRef     = useRef(0);
  const playerIdxRef   = useRef(0);
  const turnEndedRef   = useRef(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnim  = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0); slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { animateIn(); }, [phase]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const doEndTurn = useCallback(() => {
    if (turnEndedRef.current) return;
    turnEndedRef.current = true;
    clearTimer();

    const correct  = turnCorrectRef.current;
    const skipped  = turnSkippedRef.current;
    const cIdx     = cardIdxRef.current;
    const pIdx     = playerIdxRef.current;

    setLastTurnResult({ correct, skipped });
    setScores(prev => { const next = [...prev]; next[pIdx] = (next[pIdx] || 0) + correct; return next; });
    setCardIdxDisplay(cIdx);
    setPhase(cIdx >= cards.length ? 'gameEnd' : 'turnEnd');
  }, [cards.length]);

  // Keep a ref to always-current doEndTurn for interval callback
  const doEndTurnRef = useRef(doEndTurn);
  useEffect(() => { doEndTurnRef.current = doEndTurn; });

  const startTurn = () => {
    turnCorrectRef.current = 0;
    turnSkippedRef.current = 0;
    cardIdxRef.current     = cardIdxDisplay;
    playerIdxRef.current   = playerIdx;
    turnEndedRef.current   = false;

    setTimeLeft(timerSecs);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          doEndTurnRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const animateCardChange = (callback) => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    callback();
  };

  const handleCorrect = () => {
    turnCorrectRef.current += 1;
    cardIdxRef.current += 1;
    if (cardIdxRef.current >= cards.length) {
      doEndTurnRef.current();
    } else {
      animateCardChange(() => setCardIdxDisplay(cardIdxRef.current));
    }
  };

  const handleSkip = () => {
    turnSkippedRef.current += 1;
    cardIdxRef.current += 1;
    if (cardIdxRef.current >= cards.length) {
      doEndTurnRef.current();
    } else {
      animateCardChange(() => setCardIdxDisplay(cardIdxRef.current));
    }
  };

  const handleNextTurn = () => {
    const nextPlayer = (playerIdx + 1) % players.length;
    setPlayerIdx(nextPlayer);
    setPhase('handoff');
  };

  if (phase === 'gameEnd') {
    return (
      <FinalScreen
        players={players} scores={scores}
        onPlayAgain={() => navigation.replace('MotDePasseSetup')}
        onMenu={() => navigation.navigate('Menu')}
      />
    );
  }

  const currentCard = cards[cardIdxDisplay] || cards[cards.length - 1];
  const timerPct    = timeLeft / timerSecs;
  const timerColor  = timerPct > 0.5 ? CYAN : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  // ── HANDOFF ──────────────────────────────────────────────────────
  if (phase === 'handoff') {
    return (
      <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
        <Animated.View style={[styles.handoffBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.cancelTop}>
            <Text style={styles.cancelTopText}>✕  Quitter</Text>
          </TouchableOpacity>

          <Text style={styles.progressLabel}>{cardIdxDisplay} / {cards.length} mots</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(cardIdxDisplay / cards.length) * 100}%`, backgroundColor: CYAN }]} />
          </View>

          <LinearGradient colors={[CYAN + '25', CYAN + '10']} style={[styles.handoffCard, { borderColor: CYAN + '30' }]}>
            <View style={[styles.handoffAvatar, { borderColor: CYAN + '60', backgroundColor: CYAN + '20' }]}>
              <Text style={styles.handoffAvatarEmoji}>🎭</Text>
            </View>
            <Text style={styles.handoffLabel}>C'est le tour de</Text>
            <Text style={[styles.handoffName, { color: CYAN }]}>{players[playerIdx]}</Text>
            <Text style={styles.handoffInstruction}>
              Prends le téléphone !{'\n'}Fais deviner les mots sans dire les mots interdits.{'\n'}Tu as {timerSecs} secondes.
            </Text>
          </LinearGradient>

          <View style={styles.scoreRow}>
            {players.map((name, i) => (
              <View key={i} style={styles.scoreChip}>
                <Text style={styles.scoreChipName}>{name.length > 7 ? name.slice(0, 7) + '…' : name}</Text>
                <Text style={[styles.scoreChipScore, i === playerIdx && { color: CYAN }]}>{scores[i] || 0}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={startTurn} style={styles.startBtn} activeOpacity={0.88}>
            <LinearGradient colors={[CYAN, CYAN_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>🎭  JE SUIS PRÊT !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────
  if (phase === 'playing') {
    return (
      <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topBarPlayer, { color: CYAN }]}>{players[playerIdx]}</Text>
          <View style={[styles.timerBadge, { borderColor: timerColor + '80', backgroundColor: timerColor + '20' }]}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
            <Text style={[styles.timerSec, { color: timerColor }]}>s</Text>
          </View>
          <Text style={styles.topBarCount}>{cardIdxDisplay}/{cards.length}</Text>
        </View>

        {/* Timer bar */}
        <View style={styles.timerBarTrack}>
          <Animated.View style={[styles.timerBarFill, { width: `${timerPct * 100}%`, backgroundColor: timerColor }]} />
        </View>

        <ScrollView contentContainerStyle={styles.playScroll} showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' && { flex: 1 }}>

          {/* Turn score */}
          <View style={styles.turnScoreRow}>
            <View style={[styles.turnScoreBadge, { borderColor: CYAN + '50' }]}>
              <Text style={styles.turnScoreNum}>{turnCorrectRef.current}</Text>
              <Text style={styles.turnScoreLabel}>✓ ce tour</Text>
            </View>
          </View>

          {/* Word card */}
          <Animated.View style={{ opacity: cardAnim }}>
            <LinearGradient colors={[CYAN + '20', CYAN + '08']} style={[styles.wordCard, { borderColor: CYAN + '50' }]}>
              <Text style={styles.wordText}>{currentCard.word}</Text>
            </LinearGradient>

            {/* Forbidden words */}
            <View style={styles.forbiddenBox}>
              <Text style={styles.forbiddenTitle}>🚫  Mots interdits</Text>
              <View style={styles.forbiddenList}>
                {currentCard.forbidden.map((w, i) => (
                  <View key={i} style={styles.forbiddenChip}>
                    <Text style={styles.forbiddenWord}>{w}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.8}>
              <Text style={styles.skipBtnIcon}>✗</Text>
              <Text style={styles.skipBtnText}>Passer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCorrect} style={styles.correctBtn} activeOpacity={0.8}>
              <Text style={styles.correctBtnIcon}>✓</Text>
              <Text style={styles.correctBtnText}>Deviné !</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={doEndTurnRef.current} style={styles.endTurnLink}>
            <Text style={styles.endTurnLinkText}>Terminer le tour</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── TURN END ─────────────────────────────────────────────────────
  return (
    <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <Animated.View style={[styles.turnEndBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.turnEndTitle}>⏱️  Fin du tour</Text>
        <Text style={[styles.turnEndPlayer, { color: CYAN }]}>{players[playerIdx]}</Text>

        <LinearGradient colors={[CYAN + '25', CYAN + '10']} style={[styles.turnEndResult, { borderColor: CYAN + '30' }]}>
          <View style={styles.turnEndStat}>
            <Text style={[styles.turnEndStatNum, { color: '#4ADE80' }]}>{lastTurnResult.correct}</Text>
            <Text style={styles.turnEndStatLabel}>✓ mot{lastTurnResult.correct > 1 ? 's' : ''} deviné{lastTurnResult.correct > 1 ? 's' : ''}</Text>
          </View>
          {lastTurnResult.skipped > 0 && (
            <View style={styles.turnEndStat}>
              <Text style={[styles.turnEndStatNum, { color: colors.textMuted }]}>{lastTurnResult.skipped}</Text>
              <Text style={styles.turnEndStatLabel}>passé{lastTurnResult.skipped > 1 ? 's' : ''}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.miniScoreList}>
          {players.map((name, i) => (
            <View key={i} style={[styles.miniScoreRow, i === playerIdx && styles.miniScoreRowActive]}>
              <Text style={[styles.miniScoreName, i === playerIdx && { color: CYAN }]}>{name}</Text>
              <Text style={[styles.miniScoreVal, i === playerIdx && { color: CYAN }]}>{scores[i] || 0} mot{(scores[i] || 0) !== 1 ? 's' : ''}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleNextTurn} style={styles.nextBtn} activeOpacity={0.88}>
          <LinearGradient colors={[CYAN, CYAN_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
            <Text style={styles.nextBtnText}>
              {`Tour de ${players[(playerIdx + 1) % players.length]}  →`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.remainText}>{cards.length - cardIdxDisplay} mots restants</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  // Handoff
  handoffBox: { flex: 1, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: spacing.xl, alignItems: 'center' },
  cancelTop: { alignSelf: 'flex-start', marginBottom: spacing.md },
  cancelTopText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  progressLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6, fontWeight: '600' },
  progressTrack: { width: '100%', height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: spacing.xl },
  progressFill: { height: '100%', borderRadius: 2 },
  handoffCard: { width: '100%', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, marginBottom: spacing.xl },
  handoffAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  handoffAvatarEmoji: { fontSize: 38 },
  handoffLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  handoffName: { fontSize: 32, fontWeight: '900', marginBottom: spacing.md },
  handoffInstruction: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  scoreChip: { backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  scoreChipName: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  scoreChipScore: { fontSize: 16, fontWeight: '900', color: colors.text },
  startBtn: { width: '100%', borderRadius: radius.full, overflow: 'hidden', shadowColor: CYAN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  startBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },

  // Playing
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  topBarPlayer: { fontSize: 13, fontWeight: '700', flex: 1 },
  topBarCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600', flex: 1, textAlign: 'right' },
  timerBadge: { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4, flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  timerNum: { fontSize: 22, fontWeight: '900' },
  timerSec: { fontSize: 12, fontWeight: '700' },
  timerBarTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginHorizontal: spacing.xl, marginBottom: spacing.md },
  timerBarFill: { height: '100%', borderRadius: 3 },

  playScroll: { paddingHorizontal: spacing.xl, paddingBottom: 48 },
  turnScoreRow: { alignItems: 'center', marginBottom: spacing.md },
  turnScoreBadge: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 6, flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  turnScoreNum: { fontSize: 28, fontWeight: '900', color: '#4ADE80' },
  turnScoreLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  wordCard: { borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1.5, marginBottom: spacing.md },
  wordText: { fontSize: 46, fontWeight: '900', color: colors.text, letterSpacing: 2, textAlign: 'center' },

  forbiddenBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: '#EF4444' + '40', marginBottom: spacing.xl },
  forbiddenTitle: { fontSize: 13, fontWeight: '700', color: '#EF4444', marginBottom: spacing.sm },
  forbiddenList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  forbiddenChip: { backgroundColor: '#EF4444' + '15', borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: '#EF4444' + '40' },
  forbiddenWord: { fontSize: 13, fontWeight: '700', color: '#FCA5A5' },

  actionRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  skipBtn: {
    flex: 1, backgroundColor: '#EF4444' + '20', borderRadius: radius.lg,
    paddingVertical: spacing.lg + 4, alignItems: 'center', borderWidth: 2, borderColor: '#EF4444' + '70',
  },
  skipBtnIcon: { fontSize: 32, marginBottom: 4 },
  skipBtnText: { fontSize: 14, fontWeight: '700', color: '#FCA5A5' },
  correctBtn: {
    flex: 1, backgroundColor: '#10B981' + '20', borderRadius: radius.lg,
    paddingVertical: spacing.lg + 4, alignItems: 'center', borderWidth: 2, borderColor: '#10B981' + '70',
  },
  correctBtnIcon: { fontSize: 32, marginBottom: 4 },
  correctBtnText: { fontSize: 14, fontWeight: '700', color: '#6EE7B7' },
  endTurnLink: { alignItems: 'center', paddingVertical: spacing.md },
  endTurnLinkText: { fontSize: 12, color: colors.textMuted, textDecorationLine: 'underline' },

  // Turn end
  turnEndBox: { flex: 1, paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: spacing.xl, alignItems: 'center' },
  turnEndTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  turnEndPlayer: { fontSize: 36, fontWeight: '900', marginBottom: spacing.xl },
  turnEndResult: { width: '100%', borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.xl },
  turnEndStat: { alignItems: 'center' },
  turnEndStatNum: { fontSize: 56, fontWeight: '900' },
  turnEndStatLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
  miniScoreList: { width: '100%', gap: spacing.xs, marginBottom: spacing.xl },
  miniScoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.md },
  miniScoreRowActive: { backgroundColor: CYAN + '15' },
  miniScoreName: { fontSize: 14, fontWeight: '600', color: colors.text },
  miniScoreVal: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  nextBtn: { width: '100%', borderRadius: radius.full, overflow: 'hidden', shadowColor: CYAN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10, marginBottom: spacing.md },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 1 },
  remainText: { fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },

  // Final
  finalScroll: { paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: spacing.xl, paddingBottom: 60, alignItems: 'center' },
  finalHeader: { alignItems: 'center', marginBottom: spacing.xl },
  finalEmoji: { fontSize: 72, textAlign: 'center', marginBottom: spacing.md },
  finalTitle: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: 3, textAlign: 'center' },
  finalSub: { fontSize: 13, color: CYAN_LIGHT, letterSpacing: 2, marginTop: spacing.xs, textAlign: 'center' },
  rankList: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  rankRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rankRowFirst: { borderColor: CYAN + '50' },
  rankMedal: { fontSize: 26 },
  rankName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScoreWrap: { alignItems: 'flex-end' },
  rankScore: { fontSize: 26, fontWeight: '900', color: colors.text },
  rankScorePts: { fontSize: 11, color: colors.textMuted },
  finalBtns: { width: '100%', gap: spacing.md },
  finalBtnPrimary: { borderRadius: radius.full, overflow: 'hidden', shadowColor: CYAN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  finalBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  finalBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },
  finalBtnSecondary: { backgroundColor: colors.surface, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  finalBtnSecondaryText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
