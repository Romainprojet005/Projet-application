import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';

const ROSE = '#F43F5E';
const ROSE_DARK = '#881337';
const ROSE_LIGHT = '#FDA4AF';
const BG = OB_BG;

function buildRounds(players, questions) {
  const pairs = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length; j++) {
      if (i !== j) pairs.push([i, j]);
    }
  }
  return questions.map((question, idx) => ({
    guesser: pairs[idx % pairs.length][0],
    subject: pairs[idx % pairs.length][1],
    question,
  }));
}

function getCompatibilityEmoji(pct) {
  if (pct >= 80) return '💝';
  if (pct >= 60) return '🤝';
  if (pct >= 40) return '🌱';
  return '💔';
}

function getCompatibilityLabel(pct) {
  if (pct >= 80) return 'Vous vous connaissez parfaitement !';
  if (pct >= 60) return 'Vous vous connaissez bien !';
  if (pct >= 40) return 'Vous avez encore des surprises à vous faire...';
  return 'Il y a des choses à (re)découvrir ensemble !';
}

export default function AmitieGameScreen({ navigation, route }) {
  const { players, mode, questions } = route.params;
  const rounds = useMemo(() => buildRounds(players, questions), []);

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'reveal' | 'results'
  const [scores, setScores] = useState(
    Object.fromEntries(players.map((_, i) => [i, 0]))
  );
  const [lastResult, setLastResult] = useState(null); // null | 'correct' | 'wrong'

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;

  const animateCardIn = () => {
    cardOpacity.setValue(0);
    cardSlide.setValue(30);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const animateCardOut = (callback) => {
    Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      callback()
    );
  };

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  useEffect(() => {
    animateCardIn();
  }, [currentRound, phase]);

  const handleReveal = () => {
    animateCardOut(() => setPhase('reveal'));
  };

  const handleAnswer = (correct) => {
    const round = rounds[currentRound];
    const newScores = { ...scores };
    if (correct) newScores[round.guesser] = (newScores[round.guesser] || 0) + 1;
    setScores(newScores);
    setLastResult(correct ? 'correct' : 'wrong');
    animateFeedback();

    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) {
        animateCardOut(() => setPhase('results'));
      } else {
        animateCardOut(() => {
          setCurrentRound(currentRound + 1);
          setPhase('question');
          setLastResult(null);
        });
      }
    }, 900);
  };

  if (phase === 'results') {
    return (
      <ResultsScreen
        players={players}
        scores={scores}
        rounds={rounds}
        mode={mode}
        navigation={navigation}
        route={route}
      />
    );
  }

  const round = rounds[currentRound];
  const guesserName = players[round.guesser];
  const subjectName = players[round.subject];
  const questionText = round.question.question.replace('{nom}', subjectName);
  const progress = currentRound / rounds.length;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: ROSE },
          ]}
        />
      </View>

      <View style={styles.inner}>
        {/* Top info */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
            <Text style={styles.quitBtnText}>✕ Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.roundCounter}>
            {currentRound + 1} / {rounds.length}
          </Text>
        </View>

        {/* Who plays */}
        <View style={styles.playersBar}>
          <View style={[styles.playerChip, { backgroundColor: ROSE + '33', borderColor: ROSE + '66' }]}>
            <Text style={styles.playerChipRole}>🔍 Devine</Text>
            <Text style={[styles.playerChipName, { color: ROSE_LIGHT }]}>{guesserName}</Text>
          </View>
          <Text style={styles.arrowText}>→</Text>
          <View style={[styles.playerChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.playerChipRole}>🎯 Sujet</Text>
            <Text style={[styles.playerChipName, { color: colors.text }]}>{subjectName}</Text>
          </View>
        </View>

        {/* Question card */}
        <Animated.View
          style={[
            styles.questionCard,
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <LinearGradient
            colors={mode === 'adulte' ? ['#3D0A00', '#1A0400'] : ['#2D001A', '#1A000F']}
            style={styles.questionCardInner}
          >
            <Text style={styles.questionEmoji}>
              {mode === 'couple' ? '💑' : mode === 'adulte' ? '🔥' : '🤝'}
            </Text>
            <Text style={styles.questionText}>{questionText}</Text>
          </LinearGradient>
        </Animated.View>

        {phase === 'question' && (
          <View style={styles.actionArea}>
            <Text style={styles.instructionText}>
              {guesserName}, donne ta réponse à voix haute...
            </Text>
            <TouchableOpacity onPress={handleReveal}>
              <LinearGradient
                colors={[ROSE, ROSE_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.revealBtn}
              >
                <Text style={styles.revealBtnText}>
                  👁 Voir la réponse de {subjectName}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'reveal' && (
          <View style={styles.actionArea}>
            {lastResult === null ? (
              <>
                <Text style={styles.instructionText}>
                  {subjectName}, révèle ta vraie réponse !
                </Text>
                <View style={styles.answerBtns}>
                  <TouchableOpacity
                    style={[styles.answerBtn, styles.correctBtn]}
                    onPress={() => handleAnswer(true)}
                  >
                    <Text style={styles.answerBtnEmoji}>✓</Text>
                    <Text style={styles.answerBtnText}>Bonne réponse !</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerBtn, styles.wrongBtn]}
                    onPress={() => handleAnswer(false)}
                  >
                    <Text style={styles.answerBtnEmoji}>✗</Text>
                    <Text style={styles.answerBtnText}>Pas du tout...</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Animated.View
                style={[styles.feedbackBanner, { transform: [{ scale: feedbackScale }] }]}
              >
                <LinearGradient
                  colors={
                    lastResult === 'correct'
                      ? [colors.success + 'CC', colors.success + '88']
                      : [colors.danger + 'CC', colors.danger + '88']
                  }
                  style={styles.feedbackBannerInner}
                >
                  <Text style={styles.feedbackEmoji}>
                    {lastResult === 'correct' ? '🎉' : '😅'}
                  </Text>
                  <Text style={styles.feedbackText}>
                    {lastResult === 'correct' ? 'Bien joué !' : 'Raté !'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        )}
      </View>

      <View style={styles.lilouWrap} pointerEvents="none">
        <Text style={styles.lilouText}>𝓛𝓘𝓛𝓞𝓤𝓣𝓡𝓔</Text>
      </View>
    </LinearGradient>
  );
}

function ResultsScreen({ players, scores, rounds, mode, navigation, route }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalCorrect = Object.values(scores).reduce((a, b) => a + b, 0);
  const compatibility = Math.round((totalCorrect / rounds.length) * 100);
  const emoji = getCompatibilityEmoji(compatibility);
  const label = getCompatibilityLabel(compatibility);

  const playerStats = players.map((name, i) => {
    const attempts = rounds.filter((r) => r.guesser === i).length;
    const correct = scores[i] || 0;
    const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    return { name, correct, attempts, pct };
  });

  const sorted = [...playerStats].sort((a, b) => b.correct - a.correct);

  const handleReplay = () => {
    const { players: ps, mode: m } = route.params;
    const { getQuestions } = require('../../data/amitieQuestions');
    const newQuestions = getQuestions(m, route.params.questions.length);
    navigation.replace('AmitieGame', { players: ps, mode: m, questions: newQuestions });
  };

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.resultsScroll}
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Compatibility score */}
          <View style={styles.compatCard}>
            <LinearGradient
              colors={['#2D001A', '#4A0020']}
              style={styles.compatCardInner}
            >
              <Text style={styles.compatEmoji}>{emoji}</Text>
              <Text style={styles.compatPct}>{compatibility}%</Text>
              <Text style={styles.compatTitle}>de compatibilité</Text>
              <View style={[styles.compatDivider, { backgroundColor: ROSE + '44' }]} />
              <Text style={styles.compatLabel}>{label}</Text>
            </LinearGradient>
          </View>

          {/* Leaderboard */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🏆 SCORES</Text>
            {sorted.map((stat, idx) => (
              <View key={stat.name} style={styles.scoreRow}>
                <Text style={styles.scoreRank}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                </Text>
                <Text style={styles.scoreName}>{stat.name}</Text>
                <View style={styles.scoreBarWrap}>
                  <View style={styles.scoreTrack}>
                    <View
                      style={[
                        styles.scoreFill,
                        { width: `${stat.pct}%`, backgroundColor: ROSE },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.scoreVal}>
                  {stat.correct}/{stat.attempts}
                </Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={handleReplay} style={{ marginBottom: spacing.md }}>
            <LinearGradient
              colors={[ROSE, ROSE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchBtn}
            >
              <Text style={styles.launchBtnText}>🔄 REJOUER</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            style={styles.menuBtn}
          >
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={styles.lilouWrap} pointerEvents="none">
        <Text style={styles.lilouText}>𝓛𝓘𝓛𝓞𝓤𝓣𝓡𝓔</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: spacing.lg,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  quitBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  quitBtnText: { color: colors.textMuted, fontSize: 13 },
  roundCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },

  playersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  playerChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 110,
  },
  playerChipRole: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  playerChipName: { fontSize: 16, fontWeight: '800' },
  arrowText: { fontSize: 20, color: colors.textMuted },

  questionCard: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: spacing.lg,
  },
  questionCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: ROSE + '44',
    borderRadius: radius.xl,
  },
  questionEmoji: { fontSize: 48, marginBottom: spacing.lg },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },

  actionArea: { gap: spacing.md },
  instructionText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  revealBtn: {
    paddingVertical: spacing.md + 2,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  revealBtnText: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 1 },

  answerBtns: { flexDirection: 'row', gap: spacing.sm },
  answerBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  correctBtn: {
    backgroundColor: colors.success + '22',
    borderColor: colors.success + '88',
  },
  wrongBtn: {
    backgroundColor: colors.danger + '22',
    borderColor: colors.danger + '88',
  },
  answerBtnEmoji: { fontSize: 24 },
  answerBtnText: { fontSize: 13, fontWeight: '700', color: colors.text },

  feedbackBanner: { borderRadius: radius.lg, overflow: 'hidden' },
  feedbackBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  feedbackEmoji: { fontSize: 28 },
  feedbackText: { fontSize: 20, fontWeight: '900', color: colors.text },

  // Results
  resultsScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xxl,
  },
  compatCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  compatCardInner: {
    alignItems: 'center',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: ROSE + '55',
    borderRadius: radius.xl,
  },
  compatEmoji: { fontSize: 56, marginBottom: spacing.sm },
  compatPct: {
    fontSize: 64,
    fontWeight: '900',
    color: ROSE_LIGHT,
    lineHeight: 72,
  },
  compatTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  compatDivider: { height: 1, width: '60%', marginBottom: spacing.md },
  compatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ROSE_LIGHT,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreRank: { fontSize: 18, width: 32, textAlign: 'center' },
  scoreName: { width: 80, fontSize: 14, fontWeight: '700', color: colors.text },
  scoreBarWrap: { flex: 1 },
  scoreTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 3 },
  scoreVal: {
    width: 36,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    fontWeight: '700',
  },

  launchBtn: {
    paddingVertical: spacing.md + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  launchBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
  },
  menuBtn: { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText: { fontSize: 14, color: ROSE_LIGHT, fontWeight: '600' },

  lilouWrap: {
    position: 'absolute',
    bottom: 14,
    right: 18,
    zIndex: 10,
  },
  lilouText: {
    fontSize: 20,
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
