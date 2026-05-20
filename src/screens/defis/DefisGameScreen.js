import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { DEFI_CATEGORIES, pickDefi, pickConsequence } from '../../data/defisData';

const ACCENT       = '#F97316';
const ACCENT_LIGHT = '#FED7AA';
const ACCENT_DARK  = '#EA580C';

export default function DefisGameScreen({ route, navigation }) {
  const { roundCount, playerNames, activeCategories } = route.params;

  const [round,             setRound]             = useState(0);
  const [phase,             setPhase]             = useState('spin');
  const [displayedName,     setDisplayedName]     = useState(playerNames[0]);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const [currentChallenge,  setCurrentChallenge]  = useState(null);
  const [currentConsequence,setCurrentConsequence]= useState('');
  const [playerStats,       setPlayerStats]       = useState(
    Object.fromEntries(playerNames.map(n => [n, { completed: 0, refused: 0 }]))
  );

  const cardAnim      = useRef(new Animated.Value(0)).current;
  const spinTimeout   = useRef(null);
  const mountedRef    = useRef(true);

  useEffect(() => {
    startSpin();
    return () => {
      mountedRef.current = false;
      clearTimeout(spinTimeout.current);
    };
  }, []);

  const startSpin = () => {
    cardAnim.setValue(0);
    setPhase('spin');

    let ticks = 0;
    const maxTicks = 22;

    const tick = (delay) => {
      if (!mountedRef.current) return;
      setDisplayedName(playerNames[Math.floor(Math.random() * playerNames.length)]);
      ticks++;
      if (ticks < maxTicks) {
        spinTimeout.current = setTimeout(() => tick(Math.min(delay * 1.18, 380)), delay);
      } else {
        const finalIdx = Math.floor(Math.random() * playerNames.length);
        setSelectedPlayerIdx(finalIdx);
        setDisplayedName(playerNames[finalIdx]);
        const challenge = pickDefi(activeCategories);
        setCurrentChallenge(challenge);
        spinTimeout.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setPhase('challenge');
          Animated.spring(cardAnim, { toValue: 1, tension: 45, friction: 9, useNativeDriver: true }).start();
        }, 450);
      }
    };

    tick(60);
  };

  const handleComplete = () => {
    const name = playerNames[selectedPlayerIdx];
    setPlayerStats(prev => ({ ...prev, [name]: { ...prev[name], completed: prev[name].completed + 1 } }));
    advanceRound();
  };

  const handleRefuse = () => {
    const name = playerNames[selectedPlayerIdx];
    setPlayerStats(prev => ({ ...prev, [name]: { ...prev[name], refused: prev[name].refused + 1 } }));
    setCurrentConsequence(pickConsequence());
    setPhase('consequence');
  };

  const advanceRound = () => {
    if (round + 1 >= roundCount) {
      setRound(r => r + 1);
      setPhase('final');
    } else {
      setRound(r => r + 1);
      setTimeout(() => { if (mountedRef.current) startSpin(); }, 300);
    }
  };

  const catInfo = currentChallenge
    ? DEFI_CATEGORIES.find(c => c.id === currentChallenge.cat)
    : null;

  // ── SPIN ──────────────────────────────────────────────────────────────
  if (phase === 'spin') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Défi {round + 1} / {roundCount}</Text>
        <View style={[styles.spinCard, { borderColor: ACCENT + '50' }]}>
          <Text style={styles.spinDice}>🎰</Text>
          <Text style={styles.spinName}>{displayedName}</Text>
          <Text style={styles.spinHint}>Sélection en cours…</Text>
        </View>
      </LinearGradient>
    );
  }

  // ── CHALLENGE ─────────────────────────────────────────────────────────
  if (phase === 'challenge') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Défi {round + 1} / {roundCount}</Text>

        <Text style={styles.playerSelected}>🎯 {playerNames[selectedPlayerIdx]}</Text>

        {catInfo && (
          <View style={[styles.catBadge, { backgroundColor: catInfo.color + '22', borderColor: catInfo.color + '55' }]}>
            <Text style={styles.catBadgeEmoji}>{catInfo.emoji}</Text>
            <Text style={[styles.catBadgeName, { color: catInfo.color }]}>{catInfo.name}</Text>
          </View>
        )}

        <Animated.View style={[styles.challengeCard, { opacity: cardAnim, transform: [{ scale: cardAnim }] }]}>
          <Text style={styles.challengeText}>{currentChallenge?.text}</Text>
        </Animated.View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleRefuse} style={styles.refuseBtn} activeOpacity={0.82}>
            <Text style={styles.refuseBtnText}>✗  Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleComplete} style={styles.acceptBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.acceptInner}>
              <Text style={styles.acceptBtnText}>✓  Défi réussi !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ── CONSEQUENCE ───────────────────────────────────────────────────────
  if (phase === 'consequence') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.consequenceTitle}>❌ Défi refusé !</Text>
        <View style={[styles.consequenceCard, { borderColor: '#EF444450' }]}>
          <Text style={styles.consequenceLabel}>Conséquence :</Text>
          <Text style={styles.consequenceText}>{currentConsequence}</Text>
        </View>
        <TouchableOpacity onPress={advanceRound} style={styles.nextBtn} activeOpacity={0.85}>
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextInner}>
            <Text style={styles.nextBtnText}>
              {round + 1 >= roundCount ? '🏆 Voir les résultats' : 'Défi suivant →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── FINAL ─────────────────────────────────────────────────────────────
  const sorted = [...playerNames].sort(
    (a, b) => (playerStats[b].completed - playerStats[a].completed)
  );
  const medals = ['🥇', '🥈', '🥉'];
  const totalCompleted = Object.values(playerStats).reduce((s, v) => s + v.completed, 0);
  const totalRefused   = Object.values(playerStats).reduce((s, v) => s + v.refused, 0);

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.finalScroll}>
        <Text style={styles.finalTitle}>🏆 Résultats finaux</Text>
        <Text style={styles.finalSub}>
          {totalCompleted} défis réussis · {totalRefused} refusés
        </Text>

        {sorted.map((name, idx) => {
          const stat = playerStats[name];
          return (
            <View key={name} style={[styles.finalRow, idx === 0 && styles.finalRowFirst]}>
              <Text style={styles.finalMedal}>{medals[idx] ?? `${idx + 1}.`}</Text>
              <Text style={styles.finalName}>{name}</Text>
              <View style={styles.finalCounts}>
                <Text style={styles.finalOk}>✓ {stat.completed}</Text>
                <Text style={styles.finalNo}>✗ {stat.refused}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.finalBtns}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.replayBtn} activeOpacity={0.85}>
            <Text style={styles.replayBtnText}>🔄 Rejouer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.menuInner}>
              <Text style={styles.menuBtnText}>Retour au menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  fullCenter:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
                 ...Platform.select({ web: { height: '100vh' } }) },

  roundBadge: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: spacing.xl,
    fontSize: 13, fontWeight: '700', color: ACCENT_LIGHT,
    backgroundColor: ACCENT + '22', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: ACCENT + '40',
  },

  // SPIN
  spinCard: {
    width: '100%', maxWidth: 340, borderRadius: radius.xl,
    borderWidth: 2, padding: spacing.xl * 1.5,
    alignItems: 'center', backgroundColor: colors.card,
  },
  spinDice: { fontSize: 56, marginBottom: spacing.md },
  spinName: { fontSize: 36, fontWeight: '900', color: colors.text, textAlign: 'center' },
  spinHint: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  // CHALLENGE
  playerSelected: {
    fontSize: 28, fontWeight: '900', color: colors.text,
    marginBottom: spacing.sm, textAlign: 'center',
  },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, marginBottom: spacing.lg,
  },
  catBadgeEmoji: { fontSize: 16 },
  catBadgeName:  { fontSize: 13, fontWeight: '700' },

  challengeCard: {
    width: '100%', maxWidth: 360, backgroundColor: colors.card,
    borderRadius: radius.xl, borderWidth: 1, borderColor: ACCENT + '40',
    padding: spacing.xl, marginBottom: spacing.xl,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  challengeText: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    textAlign: 'center', lineHeight: 30,
  },

  actionRow: { flexDirection: 'row', gap: spacing.md, width: '100%', maxWidth: 360 },
  refuseBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: '#EF444466',
  },
  refuseBtnText: { color: '#FCA5A5', fontSize: 15, fontWeight: '700' },
  acceptBtn:   { flex: 2, borderRadius: radius.lg, overflow: 'hidden' },
  acceptInner: { paddingVertical: spacing.md, alignItems: 'center' },
  acceptBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },

  // CONSEQUENCE
  consequenceTitle: { fontSize: 32, fontWeight: '900', color: '#FCA5A5', marginBottom: spacing.lg },
  consequenceCard: {
    width: '100%', maxWidth: 340, backgroundColor: '#EF444415',
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.xl,
    marginBottom: spacing.xl, alignItems: 'center',
  },
  consequenceLabel: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  consequenceText:  { fontSize: 22, fontWeight: '800', color: '#FCA5A5', textAlign: 'center' },
  nextBtn:    { width: '100%', maxWidth: 340, borderRadius: radius.full, overflow: 'hidden' },
  nextInner:  { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },

  // FINAL
  finalScroll: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: 60, alignItems: 'center',
  },
  finalTitle: { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  finalSub:   { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl, fontStyle: 'italic' },

  finalRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 360,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  finalRowFirst: { borderColor: ACCENT + '60', backgroundColor: ACCENT + '12' },
  finalMedal: { fontSize: 22, width: 36 },
  finalName:  { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  finalCounts: { flexDirection: 'row', gap: spacing.sm },
  finalOk:  { fontSize: 14, fontWeight: '700', color: '#34D399' },
  finalNo:  { fontSize: 14, fontWeight: '700', color: '#FCA5A5' },

  finalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%', maxWidth: 360 },
  replayBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  replayBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  menuBtn:    { flex: 2, borderRadius: radius.full, overflow: 'hidden' },
  menuInner:  { paddingVertical: spacing.md + 2, alignItems: 'center' },
  menuBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
