import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, Pressable, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { PLAYER_COLORS } from './BuzzerSetupScreen';

const BUZZ_COLOR = '#DC2626';
const BUZZ_DARK  = '#B91C1C';
const BUZZ_LIGHT = '#FCA5A5';

export default function BuzzerGameScreen({ navigation, route }) {
  const { playerNames, playerColors } = route.params;
  const n = playerNames.length;

  const [phase, setPhase]     = useState('waiting'); // waiting | countdown | active | buzzed
  const [scores, setScores]   = useState(Object.fromEntries(playerNames.map(p => [p, 0])));
  const [round, setRound]     = useState(1);
  const [winner, setWinner]   = useState(null);
  const [count, setCount]     = useState(3);
  const [showQuit, setShowQuit] = useState(false);

  const alreadyBuzzed = useRef(false);
  const countdownTimer = useRef(null);
  const countAnim = useRef(new Animated.Value(1)).current;
  const winnerAnim = useRef(new Animated.Value(0)).current;
  const zonesOpacity = useRef(new Animated.Value(0.35)).current;

  // Build rows of player indices
  const rows = [];
  for (let i = 0; i < n; i += 2) {
    rows.push([i, i + 1].filter(j => j < n));
  }

  // Cleanup on unmount
  useEffect(() => () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  }, []);

  const animateCount = useCallback(() => {
    countAnim.setValue(1.8);
    Animated.spring(countAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }, [countAnim]);

  const startCountdown = useCallback(() => {
    alreadyBuzzed.current = false;
    setWinner(null);
    setCount(3);
    setPhase('countdown');
    zonesOpacity.setValue(0.35);

    let c = 3;
    animateCount();

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

  const handleBuzz = useCallback((idx) => {
    if (phase !== 'active') return;
    if (alreadyBuzzed.current) return;
    alreadyBuzzed.current = true;

    setWinner(idx);
    setPhase('buzzed');
    winnerAnim.setValue(0);
    Animated.spring(winnerAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
  }, [phase, winnerAnim]);

  const handleResult = useCallback((result) => {
    if (result === 'correct') {
      setScores(prev => ({ ...prev, [playerNames[winner]]: prev[playerNames[winner]] + 1 }));
    }
    setRound(r => r + 1);
    setPhase('waiting');
    setWinner(null);
  }, [playerNames, winner]);

  const handleQuit = useCallback(() => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    navigation.goBack();
  }, [navigation]);

  const maxScore = Math.max(...Object.values(scores));

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowQuit(true)} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.scoreRow}>
          {playerNames.map((name, i) => (
            <View
              key={i}
              style={[
                styles.scoreChip,
                { borderColor: playerColors[i] },
                scores[name] === maxScore && maxScore > 0 && { backgroundColor: playerColors[i] + '30' },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: playerColors[i] }]} />
              <Text style={styles.chipName} numberOfLines={1}>{name}</Text>
              <Text style={[styles.chipScore, { color: playerColors[i] }]}>{scores[name]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>Q.{round}</Text>
        </View>
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
      {(phase === 'waiting') && (
        <View style={styles.launchArea}>
          <TouchableOpacity onPress={startCountdown} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[BUZZ_COLOR, BUZZ_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
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
  container: { flex: 1, backgroundColor: '#090909' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 32,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  quitBtn: { padding: 8 },
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
  roundText: { fontSize: 12, fontWeight: '800', color: BUZZ_LIGHT },

  zonesContainer: { flex: 1 },
  zoneRow: { flex: 1, flexDirection: 'row' },
  zone: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    margin: 3, borderRadius: 8,
  },
  zoneName: { fontSize: 22, fontWeight: '900', color: '#fff', textShadowColor: '#0006', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000A',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  countText: { fontSize: 120, fontWeight: '900', color: '#fff', textShadowColor: BUZZ_COLOR, textShadowRadius: 40, textShadowOffset: { width: 0, height: 0 } },

  buzzPanel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20, padding: spacing.xl,
  },
  buzzPanelEmoji: { fontSize: 64, marginBottom: spacing.sm },
  buzzPanelName:  { fontSize: 48, fontWeight: '900', color: '#fff', textShadowColor: '#0008', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } },
  buzzPanelSub:   { fontSize: 18, fontWeight: '600', color: '#ffffffCC', marginBottom: spacing.xl },
  buzzActions:    { gap: spacing.sm, width: '80%', maxWidth: 300 },
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
  launchText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 3 },

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
});
