import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ActivityIndicator } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { ANSWERS } from '../../data/blancMangerData';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, Heading, QuestionCard, Field, Ranking, T, F,
} from '../../components/game/Legende';

const GAME = 'blanc_manger';

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
      .channel(channelName(`blanc_game:${roomId}`))
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

  const quit = () => navigation.navigate('Menu');

  if (!room || !myPlayer) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} />} scroll={false}>
        <View style={s.center}><ActivityIndicator color={T.orTexte} size="large" /></View>
      </GameScreen>
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
  const roundNo = (room.current_round || 0) + 1;
  const parts = (room.current_question || '').split('___');
  const Sentence = ({ fill }) => (
    <QuestionCard kicker={`Phrase à trou · tour ${roundNo}`}>
      <Text style={s.sentence}>
        {parts[0]}
        <Text style={fill ? s.fill : s.blank}>{fill ? ` ${fill} ` : ' ________ '}</Text>
        {parts[1] || ''}
      </Text>
    </QuestionCard>
  );
  const Wait = ({ title, sub, progress }) => (
    <View style={s.center}>
      <ActivityIndicator color={T.orTexte} />
      <Heading title={title} sub={sub} />
      {progress != null ? <View style={s.track}><View style={[s.fillBar, { width: `${progress * 100}%` }]} /></View> : null}
    </View>
  );
  const top = (
    <GameTopBar game={GAME} onBack={quit} current={roundNo} total={room.total_rounds}
      right={<Text style={s.judgeTag} numberOfLines={1}>JURY · {(judgePlayer?.name ?? '?').toUpperCase()}</Text>} />
  );
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  let body = null;
  let footer = null;

  if (room.phase === 'question') {
    footer = iAmJudge ? one('Lancez vos réponses', handleJudgeLaunch) : null;
    body = (
      <>
        <Sentence />
        <Text style={s.instr}>{iAmJudge ? 'Lisez la phrase à voix haute.' : `${judgePlayer?.name} lit la phrase… Préparez-vous à choisir.`}</Text>
      </>
    );
  } else if (room.phase === 'picking') {
    if (iAmJudge) {
      body = <Wait title="En attente des réponses…" sub={`${submittedCount} joueur${submittedCount > 1 ? 's' : ''} sur ${nonJudgeCount} ont choisi`} progress={submittedCount / Math.max(nonJudgeCount, 1)} />;
    } else if (alreadySubmitted) {
      body = <Wait title="Carte envoyée" sub="En attente des autres joueurs…" />;
    } else {
      footer = one(submitting ? 'Envoi…' : selectedIsRare ? 'Jouer ma réponse' : 'Choisir cette carte', handleSubmitCard, !canSubmit || submitting);
      body = (
        <>
          <Sentence />
          <Text style={s.instr}>Laquelle fera le plus rire le jury ?</Text>
          <View style={s.grid}>
            {myHand.map(cardId => {
              const isRare = rareSet.has(cardId);
              const on = selectedCard === cardId;
              return (
                <Pressable key={cardId} onPress={() => { setSelectedCard(cardId); if (!isRare) setRareDraft(''); }}
                  accessibilityRole="button" accessibilityState={{ selected: on }}
                  accessibilityLabel={isRare ? 'Carte rare : écrivez votre propre réponse' : answerMap[cardId]}
                  style={[s.card, isRare && s.cardRare, on && s.cardOn]}>
                  {isRare ? (
                    <>
                      <Text style={s.rareKicker}>CARTE RARE</Text>
                      <Text style={[s.cardText, { color: T.encre }]}>Écrivez votre propre réponse</Text>
                    </>
                  ) : <Text style={[s.cardText, on && { color: T.orTexte }]}>{answerMap[cardId]}</Text>}
                </Pressable>
              );
            })}
          </View>
          {selectedIsRare && (
            <Field value={rareDraft} onChangeText={setRareDraft} placeholder="Votre réponse la plus drôle…" multiline autoFocus
              accessibilityLabel="Votre réponse libre" />
          )}
        </>
      );
    }
  } else if (room.phase === 'judging') {
    if (iAmJudge) {
      footer = one('Couronner cette réponse', handleJudgePick, judgeSelected == null);
      body = (
        <>
          <Sentence />
          <Text style={s.instr}>Lisez les réponses à voix haute, puis touchez votre préférée.</Text>
          <View style={s.grid}>
            {submissions.map(({ cardId, displayText }, idx) => {
              const on = judgeSelected === cardId;
              return (
                <Pressable key={idx} onPress={() => setJudgeSelected(cardId)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  accessibilityLabel={displayText} style={[s.card, on && s.cardOn]}>
                  <Text style={[s.cardText, on && { color: T.orTexte }]}>{displayText}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      );
    } else {
      body = <Wait title={`${judgePlayer?.name} choisit…`} sub="Tout le monde attend le verdict." />;
    }
  } else if (room.phase === 'reveal') {
    const sorted = [...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
    const names = sorted.map(p => p.name);
    const scoreMap = Object.fromEntries(allPlayers.map(p => [p.name, p.score || 0]));
    footer = isHost
      ? one(roundNo >= room.total_rounds ? 'Voir les résultats' : 'Tour suivant', () => { clearTimeout(revealTimer.current); advanceRound(room, allPlayers); })
      : <ActionBar note="En attente de l’hôte pour continuer…" />;
    body = (
      <>
        <Heading kicker="Le jury a tranché" title={`${room.winner_name} gagne ce tour`} />
        <Sentence fill={room.winner_card_text} />
        <Ranking players={names} scores={scoreMap} order={names} suffix=" pts" />
      </>
    );
  }

  return (
    <GameScreen top={top} footer={footer}>
      <Animated.View style={{ opacity: fadeAnim, gap: 22 }}>{body}</Animated.View>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 40 },
  judgeTag: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 1.4, maxWidth: 110 },
  sentence: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 24, lineHeight: 32, textAlign: 'center' },
  blank: { color: T.encreDouce },
  fill: { color: T.orTexte },
  instr: { color: T.encreDouce, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  track: { alignSelf: 'stretch', height: 6, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  fillBar: { height: 6, borderRadius: 999, backgroundColor: T.or },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexBasis: '47%', flexGrow: 1, minHeight: 92, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.encre, padding: 12, justifyContent: 'center', gap: 4 },
  cardRare: { backgroundColor: T.carte, borderStyle: 'dashed', borderColor: T.or },
  cardOn: { borderColor: T.or, borderWidth: 2, backgroundColor: T.orVoile },
  cardText: { color: T.fond, fontFamily: F.texteFort, fontSize: 15, lineHeight: 20 },
  rareKicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
});
