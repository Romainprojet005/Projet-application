import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { OTAKU_CATEGORIES, buildOtakuDeck } from '../../data/otakuData';

const ACCENT       = '#F472B6';
const ACCENT_LIGHT = '#FBCFE8';
const ACCENT_DARK  = '#BE185D';

const CATEGORY = Object.fromEntries(OTAKU_CATEGORIES.map(c => [c.id, c]));

const QUESTION_LABEL = {
  indices:   'De quel animé s\'agit-il ?',
  citation:  'Qui a dit ça ?',
  technique: 'Qui utilise cette technique ?',
  emoji:     'Quel animé se cache derrière ces emojis ?',
};

export default function OtakuGameScreen({ route, navigation }) {
  const { playerNames, categories, count = 20 } = route.params;

  const [deck]    = useState(() => buildOtakuDeck(categories, count));
  const [qIdx,    setQIdx]    = useState(0);
  const [phase,   setPhase]   = useState('question'); // question|answer|final
  const [clues,   setClues]   = useState(1);          // indices dévoilés (catégorie « indices »)
  const [helped,  setHelped]  = useState(false);      // aide demandée (emoji : indice, autres : animé)
  const [winners, setWinners] = useState([]);
  const [scores,  setScores]  = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  const revealAnim = useRef(new Animated.Value(0)).current;

  const item = deck[qIdx];
  const cat  = item ? CATEGORY[item.category] : null;

  const pointsAtStake = () => {
    if (!item) return 0;
    if (item.category === 'indices') return 4 - clues;
    return helped ? 1 : 2;
  };

  const handleReveal = () => {
    revealAnim.setValue(0);
    Animated.spring(revealAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }).start();
    setPhase('answer');
  };

  const toggleWinner = (name) => {
    setWinners(w => (w.includes(name) ? w.filter(n => n !== name) : [...w, name]));
  };

  const handleNext = () => {
    const pts = pointsAtStake();
    setScores(s => {
      const next = { ...s };
      winners.forEach(n => { next[n] = (next[n] || 0) + pts; });
      return next;
    });
    setWinners([]);
    setClues(1);
    setHelped(false);
    if (qIdx + 1 >= deck.length) {
      setPhase('final');
      return;
    }
    setQIdx(i => i + 1);
    setPhase('question');
  };

  const counter = `Question ${qIdx + 1} / ${deck.length}`;

  const renderScoreStrip = () => (
    <View style={styles.scoreStrip}>
      {playerNames.map(n => (
        <View key={n} style={styles.scoreChip}>
          <Text style={styles.scoreChipName}>{n}</Text>
          <Text style={styles.scoreChipPts}>{scores[n] || 0}</Text>
        </View>
      ))}
    </View>
  );

  const renderPrompt = () => {
    if (item.category === 'indices') {
      return (
        <View style={styles.cluesBox}>
          {item.clues.map((c, i) => (
            <View key={i} style={[styles.clueRow, i >= clues && phase === 'question' && styles.clueHidden]}>
              <Text style={styles.clueNum}>{i + 1}</Text>
              <Text style={styles.clueText}>{i < clues || phase === 'answer' ? c : '? ? ?'}</Text>
            </View>
          ))}
        </View>
      );
    }
    if (item.category === 'emoji') {
      return (
        <View style={styles.promptCard}>
          <Text style={styles.emojiLine}>{item.emojis.join('  ')}</Text>
          {(helped || phase === 'answer') && <Text style={styles.helpText}>💡 {item.hint}</Text>}
        </View>
      );
    }
    return (
      <View style={styles.promptCard}>
        <Text style={item.category === 'citation' ? styles.quoteText : styles.techText}>{item.q}</Text>
        {helped && phase === 'question' && <Text style={styles.helpText}>💡 Animé : {item.from}</Text>}
      </View>
    );
  };

  // ── RENDER: FINAL ─────────────────────────────────────────────────────
  if (phase === 'final' || !item) {
    const sorted = [...playerNames].sort((x, y) => (scores[y] || 0) - (scores[x] || 0));
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.bigEmoji}>🏆</Text>
          <Text style={styles.title}>Résultats finaux</Text>
          <Text style={styles.hint}>{sorted[0]} est le Hokage des otakus !</Text>

          {sorted.map((name, idx) => (
            <View key={name} style={[styles.finalRow, idx === 0 && styles.finalRowFirst]}>
              <Text style={styles.finalMedal}>{medals[idx] ?? `${idx + 1}.`}</Text>
              <Text style={styles.finalName}>{name}</Text>
              <Text style={styles.finalScore}>{scores[name] || 0} pts</Text>
            </View>
          ))}

          <View style={styles.finalBtns}>
            <TouchableOpacity onPress={() => navigation.replace(route.name, route.params)} style={styles.replayBtn} activeOpacity={0.85}>
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

  // ── RENDER: QUESTION ──────────────────────────────────────────────────
  if (phase === 'question') {
    const canMoreClues = item.category === 'indices' && clues < item.clues.length;
    const canHelp      = item.category !== 'indices' && !helped;
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.counter}>{counter}</Text>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{cat.emoji}  {cat.label}</Text>
          </View>
          <Text style={styles.title}>{QUESTION_LABEL[item.category]}</Text>
          <Text style={styles.stake}>⭐ {pointsAtStake()} pt{pointsAtStake() > 1 ? 's' : ''} en jeu</Text>

          {renderPrompt()}

          {canMoreClues && (
            <TouchableOpacity onPress={() => setClues(c => c + 1)} style={styles.secondaryBtn} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>🔍  Indice suivant (−1 pt)</Text>
            </TouchableOpacity>
          )}
          {canHelp && (
            <TouchableOpacity onPress={() => setHelped(true)} style={styles.secondaryBtn} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>💡  {item.category === 'emoji' ? 'Un indice' : 'Donner l\'animé'} (−1 pt)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleReveal} style={styles.mainBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
              <Text style={styles.mainBtnText}>👀  Révéler la réponse</Text>
            </LinearGradient>
          </TouchableOpacity>

          {renderScoreStrip()}
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: ANSWER ────────────────────────────────────────────────────
  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollCenter}>
        <Text style={styles.counter}>{counter}</Text>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{cat.emoji}  {cat.label}</Text>
        </View>

        {renderPrompt()}

        <Animated.View style={[styles.answerCard, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
          <Text style={styles.answerLabel}>Réponse</Text>
          <Text style={styles.answerText}>{item.answer}</Text>
          {item.from && <Text style={styles.answerFrom}>{item.from}</Text>}
        </Animated.View>

        <Text style={styles.hint}>Qui a trouvé ? (+{pointsAtStake()} pt{pointsAtStake() > 1 ? 's' : ''} chacun)</Text>
        <View style={styles.voteGrid}>
          {playerNames.map(name => {
            const picked = winners.includes(name);
            return (
              <TouchableOpacity
                key={name}
                onPress={() => toggleWinner(name)}
                style={[styles.voteBtn, picked && styles.voteBtnPicked]}
                activeOpacity={0.8}
              >
                <Text style={styles.voteBtnText}>{picked ? '✅ ' : ''}{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.mainBtn} activeOpacity={0.85}>
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
            <Text style={styles.mainBtnText}>
              {winners.length === 0 ? 'Personne → ' : ''}
              {qIdx + 1 >= deck.length ? '🏆 Voir les résultats' : 'Question suivante →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scrollCenter: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center',
  },

  counter:  { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.md },
  bigEmoji: { fontSize: 56, marginBottom: spacing.sm },
  title:    { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  hint:     { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic', textAlign: 'center', maxWidth: 380 },
  stake:    { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '800', marginBottom: spacing.lg },

  catBadge: {
    backgroundColor: ACCENT + '25', borderColor: ACCENT + '60', borderWidth: 1,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, marginBottom: spacing.md,
  },
  catBadgeText: { color: colors.text, fontSize: 13, fontWeight: '700' },

  promptCard: {
    width: '100%', maxWidth: 420, backgroundColor: ACCENT + '12',
    borderRadius: radius.xl, borderWidth: 1, borderColor: ACCENT + '40',
    padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center',
  },
  quoteText: { fontSize: 20, color: colors.text, fontStyle: 'italic', lineHeight: 28, textAlign: 'center' },
  techText:  { fontSize: 24, color: colors.text, fontWeight: '900', textAlign: 'center' },
  emojiLine: { fontSize: 48, textAlign: 'center' },
  helpText:  { fontSize: 14, color: ACCENT_LIGHT, marginTop: spacing.md, textAlign: 'center' },

  cluesBox:  { width: '100%', maxWidth: 420, marginBottom: spacing.lg, gap: spacing.sm },
  clueRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: ACCENT + '15', borderRadius: radius.lg, borderWidth: 1, borderColor: ACCENT + '45',
    padding: spacing.md,
  },
  clueHidden: { backgroundColor: colors.surface, borderColor: colors.border },
  clueNum: {
    width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28,
    backgroundColor: ACCENT, color: '#fff', fontWeight: '900', fontSize: 14, overflow: 'hidden',
  },
  clueText: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },

  mainBtn:      { width: '100%', maxWidth: 400, borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.lg },
  mainBtnInner: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  secondaryBtn: {
    width: '100%', maxWidth: 400, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: radius.full, borderWidth: 1, borderColor: ACCENT + '60', marginBottom: spacing.md,
  },
  secondaryBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '700' },

  scoreStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', maxWidth: 420, marginTop: spacing.sm },
  scoreChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.card, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 4,
  },
  scoreChipName: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  scoreChipPts:  { color: ACCENT_LIGHT, fontSize: 13, fontWeight: '900' },

  answerCard: {
    width: '100%', maxWidth: 420, backgroundColor: ACCENT + '22',
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: ACCENT,
    padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center',
  },
  answerLabel: { fontSize: 12, color: ACCENT_LIGHT, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  answerText:  { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerFrom:  { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic', textAlign: 'center' },

  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl, maxWidth: 420 },
  voteBtn: {
    minWidth: 120, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1, borderColor: ACCENT + '50', backgroundColor: ACCENT + '18',
  },
  voteBtnPicked: { borderColor: ACCENT, backgroundColor: ACCENT + '55' },
  voteBtnText:   { color: colors.text, fontSize: 16, fontWeight: '700' },

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
