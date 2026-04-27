import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { EMOJI_QUIZ_ITEMS } from '../../data/emojiQuizData';

const AMB       = '#F59E0B';
const AMB_DARK  = '#B45309';
const AMB_LIGHT = '#FDE68A';
const BG = ['#1A0F00', '#2D1A00', '#1A0F00'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
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

// ── Category info ──────────────────────────────────────────────────
const CAT_INFO = {
  film:         { label: 'Film',        emoji: '🎬' },
  musique:      { label: 'Musique',     emoji: '🎵' },
  serie:        { label: 'Série',       emoji: '📺' },
  personnalite: { label: 'Célébrité',   emoji: '⭐' },
  jeu_video:    { label: 'Jeux Vidéo',  emoji: '🎮' },
};

// ── Main game ──────────────────────────────────────────────────────
export default function EmojiQuizGameScreen({ navigation, route }) {
  const { players, rounds } = route.params;
  const totalQ = rounds.length;

  const [qIndex,         setQIndex]        = useState(0);
  const [phase,          setPhase]         = useState('intro');
  const [step,           setStep]          = useState(1);
  const [scores,         setScores]        = useState(Array(players.length).fill(0));
  const [inputText,      setInputText]     = useState('');
  const [wasCorrect,     setWasCorrect]    = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const currentPlayer = qIndex % players.length;
  const round = rounds[qIndex];
  const cat   = CAT_INFO[round.category] || {};
  const emojis = Array.isArray(round.emojis) ? round.emojis : [round.emojis];

  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const slideAnim    = useRef(new Animated.Value(30)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  const propositions = useMemo(() => {
    const correct = round.answer;
    const pool = EMOJI_QUIZ_ITEMS.filter(item => item.category === round.category && item.answer !== correct);
    const distractors = shuffle([...pool]).slice(0, 3).map(item => item.answer);
    return shuffle([correct, ...distractors]);
  }, [qIndex]);

  useEffect(() => { animateIn(); setInputText(''); setSelectedAnswer(null); }, [qIndex, step]);

  const handleStartQuestion = () => {
    setPhase('question');
    setStep(1);
    setWasCorrect(null);
    setSelectedAnswer(null);
    setInputText('');
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase('final');
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setQIndex(i => i + 1);
        setStep(1);
        setPhase('intro');
        setWasCorrect(null);
        setSelectedAnswer(null);
      });
    }
  };

  const handleSubmit = () => {
    if (phase !== 'question' || !inputText.trim()) return;
    const inputNorm = normalize(inputText);
    const correctNorm = normalize(round.answer);
    const lastWord = normalize(round.answer.split(' ').pop());
    const correct = inputNorm === correctNorm || (lastWord.length >= 3 && inputNorm === lastWord);

    setWasCorrect(correct);
    animateFeedback();

    if (correct) {
      const pts = 5 - step; // step1→4pts, step2→3pts, step3→2pts
      setScores(prev => { const next = [...prev]; next[currentPlayer] += pts; return next; });
      setTimeout(() => setPhase('reveal'), 900);
    } else {
      setTimeout(() => {
        if (step < 3) {
          setStep(s => s + 1);
          setWasCorrect(null);
          setPhase('question');
        } else {
          // Step 3 raté → propositions MCQ
          setStep(4);
          setWasCorrect(null);
          setPhase('mcq');
        }
      }, 900);
    }
  };

  const handleMcqChoice = (answer) => {
    if (phase !== 'mcq' || selectedAnswer !== null) return;
    const correct = answer === round.answer;
    setSelectedAnswer(answer);
    setWasCorrect(correct);
    animateFeedback();
    if (correct) {
      setScores(prev => { const next = [...prev]; next[currentPlayer] += 1; return next; });
    }
    setTimeout(() => setPhase('reveal'), 1000);
  };

  const handleSkip = () => {
    if (phase === 'mcq') {
      setPhase('reveal');
      return;
    }
    animateFeedback();
    setWasCorrect(false);
    setTimeout(() => {
      if (step < 3) {
        setStep(s => s + 1);
        setWasCorrect(null);
        setPhase('question');
      } else {
        setStep(4);
        setWasCorrect(null);
        setPhase('mcq');
      }
    }, 700);
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
              Un emoji à la fois pour trouver la réponse !{'\n'}
              Plus vite tu trouves, plus tu gagnes de points 🏆
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

  // ── QUESTION + MCQ + REVEAL ─────────────────────────────────────
  const isReveal = phase === 'reveal';
  const isMcq    = phase === 'mcq';

  return (
    <LinearGradient colors={BG} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <View style={styles.topBar}>
        <Text style={[styles.topBarPlayer, { color: AMB }]}>{players[currentPlayer]}</Text>
        <Text style={styles.topBarCount}>{qIndex + 1}/{totalQ}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { flex: 1 }} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <View style={[styles.catBadge, { borderColor: AMB + '50', backgroundColor: AMB + '15' }]}>
            <Text style={styles.catBadgeText}>{cat.emoji}  {cat.label}</Text>
          </View>

          {/* Emoji progressive reveal */}
          <View style={styles.emojiCard}>
            <View style={styles.emojiRow}>
              {emojis.map((emoji, i) => (
                <View
                  key={i}
                  style={[
                    styles.emojiSlot,
                    i < step ? styles.emojiSlotVisible : styles.emojiSlotHidden,
                  ]}
                >
                  <Text style={i < step ? styles.emojiText : styles.emojiHiddenText}>
                    {i < step ? emoji : '?'}
                  </Text>
                </View>
              ))}
            </View>

            {!isReveal && (
              <View style={styles.stepDots}>
                {[1, 2, 3, 4].map(s => (
                  <View
                    key={s}
                    style={[
                      styles.stepDot,
                      s < step  && { backgroundColor: colors.textMuted },
                      s === step && { backgroundColor: AMB, transform: [{ scale: 1.4 }] },
                      s > step  && { backgroundColor: colors.border },
                    ]}
                  />
                ))}
              </View>
            )}

            {!isReveal && !isMcq && (
              <Text style={styles.emojiHint}>
                {`Indice ${step}/3 — Que représentent ces emojis ?`}
              </Text>
            )}
            {isMcq && (
              <Text style={styles.emojiHint}>Tous les indices révélés — choisissez !</Text>
            )}
          </View>

          {/* Feedback overlay */}
          {wasCorrect !== null && phase !== 'reveal' && (
            <Animated.View
              style={[styles.feedbackBubble, { transform: [{ scale: feedbackScale }],
                backgroundColor: wasCorrect ? '#065F46' : '#7F1D1D' }]}
              pointerEvents="none"
            >
              <Text style={styles.feedbackText}>
                {wasCorrect
                  ? `🎉 +${isMcq ? 1 : 5 - step} pts !`
                  : isMcq ? '😅 Raté !' : step < 3 ? '💡 Indice suivant...' : '🎯 Propositions...'}
              </Text>
            </Animated.View>
          )}

          {/* Text input (steps 1-3) */}
          {phase === 'question' && (
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tapez la réponse..."
                  placeholderTextColor={AMB + '55'}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  autoCorrect={false}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  style={[styles.validateBtn, !inputText.trim() && styles.validateBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!inputText.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.validateBtnText}>✓</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#1A1A3B', '#2D2D5E']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.skipBtnInner}
                >
                  <Text style={styles.skipBtnText}>
                    {step < 3 ? `⏭  INDICE SUIVANT  (${step + 1}/3)` : '🎯  VOIR LES PROPOSITIONS'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* MCQ propositions (step 4) */}
          {isMcq && (
            <View style={styles.mcqContainer}>
              <Text style={styles.mcqTitle}>💡 Choisissez la bonne réponse</Text>
              <View style={styles.mcqGrid}>
                {propositions.map((answer, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleMcqChoice(answer)}
                    disabled={selectedAnswer !== null}
                    activeOpacity={0.8}
                    style={[
                      styles.mcqBtn,
                      selectedAnswer !== null && answer === round.answer && styles.mcqBtnCorrect,
                      selectedAnswer === answer && answer !== round.answer && styles.mcqBtnWrong,
                      selectedAnswer !== null && answer !== round.answer && answer !== selectedAnswer && styles.mcqBtnDimmed,
                    ]}
                  >
                    <Text style={styles.mcqBtnText}>{answer}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedAnswer === null && (
                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#1A1A3B', '#2D2D5E']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.skipBtnInner}
                  >
                    <Text style={styles.skipBtnText}>⏭  PASSER</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Reveal */}
          {isReveal && (
            <Animated.View style={[styles.revealBox, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={wasCorrect ? ['#064E3B', '#065F46'] : ['#450A0A', '#7F1D1D']}
                style={styles.revealBanner}
              >
                <Text style={styles.revealBannerEmoji}>
                  {wasCorrect ? '✅' : '❌'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.revealBannerText}>
                    {wasCorrect
                      ? `Bravo ${players[currentPlayer]} !`
                      : `C'était : ${round.answer}`}
                  </Text>
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
  topBarCount:  { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  gameScroll: { paddingHorizontal: spacing.xl, paddingBottom: 48 },

  catBadge: {
    alignSelf: 'center', borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 4,
    marginBottom: spacing.md, marginTop: spacing.sm,
  },
  catBadgeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  // Emoji card
  emojiCard: {
    backgroundColor: '#0D0800',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: AMB + '33',
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emojiSlot: {
    width: 80, height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSlotVisible: {
    backgroundColor: AMB + '22',
    borderWidth: 2,
    borderColor: AMB + '88',
  },
  emojiSlotHidden: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: colors.border,
  },
  emojiText:       { fontSize: 46 },
  emojiHiddenText: { fontSize: 28, color: colors.textMuted },

  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4 },

  emojiHint: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.5, textAlign: 'center' },

  // Feedback bubble
  feedbackBubble: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  feedbackText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Input
  inputContainer: { marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: AMB + '66',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  validateBtn: {
    backgroundColor: AMB,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateBtnDisabled: { backgroundColor: AMB + '44' },
  validateBtnText: { fontSize: 20, fontWeight: '900', color: '#000' },

  skipBtn: { borderRadius: radius.full, overflow: 'hidden' },
  skipBtnInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#7C3AED55',
  },
  skipBtnText: { fontSize: 14, fontWeight: '800', color: colors.primaryLight, letterSpacing: 1.5 },

  // MCQ
  mcqContainer: { marginBottom: spacing.sm },
  mcqTitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.5 },
  mcqGrid: { gap: spacing.sm, marginBottom: spacing.sm },
  mcqBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: AMB + '55',
    backgroundColor: AMB + '10',
    alignItems: 'center',
  },
  mcqBtnCorrect: { borderColor: '#10B981', backgroundColor: '#065F46' },
  mcqBtnWrong:   { borderColor: '#EF4444', backgroundColor: '#450A0A' },
  mcqBtnDimmed:  { opacity: 0.35 },
  mcqBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },

  // Reveal
  revealBox: { gap: spacing.md },
  revealBanner: {
    borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  revealBannerEmoji: { fontSize: 28 },
  revealBannerText:  { fontSize: 15, fontWeight: '800', color: colors.text },

  hintBox: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: AMB + '30',
  },
  hintLabel: { fontSize: 12, fontWeight: '700', color: AMB, marginBottom: spacing.xs },
  hintText:  { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

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
  dot:       { width: 8,  height: 8,  borderRadius: 4, backgroundColor: colors.border },
  dotDone:   { backgroundColor: '#10B981' },
  dotActive: { backgroundColor: AMB, width: 12, height: 12, borderRadius: 6 },
  questionCountLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xl, letterSpacing: 1 },
  introCard: { width: '100%', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, marginBottom: spacing.xl },
  introAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  introAvatarEmoji: { fontSize: 38 },
  introPlayerLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  introPlayerName:  { fontSize: 32, fontWeight: '900', marginBottom: spacing.md },
  introInstruction: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  scoreChip: { backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  scoreChipName:  { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  scoreChipScore: { fontSize: 16, fontWeight: '900', color: colors.text },
  startBtn: { width: '100%', borderRadius: radius.full, overflow: 'hidden', shadowColor: AMB, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  startBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },

  // Final
  finalScroll:  { paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: spacing.xl, paddingBottom: 60, alignItems: 'center' },
  finalHeader:  { alignItems: 'center', marginBottom: spacing.xl },
  finalEmoji:   { fontSize: 72, textAlign: 'center', marginBottom: spacing.md },
  finalTitle:   { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 3, textAlign: 'center' },
  finalSub:     { fontSize: 13, color: AMB_LIGHT, letterSpacing: 2, marginTop: spacing.xs, textAlign: 'center' },
  rankList:     { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  rankRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rankRowFirst: { borderColor: AMB + '50' },
  rankMedal:    { fontSize: 26 },
  rankName:     { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScoreWrap: { alignItems: 'flex-end' },
  rankScore:    { fontSize: 26, fontWeight: '900', color: colors.text },
  rankScorePts: { fontSize: 11, color: colors.textMuted },
  finalBtns:    { width: '100%', gap: spacing.md },
  finalBtnPrimary: { borderRadius: radius.full, overflow: 'hidden', shadowColor: AMB, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  finalBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  finalBtnText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },
  finalBtnSecondary: { backgroundColor: colors.surface, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  finalBtnSecondaryText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
