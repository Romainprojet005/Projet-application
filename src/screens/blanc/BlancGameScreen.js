import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG, GOLD, GOLD_LIGHT, GOLD_DARK, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
import { ANSWERS } from '../../data/blancMangerData';

const PRP       = colors.primary;
const PRP_LIGHT = colors.primaryLight;
const PRP_DARK  = colors.primaryDark;

function initCards(playerCount, answers) {
  const pool = [...answers.map(a => a.id)].sort(() => Math.random() - 0.5);
  const hands = {};
  for (let i = 0; i < playerCount; i++) {
    hands[i] = pool.splice(0, 7);
  }
  return { hands, deck: pool };
}

export default function BlancGameScreen({ navigation, route }) {
  const { players, category, totalRounds, questions } = route.params;

  const answers = useMemo(() =>
    ANSWERS.filter(a => !a.adulte || category === 'adulte'),
  []);

  const answerMap = useMemo(() =>
    Object.fromEntries(answers.map(a => [a.id, a.text])),
  [answers]);

  const [phase, setPhase]           = useState('question');
  const [round, setRound]           = useState(0);
  const [judgeIdx, setJudgeIdx]     = useState(0);
  const [pickerStep, setPickerStep] = useState(0);
  const [gameCards, setGameCards]   = useState(() => initCards(players.length, answers));
  const [submissions, setSubmissions]     = useState({});
  const [selectedCard, setSelectedCard]   = useState(null);
  const [judgeSelected, setJudgeSelected] = useState(null);
  const [winnerIdx, setWinnerIdx]         = useState(null);
  const [shuffledSubs, setShuffledSubs]   = useState([]);
  const [scores, setScores] = useState(
    Object.fromEntries(players.map((_, i) => [i, 0]))
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const pickers = players.map((_, i) => i).filter(i => i !== judgeIdx);
  const currentQuestion = questions[round];

  const go = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartPicking = () => go(() => { setPickerStep(0); setPhase('picker_lock'); });

  const handlePickerLockOK = () => go(() => { setSelectedCard(null); setPhase('picker_active'); });

  const handleCardSelect = (id) => setSelectedCard(id);

  const handlePickerSubmit = () => {
    if (selectedCard === null) return;
    const playerIdx = pickers[pickerStep];

    setGameCards(prev => {
      const newHand = prev.hands[playerIdx].filter(id => id !== selectedCard);
      const newDeck = [...prev.deck];
      if (newDeck.length > 0) newHand.push(newDeck.shift());
      return { hands: { ...prev.hands, [playerIdx]: newHand }, deck: newDeck };
    });
    setSubmissions(prev => ({ ...prev, [playerIdx]: selectedCard }));

    go(() => {
      if (pickerStep < pickers.length - 1) {
        setPickerStep(s => s + 1);
        setSelectedCard(null);
        setPhase('picker_lock');
      } else {
        setPhase('judge_lock');
      }
    });
  };

  const handleJudgeLockOK = () => {
    const subs = pickers.map(pi => ({ playerIdx: pi, cardId: submissions[pi] }));
    setShuffledSubs([...subs].sort(() => Math.random() - 0.5));
    setJudgeSelected(null);
    go(() => setPhase('judge_active'));
  };

  const handleJudgePickCard = (id) => setJudgeSelected(id);

  const handleJudgeConfirm = () => {
    if (judgeSelected === null) return;
    const winner = shuffledSubs.find(s => s.cardId === judgeSelected);
    const wIdx = winner.playerIdx;
    setWinnerIdx(wIdx);
    setScores(prev => ({ ...prev, [wIdx]: (prev[wIdx] || 0) + 1 }));
    go(() => setPhase('reveal'));
  };

  const handleNextRound = () => {
    if (round + 1 >= totalRounds) { go(() => setPhase('results')); return; }
    const nextJudge = (judgeIdx + 1) % players.length;
    go(() => {
      setRound(r => r + 1);
      setJudgeIdx(nextJudge);
      setPickerStep(0);
      setSubmissions({});
      setSelectedCard(null);
      setJudgeSelected(null);
      setWinnerIdx(null);
      setShuffledSubs([]);
      setPhase('question');
    });
  };

  // ── Results screen ─────────────────────────────────────────────────────────

  if (phase === 'results') {
    const sorted = players
      .map((name, i) => ({ name, score: scores[i] || 0, idx: i }))
      .sort((a, b) => b.score - a.score);

    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.resultsScroll}
          showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' && { height: '100vh' }}
        >
          <Text style={styles.resultsTitle}>🏆 RÉSULTATS FINAUX</Text>
          <Text style={styles.resultsSub}>Qui a fait le plus rire le jury ?</Text>

          {sorted.map((p, idx) => (
            <LinearGradient
              key={p.name}
              colors={idx === 0 ? ['#2A1800', '#1A0D00'] : ['transparent', 'transparent']}
              style={[styles.resultRow, idx === 0 && styles.resultRowWinner]}
            >
              <Text style={styles.resultRank}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </Text>
              <Text style={[styles.resultName, idx === 0 && { color: GOLD_LIGHT }]}>{p.name}</Text>
              <Text style={[styles.resultScore, idx === 0 && { color: GOLD_LIGHT }]}>
                {p.score} pt{p.score > 1 ? 's' : ''}
              </Text>
            </LinearGradient>
          ))}

          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={{ marginTop: spacing.xl }}>
            <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>🏠 Retour au menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function renderQuestionCard(full = true) {
    const parts = currentQuestion.split('___');
    return full ? (
      <LinearGradient colors={['#1C0D40', '#0E0820']} style={styles.blackCard}>
        <Text style={styles.blackCardText}>
          {parts[0]}
          <Text style={styles.blackCardBlank}>___________</Text>
          {parts[1] || ''}
        </Text>
      </LinearGradient>
    ) : (
      <View style={styles.miniBlack}>
        <Text style={styles.miniBlackText}>
          {parts[0]}<Text style={styles.miniBlackBlank}> ___ </Text>{parts[1] || ''}
        </Text>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕ Quitter</Text>
        </TouchableOpacity>
        <Text style={styles.roundText}>{round + 1} / {totalRounds}</Text>
        <View style={styles.judgeTag}>
          <Text style={styles.judgeTagText}>⚖️ {players[judgeIdx]}</Text>
        </View>
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {/* ── Phase : QUESTION ─────────────────────────────────────── */}
        {phase === 'question' && (
          <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.phaseLabel}>🃏 CARTE NOIRE — TOUR {round + 1}</Text>
            {renderQuestionCard(true)}
            <Text style={styles.instruction}>
              {players[judgeIdx]}, lis la carte à voix haute !{'\n'}
              Tout le monde écoute avant de choisir sa réponse.
            </Text>
            <TouchableOpacity onPress={handleStartPicking} style={styles.mainBtn}>
              <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                <Text style={styles.mainBtnText}>Lancez vos réponses ! 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Phase : PICKER LOCK ──────────────────────────────────── */}
        {phase === 'picker_lock' && (
          <View style={styles.lockContent}>
            <View style={styles.lockCard}>
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={styles.lockNum}>JOUEUR {pickers[pickerStep] + 1}</Text>
              <Text style={styles.lockName}>{players[pickers[pickerStep]]}</Text>
              <Text style={styles.lockSub}>
                Prends le téléphone seul(e).{'\n'}Les autres regardent ailleurs !
              </Text>
              <TouchableOpacity onPress={handlePickerLockOK} style={styles.mainBtn}>
                <LinearGradient colors={[PRP, PRP_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>Je suis prêt(e) 👀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Phase : PICKER ACTIVE ────────────────────────────────── */}
        {phase === 'picker_active' && (() => {
          const playerIdx = pickers[pickerStep];
          const hand = gameCards.hands[playerIdx] || [];
          return (
            <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.phaseLabel}>✋ {players[playerIdx]}, choisis ta carte !</Text>
              {renderQuestionCard(false)}
              <Text style={styles.instruction}>Laquelle fera le plus rire le jury ?</Text>

              <View style={styles.handGrid}>
                {hand.map(cardId => (
                  <TouchableOpacity
                    key={cardId}
                    onPress={() => handleCardSelect(cardId)}
                    style={[styles.whiteCard, selectedCard === cardId && styles.whiteCardSelected]}
                    activeOpacity={0.75}
                  >
                    {selectedCard === cardId && <Text style={styles.checkMark}>✓</Text>}
                    <Text style={[styles.whiteCardText, selectedCard === cardId && styles.whiteCardTextSel]}>
                      {answerMap[cardId]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCard !== null && (
                <TouchableOpacity onPress={handlePickerSubmit} style={[styles.mainBtn, { marginTop: spacing.md }]}>
                  <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                    <Text style={styles.mainBtnText}>Choisir cette carte ✓</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </ScrollView>
          );
        })()}

        {/* ── Phase : JUDGE LOCK ───────────────────────────────────── */}
        {phase === 'judge_lock' && (
          <View style={styles.lockContent}>
            <View style={styles.lockCard}>
              <Text style={styles.lockEmoji}>⚖️</Text>
              <Text style={styles.lockNum}>JURY</Text>
              <Text style={styles.lockName}>{players[judgeIdx]}</Text>
              <Text style={styles.lockSub}>
                Tout le monde a voté !{'\n'}Reprends le téléphone et choisis la réponse la plus drôle.
              </Text>
              <TouchableOpacity onPress={handleJudgeLockOK} style={styles.mainBtn}>
                <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>Voir les réponses 👁️</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Phase : JUDGE ACTIVE ─────────────────────────────────── */}
        {phase === 'judge_active' && (
          <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.phaseLabel}>⚖️ {players[judgeIdx]}, choisis la meilleure !</Text>
            {renderQuestionCard(false)}
            <Text style={styles.instruction}>Tape la réponse qui t'a fait le plus rire.</Text>

            <View style={styles.handGrid}>
              {shuffledSubs.map(({ cardId }) => (
                <TouchableOpacity
                  key={cardId}
                  onPress={() => handleJudgePickCard(cardId)}
                  style={[styles.whiteCard, judgeSelected === cardId && styles.whiteCardGold]}
                  activeOpacity={0.75}
                >
                  {judgeSelected === cardId && <Text style={styles.checkMark}>👑</Text>}
                  <Text style={[styles.whiteCardText, judgeSelected === cardId && styles.whiteCardTextGold]}>
                    {answerMap[cardId]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {judgeSelected !== null && (
              <TouchableOpacity onPress={handleJudgeConfirm} style={[styles.mainBtn, { marginTop: spacing.md }]}>
                <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>Couronner cette réponse 👑</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ── Phase : REVEAL ───────────────────────────────────────── */}
        {phase === 'reveal' && (() => {
          const winnerName = players[winnerIdx];
          const winnerCard = submissions[winnerIdx];
          const winnerText = answerMap[winnerCard];
          const parts = currentQuestion.split('___');
          return (
            <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.winEmoji}>🎉</Text>
              <Text style={styles.winTitle}>{winnerName} gagne ce tour !</Text>

              <LinearGradient colors={['#1C0D40', '#0E0820']} style={[styles.blackCard, { marginBottom: spacing.lg }]}>
                <Text style={styles.blackCardText}>
                  {parts[0]}
                  <Text style={{ color: GOLD_LIGHT, fontWeight: '900' }}> {winnerText} </Text>
                  {parts[1] || ''}
                </Text>
              </LinearGradient>

              <View style={styles.scoreCard}>
                <Text style={styles.scoreCardLabel}>🏅 SCORES</Text>
                {players.map((name, i) => (
                  <View key={i} style={styles.scoreRow}>
                    <Text style={[styles.scoreName, i === winnerIdx && { color: GOLD_LIGHT }]}>
                      {i === winnerIdx ? '⭐ ' : ''}{name}
                    </Text>
                    <Text style={[styles.scoreVal, i === winnerIdx && { color: GOLD_LIGHT }]}>
                      {scores[i] || 0} pt{(scores[i] || 0) > 1 ? 's' : ''}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={handleNextRound} style={styles.mainBtn}>
                <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>
                    {round + 1 >= totalRounds ? 'Voir les résultats 🏆' : `Tour suivant →`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          );
        })()}

      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quitBtn:  { paddingVertical: 4 },
  quitText: { color: colors.textMuted, fontSize: 13 },
  roundText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
  judgeTag: {
    backgroundColor: GOLD + '22',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: GOLD + '44',
  },
  judgeTagText: { fontSize: 11, fontWeight: '700', color: GOLD_LIGHT },

  // Phase containers
  phaseContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  phaseLabel: {
    fontSize: 11, fontWeight: '800', color: PRP_LIGHT,
    letterSpacing: 2, marginBottom: spacing.md, textAlign: 'center',
  },

  lockContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  lockCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  lockEmoji: { fontSize: 56, marginBottom: spacing.md },
  lockNum: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 3, marginBottom: 4 },
  lockName: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  lockSub: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: spacing.xl,
  },

  // Black card (question)
  blackCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: PRP + '55',
    shadowColor: PRP,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blackCardText: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    textAlign: 'center', lineHeight: 30,
  },
  blackCardBlank: { color: PRP_LIGHT, fontWeight: '900', textDecorationLine: 'underline' },

  // Mini black card (during picking)
  miniBlack: {
    backgroundColor: '#1C0D40',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: PRP + '44',
  },
  miniBlackText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  miniBlackBlank: { color: PRP_LIGHT, fontWeight: '900' },

  instruction: {
    fontSize: 13, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
    marginBottom: spacing.lg, fontStyle: 'italic',
  },

  // Hand grid (answer cards)
  handGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.sm, marginBottom: spacing.sm,
  },
  whiteCard: {
    width: '47%',
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  whiteCardSelected: {
    borderColor: PRP,
    backgroundColor: '#EDE9FE',
    shadowColor: PRP,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  whiteCardGold: {
    borderColor: GOLD,
    backgroundColor: '#FEF3C7',
    shadowColor: GOLD,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  checkMark: { fontSize: 14, fontWeight: '900', color: PRP, marginBottom: 4 },
  whiteCardText:     { fontSize: 13, fontWeight: '700', color: '#1A1A2E', lineHeight: 18 },
  whiteCardTextSel:  { color: PRP_DARK },
  whiteCardTextGold: { color: '#78350F' },

  // Main button
  mainBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 1 },

  // Reveal
  winEmoji: { fontSize: 64, textAlign: 'center', marginBottom: spacing.sm },
  winTitle: {
    fontSize: 26, fontWeight: '900', color: GOLD_LIGHT,
    textAlign: 'center', marginBottom: spacing.lg,
  },

  // Score card (during reveal)
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreCardLabel: { fontSize: 11, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 2, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  scoreName: { fontSize: 14, fontWeight: '700', color: colors.text },
  scoreVal:  { fontSize: 14, fontWeight: '800', color: colors.textSecondary },

  // Results screen
  resultsScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xxl,
  },
  resultsTitle: {
    fontSize: 28, fontWeight: '900', color: GOLD_LIGHT,
    textAlign: 'center', letterSpacing: 3, marginBottom: spacing.xs,
  },
  resultsSub: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', marginBottom: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  resultRowWinner: { borderColor: GOLD + '88' },
  resultRank:  { fontSize: 22, width: 36 },
  resultName:  { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
  resultScore: { fontSize: 18, fontWeight: '900', color: colors.textSecondary },
});
