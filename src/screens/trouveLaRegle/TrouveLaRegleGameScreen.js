import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { pickRuleAndDecoys, REGLE_CATEGORIES } from '../../data/regles';

const ACCENT       = '#F59E0B';
const ACCENT_LIGHT = '#FDE68A';
const ACCENT_DARK  = '#D97706';

function calcPoints(questions) {
  if (questions <= 3) return 3;
  if (questions <= 6) return 2;
  return 1;
}

export default function TrouveLaRegleGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 5 } = route.params || {};

  const [round,          setRound]          = useState(0);
  const [phase,          setPhase]          = useState('detective_out');
  const [questionCount,  setQuestionCount]  = useState(0);
  const [scores,         setScores]         = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [currentRule,    setCurrentRule]    = useState(null);
  const [options,        setOptions]        = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastResult,     setLastResult]     = useState(null); // { correct, pts }

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const detective = playerNames[round % playerNames.length];
  const others    = playerNames.filter((_, i) => i !== round % playerNames.length);

  useEffect(() => {
    const { rule, options: opts } = pickRuleAndDecoys();
    setCurrentRule(rule);
    setOptions(opts);
    setQuestionCount(0);
    setSelectedOption(null);
    setLastResult(null);
    animateIn();
  }, [round]);

  const animateIn = () => {
    fadeIn.setValue(0);
    slideUp.setValue(30);
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  };

  const goPhase = (p) => {
    fadeIn.setValue(0);
    slideUp.setValue(20);
    setPhase(p);
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 70, friction: 14, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirmGuess = () => {
    if (!selectedOption) return;
    const correct = selectedOption.id === currentRule.id;
    const pts     = correct ? calcPoints(questionCount) : 0;
    if (correct) setScores(prev => ({ ...prev, [detective]: (prev[detective] || 0) + pts }));
    setLastResult({ correct, pts });
    goPhase('result');
  };

  const handleNextRound = () => {
    if (round + 1 >= roundCount) {
      goPhase('final');
    } else {
      setRound(r => r + 1);
      goPhase('detective_out');
    }
  };

  const catMeta = currentRule
    ? REGLE_CATEGORIES.find(c => c.id === currentRule.cat) ?? REGLE_CATEGORIES[0]
    : REGLE_CATEGORIES[0];

  // ── FINAL ─────────────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sorted[0]?.[0];
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll}
          style={Platform.OS === 'web' && { height: '100vh' }}>
          <Animated.View style={{ opacity: fadeIn }}>
            <Text style={styles.finalTitle}>🏆 FIN DE L'ENQUÊTE</Text>
            <View style={[styles.winnerCard, { borderColor: ACCENT + '60', backgroundColor: ACCENT + '18' }]}>
              <Text style={styles.winnerEmoji}>🥇</Text>
              <Text style={styles.winnerName}>{winner}</Text>
              <Text style={styles.winnerSub}>Meilleur(e) détective de la soirée !</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>CLASSEMENT</Text>
              {sorted.map(([name, pts], i) => (
                <View key={name} style={styles.scoreRow}>
                  <Text style={styles.scoreRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </Text>
                  <Text style={styles.scoreName}>{name}</Text>
                  <View style={styles.scoreBarWrap}>
                    <View style={styles.scoreTrack}>
                      <View style={[styles.scoreFill, {
                        width: `${(pts / Math.max(sorted[0][1], 1)) * 100}%`,
                        backgroundColor: ACCENT,
                      }]} />
                    </View>
                  </View>
                  <Text style={styles.scoreVal}>{pts} pts</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('TrouveLaRegleSetup')} style={styles.replayBtn}>
              <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayGrad}>
                <Text style={styles.replayText}>🕵️  Nouvelle enquête</Text>
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

  // ── PHASES PRINCIPALES ────────────────────────────────────────────────────
  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView
        style={[{ flex: 1 }, Platform.OS === 'web' && { height: '100vh' }]}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(round / roundCount) * 100}%` }]} />
        </View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], flex: 1 }}>

          {/* PHASE : DETECTIVE_OUT */}
          {phase === 'detective_out' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🚪</Text>
              <Text style={styles.phaseBigName}>{detective}</Text>
              <Text style={styles.phaseInstruction}>sors de la pièce !</Text>
              <View style={styles.instrBox}>
                <Text style={styles.instrText}>
                  {others.join(', ')} : gardez l'écran pour vous.{'\n'}
                  Appuyez sur le bouton quand {detective} est bien sorti(e).
                </Text>
              </View>
              <TouchableOpacity onPress={() => goPhase('rule_reveal')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>✓  {detective} est sorti(e)</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : RULE_REVEAL */}
          {phase === 'rule_reveal' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>📜</Text>
              <Text style={styles.ruleRevealTitle}>LA RÈGLE SECRÈTE</Text>
              <View style={[styles.ruleCard, { borderColor: catMeta.color + '60', backgroundColor: catMeta.color + '18' }]}>
                <View style={styles.ruleCatBadge}>
                  <Text style={styles.ruleCatEmoji}>{catMeta.emoji}</Text>
                  <Text style={[styles.ruleCatName, { color: catMeta.color }]}>{catMeta.name}</Text>
                </View>
                <Text style={styles.ruleText}>{currentRule?.text}</Text>
              </View>
              <View style={styles.instrBox}>
                <Text style={styles.instrText}>
                  Mémorisez bien la règle.{'\n'}
                  Puis appelez {detective} !
                </Text>
              </View>
              <TouchableOpacity onPress={() => goPhase('playing')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>🔔  Appeler {detective}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : PLAYING */}
          {phase === 'playing' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🔍</Text>
              <Text style={styles.phaseBigName}>{detective}</Text>
              <Text style={styles.phaseInstruction}>est en train d'enquêter…</Text>

              <View style={styles.qCountCard}>
                <Text style={styles.qCountLabel}>QUESTIONS POSÉES</Text>
                <View style={styles.qCountRow}>
                  <TouchableOpacity
                    onPress={() => setQuestionCount(q => Math.max(0, q - 1))}
                    style={styles.qBtn}
                  >
                    <Text style={styles.qBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qCountNum}>{questionCount}</Text>
                  <TouchableOpacity
                    onPress={() => setQuestionCount(q => q + 1)}
                    style={[styles.qBtn, styles.qBtnPlus]}
                  >
                    <Text style={[styles.qBtnText, { color: '#000' }]}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.qCountHint}>
                  {questionCount <= 3
                    ? `⚡ ≤ 3 questions → ${calcPoints(questionCount)} pts`
                    : questionCount <= 6
                      ? `✅ ≤ 6 questions → ${calcPoints(questionCount)} pts`
                      : `⏳ 7+ questions → ${calcPoints(questionCount)} pt`}
                </Text>
              </View>

              <TouchableOpacity onPress={() => goPhase('guessing')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>💡  J'AI TROUVÉ !</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLastResult({ correct: false, pts: 0 });
                  goPhase('result');
                }}
                style={styles.abandonBtn}
              >
                <Text style={styles.abandonText}>🏳  Abandonner cette manche</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : GUESSING */}
          {phase === 'guessing' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🕵️</Text>
              <Text style={styles.ruleRevealTitle}>QUELLE EST LA RÈGLE ?</Text>
              <Text style={styles.guessingHint}>
                {detective}, choisis ta réponse.{'\n'}Les autres : regardez ailleurs !
              </Text>

              <View style={styles.optionsList}>
                {options.map((opt, i) => {
                  const letter = ['A', 'B', 'C', 'D'][i];
                  const active = selectedOption?.id === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setSelectedOption(opt)}
                      style={[styles.optionBtn, active && styles.optionBtnActive]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.optionLetter, active && { backgroundColor: ACCENT }]}>
                        <Text style={[styles.optionLetterText, active && { color: '#000' }]}>{letter}</Text>
                      </View>
                      <Text style={[styles.optionText, active && { color: ACCENT_LIGHT }]}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleConfirmGuess}
                disabled={!selectedOption}
                style={[styles.mainBtn, !selectedOption && { opacity: 0.4 }]}
              >
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>✓  VALIDER MA RÉPONSE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : RESULT */}
          {phase === 'result' && lastResult && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.resultIcon}>
                {lastResult.correct ? '🎉' : '😅'}
              </Text>
              <Text style={styles.resultTitle}>
                {lastResult.correct ? 'BONNE RÉPONSE !' : 'RATÉ !'}
              </Text>
              {lastResult.correct && (
                <Text style={styles.resultPts}>+{lastResult.pts} pt{lastResult.pts > 1 ? 's' : ''}</Text>
              )}

              <View style={styles.instrBox}>
                <Text style={styles.instrLabel}>LA RÈGLE ÉTAIT :</Text>
                <Text style={styles.instrRuleText}>{currentRule?.text}</Text>
              </View>

              <View style={styles.scoresPreview}>
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([name, pts]) => (
                    <View key={name} style={styles.scoresPreviewRow}>
                      <Text style={[styles.scoresPreviewName, name === detective && { color: ACCENT_LIGHT }]}>
                        {name === detective ? '🔍 ' : ''}{name}
                      </Text>
                      <Text style={styles.scoresPreviewPts}>{pts} pts</Text>
                    </View>
                  ))
                }
              </View>

              <TouchableOpacity onPress={handleNextRound} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>
                    {round + 1 >= roundCount ? '🏆  Voir les scores' : '▶  Manche suivante'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { flexGrow: 1, paddingBottom: 60 },

  progressTrack: { height: 3, backgroundColor: colors.border, width: '100%' },
  progressFill:  { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },

  phase: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    gap: spacing.md,
  },

  roundBadge: {
    fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT,
    letterSpacing: 2, marginBottom: spacing.xs,
  },

  phaseIcon: { fontSize: 64, lineHeight: 80 },

  phaseBigName: {
    fontSize: 36, fontWeight: '900', color: ACCENT_LIGHT,
    textAlign: 'center', letterSpacing: 2,
  },
  phaseInstruction: {
    fontSize: 18, fontWeight: '600', color: colors.textSecondary,
    textAlign: 'center',
  },

  instrBox: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, width: '100%', alignItems: 'center',
  },
  instrText: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22,
  },
  instrLabel: {
    fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT,
    letterSpacing: 2, marginBottom: spacing.sm,
  },
  instrRuleText: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    textAlign: 'center', lineHeight: 24,
  },

  ruleRevealTitle: {
    fontSize: 13, fontWeight: '800', color: ACCENT_LIGHT,
    letterSpacing: 3, marginBottom: spacing.xs,
  },
  ruleCard: {
    width: '100%', borderRadius: radius.xl,
    borderWidth: 1, padding: spacing.xl, alignItems: 'center',
  },
  ruleCatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ruleCatEmoji: { fontSize: 20 },
  ruleCatName:  { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  ruleText: {
    fontSize: 22, fontWeight: '900', color: colors.text,
    textAlign: 'center', lineHeight: 32,
  },

  // Compteur questions
  qCountCard: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: `${ACCENT}44`,
    padding: spacing.xl, width: '100%', alignItems: 'center',
  },
  qCountLabel: { fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT, letterSpacing: 2, marginBottom: spacing.md },
  qCountRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginBottom: spacing.sm },
  qCountNum:   { fontSize: 56, fontWeight: '900', color: colors.text, width: 80, textAlign: 'center' },
  qBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qBtnPlus: { backgroundColor: ACCENT, borderColor: ACCENT_DARK },
  qBtnText: { fontSize: 28, fontWeight: '300', color: colors.text, lineHeight: 32 },
  qCountHint: { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '700', textAlign: 'center' },

  // Options
  guessingHint: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: spacing.xs,
  },
  optionsList: { width: '100%', gap: spacing.sm },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  optionBtnActive: { borderColor: ACCENT, backgroundColor: ACCENT + '20' },
  optionLetter: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optionLetterText: { fontSize: 15, fontWeight: '900', color: colors.textMuted },
  optionText:  { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, fontWeight: '600' },

  // Result
  resultIcon:  { fontSize: 72, lineHeight: 88 },
  resultTitle: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  resultPts:   { fontSize: 22, fontWeight: '800', color: ACCENT_LIGHT },

  scoresPreview: {
    width: '100%', backgroundColor: colors.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  scoresPreviewRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  scoresPreviewName: { fontSize: 14, fontWeight: '700', color: colors.text },
  scoresPreviewPts:  { fontSize: 14, fontWeight: '800', color: ACCENT_LIGHT },

  // Buttons
  mainBtn: {
    borderRadius: radius.full, overflow: 'hidden', width: '100%',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 },
  abandonBtn:  { paddingVertical: spacing.sm, alignItems: 'center' },
  abandonText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },

  // Final
  finalScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
  },
  finalTitle: {
    fontSize: 24, fontWeight: '900', color: ACCENT_LIGHT,
    textAlign: 'center', letterSpacing: 3, marginBottom: spacing.xl,
  },
  winnerCard: {
    borderRadius: radius.xl, borderWidth: 1,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md,
  },
  winnerEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winnerName:  { fontSize: 30, fontWeight: '900', color: ACCENT_LIGHT, letterSpacing: 2 },
  winnerSub:   { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },

  scoreRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  scoreRank:   { fontSize: 18, width: 30 },
  scoreName:   { fontSize: 14, fontWeight: '700', color: colors.text, width: 90 },
  scoreBarWrap:{ flex: 1 },
  scoreTrack:  { height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  scoreFill:   { height: '100%', borderRadius: 3 },
  scoreVal:    { fontSize: 13, fontWeight: '800', color: ACCENT_LIGHT, width: 50, textAlign: 'right' },

  replayBtn:  { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm },
  replayGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 2 },
  menuBtn:    { paddingVertical: spacing.md, alignItems: 'center' },
  menuBtnText:{ fontSize: 13, color: colors.textMuted },
});
