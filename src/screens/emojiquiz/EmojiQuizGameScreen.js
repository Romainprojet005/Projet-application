import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';

const AMB      = '#F59E0B';
const AMB_DARK = '#B45309';
const AMB_LIGHT = '#FDE68A';
const BG = ['#1A0F00', '#2D1A00', '#1A0F00'];
const TIME_LIMIT = 20;

// ── Timer bar ──────────────────────────────────────────────────────
function TimerBar({ running, onExpire }) {
  const widthAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const animRef   = useRef(null);

  useEffect(() => {
    widthAnim.setValue(1);
    colorAnim.setValue(0);
    if (!running) return;
    animRef.current = Animated.parallel([
      Animated.timing(widthAnim, { toValue: 0, duration: TIME_LIMIT * 1000, useNativeDriver: false }),
      Animated.timing(colorAnim, { toValue: 1, duration: TIME_LIMIT * 1000, useNativeDriver: false }),
    ]);
    animRef.current.start(({ finished }) => { if (finished) onExpire(); });
    return () => animRef.current?.stop();
  }, [running]);

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [AMB, '#F97316', '#EF4444'],
  });

  return (
    <View style={timerStyles.track}>
      <Animated.View style={[timerStyles.fill, {
        width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        backgroundColor: bgColor,
      }]} />
    </View>
  );
}

const timerStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginHorizontal: spacing.xl, marginBottom: spacing.md },
  fill: { height: '100%', borderRadius: 3 },
});

// ── Choice button ──────────────────────────────────────────────────
function ChoiceButton({ label, state, onPress, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => { if (!disabled) Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start(); };
  const onPressOut = () => { Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start(); };

  let bg = colors.card, border = colors.border, txtColor = colors.text;
  if (state === 'correct') { bg = '#1C2E0A'; border = '#4ADE80'; txtColor = '#86EFAC'; }
  if (state === 'wrong')   { bg = '#450A0A'; border = '#EF4444'; txtColor = '#FCA5A5'; }
  if (state === 'neutral') { bg = colors.surface; border = colors.border; txtColor = colors.textMuted; }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={disabled} activeOpacity={0.85}
        style={[styles.choice, { backgroundColor: bg, borderColor: border }]}
      >
        <Text style={[styles.choiceText, { color: txtColor }]} numberOfLines={2}>{label}</Text>
        {state === 'correct' && <Text style={styles.choiceIcon}>✓</Text>}
        {state === 'wrong'   && <Text style={styles.choiceIcon}>✗</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

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
        <Animated.View style={[styles.finalHeader, { opacity: podiumAnim, transform: [{ scale: podiumAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}>
          <Text style={styles.finalEmoji}>🤩</Text>
          <Text style={styles.finalTitle}>EMOJI QUIZ TERMINÉ !</Text>
          <Text style={styles.finalSub}>Willy Wonka est fier de vous</Text>
        </Animated.View>

        <View style={styles.rankList}>
          {ranked.map((player, i) => (
            <Animated.View key={i} style={{ opacity: rowAnims[i], transform: [{ translateX: rowAnims[i].interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }}>
              <LinearGradient
                colors={i === 0 ? ['#1A1100', '#2D1E00'] : ['#141414', '#1A1A1A']}
                style={[styles.rankRow, i === 0 && styles.rankRowFirst]}
              >
                <Text style={styles.rankMedal}>{medals[i] || `#${i + 1}`}</Text>
                <Text style={[styles.rankName, i === 0 && { color: AMB_LIGHT }]}>{player.name}</Text>
                <View style={styles.rankScoreWrap}>
                  <Text style={[styles.rankScore, i === 0 && { color: AMB }]}>{player.score}</Text>
                  <Text style={styles.rankScorePts}>pts</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <View style={styles.finalBtns}>
          <TouchableOpacity onPress={onPlayAgain} style={styles.finalBtnPrimary} activeOpacity={0.88}>
            <LinearGradient colors={[AMB, AMB_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.finalBtnGrad}>
              <Text style={styles.finalBtnText}>🤩  REJOUER</Text>
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
const CAT_INFO = {
  film:         { label: 'Film',       emoji: '🎬' },
  musique:      { label: 'Musique',    emoji: '🎵' },
  serie:        { label: 'Série',      emoji: '📺' },
  personnalite: { label: 'Célébrité',  emoji: '⭐' },
};

export default function EmojiQuizGameScreen({ navigation, route }) {
  const { players, rounds } = route.params;
  const totalQ = rounds.length;

  const [qIndex,       setQIndex]       = useState(0);
  const [phase,        setPhase]        = useState('intro');
  const [selected,     setSelected]     = useState(null);
  const [timerKey,     setTimerKey]     = useState(0);
  const [scores,       setScores]       = useState(Array(players.length).fill(0));
  const [pointsGained, setPointsGained] = useState(0);

  const questionStartTime = useRef(null);
  const currentPlayer = qIndex % players.length;
  const round = rounds[qIndex];
  const correctIndex = round.choices.findIndex(c => c.id === round.id);
  const cat = CAT_INFO[round.category] || {};

  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const slideAnim     = useRef(new Animated.Value(30)).current;
  const pointsAnim    = useRef(new Animated.Value(0)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { animateIn(); }, [qIndex, phase]);

  const handleStartQuestion = () => {
    questionStartTime.current = Date.now();
    setPhase('question');
    setTimerKey(k => k + 1);
    setSelected(null);
    setPointsGained(0);
  };

  const handleAnswer = (choiceIndex) => {
    if (phase !== 'question') return;
    const elapsed = (Date.now() - questionStartTime.current) / 1000;
    setSelected(choiceIndex);
    setPhase('reveal');

    let pts = 0;
    if (choiceIndex === correctIndex) {
      const speedBonus = elapsed < 5 ? 50 : elapsed < 10 ? 25 : 0;
      pts = 100 + speedBonus;
      setScores(prev => { const next = [...prev]; next[currentPlayer] = (next[currentPlayer] || 0) + pts; return next; });
    }
    setPointsGained(pts);

    pointsAnim.setValue(0);
    pointsOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(pointsAnim, { toValue: -30, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(pointsOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const handleTimeout = () => {
    if (phase !== 'question') return;
    setSelected(-1);
    setPhase('reveal');
    setPointsGained(0);
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase('final');
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setQIndex(i => i + 1);
        setPhase('intro');
      });
    }
  };

  const getChoiceState = (index) => {
    if (phase !== 'reveal') return null;
    if (index === correctIndex) return 'correct';
    if (index === selected)     return 'wrong';
    return 'neutral';
  };

  if (phase === 'final') {
    return (
      <FinalScreen
        players={players} scores={scores}
        onPlayAgain={() => navigation.replace('EmojiQuizSetup')}
        onMenu={() => navigation.navigate('Menu')}
      />
    );
  }

  // ── INTRO ────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
        <Animated.View style={[styles.introBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.cancelTop}>
            <Text style={styles.cancelTopText}>✕  Quitter</Text>
          </TouchableOpacity>

          <View style={styles.progressRow}>
            {rounds.map((_, i) => (
              <View key={i} style={[styles.dot, i < qIndex && styles.dotDone, i === qIndex && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.questionCountLabel}>Question {qIndex + 1} / {totalQ}</Text>

          <LinearGradient colors={[AMB + '25', AMB + '10']} style={[styles.introCard, { borderColor: AMB + '30' }]}>
            <View style={[styles.introAvatar, { borderColor: AMB + '60', backgroundColor: AMB + '20' }]}>
              <Text style={styles.introAvatarEmoji}>🤩</Text>
            </View>
            <Text style={styles.introPlayerLabel}>C'est le tour de</Text>
            <Text style={[styles.introPlayerName, { color: AMB }]}>{players[currentPlayer]}</Text>
            <Text style={styles.introInstruction}>
              Prends le téléphone et prépare-toi !{'\n'}Tu as {TIME_LIMIT} secondes pour répondre.
            </Text>
          </LinearGradient>

          <View style={styles.scoreRow}>
            {players.map((name, i) => (
              <View key={i} style={styles.scoreChip}>
                <Text style={styles.scoreChipName}>{name.length > 7 ? name.slice(0, 7) + '…' : name}</Text>
                <Text style={[styles.scoreChipScore, i === currentPlayer && { color: AMB }]}>{scores[i] || 0}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleStartQuestion} style={styles.startBtn} activeOpacity={0.88}>
            <LinearGradient colors={[AMB, AMB_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>🤩  JE SUIS PRÊT !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── QUESTION + REVEAL ────────────────────────────────────────────
  const isRevealed = phase === 'reveal';
  const wasCorrect = selected === correctIndex;
  const wasTimeout = selected === -1;

  return (
    <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <View style={styles.topBar}>
        <Text style={[styles.topBarPlayer, { color: AMB }]}>{players[currentPlayer]}</Text>
        <Text style={styles.topBarCount}>{qIndex + 1}/{totalQ}</Text>
      </View>

      <TimerBar key={timerKey} running={phase === 'question'} onExpire={handleTimeout} />

      <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { flex: 1 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <View style={[styles.catBadge, { borderColor: AMB + '50', backgroundColor: AMB + '15' }]}>
            <Text style={styles.catBadgeText}>{cat.emoji}  {cat.label}</Text>
          </View>

          {/* Emoji display */}
          <View style={styles.emojiBox}>
            <Text style={styles.emojiText}>{round.emojis}</Text>
            <Text style={styles.emojiHint}>Que représentent ces emojis ?</Text>
          </View>

          {/* Points popup */}
          {isRevealed && (
            <Animated.View style={[styles.pointsPopup, {
              opacity: pointsOpacity,
              transform: [{ translateY: pointsAnim }],
              backgroundColor: pointsGained > 0 ? '#10B981' : '#EF4444',
            }]}>
              <Text style={styles.pointsPopupText}>
                {pointsGained > 0 ? `+${pointsGained} pts` : wasTimeout ? 'Temps écoulé !' : 'Raté !'}
              </Text>
            </Animated.View>
          )}

          {/* Choices */}
          <View style={styles.choices}>
            {round.choices.map((choice, i) => (
              <ChoiceButton
                key={i}
                label={choice.answer}
                state={getChoiceState(i)}
                onPress={() => handleAnswer(i)}
                disabled={isRevealed}
              />
            ))}
          </View>

          {/* Reveal */}
          {isRevealed && (
            <Animated.View style={[styles.revealBox, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={wasCorrect ? ['#064E3B', '#065F46'] : ['#450A0A', '#7F1D1D']}
                style={styles.revealBanner}
              >
                <Text style={styles.revealBannerEmoji}>
                  {wasTimeout ? '⏰' : wasCorrect ? '✅' : '❌'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.revealBannerText}>
                    {wasTimeout
                      ? 'Temps écoulé !'
                      : wasCorrect
                      ? `Bravo ${players[currentPlayer]} !`
                      : `C'était : ${round.answer}`}
                  </Text>
                  {pointsGained > 100 && (
                    <Text style={styles.revealSpeedBonus}>⚡ Bonus rapidité !</Text>
                  )}
                </View>
              </LinearGradient>

              <View style={styles.hintBox}>
                <Text style={styles.hintLabel}>💡 Indice</Text>
                <Text style={styles.hintText}>{round.hint}</Text>
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.88}>
                <LinearGradient colors={[AMB, AMB_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>
                    {qIndex + 1 >= totalQ
                      ? '🏆  VOIR LES RÉSULTATS'
                      : `${players[(qIndex + 1) % players.length]}  →`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
  },
  topBarPlayer: { fontSize: 13, fontWeight: '700' },
  topBarCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  gameScroll: { paddingHorizontal: spacing.xl, paddingBottom: 48 },

  catBadge: {
    alignSelf: 'center', borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 4,
    marginBottom: spacing.md, marginTop: spacing.sm,
  },
  catBadgeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  emojiBox: { alignItems: 'center', marginVertical: spacing.lg },
  emojiText: { fontSize: 72, textAlign: 'center', lineHeight: 90 },
  emojiHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, letterSpacing: 1 },

  pointsPopup: {
    position: 'absolute', top: -20, alignSelf: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full, zIndex: 10,
  },
  pointsPopupText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  choices: { gap: spacing.sm, marginBottom: spacing.lg },
  choice: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.md, gap: spacing.md, minHeight: 54,
  },
  choiceText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  choiceIcon: { fontSize: 18 },

  revealBox: { gap: spacing.md },
  revealBanner: {
    borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  revealBannerEmoji: { fontSize: 28 },
  revealBannerText: { fontSize: 15, fontWeight: '800', color: colors.text },
  revealSpeedBonus: { fontSize: 11, color: '#FCD34D', fontWeight: '700', marginTop: 2 },

  hintBox: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: AMB + '30',
  },
  hintLabel: { fontSize: 12, fontWeight: '700', color: AMB, marginBottom: spacing.xs },
  hintText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  nextBtn: {
    borderRadius: radius.full, overflow: 'hidden',
    shadowColor: AMB, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10, marginBottom: spacing.xl,
  },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 1 },

  // Intro
  introBox: { flex: 1, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: spacing.xl, alignItems: 'center' },
  cancelTop: { alignSelf: 'flex-start', marginBottom: spacing.md },
  cancelTopText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotDone: { backgroundColor: '#10B981' },
  dotActive: { backgroundColor: AMB, width: 12, height: 12, borderRadius: 6 },
  questionCountLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xl, letterSpacing: 1 },
  introCard: { width: '100%', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, marginBottom: spacing.xl },
  introAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  introAvatarEmoji: { fontSize: 38 },
  introPlayerLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  introPlayerName: { fontSize: 32, fontWeight: '900', marginBottom: spacing.md },
  introInstruction: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  scoreChip: { backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  scoreChipName: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  scoreChipScore: { fontSize: 16, fontWeight: '900', color: colors.text },
  startBtn: { width: '100%', borderRadius: radius.full, overflow: 'hidden', shadowColor: AMB, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  startBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },

  // Final
  finalScroll: { paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: spacing.xl, paddingBottom: 60, alignItems: 'center' },
  finalHeader: { alignItems: 'center', marginBottom: spacing.xl },
  finalEmoji: { fontSize: 72, textAlign: 'center', marginBottom: spacing.md },
  finalTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 3, textAlign: 'center' },
  finalSub: { fontSize: 13, color: AMB_LIGHT, letterSpacing: 2, marginTop: spacing.xs, textAlign: 'center' },
  rankList: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  rankRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rankRowFirst: { borderColor: AMB + '50' },
  rankMedal: { fontSize: 26 },
  rankName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScoreWrap: { alignItems: 'flex-end' },
  rankScore: { fontSize: 26, fontWeight: '900', color: colors.text },
  rankScorePts: { fontSize: 11, color: colors.textMuted },
  finalBtns: { width: '100%', gap: spacing.md },
  finalBtnPrimary: { borderRadius: radius.full, overflow: 'hidden', shadowColor: AMB, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  finalBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  finalBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },
  finalBtnSecondary: { backgroundColor: colors.surface, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  finalBtnSecondaryText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
