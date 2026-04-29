import React, { useRef, useEffect, useState } from 'react';
import personalityImages from '../../data/personalityImages';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Platform, ScrollView, Image, Dimensions, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';

const SCREEN_W = Dimensions.get('window').width;
const PC_IMG_W = Platform.OS === 'web' ? Math.min(380, SCREEN_W - 48) : undefined;
const IMG_HEIGHT = Math.min(Dimensions.get('window').height * 0.42, 340);

// Normalise pour comparaison (minuscules, sans accents ni ponctuation)
function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// 1 faute tolérée à partir de 5 lettres, 2 à partir de 8
function maxErrors(len) {
  if (len >= 8) return 2;
  if (len >= 5) return 1;
  return 0;
}

const ORANGE = '#F97316';
const ORANGE_DARK = '#C2410C';
const ORANGE_LIGHT = '#FED7AA';
const BG = ['#1A0A00', '#2D1500', '#1A0A00'];

// Blur (css filter) applied to a wrapper View on web — 3 levels + clear at step 4
const blurStyle = (step) => {
  if (Platform.OS !== 'web') return {};
  if (step === 1) return { filter: 'blur(24px)', transform: [{ scale: 1.3 }] };
  if (step === 2) return { filter: 'blur(14px)', transform: [{ scale: 1.18 }] };
  if (step === 3) return { filter: 'blur(6px)', transform: [{ scale: 1.07 }] };
  return {};
};

// Mosaic grid: 3 cols × 4 rows = 12 tiles
const GRID_COLS = 3;
const GRID_ROWS = 4;
const TILE_W = 100 / GRID_COLS; // 33.33%
const TILE_H = 100 / GRID_ROWS; // 25%

// Dark overlay with N randomly-placed revealed tiles (each shows the real image)
function TilesMask({ revealedTiles, source, imgError }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />
      {revealedTiles.map(tileIdx => {
        const col = tileIdx % GRID_COLS;
        const row = Math.floor(tileIdx / GRID_COLS);
        return (
          <View key={tileIdx} style={{
            position: 'absolute',
            top: `${row * TILE_H}%`, left: `${col * TILE_W}%`,
            width: `${TILE_W}%`, height: `${TILE_H}%`,
            overflow: 'hidden',
            borderWidth: 1, borderColor: ORANGE + '66',
          }}>
            {source && !imgError ? (
              <Image
                source={source}
                style={{
                  position: 'absolute',
                  top: `${-row * 100}%`, left: `${-col * 100}%`,
                  width: `${GRID_COLS * 100}%`, height: `${GRID_ROWS * 100}%`,
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: '#1A0A00' }} />
            )}
          </View>
        );
      })}
    </View>
  );
}


export default function PersonalityGameScreen({ navigation, route }) {
  const { players, rounds } = route.params;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('playing');
  const [wasCorrect, setWasCorrect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [scores, setScores] = useState(Object.fromEntries(players.map((_, i) => [i, 0])));
  const [imgError, setImgError] = useState(false);
  const [inputText, setInputText] = useState('');

  const mode = currentIdx % 2 === 0 ? 'blur' : 'tiles';
  const currentRound = rounds[currentIdx];
  const currentPersonality = currentRound.personality;
  const currentPlayer = players[currentIdx % players.length];

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const imgOpacity = useRef(new Animated.Value(1)).current;

  const animateCardIn = () => {
    cardOpacity.setValue(0);
    cardSlide.setValue(30);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  useEffect(() => { animateCardIn(); setInputText(''); }, [currentIdx, step]);

  const goToNext = () => {
    if (currentIdx + 1 >= rounds.length) {
      setPhase('results');
    } else {
      setCurrentIdx(i => i + 1);
      setStep(1);
      setPhase('playing');
      setWasCorrect(null);
      setSelectedId(null);
      setImgError(false);
    }
  };

  const handleTextSubmit = () => {
    if (phase !== 'playing' || !inputText.trim()) return;
    const inputNorm = normalize(inputText);
    const correctNorm = normalize(currentPersonality.name);
    const lastWord = normalize(currentPersonality.name.split(' ').pop());
    const correct =
      levenshtein(inputNorm, correctNorm) <= maxErrors(correctNorm.length) ||
      (lastWord.length >= 4 && levenshtein(inputNorm, lastWord) <= maxErrors(lastWord.length));
    handleChoice({ id: correct ? currentPersonality.id : '__wrong__' });
  };

  const handleChoice = (choice) => {
    if (phase !== 'playing') return;
    const correct = choice.id === currentPersonality.id;
    setSelectedId(choice.id);
    setWasCorrect(correct);

    if (correct) {
      const pts = 5 - step; // step1→4pts, step2→3pts, step3→2pts, step4→1pt
      const playerIdx = currentIdx % players.length;
      setScores(s => ({ ...s, [playerIdx]: (s[playerIdx] || 0) + pts }));
      setPhase('feedback');
      animateFeedback();
      setTimeout(() => setPhase('reveal'), 900);
    } else {
      setPhase('feedback');
      animateFeedback();
      setTimeout(() => {
        if (step < 4) {
          setStep(s => s + 1);
          setPhase('playing');
          setWasCorrect(null);
          setSelectedId(null);
        } else {
          setPhase('reveal');
        }
      }, 1000);
    }
  };

  const handleDontKnow = () => {
    setWasCorrect(false);
    setPhase('feedback');
    animateFeedback();
    setTimeout(() => {
      if (step < 4) {
        setStep(s => s + 1);
        setPhase('playing');
        setWasCorrect(null);
        setSelectedId(null);
      } else {
        setPhase('reveal');
      }
    }, 1000);
  };

  const handleSkip = () => {
    if (step < 4) {
      setStep(s => s + 1);
    } else {
      setPhase('reveal');
    }
  };

  if (phase === 'results') {
    return (
      <ResultsScreen
        players={players}
        scores={scores}
        rounds={rounds}
        navigation={navigation}
      />
    );
  }

  const progress = currentIdx / rounds.length;
  const isReveal = phase === 'reveal';
  const revealedTiles = mode === 'tiles' ? currentRound.tileOrder.slice(0, step) : null;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={[styles.innerScroll, Platform.OS === 'web' && { height: '100vh' }]}
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.roundCounter}>{currentIdx + 1} / {rounds.length}</Text>
        </View>

        {/* Current player + mode */}
        <View style={styles.infoRow}>
          <View style={[styles.playerChip, { backgroundColor: ORANGE + '33', borderColor: ORANGE + '66' }]}>
            <Text style={styles.playerChipRole}>🎯 À toi</Text>
            <Text style={[styles.playerChipName, { color: ORANGE_LIGHT }]}>{currentPlayer}</Text>
          </View>
          <View style={styles.modeChip}>
            <Text style={styles.modeChipText}>
              {mode === 'blur' ? '🌫️ Flou' : '🎲 Mosaïque'}
            </Text>
            {mode === 'tiles' && !isReveal && (
              <Text style={styles.featureLabel}>{step} case{step > 1 ? 's' : ''} / 12</Text>
            )}
          </View>
        </View>

        {/* Image area */}
        <Animated.View
          style={[
            styles.imageContainer,
            Platform.OS === 'web' && { width: PC_IMG_W, alignSelf: 'center' },
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <View style={styles.imageClip}>
            {/* Blur wrapper (web only) */}
            <View style={[styles.imageWrapper, !isReveal && mode === 'blur' && blurStyle(step)]}>
              {personalityImages[currentPersonality.id] && !imgError ? (
                <Image
                  source={personalityImages[currentPersonality.id]}
                  style={[styles.faceImage, Platform.OS === 'web' && { objectPosition: 'top center' }]}
                  resizeMode={isReveal ? 'contain' : 'cover'}
                  onError={() => setImgError(true)}
                />
              ) : (
                <View style={styles.imgFallback}>
                  <Text style={styles.imgFallbackEmoji}>🤷</Text>
                  <Text style={styles.imgFallbackText}>Image non disponible</Text>
                </View>
              )}
            </View>

            {/* Mosaic tiles overlay */}
            {!isReveal && mode === 'tiles' && revealedTiles && (
              <TilesMask
                revealedTiles={revealedTiles}
                source={personalityImages[currentPersonality.id]}
                imgError={imgError}
              />
            )}

            {/* Reveal label */}
            {isReveal && (
              <View style={styles.revealBanner}>
                <Text style={styles.revealName}>{currentPersonality.name}</Text>
                <Text style={styles.revealHint}>{currentPersonality.hint}</Text>
              </View>
            )}

            {/* Step dots */}
            {!isReveal && (
              <View style={styles.stepDots}>
                {[1, 2, 3, 4].map(s => (
                  <View
                    key={s}
                    style={[
                      styles.stepDot,
                      s < step && { backgroundColor: colors.textMuted },
                      s === step && { backgroundColor: ORANGE, transform: [{ scale: 1.4 }] },
                      s > step && { backgroundColor: colors.border },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Feedback overlay */}
          {phase === 'feedback' && (
            <Animated.View
              style={[styles.feedbackOverlay, { transform: [{ scale: feedbackScale }] }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={wasCorrect
                  ? [colors.success + 'EE', colors.success + 'BB']
                  : [colors.danger + 'EE', colors.danger + 'BB']
                }
                style={styles.feedbackInner}
              >
                <Text style={styles.feedbackEmoji}>{wasCorrect ? '🎉' : step < 4 ? '💡' : '😅'}</Text>
                <Text style={styles.feedbackText}>
                  {wasCorrect
                    ? `+${5 - step} pts !`
                    : step < 4
                      ? 'Indice suivant...'
                      : 'Raté !'}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>

        {/* Text input */}
        {phase === 'playing' && (
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Tapez le nom..."
                placeholderTextColor={ORANGE + '66'}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleTextSubmit}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.validateBtn, !inputText.trim() && styles.validateBtnDisabled]}
                onPress={handleTextSubmit}
                activeOpacity={0.8}
                disabled={!inputText.trim()}
              >
                <Text style={styles.validateBtnText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'playing' && (
          <TouchableOpacity onPress={handleDontKnow} activeOpacity={0.8} style={styles.skipBtn}>
            <LinearGradient
              colors={['#1A1A3B', '#2D2D5E']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.skipBtnInner}
            >
              <Text style={styles.skipBtnText}>
                {step < 4 ? `⏭  INDICE SUIVANT  (${step + 1}/4)` : '⏭  PASSER'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {phase === 'reveal' && (
          <TouchableOpacity onPress={goToNext}>
            <LinearGradient
              colors={[ORANGE, ORANGE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextBtnText}>
                {currentIdx + 1 >= rounds.length ? '🏁 Voir les résultats' : '▶ Personnalité suivante'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function ResultsScreen({ players, scores, rounds, navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalPossible = rounds.length * 3;
  const totalScored = Object.values(scores).reduce((a, b) => a + b, 0);
  const successPct = Math.round((totalScored / Math.max(totalPossible, 1)) * 100);

  const sorted = [...players]
    .map((name, i) => ({ name, score: scores[i] || 0 }))
    .sort((a, b) => b.score - a.score);

  const maxScore = sorted[0]?.score || 1;

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.resultsScroll}
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Global score */}
          <View style={styles.compatCard}>
            <LinearGradient colors={['#2D0F00', '#4A1A00']} style={styles.compatInner}>
              <Text style={styles.compatEmoji}>
                {successPct >= 70 ? '🏆' : successPct >= 40 ? '👁️' : '😵'}
              </Text>
              <Text style={styles.compatPct}>{successPct}%</Text>
              <Text style={styles.compatTitle}>de bonnes réponses</Text>
              <View style={[styles.compatDivider, { backgroundColor: ORANGE + '44' }]} />
              <Text style={styles.compatLabel}>
                {successPct >= 70
                  ? 'Impressionnant ! Vous connaissez vos célébrités !'
                  : successPct >= 40
                    ? 'Pas mal ! Quelques têtes connues...'
                    : 'Les célébrités vous sont restées floues !'}
              </Text>
            </LinearGradient>
          </View>

          {/* Leaderboard */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🏆 CLASSEMENT</Text>
            {sorted.map((p, idx) => (
              <View key={p.name} style={styles.scoreRow}>
                <Text style={styles.scoreRank}>
                  {idx < 3 ? MEDALS[idx] : `${idx + 1}.`}
                </Text>
                <Text style={styles.scoreName}>{p.name}</Text>
                <View style={styles.scoreBarWrap}>
                  <View style={styles.scoreTrack}>
                    <View style={[styles.scoreFill, { width: `${(p.score / maxScore) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.scoreVal}>{p.score} pts</Text>
              </View>
            ))}
          </View>

          {/* Replay */}
          <TouchableOpacity
            onPress={() => navigation.replace('PersonalitySetup')}
            style={{ marginBottom: spacing.md }}
          >
            <LinearGradient
              colors={[ORANGE, ORANGE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.replayBtn}
            >
              <Text style={styles.replayBtnText}>🔄 REJOUER</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  progressTrack: { height: 3, backgroundColor: colors.border, width: '100%' },
  progressFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 2 },

  innerScroll: { flex: 1 },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: spacing.xl,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quitBtn: { paddingVertical: 4 },
  quitText: { color: colors.textMuted, fontSize: 13 },
  roundCounter: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  playerChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  playerChipRole: { fontSize: 10, color: colors.textMuted },
  playerChipName: { fontSize: 15, fontWeight: '800' },
  modeChip: { alignItems: 'flex-end' },
  modeChipText: { fontSize: 13, fontWeight: '700', color: ORANGE_LIGHT },
  featureLabel: { fontSize: 11, color: ORANGE + 'CC', marginTop: 2 },

  // Image area
  imageContainer: {
    height: IMG_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  imageClip: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ORANGE + '33',
    backgroundColor: '#0A0500',
  },
  imageWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  imgFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0A00',
  },
  imgFallbackEmoji: { fontSize: 48 },
  imgFallbackText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },

  // Step dots
  stepDots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4 },

  // Reveal banner
  revealBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 5, 0, 0.85)',
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ORANGE + '44',
  },
  revealName: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center' },
  revealHint: { fontSize: 12, color: ORANGE_LIGHT, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },

  // Feedback
  feedbackOverlay: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  feedbackInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  feedbackEmoji: { fontSize: 30 },
  feedbackText: { fontSize: 22, fontWeight: '900', color: colors.text },

  // Text input
  inputContainer: { marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: ORANGE + '66',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  validateBtn: {
    backgroundColor: ORANGE,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateBtnDisabled: { backgroundColor: ORANGE + '44' },
  validateBtnText: { fontSize: 20, fontWeight: '900', color: colors.text },
  skipBtn: { marginTop: spacing.sm, borderRadius: radius.full, overflow: 'hidden' },
  skipBtnInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#7C3AED55',
  },
  skipBtnText: { fontSize: 14, fontWeight: '800', color: colors.primaryLight, letterSpacing: 1.5 },

  // Next
  nextBtn: {
    paddingVertical: spacing.md + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 1 },

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
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  compatInner: {
    alignItems: 'center',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: ORANGE + '55',
    borderRadius: radius.xl,
  },
  compatEmoji: { fontSize: 56, marginBottom: spacing.sm },
  compatPct: { fontSize: 64, fontWeight: '900', color: ORANGE_LIGHT, lineHeight: 72 },
  compatTitle: { fontSize: 14, color: colors.textSecondary, letterSpacing: 2, marginBottom: spacing.md },
  compatDivider: { height: 1, width: '60%', marginBottom: spacing.md },
  compatLabel: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center', lineHeight: 24 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: ORANGE_LIGHT, letterSpacing: 2, marginBottom: spacing.md },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  scoreRank: { fontSize: 20, width: 32, textAlign: 'center' },
  scoreName: { width: 80, fontSize: 14, fontWeight: '700', color: colors.text },
  scoreBarWrap: { flex: 1 },
  scoreTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 3 },
  scoreVal: { width: 48, fontSize: 12, color: colors.textSecondary, textAlign: 'right', fontWeight: '700' },

  replayBtn: {
    paddingVertical: spacing.md + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  replayBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  menuBtn: { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText: { fontSize: 14, color: ORANGE_LIGHT, fontWeight: '600' },
});
