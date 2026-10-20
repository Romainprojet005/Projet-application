import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { GameScreen, GameTopBar, ActionBar, Notice, QuestionCard, AnswerChoice, Ranking, T, F } from '../../components/game/Legende';

const GAME = 'vote';

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
      .channel(channelName(`vote_game:${roomId}`))
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

  const quit = () => navigation.navigate('Menu');

  if (!room) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} />} scroll={false}>
        <View style={s.center}><ActivityIndicator color={T.orTexte} size="large" /></View>
      </GameScreen>
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
    if (aCount === total || bCount === total) { resultLabel = 'Vote unanime : +2 points pour tous'; myPoints = 2; }
    else if (aCount === bCount) { resultLabel = 'Égalité parfaite : personne ne marque'; myPoints = 0; }
    else {
      const majChoice = aCount > bCount ? 'a' : 'b';
      resultLabel = `La majorité choisit ${majChoice.toUpperCase()} : +1 point`;
      myPoints = myVote === majChoice ? 1 : 0;
    }
  }
  const names = [...players].sort((a, b) => b.score - a.score).map(p => p.name);
  const scoreMap = Object.fromEntries(players.map(p => [p.name, p.score]));

  return (
    <GameScreen
      top={<GameTopBar game={GAME} onBack={quit} current={room.current_question_idx + 1} total={questions.length} />}
      footer={myVote && !isReveal ? (
        <ActionBar>
          <View style={s.wait}>
            <ActivityIndicator color={T.orTexte} size="small" />
            <Text style={s.waitText}>Vous avez voté {myVote.toUpperCase()} · {total} sur {players.length}</Text>
          </View>
        </ActionBar>
      ) : null}
    >
      <View style={s.head}>
        <Text style={s.score}>{myPlayer?.score ?? 0} pts</Text>
        {isReveal && myPoints > 0 ? <Text style={s.gain}>+{myPoints}</Text> : null}
      </View>

      {currentQ && (
        <>
          <QuestionCard kicker="Votez comme la majorité">{currentQ.q}</QuestionCard>
          <View style={{ gap: 10 }}>
            {['a', 'b'].map((choice, i) => {
              const count = choice === 'a' ? aCount : bCount;
              const other = choice === 'a' ? bCount : aCount;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              const state = isReveal ? (count >= other ? 'correct' : 'neutral') : myVote === choice ? 'selected' : null;
              return (
                <View key={choice} style={{ gap: 6 }}>
                  <AnswerChoice index={i} label={currentQ[choice]} state={state} onPress={() => handleVote(choice)} disabled={!!myVote || isReveal} />
                  {isReveal ? (
                    <View style={s.barRow}>
                      <View style={s.track}><View style={[s.fill, { width: `${pct}%`, backgroundColor: count >= other ? '#4FD8A4' : T.encreDouce }]} /></View>
                      <Text style={s.barText}>{count} · {pct} %{myVote === choice ? ' · votre vote' : ''}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}

      {isReveal && resultLabel ? <Notice title={resultLabel}>Prochaine question dans quelques secondes…</Notice> : null}
      {isReveal && players.length > 0 ? <Ranking players={names} scores={scoreMap} order={names} suffix=" pts" /> : null}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  head: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  score: { color: T.encre, fontFamily: F.chiffre, fontSize: 14 },
  gain: { color: '#4FD8A4', fontFamily: F.chiffre, fontSize: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  track: { flex: 1, height: 6, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999 },
  barText: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 12 },
  wait: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  waitText: { color: T.encre, fontSize: 15 },
});
