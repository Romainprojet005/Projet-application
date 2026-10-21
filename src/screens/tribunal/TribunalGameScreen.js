import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, Field, QuestionCard, Section,
  PlayerChoice, PlayerGrid, PlayerToken, T, F,
} from '../../components/game/Legende';

const GAME = 'tribunal';

export default function TribunalGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;

  const [room,          setRoom]          = useState(null);
  const [players,       setPlayers]       = useState([]);
  const [writings,      setWritings]      = useState([]);
  const [myWritingText, setMyWritingText] = useState('');
  const [guessedId,     setGuessedId]     = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const roomRef     = useRef(null);
  const playersRef  = useRef([]);
  const writingsRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { writingsRef.current = writings; }, [writings]);
  // Reset accused's guess when defendant changes
  useEffect(() => { setGuessedId(null); }, [room?.current_accused_idx]);

  useEffect(() => {
    loadState();
    const ch = supabase
      .channel(channelName(`tribunal:${roomId}`))
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          roomRef.current = r;
          if (r.status === 'lobby') {
            const me = playersRef.current.find(p => p.id === playerId);
            navigation.replace('TribunalLobby', { roomId, playerId, isHost: me?.is_host ?? false });
            return;
          }
          if ((r.status === 'trial' || r.status === 'finished') && writingsRef.current.length === 0) {
            loadWritings();
          }
          checkAutoAdvance(r, playersRef.current);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_players', filter: `room_id=eq.${roomId}` },
        () => reloadPlayers()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const loadState = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('tribunal_rooms').select().eq('id', roomId).single(),
      supabase.from('tribunal_players').select().eq('room_id', roomId).order('turn_order'),
    ]);
    if (r)  { setRoom(r);    roomRef.current    = r;  }
    if (ps) { setPlayers(ps); playersRef.current = ps; }
    if (r?.status === 'trial' || r?.status === 'finished') await loadWritings();
    if (r && ps) checkAutoAdvance(r, ps);
  };

  const loadWritings = async () => {
    const { data } = await supabase.from('tribunal_writings').select().eq('room_id', roomId);
    if (data) { setWritings(data); writingsRef.current = data; }
  };

  const reloadPlayers = async () => {
    const { data: ps } = await supabase.from('tribunal_players').select().eq('room_id', roomId).order('turn_order');
    if (ps) {
      setPlayers(ps);
      playersRef.current = ps;
      checkAutoAdvance(roomRef.current, ps);
    }
  };

  const checkAutoAdvance = async (r, ps) => {
    if (!r) return;

    // All written → start trial
    if (r.status === 'writing' && ps.length > 0 && ps.every(p => p.has_written)) {
      const { data } = await supabase.from('tribunal_rooms').update({
        status: 'trial', trial_phase: 'defense', current_accused_idx: 0,
      }).eq('id', roomId).eq('status', 'writing').select();
      if (data && data.length > 0) await loadWritings();
    }

    // All voted → reveal
    if (r.status === 'trial' && r.trial_phase === 'voting') {
      const accused = ps.find(p => p.turn_order === r.current_accused_idx);
      if (!accused) return;
      const voters = ps.filter(p => p.id !== accused.id);
      if (voters.length > 0 && voters.every(p => p.has_voted)) {
        await supabase.from('tribunal_rooms').update({ trial_phase: 'reveal' })
          .eq('id', roomId).eq('trial_phase', 'voting');
      }
    }
  };

  const handleSubmitWriting = async () => {
    if (!myWritingText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const myPlayer = players.find(p => p.id === playerId);
      if (!myPlayer) return;
      await supabase.from('tribunal_writings').insert({
        room_id: roomId, author_id: playerId,
        target_id: myPlayer.target_id, content: myWritingText.trim(),
      });
      await supabase.from('tribunal_players').update({ has_written: true }).eq('id', playerId);
    } finally { setSubmitting(false); }
  };

  const handleDefenseDone = async () => {
    await supabase.from('tribunal_rooms')
      .update({ trial_phase: 'voting' })
      .eq('id', roomId).eq('trial_phase', 'defense');
  };

  const handleVote = async (voteVal) => {
    await supabase.from('tribunal_players')
      .update({ vote: voteVal, has_voted: true })
      .eq('id', playerId);
  };

  const handleReplay = async () => {
    await supabase.from('tribunal_writings').delete().eq('room_id', roomId);
    await supabase.from('tribunal_players')
      .update({ has_written: false, malus: 0, vote: null, has_voted: false })
      .eq('room_id', roomId);
    await supabase.from('tribunal_rooms')
      .update({ status: 'lobby', trial_phase: null, current_accused_idx: 0 })
      .eq('id', roomId);
  };

  const handleContinue = async () => {
    if (!room) return;
    const ps = playersRef.current;
    const accused = ps.find(p => p.turn_order === room.current_accused_idx);
    if (!accused) return;
    const voters      = ps.filter(p => p.id !== accused.id);
    const trueVotes   = voters.filter(p => p.vote === 'vrai').length;
    const falseVotes  = voters.filter(p => p.vote === 'faux').length;
    const accusedWins = falseVotes > trueVotes;
    const nextIdx     = room.current_accused_idx + 1;
    const isLast      = nextIdx >= ps.length;

    // Atomic advance — only the first caller succeeds
    const { data } = await supabase.from('tribunal_rooms').update({
      status: isLast ? 'finished' : 'trial',
      current_accused_idx: isLast ? room.current_accused_idx : nextIdx,
      trial_phase: 'defense',
    }).eq('id', roomId).eq('trial_phase', 'reveal').select();

    if (data && data.length > 0) {
      // Apply malus if accused didn't win
      if (!accusedWins) {
        await supabase.from('tribunal_players')
          .update({ malus: accused.malus + 1 }).eq('id', accused.id);
      }
      // Reset votes for next round
      if (!isLast) {
        await Promise.all(ps.map(p =>
          supabase.from('tribunal_players').update({ vote: null, has_voted: false }).eq('id', p.id)
        ));
      }
    }
  };

  const quit = () => navigation.navigate('Menu');
  const bar = (extra) => <GameTopBar game={GAME} onBack={quit} {...extra} />;
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  if (!room) {
    return (
      <GameScreen top={bar({ confirmQuit: false })} scroll={false}>
        <View style={s.center}><ActivityIndicator color={T.orTexte} size="large" /></View>
      </GameScreen>
    );
  }

  const myPlayer       = players.find(p => p.id === playerId);
  const byTurn         = [...players].sort((a, b) => a.turn_order - b.turn_order);
  const currentAccused = byTurn[room.current_accused_idx];
  const amAccused      = currentAccused?.id === playerId;
  const accusation     = writings.find(w => w.target_id === currentAccused?.id);
  const realAuthor     = players.find(p => p.id === accusation?.author_id);
  const nonAccused     = players.filter(p => p.id !== currentAccused?.id);
  const voters         = players.filter(p => p.id !== currentAccused?.id);
  const idxOf          = (p) => byTurn.findIndex(x => x.id === p?.id);
  const trialTop       = bar({ current: room.current_accused_idx + 1, total: players.length });

  const Accusation = () => (
    <>
      <View style={s.accused}>
        <PlayerToken name={currentAccused?.name} index={idxOf(currentAccused)} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={s.kickerMuted}>SUR LE BANC DES ACCUSÉS</Text>
          <Text style={s.accusedName}>{currentAccused?.name}</Text>
        </View>
      </View>
      <QuestionCard kicker="L’accusation">{`« ${accusation?.content ?? '…'} »`}</QuestionCard>
    </>
  );

  const Waiting = ({ title, sub, done, list }) => (
    <View style={s.center}>
      <Heading title={title} sub={sub} />
      <View style={s.dots}>
        {list.map(p => <View key={p.id} style={[s.dot, done(p) && { backgroundColor: T.or }]} />)}
      </View>
    </View>
  );

  // ── Phase 1 : écrire l'accusation ──
  if (room.status === 'writing') {
    if (myPlayer?.has_written) {
      const remaining = players.filter(p => !p.has_written).length;
      return (
        <GameScreen top={bar()} scroll={false}>
          <Waiting title="Accusation envoyée" sub={`En attente de ${remaining} autre${remaining > 1 ? 's' : ''} joueur${remaining > 1 ? 's' : ''}…`}
            done={(p) => p.has_written} list={players} />
        </GameScreen>
      );
    }
    const targetName = players.find(p => p.id === myPlayer?.target_id)?.name ?? '…';
    return (
      <GameScreen top={bar()} footer={one(submitting ? 'Envoi…' : 'Soumettre au tribunal', handleSubmitWriting, !myWritingText.trim() || submitting)}>
        <Heading kicker="Phase 1 · l’accusation" title={`Une vérité sur ${targetName}`}
          sub="Écrivez quelque chose de vrai qu’il pourrait nier : il devra convaincre le jury que c’est faux." />
        <View style={{ gap: 6 }}>
          <Field placeholder={`Une vérité sur ${targetName}…`} value={myWritingText} onChangeText={setMyWritingText}
            multiline maxLength={200} accessibilityLabel={`Une vérité sur ${targetName}`} />
          <Text style={s.count}>{myWritingText.length} / 200</Text>
        </View>
      </GameScreen>
    );
  }

  // ── Défense ──
  if (room.status === 'trial' && room.trial_phase === 'defense') {
    return (
      <GameScreen top={trialTop} footer={amAccused ? one('Le jury peut voter', handleDefenseDone) : null}>
        <Text style={s.phase}>AUDIENCE</Text>
        <Accusation />
        {amAccused ? (
          <>
            <Section label="Qui l’a écrit, selon vous ?">
              <PlayerGrid>
                {nonAccused.map(p => (
                  <PlayerChoice key={p.id} name={p.name} index={idxOf(p)} selected={guessedId === p.id}
                    onPress={() => setGuessedId(prev => prev === p.id ? null : p.id)} label={`Soupçonner ${p.name}`} />
                ))}
              </PlayerGrid>
            </Section>
            <Notice tone="neutre" title="À vous de plaider">Expliquez à voix haute pourquoi c’est faux, et convainquez le jury.</Notice>
          </>
        ) : (
          <Notice tone="neutre" title={`${currentAccused?.name} plaide sa cause…`}>Écoutez sa défense : vous voterez dans un instant.</Notice>
        )}
      </GameScreen>
    );
  }

  // ── Vote du jury ──
  if (room.status === 'trial' && room.trial_phase === 'voting') {
    if (amAccused) {
      const voted = voters.filter(p => p.has_voted).length;
      return (
        <GameScreen top={trialTop} scroll={false}>
          <Waiting title="Le jury délibère…" sub={`${voted} vote${voted > 1 ? 's' : ''} reçu${voted > 1 ? 's' : ''} sur ${voters.length}`} done={(p) => p.has_voted} list={voters} />
        </GameScreen>
      );
    }
    const myVote = myPlayer?.has_voted ? myPlayer.vote : null;
    return (
      <GameScreen top={trialTop}>
        <Text style={s.phase}>VOTE DU JURY</Text>
        <Accusation />
        {myVote ? (
          <Notice tone="neutre" title={`Vous avez voté : « C’est ${myVote} »`}>En attente des autres jurés…</Notice>
        ) : (
          <Section label="L’accusation est-elle vraie ?">
            <View style={s.voteRow}>
              <Pressable onPress={() => handleVote('faux')} accessibilityRole="button" accessibilityLabel="C’est faux"
                style={({ pressed }) => [s.vote, pressed && { borderColor: T.or }]}>
                <Text style={[s.voteTitle, { color: '#4FD8A4' }]}>C’est faux</Text>
                <Text style={s.voteSub}>{currentAccused?.name} dit vrai</Text>
              </Pressable>
              <Pressable onPress={() => handleVote('vrai')} accessibilityRole="button" accessibilityLabel="C’est vrai"
                style={({ pressed }) => [s.vote, pressed && { borderColor: T.or }]}>
                <Text style={[s.voteTitle, { color: T.alerte }]}>C’est vrai</Text>
                <Text style={s.voteSub}>{currentAccused?.name} ment</Text>
              </Pressable>
            </View>
          </Section>
        )}
      </GameScreen>
    );
  }

  // ── Verdict ──
  if (room.status === 'trial' && room.trial_phase === 'reveal') {
    const trueVotes   = voters.filter(p => p.vote === 'vrai').length;
    const falseVotes  = voters.filter(p => p.vote === 'faux').length;
    const accusedWins = falseVotes > trueVotes;
    const isTie       = trueVotes === falseVotes;
    return (
      <GameScreen top={trialTop} footer={one(room.current_accused_idx + 1 >= players.length ? 'Résultats finaux' : 'Accusé suivant', handleContinue)}>
        <Text style={s.phase}>VERDICT</Text>
        <Notice son="drame" tone={isTie || accusedWins ? 'or' : 'alerte'}
          title={isTie ? 'Égalité parfaite' : accusedWins ? `${currentAccused?.name} est acquitté` : `${currentAccused?.name} est coupable`}>
          {isTie ? 'Le jury est divisé.' : accusedWins ? 'Majorité « c’est faux » : pas de malus.' : `+1 point de malus pour ${currentAccused?.name}.`}
        </Notice>
        <View style={s.split}>
          <View style={s.splitBox}><Text style={[s.splitNum, { color: '#4FD8A4' }]}>{falseVotes}</Text><Text style={s.voteSub}>C’est faux</Text></View>
          <View style={s.splitBox}><Text style={[s.splitNum, { color: T.alerte }]}>{trueVotes}</Text><Text style={s.voteSub}>C’est vrai</Text></View>
        </View>
        <View style={{ gap: 8 }}>
          {voters.map(p => (
            <View key={p.id} style={s.row}>
              <PlayerToken name={p.name} index={idxOf(p)} size={28} />
              <Text style={s.rowName}>{p.name}</Text>
              <Text style={[s.rowVote, { color: p.vote === 'faux' ? '#4FD8A4' : T.alerte }]}>{p.vote === 'faux' ? 'Faux' : 'Vrai'}</Text>
            </View>
          ))}
        </View>
        <Notice tone="neutre" title={`Écrit par ${realAuthor?.name ?? '…'}`}>
          {amAccused && guessedId
            ? (guessedId === realAuthor?.id ? 'Vous aviez deviné juste.' : `Vous pensiez que c’était ${players.find(p => p.id === guessedId)?.name}.`)
            : null}
        </Notice>
      </GameScreen>
    );
  }

  // ── Jugement final ──
  if (room.status === 'finished') {
    const sortedByMalus = [...players].sort((a, b) => a.malus - b.malus);
    const winner = sortedByMalus[0];
    const names = sortedByMalus.map(p => p.name);
    const malus = Object.fromEntries(players.map(p => [p.name, p.malus]));
    return (
      <GameScreen top={bar({ confirmQuit: false })} footer={(
        <ActionBar>
          <PrimaryButton label="Rejouer" onPress={handleReplay} />
          <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
        </ActionBar>
      )}>
        <Heading kicker="Jugement final" title={winner?.malus === 0 ? `${winner.name} sort blanchi` : 'Le verdict'}
          sub={winner?.malus === 0 ? 'Aucun malus : le jury était convaincu.' : `${sortedByMalus[sortedByMalus.length - 1]?.name} n’a convaincu personne…`} />
        <Text style={s.kickerMuted}>MALUS PAR JOUEUR · LE MOINS GAGNE</Text>
        <View style={{ gap: 8 }}>
          {names.map((n, i) => (
            <View key={n} style={[s.row, i === 0 && { borderColor: T.or, backgroundColor: T.orVoile }]}>
              <Text style={s.rank}>{String(i + 1).padStart(2, '0')}</Text>
              <PlayerToken name={n} index={i} size={28} />
              <Text style={[s.rowName, i === 0 && { color: T.orTexte }]}>{n}{players.find(p => p.name === n)?.id === playerId ? ' (vous)' : ''}</Text>
              <Text style={[s.rowVote, { color: malus[n] ? T.alerte : '#4FD8A4' }]}>{malus[n]} malus</Text>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  return null;
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  dots: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 999, backgroundColor: T.trait },
  count: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, textAlign: 'right' },
  phase: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
  accused: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  accusedName: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 24 },
  voteRow: { flexDirection: 'row', gap: 8 },
  vote: { flex: 1, minHeight: 96, borderRadius: 14, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 12 },
  voteTitle: { fontFamily: F.afficheSemi, fontSize: 22 },
  voteSub: { color: T.encreDouce, fontSize: 13, textAlign: 'center' },
  split: { flexDirection: 'row', gap: 8 },
  splitBox: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait },
  splitNum: { fontFamily: F.affiche, fontSize: 36, lineHeight: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  rowVote: { fontFamily: F.chiffre, fontSize: 13 },
  rank: { width: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
});
