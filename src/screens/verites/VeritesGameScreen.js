import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { VERITES_PROMPTS, VERITES_HOT_PROMPTS, VERITES_TRES_HOT_PROMPTS, VERITES_HOT_JOKER } from '../../data/veritesVoleesData';

const PROMPTS_BY_MODE = {
  classique: VERITES_PROMPTS,
  hot:       VERITES_HOT_PROMPTS,
  tres_hot:  VERITES_TRES_HOT_PROMPTS,
};

const ACCENT       = '#14B8A6';
const ACCENT_LIGHT = '#99F6E4';
const ACCENT_DARK  = '#0F766E';
const DANGER       = '#F87171';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function VeritesGameScreen({ route, navigation }) {
  const { playerNames, rounds = 3, mode = 'classique' } = route.params;
  const N = playerNames.length;
  const isHot = mode !== 'classique';

  // Une question différente par manche, tirée une fois pour toute la partie
  const [prompts] = useState(() => shuffle(PROMPTS_BY_MODE[mode] ?? VERITES_PROMPTS).slice(0, rounds));
  const [roundIdx, setRoundIdx] = useState(0);
  const prompt = prompts[roundIdx];
  const isQuestion = prompt.trim().endsWith('?') || prompt.trim().endsWith('.');

  // write|read|discuss|vote|reveal|final — chaque tour de passage commence masqué (handoff)
  const [phase,    setPhase]    = useState('write');
  const [turnIdx,  setTurnIdx]  = useState(0);
  const [unlocked, setUnlocked] = useState(false); // le joueur a confirmé qu'il tient le téléphone
  const [aloud,    setAloud]    = useState(false); // lecture à voix haute (écran neutre)

  const [currentText, setCurrentText] = useState('');
  const [truths,      setTruths]      = useState([]);   // truths[i] = vérité écrite par i
  const [swapped,     setSwapped]     = useState([]);   // [a, b] : a lit la vérité de b et inversement
  const [selection,   setSelection]   = useState([]);   // suspects choisis par le votant courant
  const [votes,       setVotes]       = useState([]);   // votes[i] = [suspect1, suspect2]
  const [roundPoints, setRoundPoints] = useState({});
  const [scores, setScores] = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  const revealAnim = useRef(new Animated.Value(0)).current;

  const readerTruthIdx = (i) => {
    const [a, b] = swapped;
    if (i === a) return b;
    if (i === b) return a;
    return i;
  };

  const nextTurn = (onDone) => {
    setUnlocked(false);
    setAloud(false);
    if (turnIdx + 1 >= N) {
      setTurnIdx(0);
      onDone();
    } else {
      setTurnIdx(t => t + 1);
    }
  };

  // ── WRITE ─────────────────────────────────────────────────────────────
  const handleSubmitTruth = () => {
    if (!currentText.trim()) return;
    const next = [...truths];
    next[turnIdx] = currentText.trim();
    setTruths(next);
    setCurrentText('');
    nextTurn(() => {
      const [a, b] = shuffle([...Array(N).keys()]);
      setSwapped([a, b]);
      setPhase('read');
    });
  };

  // ── VOTE ──────────────────────────────────────────────────────────────
  const toggleSuspect = (idx) => {
    if (selection.includes(idx)) setSelection(selection.filter(s => s !== idx));
    else if (selection.length < 2) setSelection([...selection, idx]);
  };

  const handleConfirmVote = () => {
    if (selection.length !== 2) return;
    const nextVotes = [...votes];
    nextVotes[turnIdx] = selection;
    setVotes(nextVotes);
    setSelection([]);
    nextTurn(() => {
      // Innocent : +1 par tricheur démasqué. Tricheur : +1 par innocent berné.
      const pts = Object.fromEntries(playerNames.map(n => [n, 0]));
      nextVotes.forEach((sus, v) => {
        if (swapped.includes(v)) return;
        swapped.forEach(liar => {
          if (sus.includes(liar)) pts[playerNames[v]] += 1;
          else pts[playerNames[liar]] += 1;
        });
      });
      setRoundPoints(pts);
      setScores(s => Object.fromEntries(playerNames.map(n => [n, (s[n] || 0) + pts[n]])));
      revealAnim.setValue(0);
      Animated.spring(revealAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }).start();
      setPhase('reveal');
    });
  };

  // ── NEXT ROUND ────────────────────────────────────────────────────────
  const handleNextRound = () => {
    if (roundIdx + 1 >= rounds) {
      setPhase('final');
      return;
    }
    setRoundIdx(r => r + 1);
    setTruths([]);
    setSwapped([]);
    setVotes([]);
    setSelection([]);
    setTurnIdx(0);
    setUnlocked(false);
    setPhase('write');
  };

  const roundLabel = `Manche ${roundIdx + 1} / ${rounds}`;

  // ── RENDER: HANDOFF (écran masqué entre deux joueurs) ─────────────────
  const renderHandoff = (subtitle) => (
    <LinearGradient colors={OB_BG} style={styles.fullCenter}>
      <Text style={styles.counter}>{roundLabel}</Text>
      <View style={styles.progressRow}>
        {playerNames.map((_, i) => (
          <View key={i} style={[styles.progressDot, i < turnIdx && styles.progressDotActive]} />
        ))}
      </View>
      <Text style={styles.bigEmoji}>📱</Text>
      <Text style={styles.handoffLabel}>Passe le téléphone à</Text>
      <Text style={styles.handoffName}>{playerNames[turnIdx]}</Text>
      <Text style={styles.hint}>{subtitle}</Text>
      <TouchableOpacity onPress={() => setUnlocked(true)} style={styles.mainBtn} activeOpacity={0.85}>
        <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
          <Text style={styles.mainBtnText}>C'est moi, {playerNames[turnIdx]} !</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  // ── RENDER: WRITE ─────────────────────────────────────────────────────
  if (phase === 'write') {
    if (!unlocked) return renderHandoff('Les autres, regardez ailleurs ! 👀');
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.counter}>{roundLabel}</Text>
        <Text style={styles.title}>À toi, {playerNames[turnIdx]} !</Text>
        <Text style={styles.hint}>Dis la vérité, rien que la vérité 🤞</Text>

        <View style={[styles.inputCard, { borderColor: ACCENT + '50' }]}>
          <Text style={styles.inputLabel}>{isQuestion ? 'Réponds en secret :' : 'Complète la phrase :'}</Text>
          <Text style={styles.promptText}>{prompt}</Text>
          <TextInput
            value={currentText}
            onChangeText={setCurrentText}
            placeholder="Ta vérité…"
            placeholderTextColor={colors.textMuted}
            style={styles.truthInput}
            multiline
            maxLength={160}
            autoFocus
          />
          <Text style={styles.charCount}>{currentText.length}/160</Text>
        </View>
        {isHot && <Text style={styles.hint}>🃏 Joker : {VERITES_HOT_JOKER}</Text>}

        <TouchableOpacity
          onPress={handleSubmitTruth}
          disabled={!currentText.trim()}
          style={[styles.mainBtn, !currentText.trim() && { opacity: 0.4 }]}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
            <Text style={styles.mainBtnText}>✓  Valider ma vérité</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── RENDER: READ ──────────────────────────────────────────────────────
  if (phase === 'read') {
    if (!unlocked) return renderHandoff('Regarde ta vérité en secret avant de la lire');
    const isLiar    = swapped.includes(turnIdx);
    const truthText = truths[readerTruthIdx(turnIdx)];

    if (!aloud) {
      return (
        <LinearGradient colors={OB_BG} style={styles.fullCenter}>
          <Text style={styles.counter}>{roundLabel}</Text>
          <Text style={styles.bigEmoji}>{isLiar ? '🤥' : '😇'}</Text>
          {isLiar ? (
            <View style={[styles.alertCard, { borderColor: DANGER + '70', backgroundColor: DANGER + '18' }]}>
              <Text style={[styles.alertTitle, { color: DANGER }]}>Ce n'est PAS ta vérité !</Text>
              <Text style={styles.alertText}>
                Le jeu te l'a échangée. Assume-la comme si c'était la tienne et bluffe pour ne pas te faire démasquer.
              </Text>
            </View>
          ) : (
            <View style={[styles.alertCard, { borderColor: ACCENT + '60', backgroundColor: ACCENT + '15' }]}>
              <Text style={[styles.alertTitle, { color: ACCENT_LIGHT }]}>C'est bien ta vérité</Text>
              <Text style={styles.alertText}>À toi de trouver les 2 joueurs qui mentent…</Text>
            </View>
          )}
          <View style={[styles.truthCard, { borderColor: ACCENT + '40' }]}>
            <Text style={styles.truthPrompt}>{prompt}</Text>
            <Text style={styles.truthText}>« {truthText} »</Text>
          </View>
          <TouchableOpacity onPress={() => setAloud(true)} style={styles.mainBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
              <Text style={styles.mainBtnText}>🗣️  Lire à voix haute</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.counter}>{roundLabel}</Text>
        <Text style={styles.title}>La vérité de {playerNames[turnIdx]}</Text>
        <View style={[styles.truthCard, { borderColor: ACCENT + '40' }]}>
          <Text style={styles.truthPrompt}>{prompt}</Text>
          <Text style={styles.truthText}>« {truthText} »</Text>
        </View>
        <TouchableOpacity onPress={() => nextTurn(() => setPhase('discuss'))} style={styles.mainBtn} activeOpacity={0.85}>
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
            <Text style={styles.mainBtnText}>{turnIdx + 1 < N ? 'Joueur suivant →' : 'Place au débat →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── RENDER: DISCUSS ───────────────────────────────────────────────────
  if (phase === 'discuss') {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.counter}>{roundLabel}</Text>
          <Text style={styles.bigEmoji}>🕵️</Text>
          <Text style={styles.title}>Qui ment ?</Text>
          <Text style={styles.hint}>Questionnez-vous, demandez des détails… 2 joueurs bluffent !</Text>

          <View style={styles.recapBox}>
            <Text style={styles.truthPrompt}>{prompt}</Text>
            {playerNames.map((name, i) => (
              <View key={name} style={styles.recapRow}>
                <Text style={styles.recapName}>{name}</Text>
                <Text style={styles.recapText}>« {truths[readerTruthIdx(i)]} »</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => { setTurnIdx(0); setUnlocked(false); setPhase('vote'); }} style={styles.mainBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
              <Text style={styles.mainBtnText}>🗳️  Passer au vote</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: VOTE ──────────────────────────────────────────────────────
  if (phase === 'vote') {
    if (!unlocked) return renderHandoff('Vote en secret pour 2 suspects');
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.counter}>{roundLabel}</Text>
          <Text style={styles.title}>À toi, {playerNames[turnIdx]} !</Text>
          <Text style={styles.hint}>Qui a lu une vérité qui n'était pas la sienne ? Choisis 2 suspects.</Text>

          <View style={styles.voteGrid}>
            {playerNames.map((name, idx) => {
              if (idx === turnIdx) return null;
              const picked = selection.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleSuspect(idx)}
                  style={[styles.voteBtn, picked && styles.voteBtnPicked]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voteBtnText}>{picked ? '🎯 ' : ''}{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleConfirmVote}
            disabled={selection.length !== 2}
            style={[styles.mainBtn, selection.length !== 2 && { opacity: 0.4 }]}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
              <Text style={styles.mainBtnText}>✓  Valider mon vote ({selection.length}/2)</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: REVEAL ────────────────────────────────────────────────────
  if (phase === 'reveal') {
    const [a, b] = swapped;
    const suspicion = playerNames.map((_, i) => votes.filter(v => v.includes(i)).length);
    const ranked = [...playerNames.keys()].sort((x, y) => suspicion[y] - suspicion[x]);

    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.counter}>{roundLabel}</Text>
          <Text style={styles.title}>Les tricheurs étaient…</Text>

          <Animated.View style={[styles.liarCard, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
            <Text style={styles.liarNames}>🤥 {playerNames[a]} & {playerNames[b]}</Text>
            <Text style={styles.liarLine}>
              <Text style={styles.liarStrong}>{playerNames[a]}</Text> a lu la vérité de {playerNames[b]} : « {truths[b]} »
            </Text>
            <Text style={styles.liarLine}>
              <Text style={styles.liarStrong}>{playerNames[b]}</Text> a lu la vérité de {playerNames[a]} : « {truths[a]} »
            </Text>
          </Animated.View>

          <View style={styles.resultsBox}>
            {ranked.map(i => (
              <View key={i} style={styles.resultRow}>
                <Text style={swapped.includes(i) ? styles.resultLiar : styles.resultName}>
                  {swapped.includes(i) ? '🤥' : '😇'}  {playerNames[i]}
                </Text>
                <Text style={styles.resultVotes}>{suspicion[i]} vote{suspicion[i] > 1 ? 's' : ''}</Text>
                <Text style={styles.resultPts}>+{roundPoints[playerNames[i]] || 0}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleNextRound} style={styles.mainBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnInner}>
              <Text style={styles.mainBtnText}>
                {roundIdx + 1 >= rounds ? '🏆 Voir les résultats' : 'Manche suivante →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── RENDER: FINAL ─────────────────────────────────────────────────────
  const sorted = [...playerNames].sort((x, y) => (scores[y] || 0) - (scores[x] || 0));
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollCenter}>
        <Text style={styles.bigEmoji}>🏆</Text>
        <Text style={styles.title}>Résultats finaux</Text>
        <Text style={styles.hint}>Qui sait le mieux mentir… et démasquer ?</Text>

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

const styles = StyleSheet.create({
  container:  { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  fullCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, ...Platform.select({ web: { height: '100vh' } }),
  },
  scrollCenter: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center',
  },

  counter:  { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.md },
  bigEmoji: { fontSize: 56, marginBottom: spacing.sm },
  title:    { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  hint:     { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl, fontStyle: 'italic', textAlign: 'center', maxWidth: 380 },

  progressRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  progressDotActive: { backgroundColor: ACCENT, borderColor: ACCENT },

  handoffLabel: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.xs },
  handoffName:  { fontSize: 32, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },

  mainBtn:      { width: '100%', maxWidth: 400, borderRadius: radius.full, overflow: 'hidden' },
  mainBtnInner: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  // WRITE
  inputCard: {
    width: '100%', maxWidth: 400, backgroundColor: colors.card,
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputLabel: { fontSize: 12, color: ACCENT_LIGHT, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 1 },
  promptText: { fontSize: 18, color: colors.text, fontWeight: '700', marginBottom: spacing.md, lineHeight: 24 },
  truthInput: {
    color: colors.text, fontSize: 16, minHeight: 80, textAlignVertical: 'top',
    ...Platform.select({ web: { outlineStyle: 'none', resize: 'none' } }),
  },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },

  // READ
  alertCard:  { width: '100%', maxWidth: 400, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.lg },
  alertTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  alertText:  { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },

  truthCard: {
    width: '100%', maxWidth: 400, backgroundColor: ACCENT + '12',
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.xl,
  },
  truthPrompt: { fontSize: 13, color: ACCENT_LIGHT, fontWeight: '700', marginBottom: spacing.sm },
  truthText:   { fontSize: 20, color: colors.text, fontStyle: 'italic', lineHeight: 28 },

  // DISCUSS
  recapBox: {
    width: '100%', maxWidth: 400, backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.xl,
  },
  recapRow:  { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  recapName: { fontSize: 13, fontWeight: '800', color: ACCENT_LIGHT, marginBottom: 2 },
  recapText: { fontSize: 15, color: colors.text, fontStyle: 'italic' },

  // VOTE
  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl, maxWidth: 420 },
  voteBtn: {
    minWidth: 130, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1, borderColor: ACCENT + '50', backgroundColor: ACCENT + '18',
  },
  voteBtnPicked: { borderColor: ACCENT, backgroundColor: ACCENT + '55' },
  voteBtnText:   { color: colors.text, fontSize: 16, fontWeight: '700' },

  // REVEAL
  liarCard: {
    width: '100%', maxWidth: 400, backgroundColor: DANGER + '15',
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: DANGER + '60',
    padding: spacing.lg, marginBottom: spacing.lg, marginTop: spacing.md,
  },
  liarNames:  { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  liarLine:   { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
  liarStrong: { color: colors.text, fontWeight: '800' },

  resultsBox: { width: '100%', maxWidth: 400, marginBottom: spacing.xl },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  resultName:  { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  resultLiar:  { flex: 1, fontSize: 15, fontWeight: '800', color: DANGER },
  resultVotes: { fontSize: 12, color: colors.textMuted, marginRight: spacing.md },
  resultPts:   { fontSize: 14, fontWeight: '800', color: ACCENT_LIGHT, minWidth: 30, textAlign: 'right' },

  // FINAL
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
