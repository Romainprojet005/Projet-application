import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';

const ACCENT       = '#A855F7';
const ACCENT_LIGHT = '#D8B4FE';
const ACCENT_DARK  = '#7C3AED';

const PROMPTS = [
  "J'ai une fois fait semblant de…",
  "Mon secret le plus honteux est…",
  "J'ai déjà menti à propos de…",
  "Je n'ai jamais avoué que…",
  "La chose la plus folle que j'aie faite est…",
];

export default function ConfessionsGameScreen({ route, navigation }) {
  const { playerNames } = route.params;
  const N = playerNames.length;

  // Collect phase
  const [collectorIdx,  setCollectorIdx]  = useState(0);
  const [currentText,   setCurrentText]   = useState('');
  const [confessions,   setConfessions]   = useState([]); // [{authorIdx, text}]

  // Vote phase
  const [confessionIdx,    setConfessionIdx]    = useState(0);
  const [voterIdx,         setVoterIdx]         = useState(0);
  const [currentVotes,     setCurrentVotes]     = useState([]); // [guessedAuthorIdx per voter]
  const [frozenVotes,      setFrozenVotes]      = useState(null); // locked when reveal starts

  // Scores
  const [scores, setScores] = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  // Phase
  const [phase, setPhase] = useState('collect'); // collect|vote|reveal|final

  const revealAnim = useRef(new Animated.Value(0)).current;
  const prompt     = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // ── COLLECT ───────────────────────────────────────────────────────────
  const handleSubmitConfession = () => {
    if (!currentText.trim()) return;
    const next = [...confessions, { authorIdx: collectorIdx, text: currentText.trim() }];
    setConfessions(next);
    setCurrentText('');

    if (collectorIdx + 1 >= N) {
      setConfessionIdx(0);
      setVoterIdx(0);
      setCurrentVotes([]);
      setFrozenVotes(null);
      setPhase('vote');
    } else {
      setCollectorIdx(c => c + 1);
    }
  };

  // ── VOTE ──────────────────────────────────────────────────────────────
  const handleVote = (guessIdx) => {
    const newVotes = [...currentVotes, guessIdx];
    setCurrentVotes(newVotes);

    if (voterIdx + 1 >= N) {
      // All voted — lock votes and reveal
      setFrozenVotes(newVotes);
      setVoterIdx(v => v + 1);
      revealAnim.setValue(0);
      Animated.spring(revealAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }).start();
      setPhase('reveal');
    } else {
      setVoterIdx(v => v + 1);
    }
  };

  // ── REVEAL ────────────────────────────────────────────────────────────
  const handleNext = () => {
    const confession = confessions[confessionIdx];
    const authorIdx  = confession.authorIdx;
    const votes      = frozenVotes || currentVotes;

    const newScores = { ...scores };
    votes.forEach((guessIdx, vIdx) => {
      if (vIdx === authorIdx) return; // author's own vote doesn't count
      if (guessIdx === authorIdx) {
        newScores[playerNames[vIdx]] = (newScores[playerNames[vIdx]] || 0) + 2;
      } else {
        newScores[playerNames[authorIdx]] = (newScores[playerNames[authorIdx]] || 0) + 1;
      }
    });
    setScores(newScores);

    if (confessionIdx + 1 >= confessions.length) {
      setPhase('final');
    } else {
      setConfessionIdx(i => i + 1);
      setVoterIdx(0);
      setCurrentVotes([]);
      setFrozenVotes(null);
      revealAnim.setValue(0);
      setPhase('vote');
    }
  };

  // ── RENDER: COLLECT ───────────────────────────────────────────────────
  if (phase === 'collect') {
    const playerName = playerNames[collectorIdx];
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <View style={styles.progressRow}>
          {playerNames.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= collectorIdx && styles.progressDotActive]} />
          ))}
        </View>

        <Text style={styles.collectEmoji}>👻</Text>
        <Text style={styles.collectTitle}>À toi, {playerName} !</Text>
        <Text style={styles.collectHint}>Les autres, regardez ailleurs ! 👀</Text>

        <View style={[styles.inputCard, { borderColor: ACCENT + '50' }]}>
          <Text style={styles.inputLabel}>Ta confession :</Text>
          <TextInput
            value={currentText}
            onChangeText={setCurrentText}
            placeholder={prompt}
            placeholderTextColor={colors.textMuted}
            style={styles.confessionInput}
            multiline
            maxLength={200}
            autoFocus
          />
          <Text style={styles.charCount}>{currentText.length}/200</Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmitConfession}
          disabled={!currentText.trim()}
          style={[styles.validateBtn, !currentText.trim() && { opacity: 0.4 }]}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.validateInner}>
            <Text style={styles.validateText}>
              {collectorIdx + 1 < N ? '✓  Valider ma confession' : '✓  Terminer la collecte'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── RENDER: VOTE ──────────────────────────────────────────────────────
  if (phase === 'vote') {
    const confession = confessions[confessionIdx];
    const voterName  = playerNames[voterIdx];
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.voteScroll}>
          <Text style={styles.confessionCounter}>Confession {confessionIdx + 1} / {confessions.length}</Text>

          <View style={[styles.mysteryCard, { borderColor: ACCENT + '40' }]}>
            <Text style={styles.mysteryLabel}>👻 Confession anonyme</Text>
            <Text style={styles.mysteryText}>"{confession.text}"</Text>
          </View>

          <Text style={styles.voterTitle}>À toi, {voterName} !</Text>
          <Text style={styles.voterHint}>Qui a écrit cette confession ?</Text>
          <Text style={styles.voterLookAway}>Les autres, regardez ailleurs ! 👀</Text>

          <View style={styles.voteGrid}>
            {playerNames.map((name, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleVote(idx)}
                style={styles.voteBtn}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[ACCENT + '35', ACCENT + '18']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.voteBtnInner}
                >
                  <Text style={styles.voteBtnText}>{name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.voteProgress}>
            {playerNames.map((_, i) => (
              <View key={i} style={[styles.voteDot, i < voterIdx && styles.voteDotDone]} />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: REVEAL ────────────────────────────────────────────────────
  if (phase === 'reveal') {
    const confession = confessions[confessionIdx];
    const authorIdx  = confession.authorIdx;
    const authorName = playerNames[authorIdx];
    const votes      = frozenVotes || currentVotes;

    const results = votes
      .map((guessIdx, vIdx) => ({
        name: playerNames[vIdx],
        correct: guessIdx === authorIdx,
        isAuthor: vIdx === authorIdx,
      }))
      .filter(r => !r.isAuthor);

    const correctCount = results.filter(r => r.correct).length;
    const fooled       = results.length - correctCount;

    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.revealScroll}>
          <Text style={styles.confessionCounter}>Confession {confessionIdx + 1} / {confessions.length}</Text>

          <View style={[styles.mysteryCard, { borderColor: ACCENT + '40' }]}>
            <Text style={styles.mysteryLabel}>👻 La confession</Text>
            <Text style={styles.mysteryText}>"{confession.text}"</Text>
          </View>

          <Animated.View style={[styles.authorCard, {
            opacity: revealAnim,
            transform: [{ scale: revealAnim }],
            borderColor: ACCENT + '60',
          }]}>
            <Text style={styles.authorLabel}>L'auteur est…</Text>
            <Text style={styles.authorName}>🎭 {authorName}</Text>
            {fooled > 0 && <Text style={styles.authorFooled}>a trompé {fooled} joueur{fooled > 1 ? 's' : ''} (+{fooled} pt{fooled > 1 ? 's' : ''})</Text>}
          </Animated.View>

          <View style={styles.resultsBox}>
            {results.map((r, i) => (
              <View key={i} style={styles.resultRow}>
                <Text style={r.correct ? styles.resultCorrect : styles.resultWrong}>
                  {r.correct ? '✓' : '✗'}  {r.name}
                </Text>
                {r.correct && <Text style={styles.resultPts}>+2 pts</Text>}
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextInner}>
              <Text style={styles.nextBtnText}>
                {confessionIdx + 1 >= confessions.length ? '🏆 Voir les résultats' : 'Confession suivante →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: FINAL ─────────────────────────────────────────────────────
  const sorted = [...playerNames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.finalScroll}>
        <Text style={styles.finalEmoji}>🏆</Text>
        <Text style={styles.finalTitle}>Résultats finaux</Text>
        <Text style={styles.finalSub}>Qui a le mieux gardé ses secrets ?</Text>

        {sorted.map((name, idx) => (
          <View key={name} style={[styles.finalRow, idx === 0 && styles.finalRowFirst]}>
            <Text style={styles.finalMedal}>{medals[idx] ?? `${idx + 1}.`}</Text>
            <Text style={styles.finalName}>{name}</Text>
            <Text style={styles.finalScore}>{scores[name] || 0} pts</Text>
          </View>
        ))}

        <View style={styles.finalBtns}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.replayBtn} activeOpacity={0.85}>
            <Text style={styles.replayBtnText}>🔄 Rejouer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.menuInner}>
              <Text style={styles.menuBtnText}>Retour au menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  fullCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, ...Platform.select({ web: { height: '100vh' } }),
  },

  // COLLECT
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  progressDotActive: { backgroundColor: ACCENT, borderColor: ACCENT },

  collectEmoji: { fontSize: 56, marginBottom: spacing.sm },
  collectTitle: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  collectHint:  { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl, fontStyle: 'italic' },

  inputCard: {
    width: '100%', maxWidth: 380, backgroundColor: colors.card,
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputLabel: { fontSize: 12, color: ACCENT_LIGHT, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 1 },
  confessionInput: {
    color: colors.text, fontSize: 16, minHeight: 90, textAlignVertical: 'top',
    ...Platform.select({ web: { outlineStyle: 'none', resize: 'none' } }),
  },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },

  validateBtn:   { width: '100%', maxWidth: 380, borderRadius: radius.full, overflow: 'hidden' },
  validateInner: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  validateText:  { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  // VOTE
  voteScroll: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center',
  },
  confessionCounter: {
    fontSize: 13, color: ACCENT_LIGHT, fontWeight: '700', letterSpacing: 1,
    marginBottom: spacing.lg, alignSelf: 'center',
  },
  mysteryCard: {
    width: '100%', maxWidth: 400, backgroundColor: ACCENT + '12',
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  mysteryLabel: { fontSize: 12, color: ACCENT_LIGHT, fontWeight: '700', marginBottom: spacing.sm },
  mysteryText:  { fontSize: 17, color: colors.text, fontStyle: 'italic', lineHeight: 26 },

  voterTitle:    { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  voterHint:     { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  voterLookAway: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg, fontStyle: 'italic' },

  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  voteBtn:      { borderRadius: radius.lg, overflow: 'hidden', minWidth: 130 },
  voteBtnInner: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: ACCENT + '50' },
  voteBtnText:  { color: colors.text, fontSize: 16, fontWeight: '700' },

  voteProgress: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  voteDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  voteDotDone: { backgroundColor: ACCENT, borderColor: ACCENT },

  // REVEAL
  revealScroll: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center',
  },
  authorCard: {
    width: '100%', maxWidth: 400, backgroundColor: ACCENT + '18',
    borderRadius: radius.xl, borderWidth: 1.5, padding: spacing.xl,
    marginBottom: spacing.lg, alignItems: 'center',
  },
  authorLabel:  { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '600', marginBottom: spacing.sm },
  authorName:   { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  authorFooled: { fontSize: 13, color: ACCENT_LIGHT, fontStyle: 'italic' },

  resultsBox: { width: '100%', maxWidth: 400, marginBottom: spacing.xl },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  resultCorrect: { fontSize: 15, fontWeight: '700', color: '#34D399' },
  resultWrong:   { fontSize: 15, fontWeight: '700', color: '#FCA5A5' },
  resultPts:     { fontSize: 13, fontWeight: '700', color: ACCENT_LIGHT },

  nextBtn:   { width: '100%', maxWidth: 400, borderRadius: radius.full, overflow: 'hidden' },
  nextInner: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // FINAL
  finalScroll: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: spacing.xl, paddingBottom: 60, alignItems: 'center',
  },
  finalEmoji: { fontSize: 52, marginBottom: spacing.sm },
  finalTitle: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  finalSub:   { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl, fontStyle: 'italic' },

  finalRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 380,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  finalRowFirst: { borderColor: ACCENT + '70', backgroundColor: ACCENT + '15' },
  finalMedal:    { fontSize: 22, width: 36 },
  finalName:     { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  finalScore:    { fontSize: 18, fontWeight: '900', color: ACCENT_LIGHT },

  finalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%', maxWidth: 380 },
  replayBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  replayBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  menuBtn:       { flex: 2, borderRadius: radius.full, overflow: 'hidden' },
  menuInner:     { paddingVertical: spacing.md + 2, alignItems: 'center' },
  menuBtnText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
});
