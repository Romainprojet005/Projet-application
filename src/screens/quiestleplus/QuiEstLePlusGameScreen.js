import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { selectPrompts } from '../../data/quiEstLePlusPrompts';
import { OB_BG } from '../../theme/obsidian';

const ACCENT       = '#F97316';
const ACCENT_LIGHT = '#FED7AA';
const ACCENT_DARK  = '#C2410C';

// Phases : prompt → voting → reveal → (next | final)

export default function QuiEstLePlusGameScreen({ route, navigation }) {
  const { roundCount = 10, playerNames = [], categoryId = 'all' } = route.params || {};

  const [prompts]          = useState(() => selectPrompts(roundCount, categoryId));
  const [roundIdx, setRoundIdx]         = useState(0);
  const [phase, setPhase]               = useState('prompt');
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votes, setVotes]               = useState([]);
  const [scores, setScores]             = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.92);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => { animateIn(); }, [phase, roundIdx]);

  const currentPrompt = prompts[roundIdx];
  const currentVoter  = playerNames[currentVoterIdx];
  const isLastVoter   = currentVoterIdx === playerNames.length - 1;

  const handleVote = (votedFor) => {
    const newVotes = [...votes, { voter: currentVoter, votedFor }];
    if (isLastVoter) {
      // Tous ont voté → révèle
      const tally = {};
      playerNames.forEach(n => { tally[n] = 0; });
      newVotes.forEach(v => { tally[v.votedFor] = (tally[v.votedFor] || 0) + 1; });
      const maxVotes = Math.max(...Object.values(tally));
      const losers   = Object.entries(tally).filter(([, c]) => c === maxVotes).map(([n]) => n);
      const newScores = { ...scores };
      losers.forEach(n => { newScores[n] = (newScores[n] || 0) + maxVotes; });
      setScores(newScores);
      setVotes(newVotes);
      setPhase('reveal');
    } else {
      setVotes(newVotes);
      setCurrentVoterIdx(i => i + 1);
    }
  };

  const handleNext = () => {
    if (roundIdx + 1 >= prompts.length) {
      setPhase('final');
    } else {
      setRoundIdx(i => i + 1);
      setCurrentVoterIdx(0);
      setVotes([]);
      setPhase('prompt');
    }
  };

  const tally = {};
  if (phase === 'reveal') {
    playerNames.forEach(n => { tally[n] = 0; });
    votes.forEach(v => { tally[v.votedFor] = (tally[v.votedFor] || 0) + 1; });
  }
  const maxVotes = phase === 'reveal' ? Math.max(...Object.values(tally)) : 0;
  const losers   = phase === 'reveal' ? Object.entries(tally).filter(([, c]) => c === maxVotes).map(([n]) => n) : [];

  if (phase === 'final') {
    const sorted = [...playerNames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll}>
          <Animated.View style={[styles.finalCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.finalEmoji}>🏆</Text>
            <Text style={styles.finalTitle}>RÉSULTATS FINAUX</Text>
            <Text style={styles.finalSub}>Gorgées bues par joueur</Text>
            <View style={styles.podium}>
              {sorted.map((name, i) => (
                <View key={name} style={[styles.podiumRow, i === 0 && styles.podiumFirst]}>
                  <Text style={styles.podiumRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</Text>
                  <Text style={[styles.podiumName, i === 0 && styles.podiumNameFirst]}>{name}</Text>
                  <View style={[styles.podiumBar, { width: Math.max(30, ((scores[name] || 0) / (scores[sorted[0]] || 1)) * 120) }]} />
                  <Text style={[styles.podiumScore, i === 0 && { color: ACCENT_LIGHT }]}>
                    {scores[name] || 0} 🍺
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.homeBtn} activeOpacity={0.85}>
              <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.homeBtnGrad}>
                <Text style={styles.homeBtnText}>🏠  Retour au menu</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('QuiEstLePlusSetup')}
              style={styles.replayBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.replayBtnText}>🔄  Rejouer</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (phase === 'reveal') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <Animated.View style={[styles.revealWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.revealEmoji}>🍺</Text>
          <Text style={styles.revealTitle}>
            {losers.length === 1 ? `${losers[0]} boit !` : `${losers.join(' & ')} boivent !`}
          </Text>
          <Text style={styles.revealSub}>
            {maxVotes} vote{maxVotes > 1 ? 's' : ''} reçu{maxVotes > 1 ? 's' : ''} →{' '}
            <Text style={{ color: ACCENT_LIGHT, fontWeight: '800' }}>{maxVotes} gorgée{maxVotes > 1 ? 's' : ''}</Text>
          </Text>

          <View style={styles.tallyList}>
            {[...playerNames]
              .sort((a, b) => (tally[b] || 0) - (tally[a] || 0))
              .map(name => (
                <View key={name} style={[styles.tallyRow, losers.includes(name) && styles.tallyRowLoser]}>
                  <Text style={[styles.tallyName, losers.includes(name) && { color: ACCENT_LIGHT }]}>{name}</Text>
                  <View style={styles.tallyDots}>
                    {Array.from({ length: tally[name] || 0 }).map((_, j) => (
                      <View key={j} style={styles.tallyDot} />
                    ))}
                  </View>
                  <Text style={[styles.tallyCount, losers.includes(name) && { color: ACCENT_LIGHT }]}>
                    {tally[name] || 0} 👆
                  </Text>
                </View>
              ))}
          </View>

          <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>
                {roundIdx + 1 >= prompts.length ? '🏆  Voir les résultats' : '➡️  Question suivante'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (phase === 'prompt') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <Animated.View style={[styles.promptWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{roundIdx + 1} / {prompts.length}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.quitText}>✕ Quitter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>👆  QUI EST LE PLUS…</Text>
            <Text style={styles.promptText}>{currentPrompt?.text ?? '…'}</Text>
          </View>

          <Text style={styles.voteInstruction}>
            Chaque joueur vote en secret.{'\n'}Passez le téléphone.
          </Text>

          <TouchableOpacity
            onPress={() => { setCurrentVoterIdx(0); setVotes([]); setPhase('voting'); }}
            style={styles.startVoteBtn}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startVoteBtnGrad}>
              <Text style={styles.startVoteBtnText}>🗳️  Commencer le vote</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // Phase voting
  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <Animated.View style={[styles.votingWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{roundIdx + 1} / {prompts.length}</Text>
          <Text style={styles.voterIndicator}>
            {currentVoterIdx + 1} / {playerNames.length}
          </Text>
        </View>

        <View style={[styles.voterBadge]}>
          <Text style={styles.voterBadgeLabel}>C'est au tour de</Text>
          <Text style={styles.voterBadgeName}>{currentVoter}</Text>
        </View>

        <View style={styles.promptCardSmall}>
          <Text style={styles.promptLabelSm}>👆  QUI EST LE PLUS…</Text>
          <Text style={styles.promptTextSm}>{currentPrompt?.text ?? '…'}</Text>
        </View>

        <Text style={styles.voteForLabel}>Vote pour :</Text>
        <View style={styles.voteGrid}>
          {playerNames
            .filter(n => n !== currentVoter)
            .map(name => (
              <TouchableOpacity
                key={name}
                onPress={() => handleVote(name)}
                style={styles.voteBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.voteBtnEmoji}>👤</Text>
                <Text style={styles.voteBtnName}>{name}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  // ── Prompt ───────────────────────────────────────────────────────
  promptWrap: {
    flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, justifyContent: 'center', gap: spacing.lg,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  quitText: { fontSize: 13, color: colors.textMuted },
  promptCard: {
    backgroundColor: `${ACCENT}18`, borderRadius: radius.xl,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
  },
  promptLabel: { fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: '800' },
  promptText: {
    fontSize: 28, fontWeight: '800', color: colors.text,
    textAlign: 'center', lineHeight: 38,
  },
  voteInstruction: { textAlign: 'center', fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  startVoteBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  startVoteBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startVoteBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Voting ───────────────────────────────────────────────────────
  votingWrap: {
    flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
  },
  voterIndicator: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  voterBadge: {
    backgroundColor: `${ACCENT}20`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.md, alignItems: 'center', marginVertical: spacing.md,
  },
  voterBadgeLabel: { fontSize: 12, color: colors.textSecondary, letterSpacing: 1 },
  voterBadgeName:  { fontSize: 26, fontWeight: '900', color: ACCENT_LIGHT, marginTop: 4 },
  promptCardSmall: {
    backgroundColor: `${ACCENT}10`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}25`,
    padding: spacing.md, alignItems: 'center', gap: 6, marginBottom: spacing.md,
  },
  promptLabelSm: { fontSize: 10, letterSpacing: 2.5, color: ACCENT, fontWeight: '700' },
  promptTextSm:  { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 24 },
  voteForLabel:  { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  voteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    minWidth: '45%', flex: 1,
  },
  voteBtnEmoji: { fontSize: 20 },
  voteBtnName:  { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },

  // ── Reveal ───────────────────────────────────────────────────────
  revealWrap: {
    flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, justifyContent: 'center', gap: spacing.lg,
  },
  revealEmoji: { fontSize: 72, textAlign: 'center' },
  revealTitle: { fontSize: 32, fontWeight: '900', color: ACCENT_LIGHT, textAlign: 'center', lineHeight: 40 },
  revealSub:   { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  tallyList: { gap: spacing.sm },
  tallyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm + 2,
  },
  tallyRowLoser: { backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}50` },
  tallyName:  { fontSize: 15, fontWeight: '700', color: colors.text, width: 90 },
  tallyDots:  { flexDirection: 'row', gap: 4, flex: 1 },
  tallyDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  tallyCount: { fontSize: 14, fontWeight: '800', color: colors.textMuted, minWidth: 40, textAlign: 'right' },
  nextBtn: { borderRadius: radius.full, overflow: 'hidden' },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Final ────────────────────────────────────────────────────────
  finalScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  finalCard: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
  },
  finalEmoji: { fontSize: 64 },
  finalTitle: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 3 },
  finalSub:   { fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },
  podium: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  podiumRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.sm + 2, borderWidth: 1, borderColor: colors.border,
  },
  podiumFirst: { backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}50` },
  podiumRank:  { fontSize: 20, width: 30 },
  podiumName:  { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  podiumNameFirst: { color: ACCENT_LIGHT },
  podiumBar:   { height: 6, borderRadius: 3, backgroundColor: ACCENT, opacity: 0.6 },
  podiumScore: { fontSize: 14, fontWeight: '800', color: colors.textMuted, minWidth: 50, textAlign: 'right' },
  homeBtn: { alignSelf: 'stretch', borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  homeBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  homeBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  replayBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  replayBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '700' },
});
