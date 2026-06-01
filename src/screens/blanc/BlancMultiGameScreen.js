import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform, TextInput, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { OB_BG, GOLD, GOLD_LIGHT, GOLD_DARK, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
import { ANSWERS } from '../../data/blancMangerData';

const PRP       = colors.primary;
const PRP_LIGHT = colors.primaryLight;
const PRP_DARK  = colors.primaryDark;

export default function BlancMultiGameScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;

  const [room, setRoom]             = useState(null);
  const [myPlayer, setMyPlayer]     = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [judgeSelected, setJudgeSelected] = useState(null);
  const [rareDraft, setRareDraft]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const processingRef = useRef(false);
  const revealTimer   = useRef(null);
  const channelRef    = useRef(null);
  const fadeAnim      = useRef(new Animated.Value(1)).current;

  const answerMap = useMemo(() =>
    Object.fromEntries(ANSWERS.map(a => [a.id, a.text])),
  []);
  const rareSet = useMemo(() =>
    new Set(ANSWERS.filter(a => a.rare).map(a => a.id)),
  []);

  // ── Data loading ──────────────────────────────────────────────────────────

  const reloadAll = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('blanc_rooms').select().eq('id', roomId).single(),
      supabase.from('blanc_players').select().eq('room_id', roomId).order('created_at'),
    ]);
    if (r)  setRoom(r);
    if (ps) {
      setAllPlayers(ps);
      const me = ps.find(p => p.id === playerId);
      if (me) setMyPlayer(me);
    }
  };

  // ── Host transition logic ─────────────────────────────────────────────────

  const handleRoomUpdate = async (r, ps) => {
    if (!isHost || processingRef.current) return;

    if (r.phase === 'picking') {
      const nonJudgePlayers = ps.filter((_, i) => i !== r.judge_idx);
      const allSubmitted = nonJudgePlayers.every(p => p.submission != null);
      if (!allSubmitted) return;

      processingRef.current = true;
      try {
        // Build anonymized shuffled submissions
        const rawSubs = nonJudgePlayers.map(p => ({
          cardId: p.submission,
          displayText: p.custom_answer || answerMap[p.submission] || '?',
        }));
        const shuffled = [...rawSubs].sort(() => Math.random() - 0.5);

        // Update each player's hand: remove submitted card, draw new from deck
        const deck = [...(r.deck || [])];
        await Promise.all(
          nonJudgePlayers.map(async p => {
            const newHand = (p.hand || []).filter(id => id !== p.submission);
            if (deck.length > 0) newHand.push(deck.shift());
            await supabase.from('blanc_players').update({ hand: newHand }).eq('id', p.id);
          })
        );

        await supabase.from('blanc_rooms').update({
          phase: 'judging',
          shuffled_submissions: shuffled,
          deck,
        }).eq('id', roomId);
      } finally {
        processingRef.current = false;
      }
    }

    if (r.phase === 'judging' && r.judge_pick_card_id != null) {
      processingRef.current = true;
      try {
        const nonJudgePlayers = ps.filter((_, i) => i !== r.judge_idx);
        const winner = nonJudgePlayers.find(p => p.submission === r.judge_pick_card_id);
        if (!winner) { processingRef.current = false; return; }

        const winnerText = winner.custom_answer || answerMap[winner.submission] || '?';

        await supabase.from('blanc_players')
          .update({ score: (winner.score || 0) + 1 })
          .eq('id', winner.id);

        await supabase.from('blanc_rooms').update({
          phase: 'reveal',
          winner_name: winner.name,
          winner_card_text: winnerText,
        }).eq('id', roomId);
      } finally {
        processingRef.current = false;
      }
    }

    if (r.phase === 'reveal') {
      clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(() => advanceRound(r, ps), 6000);
    }
  };

  const advanceRound = async (r, ps) => {
    if (!isHost || processingRef.current) return;
    processingRef.current = true;
    try {
      // Reset all player submissions
      await Promise.all(
        ps.map(p => supabase.from('blanc_players')
          .update({ submission: null, custom_answer: null })
          .eq('id', p.id))
      );

      const nextRound = (r.current_round || 0) + 1;
      if (nextRound >= r.total_rounds) {
        await supabase.from('blanc_rooms').update({ status: 'finished' }).eq('id', roomId);
        return;
      }

      const questions = r.questions || [];
      const nextJudge = ((r.judge_idx || 0) + 1) % ps.length;
      await supabase.from('blanc_rooms').update({
        phase: 'question',
        current_round: nextRound,
        judge_idx: nextJudge,
        current_question: questions[nextRound] || questions[0],
        shuffled_submissions: null,
        judge_pick_card_id: null,
        winner_name: null,
        winner_card_text: null,
      }).eq('id', roomId);
    } finally {
      processingRef.current = false;
    }
  };

  // ── Subscriptions ─────────────────────────────────────────────────────────

  useEffect(() => {
    reloadAll();

    channelRef.current = supabase
      .channel(`blanc_game:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blanc_rooms', filter: `id=eq.${roomId}` },
        async ({ new: r }) => {
          Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.4, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
          setRoom(r);
          if (r.status === 'finished') {
            navigation.replace('BlancMultiFinal', { roomId, playerId });
            return;
          }
          if (r.phase !== 'picking') {
            setSelectedCard(null);
            setRareDraft('');
            setJudgeSelected(null);
          }
          // Host transitions (needs fresh players list)
          if (isHost) {
            const { data: ps } = await supabase
              .from('blanc_players').select().eq('room_id', roomId).order('created_at');
            if (ps) handleRoomUpdate(r, ps);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blanc_players', filter: `room_id=eq.${roomId}` },
        async () => {
          const { data: ps } = await supabase
            .from('blanc_players').select().eq('room_id', roomId).order('created_at');
          if (!ps) return;
          setAllPlayers(ps);
          const me = ps.find(p => p.id === playerId);
          if (me) setMyPlayer(me);
          // Host: check all submitted in picking phase
          if (isHost && room?.phase === 'picking') {
            handleRoomUpdate(room, ps);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelRef.current);
      clearTimeout(revealTimer.current);
    };
  }, []);

  // ── Player actions ────────────────────────────────────────────────────────

  const handleJudgeLaunch = async () => {
    await supabase.from('blanc_rooms').update({ phase: 'picking' }).eq('id', roomId);
  };

  const handleSubmitCard = async () => {
    if (!selectedCard || submitting) return;
    if (rareSet.has(selectedCard) && !rareDraft.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from('blanc_players').update({
        submission: selectedCard,
        custom_answer: rareSet.has(selectedCard) ? rareDraft.trim() : null,
      }).eq('id', playerId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJudgePick = async () => {
    if (!judgeSelected) return;
    await supabase.from('blanc_rooms').update({ judge_pick_card_id: judgeSelected }).eq('id', roomId);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  if (!room || !myPlayer) {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={PRP_LIGHT} size="large" />
        </View>
      </LinearGradient>
    );
  }

  const judgePlayer  = allPlayers[room.judge_idx];
  const iAmJudge     = judgePlayer?.id === playerId;
  const myHand       = myPlayer.hand || [];
  const submissions  = room.shuffled_submissions || [];
  const selectedIsRare = selectedCard != null && rareSet.has(selectedCard);
  const canSubmit    = selectedCard != null && (!selectedIsRare || rareDraft.trim().length > 0);
  const alreadySubmitted = myPlayer.submission != null;
  const nonJudgeCount = allPlayers.length - 1;
  const submittedCount = allPlayers.filter((p, i) => i !== room.judge_idx && p.submission != null).length;

  // ── Render ────────────────────────────────────────────────────────────────

  function renderQuestion() {
    const q = room.current_question || '';
    const parts = q.split('___');
    return (
      <LinearGradient colors={['#1C0D40', '#0E0820']} style={styles.blackCard}>
        <Text style={styles.blackCardText}>
          {parts[0]}
          <Text style={styles.blackCardBlank}>___________</Text>
          {parts[1] || ''}
        </Text>
      </LinearGradient>
    );
  }

  function renderMiniQuestion() {
    const q = room.current_question || '';
    const parts = q.split('___');
    return (
      <View style={styles.miniBlack}>
        <Text style={styles.miniBlackText}>
          {parts[0]}<Text style={styles.miniBlackBlank}> ___ </Text>{parts[1] || ''}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.roundText}>{(room.current_round || 0) + 1} / {room.total_rounds}</Text>
        <View style={styles.judgeTag}>
          <Text style={styles.judgeTagTxt}>⚖️ {judgePlayer?.name ?? '?'}</Text>
        </View>
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {/* ── QUESTION phase ─────────────────────────────────────────── */}
        {room.phase === 'question' && (
          <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.phaseLabel}>🃏 TOUR {(room.current_round || 0) + 1}</Text>
            {renderQuestion()}
            {iAmJudge ? (
              <>
                <Text style={styles.instruction}>Lis la carte à voix haute !</Text>
                <TouchableOpacity onPress={handleJudgeLaunch} style={styles.mainBtn}>
                  <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                    <Text style={styles.mainBtnTxt}>Lancez vos réponses ! 🚀</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.instruction}>
                {judgePlayer?.name} lit la carte...{'\n'}Prépare-toi à choisir !
              </Text>
            )}
          </ScrollView>
        )}

        {/* ── PICKING phase ──────────────────────────────────────────── */}
        {room.phase === 'picking' && (
          iAmJudge ? (
            <View style={styles.waitContent}>
              <Text style={styles.waitEmoji}>⏳</Text>
              <Text style={styles.waitTitle}>En attente des réponses...</Text>
              <Text style={styles.waitSub}>{submittedCount} / {nonJudgeCount} joueurs ont choisi</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(submittedCount / Math.max(nonJudgeCount, 1)) * 100}%` }]} />
              </View>
            </View>
          ) : alreadySubmitted ? (
            <View style={styles.waitContent}>
              <Text style={styles.waitEmoji}>✅</Text>
              <Text style={styles.waitTitle}>Carte envoyée !</Text>
              <Text style={styles.waitSub}>En attente des autres joueurs...</Text>
            </View>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.phaseLabel}>✋ Choisis ta carte !</Text>
                {renderMiniQuestion()}
                <Text style={styles.instruction}>Laquelle fera le plus rire le jury ?</Text>

                <View style={styles.handGrid}>
                  {myHand.map(cardId => {
                    const isRare = rareSet.has(cardId);
                    const isSel  = selectedCard === cardId;
                    return (
                      <TouchableOpacity
                        key={cardId}
                        onPress={() => { setSelectedCard(cardId); if (!isRare) setRareDraft(''); }}
                        style={[
                          styles.whiteCard,
                          isRare && styles.whiteCardRare,
                          isSel && !isRare && styles.whiteCardSelected,
                          isSel && isRare && styles.whiteCardRareSelected,
                        ]}
                        activeOpacity={0.75}
                      >
                        {isSel && <Text style={styles.checkMark}>{isRare ? '✨' : '✓'}</Text>}
                        {isRare ? (
                          <>
                            <Text style={styles.rareLabel}>✨ CARTE RARE</Text>
                            <Text style={styles.rareSubLabel}>Écris ta propre réponse !</Text>
                          </>
                        ) : (
                          <Text style={[styles.whiteCardText, isSel && styles.whiteCardTextSel]}>
                            {answerMap[cardId]}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedIsRare && (
                  <View style={styles.rareInputWrap}>
                    <Text style={styles.rareInputLabel}>✨ Ta réponse libre :</Text>
                    <TextInput
                      value={rareDraft}
                      onChangeText={setRareDraft}
                      placeholder="Écris quelque chose d'hilarant..."
                      placeholderTextColor={colors.textMuted}
                      style={styles.rareInput}
                      multiline
                      autoFocus
                    />
                  </View>
                )}

                {canSubmit && (
                  <TouchableOpacity onPress={handleSubmitCard} disabled={submitting} style={[styles.mainBtn, { marginTop: spacing.md }]}>
                    <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                      {submitting
                        ? <ActivityIndicator color={LAUNCH_TEXT} />
                        : <Text style={styles.mainBtnTxt}>
                            {selectedIsRare ? 'Jouer ma réponse ✨' : 'Choisir cette carte ✓'}
                          </Text>
                      }
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          )
        )}

        {/* ── JUDGING phase ──────────────────────────────────────────── */}
        {room.phase === 'judging' && (
          iAmJudge ? (
            <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.phaseLabel}>⚖️ Choisis la meilleure réponse !</Text>
              {renderMiniQuestion()}
              <Text style={styles.instruction}>Tape la carte qui t'a fait le plus rire.</Text>

              <View style={styles.handGrid}>
                {submissions.map(({ cardId, displayText }, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setJudgeSelected(cardId)}
                    style={[styles.whiteCard, judgeSelected === cardId && styles.whiteCardGold]}
                    activeOpacity={0.75}
                  >
                    {judgeSelected === cardId && <Text style={styles.checkMark}>👑</Text>}
                    <Text style={[styles.whiteCardText, judgeSelected === cardId && styles.whiteCardTextGold]}>
                      {displayText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {judgeSelected != null && (
                <TouchableOpacity onPress={handleJudgePick} style={[styles.mainBtn, { marginTop: spacing.md }]}>
                  <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                    <Text style={styles.mainBtnTxt}>Couronner cette réponse 👑</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.waitContent}>
              <Text style={styles.waitEmoji}>⚖️</Text>
              <Text style={styles.waitTitle}>{judgePlayer?.name} choisit...</Text>
              <Text style={styles.waitSub}>Tout le monde attend le verdict !</Text>
            </View>
          )
        )}

        {/* ── REVEAL phase ───────────────────────────────────────────── */}
        {room.phase === 'reveal' && (
          <ScrollView contentContainerStyle={styles.phaseContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>{room.winner_name} gagne ce tour !</Text>

            <LinearGradient colors={['#1C0D40', '#0E0820']} style={[styles.blackCard, { marginBottom: spacing.lg }]}>
              {(() => {
                const parts = (room.current_question || '').split('___');
                return (
                  <Text style={styles.blackCardText}>
                    {parts[0]}
                    <Text style={{ color: GOLD_LIGHT, fontWeight: '900' }}> {room.winner_card_text} </Text>
                    {parts[1] || ''}
                  </Text>
                );
              })()}
            </LinearGradient>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>🏅 SCORES</Text>
              {[...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0)).map(p => (
                <View key={p.id} style={styles.scoreRow}>
                  <Text style={[styles.scoreName, p.name === room.winner_name && { color: GOLD_LIGHT }]}>
                    {p.name === room.winner_name ? '⭐ ' : ''}{p.name}
                    {p.id === playerId ? ' (toi)' : ''}
                  </Text>
                  <Text style={[styles.scoreVal, p.name === room.winner_name && { color: GOLD_LIGHT }]}>
                    {p.score || 0} pt{(p.score || 0) > 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>

            {isHost && (
              <TouchableOpacity
                onPress={() => { clearTimeout(revealTimer.current); advanceRound(room, allPlayers); }}
                style={styles.mainBtn}
              >
                <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnTxt}>
                    {(room.current_round || 0) + 1 >= room.total_rounds ? 'Voir les résultats 🏆' : 'Tour suivant →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {!isHost && (
              <Text style={styles.waitingForHost}>⏳ En attente de l'hôte pour continuer...</Text>
            )}
          </ScrollView>
        )}

      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  quitBtn:    { paddingVertical: 4 },
  quitText:   { color: colors.textMuted, fontSize: 15 },
  roundText:  { fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
  judgeTag: {
    backgroundColor: GOLD + '22', borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: GOLD + '44',
  },
  judgeTagTxt: { fontSize: 11, fontWeight: '700', color: GOLD_LIGHT },

  phaseContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  phaseLabel: {
    fontSize: 11, fontWeight: '800', color: PRP_LIGHT,
    letterSpacing: 2, marginBottom: spacing.md, textAlign: 'center',
  },

  // Waiting screens
  waitContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  waitEmoji: { fontSize: 56, marginBottom: spacing.md },
  waitTitle: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  waitSub:   { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  progressBar: {
    width: '100%', height: 6, backgroundColor: colors.border,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: PRP, borderRadius: 3 },

  // Question cards
  blackCard: {
    borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: PRP + '55',
    shadowColor: PRP, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  blackCardText:  { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 30 },
  blackCardBlank: { color: PRP_LIGHT, fontWeight: '900', textDecorationLine: 'underline' },
  miniBlack: {
    backgroundColor: '#1C0D40', borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: PRP + '44',
  },
  miniBlackText:  { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  miniBlackBlank: { color: PRP_LIGHT, fontWeight: '900' },

  instruction: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: spacing.lg, fontStyle: 'italic',
  },

  // Hand grid
  handGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  whiteCard: {
    width: '47%', backgroundColor: colors.text, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 2, borderColor: 'transparent',
    minHeight: 80, justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  whiteCardSelected: {
    borderColor: PRP, backgroundColor: '#EDE9FE',
    shadowColor: PRP, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  whiteCardGold: {
    borderColor: GOLD, backgroundColor: '#FEF3C7',
    shadowColor: GOLD, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  whiteCardRare: {
    borderColor: GOLD, backgroundColor: '#1A1200',
    shadowColor: GOLD, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  whiteCardRareSelected: {
    borderColor: GOLD_LIGHT, backgroundColor: '#2A1E00',
    shadowColor: GOLD_LIGHT, shadowOpacity: 0.7, shadowRadius: 14, elevation: 10,
  },
  checkMark:         { fontSize: 14, fontWeight: '900', color: PRP, marginBottom: 4 },
  whiteCardText:     { fontSize: 13, fontWeight: '700', color: '#1A1A2E', lineHeight: 18 },
  whiteCardTextSel:  { color: PRP_DARK },
  whiteCardTextGold: { color: '#78350F' },
  rareLabel:         { fontSize: 13, fontWeight: '900', color: GOLD_LIGHT, letterSpacing: 1, marginBottom: 2 },
  rareSubLabel:      { fontSize: 11, color: GOLD, fontStyle: 'italic' },

  // Rare input
  rareInputWrap: {
    backgroundColor: '#1A1200', borderRadius: radius.lg,
    borderWidth: 1, borderColor: GOLD + '88',
    padding: spacing.md, marginBottom: spacing.sm,
  },
  rareInputLabel: { fontSize: 12, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 1, marginBottom: spacing.sm },
  rareInput: {
    color: colors.text, fontSize: 16, fontWeight: '600',
    minHeight: 60, textAlignVertical: 'top',
    borderBottomWidth: 1, borderBottomColor: GOLD + '55', paddingBottom: spacing.sm,
  },

  // Main button
  mainBtn: {
    borderRadius: radius.full, overflow: 'hidden',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnTxt:  { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 1 },

  // Reveal
  winEmoji: { fontSize: 64, textAlign: 'center', marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center', marginBottom: spacing.lg },

  scoreCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  scoreCardLabel: { fontSize: 11, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 2, marginBottom: spacing.md },
  scoreRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  scoreName: { fontSize: 14, fontWeight: '700', color: colors.text },
  scoreVal:  { fontSize: 14, fontWeight: '800', color: colors.textSecondary },

  waitingForHost: { fontSize: 13, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.md },
});
