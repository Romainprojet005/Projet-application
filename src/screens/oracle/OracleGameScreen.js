import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { selectQuestions } from '../../data/oracleQuestions';
import { OB_BG } from '../../theme/obsidian';

const ACCENT       = '#8B5CF6';
const ACCENT_LIGHT = '#C4B5FD';
const ACCENT_DARK  = '#6D28D9';
const LETTERS      = 'ABCDEFGHIJKL';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Phases :
// question → handoff_write → writing → reveal → handoff_vote → voting → result → final

export default function OracleGameScreen({ route, navigation }) {
  const { roundCount = 8, playerNames = [], categoryId = 'all' } = route.params || {};

  const [questions]    = useState(() => selectQuestions(roundCount, categoryId));
  const [roundIdx, setRoundIdx]               = useState(0);
  const [phase, setPhase]                     = useState('question');
  const [currentIdx, setCurrentIdx]           = useState(0);
  const [currentInput, setCurrentInput]       = useState('');
  const [answers, setAnswers]                 = useState([]);
  const [shuffled, setShuffled]               = useState([]);
  const [votes, setVotes]                     = useState([]);
  const [scores, setScores]                   = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const inputRef  = useRef(null);

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.94);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => { animateIn(); }, [phase, roundIdx, currentIdx]);

  const currentQuestion = questions[roundIdx];

  // ── Handlers ────────────────────────────────────────────────────────

  const handleStartWriting = () => {
    setAnswers([]);
    setCurrentIdx(0);
    setCurrentInput('');
    setPhase('handoff_write');
  };

  const handleHandoffWriteConfirm = () => {
    setCurrentInput('');
    setPhase('writing');
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSubmitAnswer = () => {
    const text = currentInput.trim();
    if (!text) return;
    const newAnswers = [...answers, { playerIdx: currentIdx, text }];
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentIdx + 1 >= playerNames.length) {
      // Tous ont écrit → révéler
      const s = shuffle(newAnswers).map((a, i) => ({ ...a, letter: LETTERS[i] }));
      setShuffled(s);
      setVotes([]);
      setPhase('reveal');
    } else {
      setCurrentIdx(i => i + 1);
      setPhase('handoff_write');
    }
  };

  const handleStartVoting = () => {
    setCurrentIdx(0);
    setVotes([]);
    setPhase('handoff_vote');
  };

  const handleHandoffVoteConfirm = () => {
    setPhase('voting');
  };

  const handleVote = (letter) => {
    const newVotes = [...votes, { voterIdx: currentIdx, letter }];

    if (currentIdx + 1 >= playerNames.length) {
      // Comptage
      const tally = {};
      LETTERS.slice(0, shuffled.length).split('').forEach(l => { tally[l] = 0; });
      newVotes.forEach(v => { tally[v.letter] = (tally[v.letter] || 0) + 1; });
      const maxV   = Math.max(...Object.values(tally));
      const winners = shuffled.filter(a => (tally[a.letter] || 0) === maxV && maxV > 0);

      const newScores = { ...scores };
      winners.forEach(w => {
        const name = playerNames[w.playerIdx];
        newScores[name] = (newScores[name] || 0) + 1;
      });
      setScores(newScores);
      setVotes(newVotes);
      setPhase('result');
    } else {
      setVotes(newVotes);
      setCurrentIdx(i => i + 1);
      setPhase('handoff_vote');
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= questions.length) {
      setPhase('final');
    } else {
      setRoundIdx(i => i + 1);
      setAnswers([]);
      setShuffled([]);
      setVotes([]);
      setCurrentIdx(0);
      setPhase('question');
    }
  };

  // ── Calculs résultat ─────────────────────────────────────────────────

  const tally = {};
  if (phase === 'result') {
    LETTERS.slice(0, shuffled.length).split('').forEach(l => { tally[l] = 0; });
    votes.forEach(v => { tally[v.letter] = (tally[v.letter] || 0) + 1; });
  }
  const maxV = phase === 'result' ? Math.max(...Object.values(tally), 0) : 0;
  const winningLetters = phase === 'result'
    ? Object.entries(tally).filter(([, c]) => c === maxV && maxV > 0).map(([l]) => l)
    : [];

  // ════════════════════════════════════════════════════════════════════
  // FINAL
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'final') {
    const sorted = [...playerNames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const maxScore = scores[sorted[0]] || 0;
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll}>
          <Animated.View style={[styles.finalCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.finalEmoji}>🔮</Text>
            <Text style={styles.finalTitle}>L'ORACLE A PARLÉ</Text>
            <Text style={styles.finalSub}>Classement final</Text>
            <View style={styles.podium}>
              {sorted.map((name, i) => (
                <View key={name} style={[styles.podiumRow, i === 0 && styles.podiumFirst]}>
                  <Text style={styles.podiumRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </Text>
                  <Text style={[styles.podiumName, i === 0 && { color: ACCENT_LIGHT }]}>{name}</Text>
                  <View style={[styles.podiumBar, {
                    width: maxScore > 0 ? Math.max(20, ((scores[name] || 0) / maxScore) * 100) : 20,
                  }]} />
                  <Text style={[styles.podiumScore, i === 0 && { color: ACCENT_LIGHT }]}>
                    {scores[name] || 0} pt{(scores[name] || 0) !== 1 ? 's' : ''}
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
              onPress={() => navigation.navigate('OracleSetup')}
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

  // ════════════════════════════════════════════════════════════════════
  // RESULT
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'result') {
    const winners = shuffled.filter(a => winningLetters.includes(a.letter));
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{roundIdx + 1} / {questions.length}</Text>
              <Text style={styles.phaseLabel}>RÉVÉLATION</Text>
            </View>

            {winners.length > 0 && (
              <View style={styles.winnerBanner}>
                <Text style={styles.winnerEmoji}>🏆</Text>
                <Text style={styles.winnerText}>
                  {winners.length === 1
                    ? `${playerNames[winners[0].playerIdx]} remporte le point !`
                    : `Égalité — ${winners.map(w => playerNames[w.playerIdx]).join(' & ')} !`}
                </Text>
              </View>
            )}
            {maxV === 0 && (
              <View style={styles.winnerBanner}>
                <Text style={styles.winnerEmoji}>🤷</Text>
                <Text style={styles.winnerText}>Personne n'a voté — aucun point cette manche</Text>
              </View>
            )}

            <View style={styles.answerList}>
              {shuffled.map((a) => {
                const isWinner = winningLetters.includes(a.letter);
                const voteCount = tally[a.letter] || 0;
                return (
                  <View
                    key={a.letter}
                    style={[styles.resultCard, isWinner && styles.resultCardWinner]}
                  >
                    <View style={styles.resultCardTop}>
                      <View style={[styles.letterBadge, isWinner && styles.letterBadgeWinner]}>
                        <Text style={[styles.letterText, isWinner && { color: '#fff' }]}>{a.letter}</Text>
                      </View>
                      <Text style={[styles.resultText, isWinner && { color: ACCENT_LIGHT }]}>
                        {a.text}
                      </Text>
                    </View>
                    <View style={styles.resultCardBottom}>
                      <Text style={[styles.resultAuthor, isWinner && { color: ACCENT_LIGHT }]}>
                        ✍️ {playerNames[a.playerIdx]}
                      </Text>
                      <Text style={[styles.resultVotes, isWinner && { color: ACCENT_LIGHT }]}>
                        {voteCount} vote{voteCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.nextBtnWrap}>
              <TouchableOpacity onPress={handleNextRound} style={styles.nextBtn} activeOpacity={0.85}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>
                    {roundIdx + 1 >= questions.length ? '🔮  Voir le classement' : '➡️  Question suivante'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // HANDOFF VOTE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'handoff_vote') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <Animated.View style={[styles.handoffWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.handoffLabel}>Passez le téléphone à</Text>
          <Text style={styles.handoffName}>{playerNames[currentIdx]}</Text>
          <Text style={styles.handoffSub}>Il/elle va voter pour sa réponse préférée</Text>
          <TouchableOpacity onPress={handleHandoffVoteConfirm} style={styles.handoffBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.handoffBtnGrad}>
              <Text style={styles.handoffBtnText}>✓  C'est bon, c'est moi</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // VOTING
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'voting') {
    const myAnswer = shuffled.find(a => a.playerIdx === currentIdx);
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.votingScroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{roundIdx + 1} / {questions.length}</Text>
              <Text style={styles.voterCount}>{currentIdx + 1} / {playerNames.length}</Text>
            </View>

            <View style={[styles.voterBadge]}>
              <Text style={styles.voterBadgeLabel}>C'est au tour de</Text>
              <Text style={styles.voterBadgeName}>{playerNames[currentIdx]}</Text>
            </View>

            <View style={styles.questionCardSm}>
              <Text style={styles.questionLabelSm}>🔮  LA QUESTION</Text>
              <Text style={styles.questionTextSm}>{currentQuestion?.text}</Text>
            </View>

            <Text style={styles.voteInstruction}>Vote pour la réponse que tu préfères :</Text>

            <View style={styles.answerVoteList}>
              {shuffled.map((a) => {
                const isMine = a.playerIdx === currentIdx;
                return (
                  <TouchableOpacity
                    key={a.letter}
                    onPress={() => !isMine && handleVote(a.letter)}
                    disabled={isMine}
                    style={[styles.voteAnswerBtn, isMine && styles.voteAnswerBtnMine]}
                    activeOpacity={isMine ? 1 : 0.7}
                  >
                    <View style={[styles.voteLetter, isMine && styles.voteLetterMine]}>
                      <Text style={[styles.voteLetterText, isMine && styles.voteLetterTextMine]}>
                        {a.letter}
                      </Text>
                    </View>
                    <Text style={[styles.voteAnswerText, isMine && styles.voteAnswerTextMine]}>
                      {isMine ? '— votre réponse —' : a.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // REVEAL
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'reveal') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.revealScroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{roundIdx + 1} / {questions.length}</Text>
              <Text style={styles.phaseLabel}>RÉVÉLATION</Text>
            </View>

            <Text style={styles.revealTitle}>Les réponses sont prêtes !</Text>
            <Text style={styles.revealSub}>Lisez-les à voix haute avant de voter</Text>

            <View style={styles.questionCardSm}>
              <Text style={styles.questionLabelSm}>🔮  LA QUESTION</Text>
              <Text style={styles.questionTextSm}>{currentQuestion?.text}</Text>
            </View>

            <View style={styles.answerList}>
              {shuffled.map((a, i) => (
                <View key={a.letter} style={styles.revealCard}>
                  <View style={styles.letterBadge}>
                    <Text style={styles.letterText}>{a.letter}</Text>
                  </View>
                  <Text style={styles.revealAnswerText}>{a.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.nextBtnWrap}>
              <TouchableOpacity onPress={handleStartVoting} style={styles.nextBtn} activeOpacity={0.85}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>🗳️  Commencer le vote</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // WRITING
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'writing') {
    const canSubmit = currentInput.trim().length > 0;
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <Animated.View style={[styles.writingWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{roundIdx + 1} / {questions.length}</Text>
            <Text style={styles.voterCount}>{currentIdx + 1} / {playerNames.length}</Text>
          </View>

          <View style={[styles.writerBadge]}>
            <Text style={styles.writerLabel}>Tour de</Text>
            <Text style={styles.writerName}>{playerNames[currentIdx]}</Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>🔮  LA QUESTION DE L'ORACLE</Text>
            <Text style={styles.questionText}>{currentQuestion?.text}</Text>
          </View>

          <Text style={styles.writeInstruction}>Ta réponse (en secret) :</Text>

          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Écris ta réponse ici…"
              placeholderTextColor={colors.textMuted}
              style={styles.bigInput}
              multiline
              maxLength={200}
              autoFocus={false}
              {...Platform.select({ web: { outlineStyle: 'none' } })}
            />
            <Text style={styles.charCount}>{currentInput.length}/200</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmitAnswer}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
              <Text style={styles.submitBtnText}>
                {currentIdx + 1 >= playerNames.length ? '✓  Valider — voir les réponses' : '✓  Valider ma réponse'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

        </Animated.View>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // HANDOFF WRITE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'handoff_write') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <Animated.View style={[styles.handoffWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.handoffLabel}>Passez le téléphone à</Text>
          <Text style={styles.handoffName}>{playerNames[currentIdx]}</Text>
          <Text style={styles.handoffSub}>Il/elle va écrire sa réponse en secret</Text>
          <TouchableOpacity onPress={handleHandoffWriteConfirm} style={styles.handoffBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.handoffBtnGrad}>
              <Text style={styles.handoffBtnText}>✓  C'est bon, c'est moi</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // QUESTION (phase initiale)
  // ════════════════════════════════════════════════════════════════════
  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <Animated.View style={[styles.questionWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{roundIdx + 1} / {questions.length}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.oracleBadge}>
          <Text style={styles.oracleBadgeEmoji}>🔮</Text>
          <Text style={styles.oracleBadgeText}>L'ORACLE DEMANDE…</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion?.text}</Text>
        </View>

        <Text style={styles.writeInstruction}>
          Chaque joueur va écrire sa réponse en secret.{'\n'}Passez le téléphone à tour de rôle.
        </Text>

        <TouchableOpacity
          onPress={handleStartWriting}
          style={styles.startBtn}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>✍️  Commencer la saisie</Text>
          </LinearGradient>
        </TouchableOpacity>

      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  phaseLabel:   { fontSize: 11, color: ACCENT_LIGHT, fontWeight: '700', letterSpacing: 2 },
  quitText:     { fontSize: 13, color: colors.textMuted },
  voterCount:   { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  // ── Question ──────────────────────────────────────────────────────
  questionWrap: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  oracleBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
  },
  oracleBadgeEmoji: { fontSize: 32 },
  oracleBadgeText:  { fontSize: 12, fontWeight: '800', color: ACCENT, letterSpacing: 3 },

  questionCard: {
    backgroundColor: `${ACCENT}18`, borderRadius: radius.xl,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.xl, alignItems: 'center',
  },
  questionLabel: { fontSize: 10, letterSpacing: 3, color: ACCENT, fontWeight: '800', marginBottom: spacing.sm },
  questionText:  { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', lineHeight: 34 },

  writeInstruction: { textAlign: 'center', fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  startBtn: { borderRadius: radius.full, overflow: 'hidden' },
  startBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Handoff ───────────────────────────────────────────────────────
  handoffWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg,
  },
  handoffLabel: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', letterSpacing: 1 },
  handoffName:  { fontSize: 44, fontWeight: '900', color: ACCENT_LIGHT, textAlign: 'center' },
  handoffSub:   { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  handoffBtn:   { alignSelf: 'stretch', borderRadius: radius.full, overflow: 'hidden' },
  handoffBtnGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  handoffBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Writing ───────────────────────────────────────────────────────
  writingWrap: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  writerBadge: {
    backgroundColor: `${ACCENT}20`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.md, alignItems: 'center',
  },
  writerLabel: { fontSize: 12, color: colors.textSecondary, letterSpacing: 1 },
  writerName:  { fontSize: 28, fontWeight: '900', color: ACCENT_LIGHT, marginTop: 4 },

  questionCardSm: {
    backgroundColor: `${ACCENT}10`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}25`,
    padding: spacing.md, alignItems: 'center', gap: 6,
  },
  questionLabelSm: { fontSize: 10, letterSpacing: 2.5, color: ACCENT, fontWeight: '700' },
  questionTextSm:  { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 22 },

  inputWrap: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.md, minHeight: 100,
  },
  bigInput: {
    color: colors.text, fontSize: 16, fontWeight: '500',
    lineHeight: 24, minHeight: 80,
    ...Platform.select({ web: { outlineStyle: 'none', resize: 'none' } }),
  },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },

  submitBtn: { borderRadius: radius.full, overflow: 'hidden' },
  submitBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Reveal ────────────────────────────────────────────────────────
  revealScroll: { flexGrow: 1, padding: spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  revealTitle:  { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  revealSub:    { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },

  answerList: { gap: spacing.sm, marginVertical: spacing.md },
  revealCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  revealAnswerText: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600', lineHeight: 22 },

  letterBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${ACCENT}25`, borderWidth: 1, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  letterBadgeWinner: { backgroundColor: ACCENT, borderColor: ACCENT_LIGHT },
  letterText:        { fontSize: 14, fontWeight: '800', color: ACCENT },

  // ── Voting ────────────────────────────────────────────────────────
  votingScroll: { flexGrow: 1, padding: spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  voterBadge: {
    backgroundColor: `${ACCENT}20`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.md, alignItems: 'center', marginVertical: spacing.md,
  },
  voterBadgeLabel: { fontSize: 12, color: colors.textSecondary, letterSpacing: 1 },
  voterBadgeName:  { fontSize: 26, fontWeight: '900', color: ACCENT_LIGHT, marginTop: 4 },

  voteInstruction: { fontSize: 14, color: colors.textSecondary, marginVertical: spacing.sm, fontWeight: '600' },

  answerVoteList: { gap: spacing.sm, marginTop: spacing.xs },
  voteAnswerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  voteAnswerBtnMine: { opacity: 0.4, backgroundColor: colors.surface },
  voteLetter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${ACCENT}25`, borderWidth: 1, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  voteLetterMine:     { backgroundColor: colors.surface, borderColor: colors.border },
  voteLetterText:     { fontSize: 14, fontWeight: '800', color: ACCENT },
  voteLetterTextMine: { color: colors.textMuted },
  voteAnswerText:     { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600', lineHeight: 22 },
  voteAnswerTextMine: { color: colors.textMuted, fontStyle: 'italic' },

  // ── Result ────────────────────────────────────────────────────────
  resultScroll: { flexGrow: 1, padding: spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  winnerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: `${ACCENT}20`, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.md, marginBottom: spacing.md,
  },
  winnerEmoji: { fontSize: 28 },
  winnerText:  { flex: 1, fontSize: 16, fontWeight: '800', color: ACCENT_LIGHT },

  resultCard: {
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, gap: spacing.xs,
  },
  resultCardWinner: { backgroundColor: `${ACCENT}18`, borderColor: `${ACCENT}50` },
  resultCardTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  resultCardBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 40 },
  resultText:    { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600', lineHeight: 22 },
  resultAuthor:  { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  resultVotes:   { fontSize: 13, color: colors.textMuted, fontWeight: '700' },

  nextBtnWrap: { marginTop: spacing.lg, marginBottom: 48 },
  nextBtn:     { borderRadius: radius.full, overflow: 'hidden' },
  nextBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // ── Final ─────────────────────────────────────────────────────────
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
  podiumFirst:     { backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}50` },
  podiumRank:      { fontSize: 20, width: 30 },
  podiumName:      { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  podiumBar:       { height: 6, borderRadius: 3, backgroundColor: ACCENT, opacity: 0.6 },
  podiumScore:     { fontSize: 14, fontWeight: '800', color: colors.textMuted, minWidth: 50, textAlign: 'right' },

  homeBtn: { alignSelf: 'stretch', borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  homeBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  homeBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  replayBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  replayBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '700' },
});
