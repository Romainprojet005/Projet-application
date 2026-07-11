import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { pickPromptAndDecoys } from '../../data/quiEstLePlusPrompts';

const ACCENT       = '#EC4899';
const ACCENT_LIGHT = '#FBCFE8';
const ACCENT_DARK  = '#BE185D';

export default function TriPotesGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 6, categoryId = 'all' } = route.params || {};

  const [round,       setRound]       = useState(0);
  const [phase,       setPhase]       = useState('pass_to_judge');
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [options,     setOptions]     = useState([]);
  const [ranking,     setRanking]     = useState([]);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [scores,      setScores]      = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [lastResult,  setLastResult]  = useState(null); // { correct }

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const judge  = playerNames[round % playerNames.length];
  const others = playerNames.filter((_, i) => i !== round % playerNames.length);

  useEffect(() => {
    const { prompt, options: opts } = pickPromptAndDecoys(categoryId);
    setCurrentPrompt(prompt);
    setOptions(opts);
    setRanking([]);
    setSelectedGuess(null);
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

  const toggleRank = (name) => {
    if (ranking.includes(name)) return;
    setRanking(prev => [...prev, name]);
  };

  const resetRanking = () => setRanking([]);

  const handleConfirmGuess = () => {
    if (!selectedGuess) return;
    const correct = selectedGuess.id === currentPrompt.id;
    const newScores = { ...scores };
    if (correct) {
      others.forEach(n => { newScores[n] = (newScores[n] || 0) + 1; });
    } else {
      newScores[judge] = (newScores[judge] || 0) + 2;
    }
    setScores(newScores);
    setLastResult({ correct });
    goPhase('result');
  };

  const handleNextRound = () => {
    if (round + 1 >= roundCount) {
      goPhase('final');
    } else {
      setRound(r => r + 1);
      goPhase('pass_to_judge');
    }
  };

  // ── FINAL ─────────────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sorted[0]?.[0];
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll}
          style={Platform.OS === 'web' && { height: '100vh' }}>
          <Animated.View style={{ opacity: fadeIn }}>
            <Text style={styles.finalTitle}>🏆 FIN DU JUGEMENT</Text>
            <View style={[styles.winnerCard, { borderColor: ACCENT + '60', backgroundColor: ACCENT + '18' }]}>
              <Text style={styles.winnerEmoji}>🥇</Text>
              <Text style={styles.winnerName}>{winner}</Text>
              <Text style={styles.winnerSub}>Meilleur(e) juge de potes de la soirée !</Text>
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
            <TouchableOpacity onPress={() => navigation.navigate('TriPotesSetup')} style={styles.replayBtn}>
              <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayGrad}>
                <Text style={styles.replayText}>🎭  Nouveau jugement</Text>
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
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(round / roundCount) * 100}%` }]} />
        </View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], flex: 1 }}>

          {/* PHASE : PASS_TO_JUDGE */}
          {phase === 'pass_to_judge' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🤫</Text>
              <Text style={styles.phaseBigName}>{judge}</Text>
              <Text style={styles.phaseInstruction}>est le juge de cette manche</Text>
              <View style={styles.instrBox}>
                <Text style={styles.instrText}>
                  Donnez le téléphone à {judge}.{'\n'}
                  Les autres, ne regardez pas l'écran !
                </Text>
              </View>
              <TouchableOpacity onPress={() => goPhase('question_reveal')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>✓  {judge} a le téléphone</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : QUESTION_REVEAL */}
          {phase === 'question_reveal' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🔮</Text>
              <Text style={styles.ruleRevealTitle}>LA QUESTION SECRÈTE</Text>
              <View style={[styles.ruleCard, { borderColor: ACCENT + '60', backgroundColor: ACCENT + '18' }]}>
                <Text style={styles.ruleText}>{currentPrompt?.text}</Text>
              </View>
              <View style={styles.instrBox}>
                <Text style={styles.instrText}>
                  Mémorisez bien la question.{'\n'}
                  Vous allez classer les autres joueurs selon elle.
                </Text>
              </View>
              <TouchableOpacity onPress={() => goPhase('ranking')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>📊  Classer les joueurs</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : RANKING */}
          {phase === 'ranking' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>📊</Text>
              <Text style={styles.ruleRevealTitle}>CLASSEZ-LES</Text>
              <Text style={styles.guessingHint}>
                Touchez les joueurs du plus au moins concerné par la question.
              </Text>

              <View style={styles.optionsList}>
                {others.map((name) => {
                  const pos = ranking.indexOf(name);
                  const ranked = pos !== -1;
                  return (
                    <TouchableOpacity
                      key={name}
                      onPress={() => toggleRank(name)}
                      disabled={ranked}
                      style={[styles.optionBtn, ranked && styles.optionBtnActive]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.optionLetter, ranked && { backgroundColor: ACCENT }]}>
                        <Text style={[styles.optionLetterText, ranked && { color: '#000' }]}>
                          {ranked ? pos + 1 : '•'}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, ranked && { color: ACCENT_LIGHT }]}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {ranking.length > 0 && (
                <TouchableOpacity onPress={resetRanking} style={styles.abandonBtn}>
                  <Text style={styles.abandonText}>↺  Réinitialiser le classement</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => goPhase('reveal_ranking')}
                disabled={ranking.length !== others.length}
                style={[styles.mainBtn, ranking.length !== others.length && { opacity: 0.4 }]}
              >
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>✓  VALIDER LE CLASSEMENT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : REVEAL_RANKING */}
          {phase === 'reveal_ranking' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>📣</Text>
              <Text style={styles.ruleRevealTitle}>LE CLASSEMENT DE {judge?.toUpperCase()}</Text>
              <View style={styles.optionsList}>
                {ranking.map((name, i) => (
                  <View key={name} style={styles.optionBtn}>
                    <View style={[styles.optionLetter, { backgroundColor: ACCENT }]}>
                      <Text style={[styles.optionLetterText, { color: '#000' }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.optionText}>{name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.instrBox}>
                <Text style={styles.instrText}>
                  Passez le téléphone au reste du groupe.{'\n'}
                  Vous devez deviner la vraie question secrète !
                </Text>
              </View>
              <TouchableOpacity onPress={() => goPhase('guessing')} style={styles.mainBtn}>
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>🔔  Le groupe est prêt</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : GUESSING */}
          {phase === 'guessing' && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.phaseIcon}>🔎</Text>
              <Text style={styles.ruleRevealTitle}>QUELLE ÉTAIT LA QUESTION ?</Text>
              <Text style={styles.guessingHint}>
                Regardez le classement et choisissez la vraie question.{'\n'}{judge} : ne dites rien !
              </Text>

              <View style={styles.rankingRecap}>
                {ranking.map((name, i) => (
                  <View key={name} style={styles.rankingRecapItem}>
                    <View style={styles.rankingRecapBadge}>
                      <Text style={styles.rankingRecapBadgeText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.rankingRecapName} numberOfLines={1}>{name}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.optionsList}>
                {options.map((opt, i) => {
                  const letter = ['A', 'B', 'C', 'D'][i];
                  const active = selectedGuess?.id === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setSelectedGuess(opt)}
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
                disabled={!selectedGuess}
                style={[styles.mainBtn, !selectedGuess && { opacity: 0.4 }]}
              >
                <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>✓  VALIDER LA RÉPONSE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* PHASE : RESULT */}
          {phase === 'result' && lastResult && (
            <View style={styles.phase}>
              <Text style={styles.roundBadge}>MANCHE {round + 1} / {roundCount}</Text>
              <Text style={styles.resultIcon}>
                {lastResult.correct ? '🎉' : '😏'}
              </Text>
              <Text style={styles.resultTitle}>
                {lastResult.correct ? 'LE GROUPE A TROUVÉ !' : `${judge?.toUpperCase()} A BLUFFÉ !`}
              </Text>
              <Text style={styles.resultPts}>
                {lastResult.correct ? `+1 pt pour chaque joueur` : `+2 pts pour ${judge}`}
              </Text>

              <View style={styles.instrBox}>
                <Text style={styles.instrLabel}>LA QUESTION ÉTAIT :</Text>
                <Text style={styles.instrRuleText}>{currentPrompt?.text}</Text>
              </View>

              <View style={styles.scoresPreview}>
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([name, pts]) => (
                    <View key={name} style={styles.scoresPreviewRow}>
                      <Text style={[styles.scoresPreviewName, name === judge && { color: ACCENT_LIGHT }]}>
                        {name === judge ? '🤫 ' : ''}{name}
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
    letterSpacing: 3, marginBottom: spacing.xs, textAlign: 'center',
  },
  ruleCard: {
    width: '100%', borderRadius: radius.xl,
    borderWidth: 1, padding: spacing.xl, alignItems: 'center',
  },
  ruleText: {
    fontSize: 22, fontWeight: '900', color: colors.text,
    textAlign: 'center', lineHeight: 32,
  },

  guessingHint: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: spacing.xs,
  },
  rankingRecap: {
    width: '100%', backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${ACCENT}44`, padding: spacing.md, gap: spacing.xs,
  },
  rankingRecapItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rankingRecapBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rankingRecapBadgeText: { fontSize: 11, fontWeight: '900', color: '#000' },
  rankingRecapName: { fontSize: 13, fontWeight: '700', color: colors.text },
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

  resultIcon:  { fontSize: 72, lineHeight: 88 },
  resultTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 1, textAlign: 'center' },
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

  mainBtn: {
    borderRadius: radius.full, overflow: 'hidden', width: '100%',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 },
  abandonBtn:  { paddingVertical: spacing.sm, alignItems: 'center' },
  abandonText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },

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
