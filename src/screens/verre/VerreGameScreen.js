import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { randomManches, dealCards, START_GLASS, FILL_STEP } from '../../data/verreData';

const ACCENT       = '#BE123C';
const ACCENT_LIGHT = '#FDA4AF';
const ACCENT_DARK  = '#9F1239';
const GOLD         = '#FBBF24';

function rotate(arr, start) {
  return arr.map((_, i) => arr[(start + i) % arr.length]);
}

export default function VerreGameScreen({ route, navigation }) {
  const { playerNames } = route.params;
  const n = playerNames.length;

  const [roundsMax]   = useState(() => randomManches());
  const [mancheIdx,    setMancheIdx]    = useState(1);
  const [cards,        setCards]        = useState(() => dealCards(n));
  const [glass,        setGlass]        = useState(START_GLASS);
  const [totalSips,    setTotalSips]    = useState(
    Object.fromEntries(playerNames.map(name => [name, 0]))
  );
  const [turnOrder,    setTurnOrder]    = useState(() => rotate([...playerNames.keys()], 0));
  const [turnPos,      setTurnPos]      = useState(0);
  const [passesInLap,  setPassesInLap]  = useState(0);

  const [phase,        setPhase]        = useState('distribute'); // distribute | table | challengeTarget | challengeCall | resolve | drink | final
  const [peekIdx,       setPeekIdx]       = useState(0);
  const [peekRevealed,  setPeekRevealed]  = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, tension: 55, friction: 10, useNativeDriver: true }).start();
  }, [phase]);

  const activePlayerIdx = turnOrder[turnPos];
  const activePlayer = playerNames[activePlayerIdx];

  // ── Distribution des cartes ─────────────────────────────────────────
  const handlePeekReveal = () => {
    revealAnim.setValue(0);
    Animated.timing(revealAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    setPeekRevealed(true);
  };
  const handlePeekNext = () => {
    if (peekIdx + 1 >= n) {
      setPhase('table');
    } else {
      setPeekIdx(i => i + 1);
      setPeekRevealed(false);
    }
  };

  // ── Actions du tour ──────────────────────────────────────────────────
  const addSips = (playerIdx, amount) => {
    setTotalSips(prev => ({ ...prev, [playerNames[playerIdx]]: prev[playerNames[playerIdx]] + amount }));
  };

  const handleDrinkSelf = () => {
    const amount = glass;
    addSips(activePlayerIdx, amount);
    setPendingResult({ type: 'volontaire', drinkerIdx: activePlayerIdx, amount });
    setPhase('drink');
  };

  const handlePass = () => {
    const nextPasses = passesInLap + 1;
    if (nextPasses >= turnOrder.length) {
      setGlass(g => g + FILL_STEP);
      setPassesInLap(0);
    } else {
      setPassesInLap(nextPasses);
    }
    setTurnPos(p => (p + 1) % turnOrder.length);
  };

  const openChallenge = () => {
    setChallengeTarget(null);
    setPhase('challengeTarget');
  };

  const pickTarget = (targetIdx) => {
    setChallengeTarget(targetIdx);
    setPhase('challengeCall');
  };

  const resolveChallenge = (call) => {
    const challengerIdx = activePlayerIdx;
    const targetIdx = challengeTarget;
    const challengerCard = cards[challengerIdx];
    const targetCard = cards[targetIdx];
    const actual = challengerCard > targetCard ? 'higher' : 'lower';
    const correct = call === actual;
    const amount = glass * 2;
    const drinkerIdx = correct ? targetIdx : challengerIdx;
    addSips(drinkerIdx, amount);
    setPendingResult({
      type: 'duel', challengerIdx, targetIdx, call, correct, amount,
      challengerCard, targetCard, drinkerIdx,
    });
    setPhase('resolve');
  };

  const advanceManche = () => {
    if (mancheIdx >= roundsMax) {
      setPhase('final');
      return;
    }
    const nextManche = mancheIdx + 1;
    setMancheIdx(nextManche);
    setCards(dealCards(n));
    setGlass(START_GLASS);
    setPassesInLap(0);
    setTurnPos(0);
    setTurnOrder(rotate([...playerNames.keys()], (nextManche - 1) % n));
    setPeekIdx(0);
    setPeekRevealed(false);
    setChallengeTarget(null);
    setPendingResult(null);
    setPhase('distribute');
  };

  // ── DISTRIBUTE ────────────────────────────────────────────────────────
  if (phase === 'distribute') {
    const peekName = playerNames[peekIdx];
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Manche {mancheIdx} / {roundsMax}</Text>
        <Text style={styles.peekInstruction}>Passe le téléphone à</Text>
        <Text style={styles.peekName}>{peekName}</Text>

        {!peekRevealed ? (
          <TouchableOpacity onPress={handlePeekReveal} activeOpacity={0.9} style={{ width: '100%', maxWidth: 320 }}>
            <View style={[styles.peekCard, { borderColor: ACCENT + '50' }]}>
              <Text style={styles.peekLockEmoji}>🔒</Text>
              <Text style={styles.peekLockTitle}>APPUIE POUR VOIR TA CARTE</Text>
              <Text style={styles.peekLockSub}>Assure-toi que les autres ne regardent pas !</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ opacity: revealAnim, transform: [{ scale: revealAnim }], width: '100%', maxWidth: 320 }}>
            <LinearGradient colors={[ACCENT_DARK, ACCENT]} style={styles.peekRevealCard}>
              <Text style={styles.peekRevealLabel}>TA CARTE SECRÈTE</Text>
              <Text style={styles.peekRevealValue}>{cards[peekIdx]}</Text>
              <Text style={styles.peekRevealHint}>sur 20 — garde-la en tête</Text>
            </LinearGradient>
            <TouchableOpacity onPress={handlePeekNext} style={styles.peekNextBtn} activeOpacity={0.85}>
              <Text style={styles.peekNextBtnText}>
                {peekIdx + 1 >= n ? "J'ai mémorisé, commencer !" : 'Joueur suivant →'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    );
  }

  // ── TABLE (tour de jeu) ─────────────────────────────────────────────
  if (phase === 'table') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Manche {mancheIdx} / {roundsMax}</Text>

        <View style={styles.glassZone}>
          <Text style={styles.glassEmoji}>🥂</Text>
          <Text style={styles.glassValue}>{glass}</Text>
          <Text style={styles.glassLabel}>gorgée{glass > 1 ? 's' : ''} sur la table</Text>
        </View>

        <Text style={styles.turnLabel}>Au tour de</Text>
        <Text style={styles.turnName}>{activePlayer}</Text>

        <View style={styles.actionCol}>
          <TouchableOpacity onPress={handleDrinkSelf} style={styles.drinkBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#EF4444', '#B91C1C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.drinkInner}>
              <Text style={styles.drinkBtnText}>🍺  Boire le verre ({glass})</Text>
            </LinearGradient>
          </TouchableOpacity>

          {n > 1 && (
            <TouchableOpacity onPress={openChallenge} style={styles.challengeBtn} activeOpacity={0.85}>
              <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.drinkInner}>
                <Text style={styles.drinkBtnText}>⚔️  Challenger</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handlePass} style={styles.passBtn} activeOpacity={0.82}>
            <Text style={styles.passBtnText}>➡️  Passer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.lapHint}>{passesInLap} / {turnOrder.length} joueurs ont passé ce tour-ci</Text>
      </LinearGradient>
    );
  }

  // ── CHALLENGE : choix de la cible ───────────────────────────────────
  if (phase === 'challengeTarget') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Manche {mancheIdx} / {roundsMax}</Text>
        <Text style={styles.turnLabel}>{activePlayer} challenge qui ?</Text>

        <View style={styles.targetList}>
          {playerNames.map((name, idx) => (
            idx !== activePlayerIdx && (
              <TouchableOpacity key={idx} onPress={() => pickTarget(idx)} style={styles.targetBtn} activeOpacity={0.85}>
                <Text style={styles.targetBtnText}>{name}</Text>
              </TouchableOpacity>
            )
          ))}
        </View>

        <TouchableOpacity onPress={() => setPhase('table')} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── CHALLENGE : pari plus haut / plus bas ───────────────────────────
  if (phase === 'challengeCall') {
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.roundBadge}>Manche {mancheIdx} / {roundsMax}</Text>
        <Text style={styles.turnLabel}>{activePlayer} parie contre {playerNames[challengeTarget]}</Text>
        <Text style={styles.callQuestion}>Ta carte est plus haute ou plus basse que la sienne ?</Text>

        <View style={styles.callRow}>
          <TouchableOpacity onPress={() => resolveChallenge('lower')} style={styles.callBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.callInner}>
              <Text style={styles.callBtnText}>⬇️{'\n'}PLUS BASSE</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => resolveChallenge('higher')} style={styles.callBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#F59E0B', '#B45309']} style={styles.callInner}>
              <Text style={styles.callBtnText}>⬆️{'\n'}PLUS HAUTE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setPhase('challengeTarget')} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>← Changer de cible</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── RESOLVE (résultat du duel) ───────────────────────────────────────
  if (phase === 'resolve' && pendingResult?.type === 'duel') {
    const r = pendingResult;
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={[styles.resultTitle, { color: r.correct ? '#34D399' : '#FCA5A5' }]}>
          {r.correct ? '✅ Pari réussi !' : '❌ Pari raté !'}
        </Text>

        <View style={styles.duelRow}>
          <View style={styles.duelCard}>
            <Text style={styles.duelName}>{playerNames[r.challengerIdx]}</Text>
            <Text style={styles.duelValue}>{r.challengerCard}</Text>
          </View>
          <Text style={styles.duelVs}>VS</Text>
          <View style={styles.duelCard}>
            <Text style={styles.duelName}>{playerNames[r.targetIdx]}</Text>
            <Text style={styles.duelValue}>{r.targetCard}</Text>
          </View>
        </View>

        <View style={[styles.consequenceCard, { borderColor: '#EF444450' }]}>
          <Text style={styles.consequenceLabel}>Conséquence :</Text>
          <Text style={styles.consequenceText}>{playerNames[r.drinkerIdx]} boit {r.amount} gorgées !</Text>
        </View>

        <TouchableOpacity onPress={advanceManche} style={styles.nextBtn} activeOpacity={0.85}>
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextInner}>
            <Text style={styles.nextBtnText}>
              {mancheIdx >= roundsMax ? '🏆 Voir les résultats' : 'Manche suivante →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── DRINK (verre bu volontairement) ─────────────────────────────────
  if (phase === 'drink' && pendingResult?.type === 'volontaire') {
    const r = pendingResult;
    return (
      <LinearGradient colors={OB_BG} style={styles.fullCenter}>
        <Text style={styles.resultTitle}>🍺 Verre bu !</Text>
        <View style={[styles.consequenceCard, { borderColor: ACCENT + '50' }]}>
          <Text style={styles.consequenceLabel}>{playerNames[r.drinkerIdx]}</Text>
          <Text style={styles.consequenceText}>boit {r.amount} gorgée{r.amount > 1 ? 's' : ''} !</Text>
        </View>
        <TouchableOpacity onPress={advanceManche} style={styles.nextBtn} activeOpacity={0.85}>
          <LinearGradient colors={[ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextInner}>
            <Text style={styles.nextBtnText}>
              {mancheIdx >= roundsMax ? '🏆 Voir les résultats' : 'Manche suivante →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── FINAL ─────────────────────────────────────────────────────────────
  const sorted = [...playerNames].sort((a, b) => totalSips[a] - totalSips[b]);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.finalScroll}>
        <Text style={styles.finalTitle}>🏆 Résultats finaux</Text>
        <Text style={styles.finalSub}>{roundsMax} manches jouées · moins tu as bu, mieux c'est !</Text>

        {sorted.map((name, idx) => (
          <View key={name} style={[styles.finalRow, idx === 0 && styles.finalRowFirst]}>
            <Text style={styles.finalMedal}>{medals[idx] ?? `${idx + 1}.`}</Text>
            <Text style={styles.finalName}>{name}</Text>
            <Text style={styles.finalSips}>{totalSips[name]} 🥃</Text>
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
  container:   { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  fullCenter:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
                 ...Platform.select({ web: { height: '100vh' } }) },

  roundBadge: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: spacing.xl,
    fontSize: 13, fontWeight: '700', color: ACCENT_LIGHT,
    backgroundColor: ACCENT + '22', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: ACCENT + '40',
  },

  // DISTRIBUTE
  peekInstruction: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  peekName: { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: spacing.xl, textAlign: 'center' },
  peekCard: {
    borderRadius: radius.xl, borderWidth: 2, padding: spacing.xl * 1.3,
    alignItems: 'center', backgroundColor: colors.card,
  },
  peekLockEmoji: { fontSize: 44, marginBottom: spacing.md },
  peekLockTitle: { fontSize: 15, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: 1 },
  peekLockSub: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  peekRevealCard: {
    borderRadius: radius.xl, padding: spacing.xl * 1.3, alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  peekRevealLabel: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 2, opacity: 0.85 },
  peekRevealValue: { fontSize: 64, fontWeight: '900', color: '#fff', marginVertical: spacing.sm },
  peekRevealHint: { fontSize: 12, color: '#fff', opacity: 0.75 },
  peekNextBtn: {
    marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.full,
    paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  peekNextBtnText: { color: colors.text, fontSize: 15, fontWeight: '700' },

  // TABLE
  glassZone: { alignItems: 'center', marginBottom: spacing.xl },
  glassEmoji: { fontSize: 52 },
  glassValue: { fontSize: 44, fontWeight: '900', color: GOLD, marginTop: spacing.xs },
  glassLabel: { fontSize: 13, color: colors.textMuted },

  turnLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
  turnName:  { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: spacing.xl, textAlign: 'center' },

  actionCol: { width: '100%', maxWidth: 340, gap: spacing.sm },
  drinkBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  challengeBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  drinkInner: { paddingVertical: spacing.md, alignItems: 'center' },
  drinkBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  passBtn: {
    paddingVertical: spacing.md, borderRadius: radius.lg, alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  passBtnText: { color: colors.text, fontSize: 15, fontWeight: '700' },

  lapHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.lg, fontStyle: 'italic' },

  // CHALLENGE TARGET
  targetList: { width: '100%', maxWidth: 340, gap: spacing.sm, marginBottom: spacing.lg },
  targetBtn: {
    paddingVertical: spacing.md, borderRadius: radius.lg, alignItems: 'center',
    backgroundColor: colors.card, borderWidth: 1, borderColor: ACCENT + '40',
  },
  targetBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cancelBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm },
  cancelBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },

  // CHALLENGE CALL
  callQuestion: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center', maxWidth: 320 },
  callRow: { flexDirection: 'row', gap: spacing.md, width: '100%', maxWidth: 340 },
  callBtn: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  callInner: { paddingVertical: spacing.xl, alignItems: 'center' },
  callBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },

  // RESOLVE
  resultTitle: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  duelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  duelCard: {
    width: 110, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg,
    paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  duelName: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
  duelValue: { fontSize: 32, fontWeight: '900', color: colors.text },
  duelVs: { fontSize: 14, fontWeight: '800', color: colors.textMuted },

  consequenceCard: {
    width: '100%', maxWidth: 340, backgroundColor: '#EF444415',
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.xl,
    marginBottom: spacing.xl, alignItems: 'center',
  },
  consequenceLabel: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  consequenceText:  { fontSize: 20, fontWeight: '800', color: '#FCA5A5', textAlign: 'center' },
  nextBtn:    { width: '100%', maxWidth: 340, borderRadius: radius.full, overflow: 'hidden' },
  nextInner:  { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // FINAL
  finalScroll: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: 60, alignItems: 'center',
  },
  finalTitle: { fontSize: 30, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  finalSub:   { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl, fontStyle: 'italic', textAlign: 'center' },

  finalRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 360,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  finalRowFirst: { borderColor: ACCENT + '60', backgroundColor: ACCENT + '12' },
  finalMedal: { fontSize: 22, width: 36 },
  finalName:  { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  finalSips:  { fontSize: 15, fontWeight: '800', color: GOLD },

  finalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%', maxWidth: 360 },
  replayBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  replayBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  menuBtn:    { flex: 2, borderRadius: radius.full, overflow: 'hidden' },
  menuInner:  { paddingVertical: spacing.md + 2, alignItems: 'center' },
  menuBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
