import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';

const VOTE_COLOR = '#6366F1';
const VOTE_DARK  = '#4F46E5';
const VOTE_LIGHT = '#A5B4FC';
const BG = ['#080818', '#0C0A24', '#080818'];

function parseQuestions(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return raw;
}

export default function VoteMultiGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [room, setRoom]       = useState(null);
  const [players, setPlayers] = useState([]);
  const [votes, setVotes]     = useState([]);
  const [myVote, setMyVote]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const channelRef    = useRef(null);
  const isHostRef     = useRef(false);
  const processingRef = useRef(false);
  const revealTimer   = useRef(null);
  const questionsRef  = useRef([]);

  useEffect(() => {
    init();
    return () => {
      supabase.removeChannel(channelRef.current);
      clearTimeout(revealTimer.current);
    };
  }, []);

  const init = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('vote_rooms').select().eq('id', roomId).single(),
      supabase.from('vote_players').select().eq('room_id', roomId).order('created_at'),
    ]);
    if (ps) {
      setPlayers(ps);
      const me = ps.find(p => p.id === playerId);
      if (me) isHostRef.current = me.is_host;
    }
    if (r) {
      const qs = parseQuestions(r.questions);
      questionsRef.current = qs;
      setRoom({ ...r, questions: qs });
      await loadVotes(r.current_question_idx, r.phase);
    }

    channelRef.current = supabase
      .channel(`vote_game:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vote_rooms', filter: `id=eq.${roomId}` },
        async ({ new: nr }) => {
          const qs = parseQuestions(nr.questions);
          questionsRef.current = qs;
          const updatedRoom = { ...nr, questions: qs };
          setRoom(updatedRoom);

          if (nr.status === 'finished') {
            navigation.replace('VoteMultiFinal', { roomId, playerId });
            return;
          }
          if (nr.phase === 'reveal') {
            const [{ data: vs }, { data: ps }] = await Promise.all([
              supabase.from('vote_votes').select().eq('room_id', roomId).eq('question_idx', nr.current_question_idx),
              supabase.from('vote_players').select().eq('room_id', roomId).order('created_at'),
            ]);
            if (vs) { setVotes(vs); const mine = vs.find(v => v.player_id === playerId); if (mine) setMyVote(mine.choice); }
            if (ps) setPlayers(ps);
          }
          if (nr.phase === 'voting') {
            setMyVote(null);
            setVotes([]);
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vote_votes', filter: `room_id=eq.${roomId}` },
        async () => {
          const { data: r } = await supabase
            .from('vote_rooms').select('current_question_idx, phase').eq('id', roomId).single();
          if (r && r.phase === 'voting') {
            await loadVotes(r.current_question_idx, 'voting');
          }
        }
      )
      .subscribe();
  };

  const loadVotes = async (idx, phase) => {
    const { data: vs } = await supabase
      .from('vote_votes').select().eq('room_id', roomId).eq('question_idx', idx);
    if (!vs) return;
    setVotes(vs);
    const mine = vs.find(v => v.player_id === playerId);
    if (mine) setMyVote(mine.choice);

    if (isHostRef.current && !processingRef.current && phase === 'voting') {
      const { data: ps } = await supabase.from('vote_players').select('id').eq('room_id', roomId);
      if (ps && vs.length >= ps.length) {
        await processResults(idx, vs);
      }
    }
  };

  const processResults = async (idx, vs) => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      const aVotes = vs.filter(v => v.choice === 'a');
      const bVotes = vs.filter(v => v.choice === 'b');
      const total  = vs.length;

      const { data: currentPlayers } = await supabase
        .from('vote_players').select().eq('room_id', roomId);
      if (!currentPlayers) { processingRef.current = false; return; }

      const bonuses = {};
      currentPlayers.forEach(p => { bonuses[p.id] = 0; });

      if (aVotes.length === total || bVotes.length === total) {
        currentPlayers.forEach(p => { bonuses[p.id] = 2; });
      } else if (aVotes.length !== bVotes.length) {
        const winners = aVotes.length > bVotes.length ? aVotes : bVotes;
        winners.forEach(v => { bonuses[v.player_id] = 1; });
      }

      await Promise.all(currentPlayers.map(p =>
        supabase.from('vote_players').update({ score: p.score + (bonuses[p.id] ?? 0) }).eq('id', p.id)
      ));
      await supabase.from('vote_rooms').update({ phase: 'reveal' }).eq('id', roomId);

      const { data: fresh } = await supabase
        .from('vote_players').select().eq('room_id', roomId).order('created_at');
      if (fresh) setPlayers(fresh);

      revealTimer.current = setTimeout(() => advanceQuestion(idx), 6000);
    } catch (e) {
      console.error('processResults error:', e);
      processingRef.current = false;
    }
  };

  const advanceQuestion = async (currentIdx) => {
    processingRef.current = false;
    const qs = questionsRef.current;
    const nextIdx = currentIdx + 1;
    if (nextIdx >= qs.length) {
      await supabase.from('vote_rooms').update({ status: 'finished', phase: 'reveal' }).eq('id', roomId);
    } else {
      await supabase.from('vote_rooms').update({
        current_question_idx: nextIdx,
        phase: 'voting',
      }).eq('id', roomId);
    }
  };

  const handleVote = async (choice) => {
    if (myVote || submitting || !room || room.phase !== 'voting') return;
    setSubmitting(true);
    setMyVote(choice);
    try {
      await supabase.from('vote_votes').insert({
        room_id: roomId,
        player_id: playerId,
        question_idx: room.current_question_idx,
        choice,
      });
    } catch (e) {
      setMyVote(null);
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={VOTE_COLOR} size="large" /></View>
      </LinearGradient>
    );
  }

  const questions  = room.questions ?? [];
  const currentQ   = questions[room.current_question_idx] ?? null;
  const isReveal   = room.phase === 'reveal';
  const aCount     = votes.filter(v => v.choice === 'a').length;
  const bCount     = votes.filter(v => v.choice === 'b').length;
  const total      = votes.length;
  const myPlayer   = players.find(p => p.id === playerId);

  let resultLabel = null;
  let myPoints    = 0;
  if (isReveal && total > 0) {
    if (aCount === total || bCount === total) {
      resultLabel = '🏆 Vote unanime ! +2 pts pour tous !';
      myPoints = 2;
    } else if (aCount === bCount) {
      resultLabel = '⚖️ Égalité parfaite ! 0 pt';
      myPoints = 0;
    } else {
      const majChoice = aCount > bCount ? 'a' : 'b';
      resultLabel = `${aCount > bCount ? 'A' : 'B'} gagne la majorité ! +1 pt`;
      myPoints = myVote === majChoice ? 1 : 0;
    }
  }

  const aPct = total > 0 ? Math.round((aCount / total) * 100) : 0;
  const bPct = total > 0 ? Math.round((bCount / total) * 100) : 0;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} style={Platform.OS === 'web' && { height: '100vh' }}>

        <View style={styles.header}>
          <Text style={styles.qCount}>
            Q {room.current_question_idx + 1} / {questions.length}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={styles.myScore}>⭐ {myPlayer?.score ?? 0} pts</Text>
            {isReveal && myPoints > 0 && (
              <Text style={styles.pointsEarned}>+{myPoints}</Text>
            )}
          </View>
        </View>

        {currentQ && (
          <>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQ.q}</Text>
            </View>

            <View style={styles.choices}>
              {(['a', 'b']).map(choice => {
                const count  = choice === 'a' ? aCount : bCount;
                const pct    = choice === 'a' ? aPct : bPct;
                const isWin  = isReveal && count > (choice === 'a' ? bCount : aCount);
                const isTie  = isReveal && aCount === bCount;
                const isUnan = isReveal && (aCount === total || bCount === total);
                const isLose = isReveal && !isWin && !isTie && !isUnan;
                const isMine = myVote === choice;
                return (
                  <TouchableOpacity
                    key={choice}
                    style={[
                      styles.choiceBtn,
                      isMine && !isReveal && styles.choiceBtnSelected,
                      isReveal && isUnan && styles.choiceBtnUnan,
                      isReveal && !isUnan && isWin && styles.choiceBtnWinner,
                      isReveal && !isUnan && isTie && styles.choiceBtnTie,
                      isReveal && !isUnan && isLose && styles.choiceBtnLoser,
                    ]}
                    onPress={() => handleVote(choice)}
                    disabled={!!myVote || isReveal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.choiceLabel}>{choice.toUpperCase()}</Text>
                    <Text style={styles.choiceText}>{currentQ[choice]}</Text>

                    {isReveal && (
                      <View style={styles.barSection}>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.barText}>{count} vote{count !== 1 ? 's' : ''} · {pct}%</Text>
                      </View>
                    )}
                    {isMine && <Text style={styles.myChoiceBadge}>✓ Ton vote</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {myVote && !isReveal && (
          <View style={styles.waitingCard}>
            <ActivityIndicator color={VOTE_COLOR} size="small" />
            <Text style={styles.waitingText}>
              Voté {myVote.toUpperCase()} · En attente… ({total}/{players.length})
            </Text>
          </View>
        )}

        {isReveal && resultLabel && (
          <View style={styles.revealCard}>
            <Text style={styles.revealText}>{resultLabel}</Text>
            <Text style={styles.revealSub}>Prochaine question dans quelques secondes…</Text>
          </View>
        )}

        {isReveal && players.length > 0 && (
          <View style={styles.scoreSection}>
            <Text style={styles.scoresLabel}>SCORES</Text>
            {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
              <View key={p.id} style={[styles.scoreItem, p.id === playerId && styles.scoreItemMe]}>
                <Text style={styles.scoreRank}>{i + 1}</Text>
                <Text style={[styles.scoreName, p.id === playerId && { color: VOTE_LIGHT }]}>
                  {p.name}{p.id === playerId ? ' (toi)' : ''}
                </Text>
                <Text style={styles.scoreValue}>{p.score} pts</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll:    { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  qCount:  { fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5 },
  scoreRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  myScore:      { fontSize: 14, fontWeight: '700', color: VOTE_LIGHT },
  pointsEarned: { fontSize: 16, fontWeight: '900', color: '#4ADE80' },

  questionCard: {
    backgroundColor: VOTE_COLOR + '18', borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: VOTE_COLOR + '35', marginBottom: spacing.xl,
  },
  questionText: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', lineHeight: 30 },

  choices:   { gap: spacing.md, marginBottom: spacing.lg },
  choiceBtn: {
    backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 2, borderColor: colors.border,
  },
  choiceBtnSelected: { borderColor: VOTE_COLOR, backgroundColor: VOTE_COLOR + '20' },
  choiceBtnWinner:   { borderColor: '#4ADE80', backgroundColor: '#4ADE8018' },
  choiceBtnUnan:     { borderColor: '#F59E0B', backgroundColor: '#F59E0B18' },
  choiceBtnTie:      { borderColor: '#94A3B8', backgroundColor: colors.surface },
  choiceBtnLoser:    { borderColor: colors.border, opacity: 0.55 },

  choiceLabel: { fontSize: 10, fontWeight: '900', color: VOTE_LIGHT, letterSpacing: 3, marginBottom: 4 },
  choiceText:  { fontSize: 17, fontWeight: '700', color: colors.text },

  barSection: { marginTop: spacing.sm },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: VOTE_COLOR, borderRadius: 3 },
  barText: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginTop: 4 },

  myChoiceBadge: { fontSize: 11, color: VOTE_LIGHT, fontWeight: '700', marginTop: 6 },

  waitingCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: VOTE_COLOR + '44', marginBottom: spacing.lg,
  },
  waitingText: { fontSize: 13, color: colors.textSecondary },

  revealCard: {
    backgroundColor: VOTE_COLOR + '18', borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: VOTE_COLOR + '44', alignItems: 'center', marginBottom: spacing.lg,
  },
  revealText: { fontSize: 17, fontWeight: '800', color: VOTE_LIGHT, textAlign: 'center' },
  revealSub:  { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },

  scoreSection: { gap: spacing.sm },
  scoresLabel:  { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.xs },
  scoreItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  scoreItemMe: { borderColor: VOTE_COLOR + '66' },
  scoreRank:  { fontSize: 14, fontWeight: '900', color: colors.textMuted, width: 24 },
  scoreName:  { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  scoreValue: { fontSize: 15, fontWeight: '900', color: VOTE_LIGHT },
});
