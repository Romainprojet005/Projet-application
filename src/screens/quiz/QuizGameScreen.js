import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';

const ZAPCOLOR = '#6366F1';
const TIME_LIMIT = 15;
const POINTS_CORRECT = 100;
const POINTS_SPEED_BONUS = 50;
const { width } = Dimensions.get('window');

// --- Timer bar ---
function TimerBar({ running, onExpire, key: timerKey }) {
  const widthAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);

  useEffect(() => {
    widthAnim.setValue(1);
    colorAnim.setValue(0);
    if (!running) return;
    animRef.current = Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: 0,
        duration: TIME_LIMIT * 1000,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: TIME_LIMIT * 1000,
        useNativeDriver: false,
      }),
    ]);
    animRef.current.start(({ finished }) => {
      if (finished) onExpire();
    });
    return () => animRef.current?.stop();
  }, [timerKey, running]);

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [ZAPCOLOR, '#F59E0B', '#EF4444'],
  });

  return (
    <View style={timerStyles.track}>
      <Animated.View
        style={[
          timerStyles.fill,
          {
            width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: bgColor,
          },
        ]}
      />
    </View>
  );
}

const timerStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  fill: { height: '100%', borderRadius: 3 },
});

// --- Answer choice button ---
function ChoiceButton({ label, index, state, onPress, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const letters = ['A', 'B', 'C', 'D'];

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  let bg = colors.card;
  let border = colors.border;
  let textColor = colors.text;
  let letterBg = colors.surface;

  if (state === 'correct') {
    bg = '#064E3B';
    border = '#10B981';
    textColor = '#6EE7B7';
    letterBg = '#10B981';
  } else if (state === 'wrong') {
    bg = '#450A0A';
    border = '#EF4444';
    textColor = '#FCA5A5';
    letterBg = '#EF4444';
  } else if (state === 'neutral') {
    bg = colors.surface;
    border = colors.border;
    textColor = colors.textMuted;
    letterBg = colors.border;
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.choice, { backgroundColor: bg, borderColor: border }]}
      >
        <View style={[styles.choiceLetter, { backgroundColor: letterBg }]}>
          <Text style={[styles.choiceLetterText, { color: state ? '#fff' : colors.textSecondary }]}>
            {letters[index]}
          </Text>
        </View>
        <Text style={[styles.choiceText, { color: textColor }]}>{label}</Text>
        {state === 'correct' && <Text style={styles.choiceIcon}>✓</Text>}
        {state === 'wrong' && <Text style={styles.choiceIcon}>✗</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// --- Final leaderboard ---
function FinalScreen({ players, scores, onPlayAgain, onMenu }) {
  const ranked = [...players]
    .map((name, i) => ({ name, score: scores[i] || 0 }))
    .sort((a, b) => b.score - a.score);

  const podiumAnim = useRef(new Animated.Value(0)).current;
  const rowAnims = useRef(ranked.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(podiumAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.stagger(
        100,
        rowAnims.map((a) =>
          Animated.spring(a, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true })
        )
      ),
    ]).start();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={['#0A0A1B', '#001A2E']} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <ScrollView contentContainerStyle={styles.finalScroll} showsVerticalScrollIndicator={true} style={Platform.OS === 'web' && { flex: 1, overflowY: 'scroll' }}>
        <Animated.View style={{ opacity: podiumAnim, transform: [{ scale: podiumAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
          <Text style={styles.finalEmoji}>✨</Text>
          <Text style={styles.finalTitle}>QUIZ TERMINÉ !</Text>
          <Text style={styles.finalSub}>Hermione Granger a parlé</Text>
        </Animated.View>

        <View style={styles.rankList}>
          {ranked.map((player, i) => (
            <Animated.View
              key={i}
              style={{
                opacity: rowAnims[i],
                transform: [
                  {
                    translateX: rowAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={i === 0 ? ['#1A1400', '#2D2200'] : ['#141428', '#1A1A35']}
                style={[styles.rankRow, i === 0 && styles.rankRowFirst]}
              >
                <Text style={styles.rankMedal}>{medals[i] || `#${i + 1}`}</Text>
                <Text style={[styles.rankName, i === 0 && { color: '#FCD34D' }]}>
                  {player.name}
                </Text>
                <View style={styles.rankScoreWrap}>
                  <Text style={[styles.rankScore, i === 0 && { color: '#FCD34D' }]}>
                    {player.score}
                  </Text>
                  <Text style={styles.rankScorePts}>pts</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <View style={styles.finalBtns}>
          <TouchableOpacity onPress={onPlayAgain} style={styles.finalBtnPrimary} activeOpacity={0.88}>
            <LinearGradient
              colors={[ZAPCOLOR, '#0369A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.finalBtnGrad}
            >
              <Text style={styles.finalBtnText}>⚡  REJOUER</Text>
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

// --- Main game screen ---
export default function QuizGameScreen({ navigation, route }) {
  const { players, questions } = route.params;
  const totalQ = questions.length;

  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'question' | 'reveal' | 'final'
  const [selected, setSelected] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [scores, setScores] = useState(Array(players.length).fill(0));
  const [pointsGained, setPointsGained] = useState(0);
  const [answerTimestamp, setAnswerTimestamp] = useState(null);
  const [imageError, setImageError] = useState(false);
  const questionStartTime = useRef(null);

  const currentPlayer = qIndex % players.length;
  const question = questions[qIndex];

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    setImageError(false);
    animateIn();
  }, [qIndex, phase]);

  const handleStartQuestion = () => {
    questionStartTime.current = Date.now();
    setPhase('question');
    setTimerKey((k) => k + 1);
    setSelected(null);
    setPointsGained(0);
  };

  const handleAnswer = (choiceIndex) => {
    if (phase !== 'question') return;
    const elapsed = (Date.now() - questionStartTime.current) / 1000;
    setSelected(choiceIndex);
    setPhase('reveal');

    let pts = 0;
    if (choiceIndex === question.answer) {
      const speedBonus = elapsed < 5 ? POINTS_SPEED_BONUS : elapsed < 10 ? 25 : 0;
      pts = POINTS_CORRECT + speedBonus;
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] = (next[currentPlayer] || 0) + pts;
        return next;
      });
    }
    setPointsGained(pts);

    // Animate points popup
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
    setSelected(-1); // -1 = pas de réponse
    setPhase('reveal');
    setPointsGained(0);
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase('final');
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setQIndex((i) => i + 1);
        setPhase('intro');
      });
    }
  };

  const getChoiceState = (index) => {
    if (phase !== 'reveal') return null;
    if (index === question.answer) return 'correct';
    if (index === selected) return 'wrong';
    return 'neutral';
  };

  if (phase === 'final') {
    return (
      <FinalScreen
        players={players}
        scores={scores}
        onPlayAgain={() => navigation.replace('QuizSetup')}
        onMenu={() => navigation.navigate('Menu')}
      />
    );
  }

  // --- INTRO phase ---
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#05050E', '#0C0A2C', '#05050E']} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
        <Animated.View
          style={[styles.introBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            style={styles.cancelTop}
          >
            <Text style={styles.cancelTopText}>✕  Quitter</Text>
          </TouchableOpacity>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {questions.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < qIndex && styles.dotDone,
                  i === qIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.questionCountLabel}>
            Question {qIndex + 1} / {totalQ}
          </Text>

          <LinearGradient
            colors={[ZAPCOLOR + '25', ZAPCOLOR + '10']}
            style={styles.introCard}
          >
            <View style={[styles.introAvatar, { borderColor: ZAPCOLOR + '60', backgroundColor: ZAPCOLOR + '20' }]}>
              <Text style={styles.introAvatarEmoji}>👤</Text>
            </View>
            <Text style={styles.introPlayerLabel}>C'est le tour de</Text>
            <Text style={[styles.introPlayerName, { color: ZAPCOLOR }]}>
              {players[currentPlayer]}
            </Text>
            <Text style={styles.introInstruction}>
              Prends le téléphone et prépare-toi !{'\n'}Tu as {TIME_LIMIT} secondes pour répondre.
            </Text>
          </LinearGradient>

          <View style={styles.scoreRow}>
            {players.map((name, i) => (
              <View key={i} style={styles.scoreChip}>
                <Text style={styles.scoreChipName}>{name.replace('Joueur ', 'J')}</Text>
                <Text style={[styles.scoreChipScore, i === currentPlayer && { color: ZAPCOLOR }]}>
                  {scores[i] || 0}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleStartQuestion} style={styles.startBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[ZAPCOLOR, '#0369A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtnGrad}
            >
              <Text style={styles.startBtnText}>⚡  JE SUIS PRÊT !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // --- QUESTION + REVEAL phases ---
  const isRevealed = phase === 'reveal';
  const wasCorrect = selected === question.answer;
  const wasTimeout = selected === -1;

  return (
    <LinearGradient colors={['#05050E', '#0C0A2C', '#05050E']} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      {/* Timer bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarPlayer}>{players[currentPlayer]}</Text>
        <Text style={styles.topBarCount}>{qIndex + 1}/{totalQ}</Text>
      </View>

      <TimerBar
        key={timerKey}
        running={phase === 'question'}
        onExpire={handleTimeout}
      />

      <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={true} style={Platform.OS === 'web' && { flex: 1, overflowY: 'scroll' }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Category badge */}
          <View style={[styles.catBadge, { borderColor: question.categoryColor + '50', backgroundColor: question.categoryColor + '15' }]}>
            <Text style={styles.catBadgeText}>{question.categoryEmoji} {question.categoryLabel}</Text>
          </View>

          {/* Question Image (catégorie Disney, etc.) */}
          {question.image && !imageError && (
            <View style={styles.questionImageContainer}>
              <Image
                key={qIndex}
                source={{ uri: question.image }}
                style={styles.questionImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          )}

          {/* Question */}
          <Text style={styles.questionText}>{question.q}</Text>

          {/* Points popup */}
          {isRevealed && (
            <Animated.View
              style={[
                styles.pointsPopup,
                {
                  opacity: pointsOpacity,
                  transform: [{ translateY: pointsAnim }],
                  backgroundColor: pointsGained > 0 ? '#10B981' : '#EF4444',
                },
              ]}
            >
              <Text style={styles.pointsPopupText}>
                {pointsGained > 0 ? `+${pointsGained} pts` : wasTimeout ? 'Temps écoulé !' : 'Raté !'}
              </Text>
            </Animated.View>
          )}

          {/* Choices */}
          <View style={styles.choices}>
            {question.choices.map((choice, i) => (
              <ChoiceButton
                key={i}
                index={i}
                label={choice}
                state={getChoiceState(i)}
                onPress={() => handleAnswer(i)}
                disabled={isRevealed}
              />
            ))}
          </View>

          {/* Reveal section */}
          {isRevealed && (
            <Animated.View style={[styles.revealBox, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={wasCorrect ? ['#064E3B', '#065F46'] : ['#450A0A', '#7F1D1D']}
                style={styles.revealBanner}
              >
                <Text style={styles.revealBannerEmoji}>
                  {wasTimeout ? '⏰' : wasCorrect ? '✅' : '❌'}
                </Text>
                <Text style={styles.revealBannerText}>
                  {wasTimeout
                    ? 'Temps écoulé !'
                    : wasCorrect
                    ? `Bravo ${players[currentPlayer]} !`
                    : `Pas tout à fait...`}
                </Text>
                {pointsGained > POINTS_CORRECT && (
                  <Text style={styles.revealSpeedBonus}>⚡ Bonus rapidité !</Text>
                )}
              </LinearGradient>

              <View style={styles.anecdoteBox}>
                <Text style={styles.anecdoteLabel}>💡 Le savais-tu ?</Text>
                <Text style={styles.anecdoteText}>{question.anecdote}</Text>
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.88}>
                <LinearGradient
                  colors={[ZAPCOLOR, '#0369A1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGrad}
                >
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  topBarPlayer: { fontSize: 13, fontWeight: '700', color: ZAPCOLOR },
  topBarCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  gameScroll: { paddingHorizontal: spacing.xl, paddingBottom: 48 },

  catBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  catBadgeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.xl,
  },

  pointsPopup: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    zIndex: 10,
  },
  pointsPopupText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  choices: { gap: spacing.sm, marginBottom: spacing.lg },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLetterText: { fontSize: 13, fontWeight: '800' },
  choiceText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  choiceIcon: { fontSize: 18 },

  revealBox: { gap: spacing.md },
  revealBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  revealBannerEmoji: { fontSize: 28 },
  revealBannerText: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
  revealSpeedBonus: { fontSize: 11, color: '#FCD34D', fontWeight: '700' },

  anecdoteBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: ZAPCOLOR + '30',
  },
  anecdoteLabel: { fontSize: 12, fontWeight: '700', color: ZAPCOLOR, marginBottom: spacing.xs },
  anecdoteText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  nextBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: ZAPCOLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: spacing.xl,
  },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 1 },

  // Intro phase
  introBox: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  cancelTop: { alignSelf: 'flex-start', marginBottom: spacing.md },
  cancelTopText: { fontSize: 13, color: colors.danger, fontWeight: '600' },

  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    marginBottom: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.success },
  dotActive: { backgroundColor: ZAPCOLOR, width: 12, height: 12, borderRadius: 6 },

  questionCountLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.xl,
    letterSpacing: 1,
  },

  introCard: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ZAPCOLOR + '30',
    marginBottom: spacing.xl,
  },
  introAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  introAvatarEmoji: { fontSize: 38 },
  introPlayerLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  introPlayerName: { fontSize: 32, fontWeight: '900', marginBottom: spacing.md },
  introInstruction: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  scoreChip: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scoreChipName: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  scoreChipScore: { fontSize: 16, fontWeight: '900', color: colors.text },

  startBtn: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: ZAPCOLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  startBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 2 },

  // Question image
  questionImageContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(232,121,249,0.3)',
  },
  questionImage: {
    width: '100%',
    height: 200,
  },

  // Final screen
  finalScroll: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
    alignItems: 'center',
  },
  finalEmoji: { fontSize: 72, textAlign: 'center', marginBottom: spacing.md },
  finalTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
  finalSub: {
    fontSize: 13,
    color: ZAPCOLOR,
    letterSpacing: 2,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  rankList: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rankRowFirst: { borderColor: '#F59E0B50' },
  rankMedal: { fontSize: 26 },
  rankName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScoreWrap: { alignItems: 'flex-end' },
  rankScore: { fontSize: 26, fontWeight: '900', color: colors.text },
  rankScorePts: { fontSize: 11, color: colors.textMuted },

  finalBtns: { width: '100%', gap: spacing.md },
  finalBtnPrimary: {
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: ZAPCOLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  finalBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  finalBtnText: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  finalBtnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  finalBtnSecondaryText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
