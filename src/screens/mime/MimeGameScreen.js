import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { pickWord } from '../../data/mimeWords';
import {
  GameScreen, GameTopBar, ActionBar, TextLink, Heading, Notice, Field, QuestionCard, Section, AdultTag, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'mime';
const ROUND_DURATION = 60;

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
function maxErrors(len) { return len >= 8 ? 2 : len >= 5 ? 1 : 0; }
function isCorrect(input, word) {
  const a = normalize(input), b = normalize(word);
  return levenshtein(a, b) <= maxErrors(b.length);
}

function buildHint(word, timeLeft) {
  if (!word) return '';
  const chars = word.toUpperCase().split('');
  const display = chars.map(c => (c === ' ' ? '   ' : '_'));
  if (timeLeft <= 40) display[0] = chars[0];
  if (timeLeft <= 25) {
    for (let i = chars.length - 1; i >= 0; i--) {
      if (chars[i] !== ' ') { display[i] = chars[i]; break; }
    }
  }
  if (timeLeft <= 10) {
    for (let i = 1; i < chars.length - 1; i += 2) {
      if (chars[i] !== ' ') display[i] = chars[i];
    }
  }
  return display.join(' ');
}

function hintPhaseLabel(timeLeft) {
  if (timeLeft > 40) return 'NOMBRE DE LETTRES';
  if (timeLeft > 25) return 'PREMIÈRE LETTRE';
  if (timeLeft > 10) return 'PREMIÈRE ET DERNIÈRE LETTRES';
  return 'INDICES SUPPLÉMENTAIRES';
}

export default function MimeGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [roundResult, setRoundResult] = useState(null);
  const [foundIds, setFoundIds] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const channelRef = useRef(null);
  const timerRef = useRef(null);
  const transitioningRef = useRef(false);
  const foundSetRef = useRef(new Set());
  const playersRef = useRef([]);
  const roomRef = useRef(null);

  useEffect(() => { playersRef.current = players; }, [players]);

  const resetRound = () => {
    setFoundIds([]);
    foundSetRef.current = new Set();
    setGuess('');
    setRoundResult(null);
    setTransitioning(false);
    transitioningRef.current = false;
    feedbackAnim.setValue(0);
  };

  useEffect(() => {
    loadState();
    channelRef.current = supabase
      .channel(channelName(`game:${roomId}`))
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mime_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          resetRound();
          setRoom(r);
          roomRef.current = r;
          if (r.status === 'finished') navigation.replace('MimeFinal', { roomId, playerId });
          else startTimer(r);
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mime_players', filter: `room_id=eq.${roomId}` },
        () => reloadPlayers())
      .on('broadcast', { event: 'guess' }, ({ payload }) => handleIncomingGuess(payload))
      .subscribe();

    return () => {
      supabase.removeChannel(channelRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const loadState = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('mime_rooms').select().eq('id', roomId).single(),
      supabase.from('mime_players').select().eq('room_id', roomId).order('turn_order'),
    ]);
    if (r) { setRoom(r); roomRef.current = r; startTimer(r); }
    if (ps) { setPlayers(ps); playersRef.current = ps; }
    if (r?.status === 'finished') navigation.replace('MimeFinal', { roomId, playerId });
  };

  const reloadPlayers = async () => {
    const { data: ps } = await supabase.from('mime_players').select().eq('room_id', roomId).order('turn_order');
    if (ps) { setPlayers(ps); playersRef.current = ps; }
  };

  const startTimer = (r) => {
    clearInterval(timerRef.current);
    if (!r.round_started_at) return;
    const deadline = new Date(r.round_started_at).getTime() + ROUND_DURATION * 1000;
    const tick = () => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      setTimeLeft(Math.ceil(left));
      if (left <= 0 && !transitioningRef.current) {
        clearInterval(timerRef.current);
        handleTimeout(r);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 500);
  };

  const handleTimeout = async (r) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setTransitioning(true);
    setRoundResult({ type: 'timeout', word: r.current_word });
    Animated.spring(feedbackAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
    await new Promise(res => setTimeout(res, 2500));
    const isHost = playersRef.current.find(p => p.id === playerId)?.is_host;
    if (isHost) await advanceRound(r);
  };

  const handleIncomingGuess = useCallback(({ playerId: gId, playerName, text, roomRound }) => {
    const r = roomRef.current;
    const ps = playersRef.current;
    if (!r || transitioningRef.current) return;
    if (r.round_number !== roomRound) return;
    if (foundSetRef.current.has(gId)) return;
    if (!isCorrect(text, r.current_word)) return;

    foundSetRef.current.add(gId);
    setFoundIds(prev => [...prev, gId]);

    const guesser = ps.find(p => p.id === gId);
    if (guesser) supabase.from('mime_players').update({ score: guesser.score + 3 }).eq('id', guesser.id);

    const guessers = ps.filter(p => p.id !== r.current_mime_player_id);
    if (guessers.length > 0 && guessers.every(p => foundSetRef.current.has(p.id))) {
      transitioningRef.current = true;
      setTransitioning(true);
      setRoundResult({ type: 'allfound', word: r.current_word, count: guessers.length, lastName: playerName });
      Animated.spring(feedbackAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();

      const mime = ps.find(p => p.id === r.current_mime_player_id);
      setTimeout(async () => {
        if (mime) await supabase.from('mime_players').update({ score: mime.score + 2 }).eq('id', mime.id);
        const isHost = ps.find(p => p.id === playerId)?.is_host;
        if (isHost) await advanceRound(r);
      }, 2500);
    }
  }, [playerId]);

  const advanceRound = async (r) => {
    const ps = playersRef.current;
    const nextRound = r.round_number + 1;
    if (nextRound > r.max_rounds) {
      await supabase.from('mime_rooms').update({ status: 'finished' }).eq('id', r.id).eq('round_number', r.round_number);
    } else {
      const curTurn = ps.find(p => p.id === r.current_mime_player_id)?.turn_order ?? 0;
      const nextMime = ps.find(p => p.turn_order === (curTurn + 1) % ps.length) ?? ps[0];
      await supabase.from('mime_rooms').update({
        round_number: nextRound,
        current_mime_player_id: nextMime.id,
        current_word: pickWord(r?.category),
        round_started_at: new Date().toISOString(),
      }).eq('id', r.id).eq('round_number', r.round_number);
    }
  };

  const submitGuess = () => {
    if (!guess.trim() || !room || transitioning || foundIds.includes(playerId)) return;
    const myName = players.find(p => p.id === playerId)?.name ?? '';
    const payload = { playerId, playerName: myName, text: guess.trim(), roomRound: room.round_number };
    channelRef.current?.send({ type: 'broadcast', event: 'guess', payload });
    handleIncomingGuess(payload);
    setGuess('');
  };

  const handleSkip = async () => {
    if (transitioning || !room) return;
    transitioningRef.current = true;
    setTransitioning(true);
    setRoundResult({ type: 'skip', word: room.current_word });
    Animated.spring(feedbackAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
    await new Promise(res => setTimeout(res, 2000));
    const isHost = players.find(p => p.id === playerId)?.is_host;
    if (isHost) await advanceRound(room);
  };

  const quit = () => navigation.navigate('Menu');

  if (!room) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} />}>
        <Heading sub="Chargement…" />
      </GameScreen>
    );
  }

  const isMime = room.current_mime_player_id === playerId;
  const mimePlayer = players.find(p => p.id === room.current_mime_player_id);
  const guessers = players.filter(p => p.id !== room.current_mime_player_id);
  const myScore = players.find(p => p.id === playerId)?.score ?? 0;
  const myFound = foundIds.includes(playerId);
  const timerColor = timeLeft > 20 ? '#4FD8A4' : timeLeft > 10 ? T.orTexte : T.alerte;
  const hint = buildHint(room.current_word, timeLeft);
  const top = (
    <GameTopBar game={GAME} onBack={quit} current={room.round_number} total={room.max_rounds}
      right={<Text style={s.counter}>{room.round_number} / {room.max_rounds}</Text>} />
  );

  if (roundResult) {
    const msg = roundResult.type === 'timeout' ? 'Temps écoulé'
      : roundResult.type === 'skip' ? 'Mot passé'
        : roundResult.count > 1 ? 'Tout le monde a trouvé' : `${roundResult.lastName} a trouvé`;
    return (
      <GameScreen top={top}>
        <Animated.View style={{ transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
          <QuestionCard kicker={msg} footer="Manche suivante dans un instant…">{roundResult.word}</QuestionCard>
        </Animated.View>
      </GameScreen>
    );
  }

  return (
    <GameScreen top={top} footer={isMime ? (
      <ActionBar><TextLink label="Passer ce mot" color={T.encreDouce} onPress={transitioning ? undefined : handleSkip} /></ActionBar>
    ) : !myFound ? (
      <ActionBar>
        <View style={s.inputRow}>
          <Field style={{ flex: 1 }} placeholder="Votre réponse…" value={guess} onChangeText={setGuess} onSubmitEditing={submitGuess}
            returnKeyType="done" autoCorrect={false} autoCapitalize="none" editable={!transitioning} blurOnSubmit={false}
            accessibilityLabel="Votre réponse" />
          <Pressable onPress={guess.trim() && !transitioning ? submitGuess : undefined} accessibilityRole="button" accessibilityLabel="Envoyer"
            style={[s.send, (!guess.trim() || transitioning) && { opacity: 0.4 }]}>
            <Icon name="check" color={T.surOr} />
          </Pressable>
        </View>
      </ActionBar>
    ) : null}>
      <View style={s.status}>
        <View style={[s.timer, { borderColor: timerColor }]}>
          <Text style={[s.timerText, { color: timerColor }]}>{timeLeft}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.track}><View style={[s.fill, { width: `${(timeLeft / ROUND_DURATION) * 100}%`, backgroundColor: timerColor }]} /></View>
        </View>
        <Text style={s.score}>{myScore} pts</Text>
        {room.category === 'adulte' ? <AdultTag /> : null}
      </View>

      {isMime ? (
        <>
          <QuestionCard kicker="Vous mimez" footer="Faites deviner ce mot sans parler.">{room.current_word?.toUpperCase()}</QuestionCard>
          <Section label="Devineurs" aside={foundIds.length ? `${foundIds.length} sur ${guessers.length} ont trouvé` : null}>
            <View style={s.chips}>
              {guessers.map((p) => {
                const ok = foundIds.includes(p.id);
                return (
                  <View key={p.id} style={[s.chip, ok && { borderColor: T.or, backgroundColor: T.orVoile }]}>
                    {ok ? <Icon name="check" size={14} color={T.orTexte} /> : null}
                    <Text style={[s.chipText, ok && { color: T.orTexte }]}>{p.name}</Text>
                  </View>
                );
              })}
            </View>
          </Section>
        </>
      ) : (
        <>
          <Heading kicker="Que mime-t-il ?" title={`${mimePlayer?.name ?? '…'} mime…`} />
          <View style={s.hint}>
            <Text style={s.hintLabel}>{hintPhaseLabel(timeLeft)}</Text>
            <Text style={s.hintText}>{hint}</Text>
          </View>
          {foundIds.filter(id => id !== playerId).map(id => {
            const p = players.find(pp => pp.id === id);
            return p ? <Text key={id} style={s.found}>{p.name} a trouvé</Text> : null;
          })}
          {myFound ? <Notice title="Bravo, vous avez trouvé">En attente des autres joueurs…</Notice> : null}
        </>
      )}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  counter: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timer: { width: 52, height: 52, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: F.chiffre, fontSize: 18 },
  track: { height: 6, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999 },
  score: { color: T.encre, fontFamily: F.chiffre, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort },
  chipText: { color: T.encre, fontSize: 14 },
  hint: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 18, alignItems: 'center', gap: 10 },
  hintLabel: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2 },
  hintText: { color: T.encre, fontFamily: F.chiffre, fontSize: 24, letterSpacing: 2, textAlign: 'center' },
  found: { color: '#4FD8A4', fontSize: 14, textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  send: { width: 52, height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },
});
