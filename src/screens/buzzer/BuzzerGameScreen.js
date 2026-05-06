import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, Pressable, Modal, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { PLAYER_COLORS } from './BuzzerSetupScreen';
import { BUZZER_MODES, getShuffledQuestions } from '../../data/buzzerQuestions';

const BUZZ_COLOR  = '#DC2626';
const BUZZ_DARK   = '#B91C1C';
const BUZZ_LIGHT  = '#FCA5A5';
const BUZZ_TIMER  = 10;

export default function BuzzerGameScreen({ navigation, route }) {
  const { playerNames, playerColors, mode = 'quiz' } = route.params;
  const n = playerNames.length;
  const modeInfo = BUZZER_MODES.find(m => m.id === mode) ?? BUZZER_MODES[0];

  const [questions]     = useState(() => getShuffledQuestions(mode));
  const [questionIdx,   setQuestionIdx]   = useState(0);
  const [phase,         setPhase]         = useState('waiting');
  const [scores,        setScores]        = useState(Object.fromEntries(playerNames.map(p => [p, 0])));
  const [winner,        setWinner]        = useState(null);
  const [count,         setCount]         = useState(3);
  const [timerLeft,     setTimerLeft]     = useState(BUZZ_TIMER);
  const [showQuit,      setShowQuit]      = useState(false);
  const [showAnswer,    setShowAnswer]    = useState(false);

  const alreadyBuzzed   = useRef(false);
  const countdownTimer  = useRef(null);
  const buzzTimer       = useRef(null);
  const handleResultRef = useRef(null);
  const countAnim       = useRef(new Animated.Value(1)).current;
  const winnerAnim      = useRef(new Animated.Value(0)).current;
  const zonesOpacity    = useRef(new Animated.Value(0.35)).current;

  const currentQ = questions[questionIdx] ?? null;
  const totalQ   = questions.length;
  const isFinal  = questionIdx >= totalQ;

  const sortedPlayers = [...playerNames].sort((a, b) => scores[b] - scores[a]);

  useEffect(() => () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (buzzTimer.current) clearInterval(buzzTimer.current);
  }, []);

  const animateCount = useCallback(() => {
    countAnim.setValue(1.8);
    Animated.spring(countAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }, [countAnim]);

  // ── handleResult (stored in ref to avoid stale closure in timer) ──
  const handleResult = useCallback((result) => {
    if (buzzTimer.current) clearInterval(buzzTimer.current);
    setShowAnswer(false);

    if (result === 'correct' && winner !== null) {
      setScores(prev => ({ ...prev, [playerNames[winner]]: prev[playerNames[winner]] + 1 }));
    }

    const nextIdx = questionIdx + 1;
    setQuestionIdx(nextIdx);
    setPhase('waiting');
    setWinner(null);
    alreadyBuzzed.current = false;
  }, [winner, playerNames, questionIdx]);

  useEffect(() => { handleResultRef.current = handleResult; }, [handleResult]);

  // ── Countdown 3-2-1 ──
  const startCountdown = useCallback(() => {
    alreadyBuzzed.current = false;
    setWinner(null);
    setCount(3);
    setPhase('countdown');
    zonesOpacity.setValue(0.35);
    animateCount();

    let c = 3;
    countdownTimer.current = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(countdownTimer.current);
        setPhase('active');
        Animated.timing(zonesOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      } else {
        setCount(c);
        animateCount();
      }
    }, 900);
  }, [animateCount, zonesOpacity]);

  // ── Buzz ──
  const handleBuzz = useCallback((idx) => {
    if (phase !== 'active') return;
    if (alreadyBuzzed.current) return;
    alreadyBuzzed.current = true;

    setWinner(idx);
    setPhase('buzzed');
    setTimerLeft(BUZZ_TIMER);
    setShowAnswer(false);
    winnerAnim.setValue(0);
    Animated.spring(winnerAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();

    let t = BUZZ_TIMER;
    buzzTimer.current = setInterval(() => {
      t -= 1;
      setTimerLeft(t);
      if (t <= 0) {
        clearInterval(buzzTimer.current);
        // auto-skip on timeout
        setTimeout(() => handleResultRef.current('skip'), 100);
      }
    }, 1000);
  }, [phase, winnerAnim]);

  const handleQuit = useCallback(() => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (buzzTimer.current) clearInterval(buzzTimer.current);
    navigation.goBack();
  }, [navigation]);

  // ── Timer color ──
  const timerColor = timerLeft > 5 ? '#22c55e' : timerLeft > 3 ? '#f59e0b' : '#ef4444';

  // ── Grid rows ──
  const rows = [];
  for (let i = 0; i < n; i += 2) rows.push([i, i + 1].filter(j => j < n));

  // ── Final leaderboard ──
  if (isFinal) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={OB_BG} style={StyleSheet.absoluteFill} />
        <View style={styles.finalContainer}>
          <Text style={styles.finalTitle}>⚡ Résultats</Text>
          <Text style={styles.finalSub}>{totalQ} questions — {playerNames.length} joueurs</Text>

          <View style={styles.finalList}>
            {sortedPlayers.map((name, rank) => {
              const pi = playerNames.indexOf(name);
              return (
                <View key={name} style={[styles.finalRow, rank === 0 && { backgroundColor: playerColors[pi] + '25', borderColor: playerColors[pi] }]}>
                  <Text style={styles.finalRank}>{rank === 0 ? '🏆' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`}</Text>
                  <View style={[styles.finalDot, { backgroundColor: playerColors[pi] }]} />
                  <Text style={styles.finalName}>{name}</Text>
                  <Text style={[styles.finalScore, { color: playerColors[pi] }]}>{scores[name]} pt{scores[name] > 1 ? 's' : ''}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retourBtn} activeOpacity={0.88}>
            <LinearGradient colors={[BUZZ_COLOR, BUZZ_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.retourGradient}>
              <Text style={styles.retourText}>← Retour au menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Question card content based on mode ──
  const renderQuestion = () => {
    if (!currentQ) return null;
    if (mode === 'quiz') {
      return <Text style={styles.qText}>{currentQ.q}</Text>;
    }
    if (mode === 'blindtest') {
      return (
        <>
          <Text style={styles.qArtist}>🎵  {currentQ.artist}</Text>
          <Text style={styles.qYear}>{currentQ.year}</Text>
          <Text style={styles.qHint}>{currentQ.hint}</Text>
          <Text style={styles.qInstruction}>Quel est le titre ?</Text>
        </>
      );
    }
    // personnalite
    return (
      <>
        <Text style={styles.qText}>{currentQ.clue}</Text>
        <Text style={styles.qInstruction}>Qui est-ce ?</Text>
      </>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowQuit(true)} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.scoreRow}>
          {playerNames.map((name, i) => {
            const maxScore = Math.max(...Object.values(scores));
            const isLeading = scores[name] === maxScore && maxScore > 0;
            return (
              <View key={i} style={[styles.scoreChip, { borderColor: playerColors[i] }, isLeading && { backgroundColor: playerColors[i] + '30' }]}>
                <View style={[styles.chipDot, { backgroundColor: playerColors[i] }]} />
                <Text style={styles.chipName} numberOfLines={1}>{name}</Text>
                <Text style={[styles.chipScore, { color: playerColors[i] }]}>{scores[name]}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>{questionIdx + 1}/{totalQ}</Text>
        </View>
      </View>

      {/* Question card */}
      <View style={[styles.questionCard, { borderColor: modeInfo.color + '40' }]}>
        <View style={[styles.modePill, { backgroundColor: modeInfo.color + '22', borderColor: modeInfo.color + '55' }]}>
          <Text style={[styles.modePillText, { color: modeInfo.color }]}>{modeInfo.emoji}  {modeInfo.name}</Text>
        </View>
        {renderQuestion()}
      </View>

      {/* Zones */}
      <Animated.View style={[styles.zonesContainer, { opacity: zonesOpacity }]}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.zoneRow}>
            {row.map(idx => (
              <Pressable
                key={idx}
                style={[styles.zone, { backgroundColor: playerColors[idx] }]}
                onPressIn={() => handleBuzz(idx)}
              >
                <Text style={styles.zoneName}>{playerNames[idx]}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </Animated.View>

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <View style={styles.overlay} pointerEvents="none">
          <Animated.Text style={[styles.countText, { transform: [{ scale: countAnim }] }]}>
            {count}
          </Animated.Text>
        </View>
      )}

      {/* Buzzed panel */}
      {phase === 'buzzed' && winner !== null && (
        <Animated.View
          style={[
            styles.buzzPanel,
            { backgroundColor: playerColors[winner] + 'EE' },
            { transform: [{ scale: winnerAnim }], opacity: winnerAnim },
          ]}
        >
          <Text style={styles.buzzPanelEmoji}>⚡</Text>
          <Text style={styles.buzzPanelName}>{playerNames[winner]}</Text>
          <Text style={styles.buzzPanelSub}>a la parole !</Text>

          {/* Timer */}
          <View style={[styles.timerCircle, { borderColor: timerColor }]}>
            <Text style={[styles.timerNumber, { color: timerColor }]}>{timerLeft}</Text>
          </View>

          {/* Reveal answer button for moderator */}
          <TouchableOpacity onPress={() => setShowAnswer(v => !v)} style={styles.revealBtn}>
            <Text style={styles.revealText}>{showAnswer ? '🙈 Masquer la réponse' : '👁  Voir la réponse'}</Text>
          </TouchableOpacity>
          {showAnswer && currentQ && (
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{currentQ.answer}</Text>
            </View>
          )}

          <View style={styles.buzzActions}>
            <TouchableOpacity onPress={() => handleResult('correct')} style={[styles.buzzActionBtn, styles.correctBtn]}>
              <Text style={styles.buzzActionText}>✅  Bonne réponse</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleResult('wrong')} style={[styles.buzzActionBtn, styles.wrongBtn]}>
              <Text style={styles.buzzActionText}>❌  Mauvaise</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleResult('skip')} style={[styles.buzzActionBtn, styles.skipBtn]}>
              <Text style={styles.buzzActionText}>⏭  Passer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Launch button */}
      {phase === 'waiting' && (
        <View style={styles.launchArea}>
          <TouchableOpacity onPress={startCountdown} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient colors={[BUZZ_COLOR, BUZZ_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.launchGradient}>
              <Text style={styles.launchText}>⚡  LANCER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Active bar */}
      {phase === 'active' && (
        <View style={styles.activeBar}>
          <Text style={styles.activeBarText}>🎯  BUZZEZ !</Text>
        </View>
      )}

      {/* Quit modal */}
      <Modal transparent visible={showQuit} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quitter la partie ?</Text>
            <Text style={styles.modalSub}>Les scores ne seront pas sauvegardés.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowQuit(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Continuer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleQuit} style={styles.modalQuit}>
                <Text style={styles.modalQuitText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0815' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 32,
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    gap: spacing.sm, backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  quitBtn:  { padding: 8 },
  quitText: { color: colors.textMuted, fontSize: 18, fontWeight: '700' },

  scoreRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  scoreChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, borderWidth: 1.5,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  chipDot:   { width: 8, height: 8, borderRadius: 4 },
  chipName:  { fontSize: 11, fontWeight: '700', color: colors.text, maxWidth: 52 },
  chipScore: { fontSize: 13, fontWeight: '900' },

  roundBadge: {
    backgroundColor: BUZZ_COLOR + '25', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: BUZZ_COLOR + '60',
  },
  roundText: { fontSize: 11, fontWeight: '800', color: BUZZ_LIGHT },

  questionCard: {
    backgroundColor: '#161616', borderBottomWidth: 1, borderBottomColor: '#222',
    padding: spacing.md, borderLeftWidth: 3,
    minHeight: 90, justifyContent: 'center',
  },
  modePill: {
    alignSelf: 'flex-start', borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8,
  },
  modePillText:  { fontSize: 11, fontWeight: '700' },
  qText:         { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 22 },
  qArtist:       { fontSize: 18, fontWeight: '900', color: colors.text },
  qYear:         { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  qHint:         { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  qInstruction:  { fontSize: 12, color: BUZZ_LIGHT, marginTop: 6, fontWeight: '700', letterSpacing: 0.5 },

  zonesContainer: { flex: 1 },
  zoneRow: { flex: 1, flexDirection: 'row' },
  zone: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    margin: 3, borderRadius: 8,
  },
  zoneName: {
    fontSize: 22, fontWeight: '900', color: '#fff',
    textShadowColor: '#0006', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 },
  },

  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#000A',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  countText: {
    fontSize: 120, fontWeight: '900', color: '#fff',
    textShadowColor: BUZZ_COLOR, textShadowRadius: 40, textShadowOffset: { width: 0, height: 0 },
  },

  buzzPanel: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center',
    justifyContent: 'center', zIndex: 20, padding: spacing.lg,
  },
  buzzPanelEmoji: { fontSize: 48, marginBottom: 4 },
  buzzPanelName:  { fontSize: 40, fontWeight: '900', color: '#fff', textShadowColor: '#0008', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } },
  buzzPanelSub:   { fontSize: 16, fontWeight: '600', color: '#ffffffCC', marginBottom: spacing.md },

  timerCircle: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0006', marginBottom: spacing.md,
  },
  timerNumber: { fontSize: 30, fontWeight: '900' },

  revealBtn: {
    backgroundColor: '#ffffff22', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: 6, borderWidth: 1, borderColor: '#ffffff33',
  },
  revealText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  answerBox: {
    backgroundColor: '#000000AA', borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: '#ffffff44',
  },
  answerText: { fontSize: 15, fontWeight: '800', color: '#fff', textAlign: 'center' },

  buzzActions:    { gap: spacing.sm, width: '80%', maxWidth: 300, marginTop: spacing.sm },
  buzzActionBtn:  { borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: '#ffffff40' },
  correctBtn: { backgroundColor: '#16a34a' },
  wrongBtn:   { backgroundColor: '#991b1b' },
  skipBtn:    { backgroundColor: '#ffffff22' },
  buzzActionText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  launchArea: { padding: spacing.lg, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222' },
  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden',
    shadowColor: BUZZ_COLOR, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  launchGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  launchText:     { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 3 },

  activeBar: {
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222',
    paddingVertical: spacing.md + 4, alignItems: 'center',
  },
  activeBarText: { fontSize: 18, fontWeight: '900', color: BUZZ_LIGHT, letterSpacing: 3 },

  modalBg: { flex: 1, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.xl, width: '80%', maxWidth: 320,
    borderWidth: 1, borderColor: colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  modalSub:   { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  modalBtns:  { flexDirection: 'row', gap: spacing.sm },
  modalCancel: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: colors.text },
  modalQuit: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: BUZZ_COLOR, alignItems: 'center',
  },
  modalQuitText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Final screen
  finalContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl,
  },
  finalTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 4, marginBottom: 4 },
  finalSub:   { fontSize: 13, color: BUZZ_LIGHT, marginBottom: spacing.xl },
  finalList:  { width: '100%', maxWidth: 380, gap: spacing.sm, marginBottom: spacing.xl },
  finalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#161616', borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: '#333',
  },
  finalRank:  { fontSize: 22, width: 32, textAlign: 'center' },
  finalDot:   { width: 14, height: 14, borderRadius: 7 },
  finalName:  { flex: 1, fontSize: 16, fontWeight: '700', color: '#fff' },
  finalScore: { fontSize: 20, fontWeight: '900' },
  retourBtn: {
    borderRadius: radius.full, overflow: 'hidden', width: '100%', maxWidth: 300,
    shadowColor: BUZZ_COLOR, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  retourGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  retourText:     { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
