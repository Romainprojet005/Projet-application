import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { selectQuestions } from '../../data/voteData';

const VOTE_COLOR = '#6366F1';
const VOTE_DARK  = '#4F46E5';
const VOTE_LIGHT = '#A5B4FC';

// Phase machine:
// player_ready → player_voting → player_voted → player_ready (next player)
//                             ↘ voting_complete → reveal → player_ready (next question)
//                                                        ↘ final

export default function VoteGameScreen({ route, navigation }) {
  const { questionCount = 10, playerNames = [], categoryId = 'all' } = route.params || {};

  const [questions]          = useState(() => selectQuestions(questionCount, categoryId));
  const [questionIdx, setQuestionIdx]       = useState(0);
  const [phase, setPhase]                   = useState('player_ready');
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [playerVotes, setPlayerVotes]       = useState({});
  const [roundPoints, setRoundPoints]       = useState(null);
  const [scores, setScores]                 = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [phase, questionIdx]);

  const currentQuestion = questions[questionIdx];
  const currentPlayer   = playerNames[currentVoterIdx];

  const calcPoints = useCallback((votes) => {
    const vals = Object.values(votes);
    const countA = vals.filter(v => v === 'a').length;
    const countB = vals.filter(v => v === 'b').length;
    const n = playerNames.length;
    const pts = Object.fromEntries(playerNames.map(name => [name, 0]));
    if (countA === n || countB === n) {
      playerNames.forEach(name => { pts[name] = 2; });
    } else if (countA !== countB) {
      const maj = countA > countB ? 'a' : 'b';
      Object.entries(votes).forEach(([idx, vote]) => {
        if (vote === maj) pts[playerNames[+idx]] = 1;
      });
    }
    return pts;
  }, [playerNames]);

  const handleVote = useCallback((choice) => {
    const newVotes = { ...playerVotes, [currentVoterIdx]: choice };
    setPlayerVotes(newVotes);
    if (currentVoterIdx < playerNames.length - 1) {
      setCurrentVoterIdx(i => i + 1);
      setPhase('player_voted');
    } else {
      setRoundPoints(calcPoints(newVotes));
      setPhase('voting_complete');
    }
  }, [playerVotes, currentVoterIdx, playerNames, calcPoints]);

  const handleNextQuestion = useCallback(() => {
    const newScores = { ...scores };
    if (roundPoints) {
      Object.entries(roundPoints).forEach(([name, pts]) => {
        newScores[name] = (newScores[name] || 0) + pts;
      });
    }
    setScores(newScores);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(q => q + 1);
      setCurrentVoterIdx(0);
      setPlayerVotes({});
      setRoundPoints(null);
      setPhase('player_ready');
    } else {
      setPhase('final');
    }
  }, [scores, roundPoints, questionIdx, questions.length]);

  const progressPct = `${(questionIdx / questions.length) * 100}%`;
  const progressBar = (
    <View style={styles.progressWrap}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.quitBtn}>
        <Text style={styles.quitText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPct }]} />
      </View>
      <Text style={styles.progressLabel}>{questionIdx + 1}/{questions.length}</Text>
    </View>
  );

  // ── player_ready ──────────────────────────────────────────────────────
  if (phase === 'player_ready') {
    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        {progressBar}
        <Animated.View style={[styles.centered, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.turnLabel}>C'est ton tour !</Text>
          <View style={[styles.playerBadge, { borderColor: VOTE_COLOR + '70', backgroundColor: VOTE_COLOR + '20' }]}>
            <Text style={styles.playerBadgeText}>{currentPlayer}</Text>
          </View>
          <Text style={styles.secretHint}>🔒  Les autres ne doivent pas regarder</Text>
          <Text style={styles.voterCounter}>{currentVoterIdx + 1} / {playerNames.length}</Text>
          <TouchableOpacity onPress={() => setPhase('player_voting')} style={styles.mainBtn} activeOpacity={0.88}>
            <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>🗳️  VOTER EN SECRET</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── player_voting ─────────────────────────────────────────────────────
  if (phase === 'player_voting') {
    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        {progressBar}
        <Animated.View style={[styles.votingWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.voterTag}>{currentPlayer}</Text>
          <View style={[styles.questionCard, { borderColor: VOTE_COLOR + '40', backgroundColor: VOTE_COLOR + '12' }]}>
            <Text style={styles.questionText}>{currentQuestion.q}</Text>
          </View>
          <View style={styles.choicesContainer}>
            <TouchableOpacity onPress={() => handleVote('a')} style={styles.choiceBtn} activeOpacity={0.8}>
              <LinearGradient colors={[VOTE_COLOR + '35', VOTE_DARK + '55']} style={styles.choiceBtnInner}>
                <Text style={styles.choiceText}>{currentQuestion.a}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleVote('b')} style={styles.choiceBtn} activeOpacity={0.8}>
              <LinearGradient colors={[VOTE_COLOR + '35', VOTE_DARK + '55']} style={styles.choiceBtnInner}>
                <Text style={styles.choiceText}>{currentQuestion.b}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── player_voted ──────────────────────────────────────────────────────
  if (phase === 'player_voted') {
    const nextPlayer = playerNames[currentVoterIdx];
    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        {progressBar}
        <Animated.View style={[styles.centered, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.bigIcon}>✅</Text>
          <Text style={styles.votedTitle}>Vote enregistré !</Text>
          <Text style={styles.passText}>Passe le téléphone à</Text>
          <View style={[styles.playerBadge, { borderColor: VOTE_COLOR + '70', backgroundColor: VOTE_COLOR + '20' }]}>
            <Text style={styles.playerBadgeText}>{nextPlayer}</Text>
          </View>
          <TouchableOpacity onPress={() => setPhase('player_ready')} style={styles.mainBtn} activeOpacity={0.88}>
            <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>▶  CONTINUER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── voting_complete ───────────────────────────────────────────────────
  if (phase === 'voting_complete') {
    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        {progressBar}
        <Animated.View style={[styles.centered, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.bigIcon}>🗳️</Text>
          <Text style={styles.completeTitle}>Tout le monde a voté !</Text>
          <Text style={styles.completeSub}>{playerNames.length} votes enregistrés</Text>
          <TouchableOpacity onPress={() => setPhase('reveal')} style={styles.mainBtn} activeOpacity={0.88}>
            <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>👁️  RÉVÉLER LES VOTES</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── reveal ────────────────────────────────────────────────────────────
  if (phase === 'reveal') {
    const countA      = Object.values(playerVotes).filter(v => v === 'a').length;
    const countB      = Object.values(playerVotes).filter(v => v === 'b').length;
    const n           = playerNames.length;
    const isUnanimous = countA === n || countB === n;
    const isTie       = countA === countB;
    const majority    = countA > countB ? 'a' : 'b';
    const votersA     = Object.entries(playerVotes).filter(([, v]) => v === 'a').map(([i]) => playerNames[+i]);
    const votersB     = Object.entries(playerVotes).filter(([, v]) => v === 'b').map(([i]) => playerNames[+i]);

    const winnerColor = isUnanimous ? '#F59E0B' : isTie ? '#64748B' : VOTE_COLOR;

    const sortedByScore = [...playerNames].sort((a, b) => {
      const sa = (scores[a] || 0) + (roundPoints?.[a] || 0);
      const sb = (scores[b] || 0) + (roundPoints?.[b] || 0);
      return sb - sa;
    });

    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        <View style={[styles.progressWrap, { marginBottom: 0 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.quitBtn}>
            <Text style={styles.quitText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((questionIdx + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{questionIdx + 1}/{questions.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.revealScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            <Text style={styles.revealHeading}>🗳️  Résultat du vote</Text>

            <View style={[styles.revealQCard, { borderColor: VOTE_COLOR + '40', backgroundColor: VOTE_COLOR + '12' }]}>
              <Text style={styles.revealQText}>{currentQuestion.q}</Text>
            </View>

            <View style={styles.voteColumns}>
              <View style={[styles.voteCol, !isTie && majority === 'a' && { borderColor: VOTE_COLOR + '70', backgroundColor: VOTE_COLOR + '20' }]}>
                <Text style={styles.voteCount}>{countA}</Text>
                <Text style={styles.voteOption}>{currentQuestion.a}</Text>
                <Text style={styles.voteNames}>{votersA.join('\n') || '—'}</Text>
                {!isTie && majority === 'a' && <Text style={styles.majorityBadge}>MAJORITÉ</Text>}
                {isUnanimous && countA === n  && <Text style={[styles.majorityBadge, { color: '#F59E0B' }]}>UNANIME</Text>}
              </View>
              <View style={styles.voteColSep} />
              <View style={[styles.voteCol, !isTie && majority === 'b' && { borderColor: VOTE_COLOR + '70', backgroundColor: VOTE_COLOR + '20' }]}>
                <Text style={styles.voteCount}>{countB}</Text>
                <Text style={styles.voteOption}>{currentQuestion.b}</Text>
                <Text style={styles.voteNames}>{votersB.join('\n') || '—'}</Text>
                {!isTie && majority === 'b' && <Text style={styles.majorityBadge}>MAJORITÉ</Text>}
                {isUnanimous && countB === n  && <Text style={[styles.majorityBadge, { color: '#F59E0B' }]}>UNANIME</Text>}
              </View>
            </View>

            <View style={[styles.resultCard, { borderColor: winnerColor + '40', backgroundColor: winnerColor + '18' }]}>
              <Text style={styles.resultTitle}>
                {isUnanimous ? '🏆  Vote unanime !'
                  : isTie    ? '⚖️  Égalité parfaite !'
                             : '👥  La majorité l\'emporte !'}
              </Text>
              <Text style={styles.resultSub}>
                {isUnanimous ? 'Tout le monde marque +2 pts'
                  : isTie    ? 'Personne ne marque de point'
                             : `${(majority === 'a' ? votersA : votersB).join(', ')} → +1 pt`}
              </Text>
            </View>

            <View style={styles.scoresCard}>
              <Text style={styles.scoresTitle}>📊  Scores</Text>
              {sortedByScore.map((name, i) => {
                const gain  = roundPoints?.[name] || 0;
                const total = (scores[name] || 0) + gain;
                return (
                  <View key={name} style={styles.scoreRow}>
                    <Text style={styles.scoreRank}>{i + 1}.</Text>
                    <Text style={styles.scoreName}>{name}</Text>
                    <View style={styles.scoreRight}>
                      {gain > 0 && (
                        <View style={styles.gainBadge}>
                          <Text style={styles.gainText}>+{gain}</Text>
                        </View>
                      )}
                      <Text style={styles.scoreTotal}>{total} pts</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity onPress={handleNextQuestion} style={styles.mainBtn} activeOpacity={0.88}>
              <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                <Text style={styles.mainBtnText}>
                  {questionIdx < questions.length - 1 ? '▶  Question suivante' : '🏁  Résultats finaux'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── final ─────────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sorted = [...playerNames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <LinearGradient colors={['#080818', '#0C0A24', '#080818']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            <Text style={styles.finalTitle}>🏆  Résultats finaux</Text>
            <Text style={styles.finalSub}>Qui a pensé comme la majorité ?</Text>

            {sorted.map((name, i) => (
              <View
                key={name}
                style={[
                  styles.finalRow,
                  {
                    borderColor: i === 0 ? VOTE_COLOR + '70' : colors.border,
                    backgroundColor: i === 0 ? VOTE_COLOR + '20' : colors.card,
                    borderWidth: i === 0 ? 2 : 1,
                  },
                ]}
              >
                <Text style={styles.finalMedal}>{medals[i] ?? `${i + 1}.`}</Text>
                <Text style={[styles.finalName, i === 0 && { color: VOTE_LIGHT }]}>{name}</Text>
                <Text style={[styles.finalScore, i === 0 && { color: VOTE_LIGHT }]}>
                  {scores[name] || 0} pts
                </Text>
              </View>
            ))}

            <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={[styles.mainBtn, { marginTop: spacing.xl }]} activeOpacity={0.88}>
              <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                <Text style={styles.mainBtnText}>🏠  Retour au menu</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('VoteSetup')} style={styles.replayBtn}>
              <Text style={styles.replayText}>↺  Rejouer</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  // Progress header
  progressWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  quitBtn:       { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  quitText:      { fontSize: 16, color: colors.textMuted, fontWeight: '700' },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 2 },
  progressFill:  { height: 4, backgroundColor: VOTE_COLOR, borderRadius: 2 },
  progressLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, minWidth: 32, textAlign: 'right' },

  // Centered layout (most phases)
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, gap: spacing.md,
  },

  // player_ready
  turnLabel:       { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  playerBadge:     { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full, borderWidth: 2 },
  playerBadgeText: { fontSize: 22, fontWeight: '900', color: colors.text },
  secretHint:      { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  voterCounter:    { fontSize: 12, color: colors.textMuted },

  // player_voting
  votingWrapper: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg, gap: spacing.lg,
  },
  voterTag:     { fontSize: 14, fontWeight: '700', color: VOTE_LIGHT, letterSpacing: 1 },
  questionCard: { width: '100%', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  questionText: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', lineHeight: 28 },
  choicesContainer: { width: '100%', gap: spacing.md },
  choiceBtn:     { width: '100%', borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: VOTE_COLOR + '40' },
  choiceBtnInner:{ padding: spacing.lg + 2, alignItems: 'center' },
  choiceText:    { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },

  // player_voted / voting_complete
  bigIcon:      { fontSize: 72 },
  votedTitle:   { fontSize: 26, fontWeight: '900', color: colors.text },
  passText:     { fontSize: 16, color: colors.textSecondary },
  completeTitle:{ fontSize: 26, fontWeight: '900', color: colors.text },
  completeSub:  { fontSize: 15, color: VOTE_LIGHT },

  // main button
  mainBtn: {
    width: '100%', borderRadius: radius.full, overflow: 'hidden',
    shadowColor: VOTE_COLOR, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // reveal
  revealScroll:  { padding: spacing.lg, paddingBottom: 48 },
  revealHeading: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  revealQCard:   { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', marginBottom: spacing.md },
  revealQText:   { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },

  voteColumns: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  voteCol: {
    flex: 1, padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: 4,
  },
  voteColSep: { width: 1, backgroundColor: colors.border, alignSelf: 'stretch' },
  voteCount:  { fontSize: 40, fontWeight: '900', color: colors.text },
  voteOption: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
  voteNames:  { fontSize: 12, color: VOTE_LIGHT, textAlign: 'center', lineHeight: 18 },
  majorityBadge: { fontSize: 9, fontWeight: '900', color: VOTE_LIGHT, letterSpacing: 1.2, marginTop: 4 },

  resultCard:  { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', marginBottom: spacing.md },
  resultTitle: { fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 4 },
  resultSub:   { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  scoresCard:  { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  scoresTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  scoreRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: spacing.sm },
  scoreRank:   { fontSize: 12, color: colors.textMuted, width: 18 },
  scoreName:   { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  scoreRight:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  gainBadge:   { backgroundColor: '#10B98128', borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 2 },
  gainText:    { fontSize: 11, fontWeight: '900', color: '#10B981' },
  scoreTotal:  { fontSize: 14, fontWeight: '700', color: VOTE_LIGHT, minWidth: 38, textAlign: 'right' },

  // final
  finalScroll:  { padding: spacing.xl, paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingBottom: 48 },
  finalTitle:   { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  finalSub:     { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  finalRow:     { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.sm, gap: spacing.md },
  finalMedal:   { fontSize: 26, width: 36 },
  finalName:    { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  finalScore:   { fontSize: 20, fontWeight: '900', color: colors.textSecondary },
  replayBtn:    { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  replayText:   { fontSize: 14, fontWeight: '700', color: colors.textMuted },
});
