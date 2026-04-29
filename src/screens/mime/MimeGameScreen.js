import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { pickWord } from '../../data/mimeWords';

const PINK = '#C026D3';
const PINK_DARK = '#86198F';
const PINK_LIGHT = '#E879F9';
const BG = ['#1A0028', '#0A0A1B'];
const ROUND_DURATION = 60;

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}
function maxErrors(len) { return len >= 8 ? 2 : len >= 5 ? 1 : 0; }
function isCorrect(input, word) {
  const a = normalize(input), b = normalize(word);
  return levenshtein(a, b) <= maxErrors(b.length);
}

export default function MimeGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [roundResult, setRoundResult] = useState(null); // { winner, word } | null
  const [transitioning, setTransitioning] = useState(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const channelRef = useRef(null);
  const timerRef = useRef(null);
  const transitioningRef = useRef(false);

  useEffect(() => {
    loadState();
    channelRef.current = supabase
      .channel(`game:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mime_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => handleRoomUpdate(r)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mime_players', filter: `room_id=eq.${roomId}` },
        () => reloadPlayers()
      )
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
    if (r) { setRoom(r); startTimer(r); }
    if (ps) setPlayers(ps);
    if (r?.status === 'finished') navigation.replace('MimeFinal', { roomId, playerId });
  };

  const reloadPlayers = async () => {
    const { data: ps } = await supabase.from('mime_players').select().eq('room_id', roomId).order('turn_order');
    if (ps) setPlayers(ps);
  };

  const handleRoomUpdate = useCallback((r) => {
    setRoom(r);
    setGuess('');
    setRoundResult(null);
    setTransitioning(false);
    transitioningRef.current = false;
    if (r.status === 'finished') {
      navigation.replace('MimeFinal', { roomId, playerId });
    } else {
      startTimer(r);
    }
  }, []);

  const startTimer = (r) => {
    clearInterval(timerRef.current);
    if (!r.round_started_at) return;
    const tick = () => {
      const elapsed = (Date.now() - new Date(r.round_started_at).getTime()) / 1000;
      const left = Math.max(0, ROUND_DURATION - elapsed);
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
    setRoundResult({ winner: null, word: r.current_word });
    await new Promise(res => setTimeout(res, 2500));
    await advanceRound(r, null, null);
  };

  const handleIncomingGuess = useCallback(({ playerId: gId, playerName, text, roomRound }) => {
    setRoom(currentRoom => {
      if (!currentRoom || transitioningRef.current) return currentRoom;
      if (currentRoom.round_number !== roomRound) return currentRoom;
      if (!isCorrect(text, currentRoom.current_word)) return currentRoom;

      transitioningRef.current = true;
      setRoundResult({ winner: playerName, word: currentRoom.current_word });
      setTransitioning(true);
      Animated.spring(feedbackAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();

      const mimePlayer = players.find(p => p.id === currentRoom.current_mime_player_id);
      const guesser = players.find(p => p.id === gId);

      setTimeout(async () => {
        if (guesser) await supabase.from('mime_players').update({ score: guesser.score + 3 }).eq('id', guesser.id);
        if (mimePlayer) await supabase.from('mime_players').update({ score: mimePlayer.score + 2 }).eq('id', mimePlayer.id);

        const isHost = players.find(p => p.id === playerId)?.is_host;
        if (isHost) await advanceRound(currentRoom, gId, mimePlayer?.id);
      }, 2000);

      return currentRoom;
    });
  }, [players, playerId]);

  const advanceRound = async (r, winnerId, mimeId) => {
    const nextRound = r.round_number + 1;
    if (nextRound > r.max_rounds) {
      await supabase.from('mime_rooms').update({ status: 'finished' }).eq('id', r.id).eq('round_number', r.round_number);
    } else {
      const nextOrderIdx = ((players.find(p => p.id === r.current_mime_player_id)?.turn_order ?? 0) + 1) % players.length;
      const nextMime = players.find(p => p.turn_order === nextOrderIdx) ?? players[0];
      await supabase.from('mime_rooms').update({
        round_number: nextRound,
        current_mime_player_id: nextMime.id,
        current_word: pickWord(),
        round_started_at: new Date().toISOString(),
      }).eq('id', r.id).eq('round_number', r.round_number);
    }
  };

  const submitGuess = () => {
    if (!guess.trim() || !room || transitioning) return;
    const myName = players.find(p => p.id === playerId)?.name ?? '';
    channelRef.current?.send({
      type: 'broadcast',
      event: 'guess',
      payload: { playerId, playerName: myName, text: guess.trim(), roomRound: room.round_number },
    });
    setGuess('');
  };

  const handleSkip = async () => {
    if (transitioning || !room) return;
    transitioningRef.current = true;
    setTransitioning(true);
    setRoundResult({ winner: null, word: room.current_word });
    await new Promise(res => setTimeout(res, 2000));
    const isHost = players.find(p => p.id === playerId)?.is_host;
    if (isHost) await advanceRound(room, null, null);
  };

  if (!room) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Chargement…</Text>
        </View>
      </LinearGradient>
    );
  }

  const isMime = room.current_mime_player_id === playerId;
  const mimePlayer = players.find(p => p.id === room.current_mime_player_id);
  const myScore = players.find(p => p.id === playerId)?.score ?? 0;
  const progress = timeLeft / ROUND_DURATION;
  const timerColor = timeLeft > 20 ? '#10B981' : timeLeft > 10 ? '#F59E0B' : '#EF4444';

  if (roundResult) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.resultOverlay}>
          <Animated.View style={[styles.resultCard, { transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
            <Text style={styles.resultEmoji}>{roundResult.winner ? '🎉' : '⏰'}</Text>
            <Text style={styles.resultWord}>{roundResult.word}</Text>
            {roundResult.winner
              ? <Text style={styles.resultText}><Text style={{ color: PINK_LIGHT }}>{roundResult.winner}</Text> a trouvé !</Text>
              : <Text style={styles.resultText}>Personne n'a trouvé…</Text>
            }
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={isMime ? ['#2D0040', '#1A0028'] : BG} style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: timerColor }]} />
      </View>

      <ScrollView
        style={Platform.OS === 'web' && { height: '100vh' }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.roundLabel}>Manche {room.round_number}/{room.max_rounds}</Text>
          <View style={[styles.timerBadge, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
          <Text style={styles.scoreLabel}>{myScore} pts</Text>
        </View>

        {isMime ? (
          /* ── MIME VIEW ── */
          <View style={styles.mimeView}>
            <Text style={styles.mimeRole}>🎭 TU MIMES !</Text>
            <Text style={styles.mimeHint}>Fais deviner ce mot sans parler</Text>
            <LinearGradient colors={[PINK + '33', PINK + '11']} style={styles.wordCard}>
              <Text style={styles.mimeWord}>{room.current_word?.toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.playersList}>
              {players.filter(p => p.id !== playerId).map(p => (
                <View key={p.id} style={styles.playerChip}>
                  <Text style={styles.playerChipText}>⌨️ {p.name}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={transitioning}>
              <Text style={styles.skipBtnText}>⏭  Passer ce mot</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── GUESSER VIEW ── */
          <View style={styles.guesserView}>
            <Text style={styles.guesserRole}>🤔 QUE MIME-T-IL ?</Text>
            <View style={styles.mimingCard}>
              <Text style={styles.mimingEmoji}>🎭</Text>
              <Text style={styles.mimingText}>
                <Text style={{ color: PINK_LIGHT, fontWeight: '900' }}>{mimePlayer?.name ?? '…'}</Text>
                {' '}est en train de mimer quelque chose…
              </Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Tapez votre réponse..."
                placeholderTextColor={colors.textMuted}
                value={guess}
                onChangeText={setGuess}
                onSubmitEditing={submitGuess}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="none"
                editable={!transitioning}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !guess.trim() && styles.sendBtnDisabled]}
                onPress={submitGuess}
                disabled={!guess.trim() || transitioning}
              >
                <Text style={styles.sendBtnText}>✓</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scoresSection}>
              <Text style={styles.scoresLabel}>SCORES</Text>
              {[...players].sort((a, b) => b.score - a.score).map(p => (
                <View key={p.id} style={[styles.scoreRow, p.id === playerId && { borderColor: PINK + '55' }]}>
                  <Text style={styles.scoreName}>{p.name}{p.id === playerId ? ' (toi)' : ''}</Text>
                  <Text style={styles.scoreVal}>{p.score} pts</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  progressTrack: { height: 4, backgroundColor: colors.border, width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
  scroll: { padding: spacing.lg, paddingTop: 20, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  roundLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  timerBadge: {
    borderWidth: 2, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  timerText: { fontSize: 18, fontWeight: '900' },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: PINK_LIGHT },

  // Mime view
  mimeView: { alignItems: 'center' },
  mimeRole: { fontSize: 24, fontWeight: '900', color: PINK_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  mimeHint: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl },
  wordCard: {
    borderRadius: radius.xl, borderWidth: 1, borderColor: PINK + '55',
    paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%', marginBottom: spacing.xl,
  },
  mimeWord: { fontSize: 42, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: 2 },
  playersList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  playerChip: {
    backgroundColor: colors.card, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  playerChipText: { fontSize: 13, color: colors.textSecondary },
  skipBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
  },
  skipBtnText: { fontSize: 13, color: colors.textMuted },

  // Guesser view
  guesserView: { flex: 1 },
  guesserRole: { fontSize: 22, fontWeight: '900', color: PINK_LIGHT, letterSpacing: 2, marginBottom: spacing.lg },
  mimingCard: {
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: PINK + '33',
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.xl,
  },
  mimingEmoji: { fontSize: 36 },
  mimingText: { flex: 1, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  input: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: PINK + '55', paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    fontSize: 16, fontWeight: '700', color: colors.text,
  },
  sendBtn: {
    backgroundColor: PINK, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: PINK + '44' },
  sendBtnText: { fontSize: 20, fontWeight: '900', color: colors.text },
  scoresSection: { marginTop: spacing.sm },
  scoresLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm },
  scoreRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  scoreName: { fontSize: 14, fontWeight: '700', color: colors.text },
  scoreVal: { fontSize: 13, fontWeight: '700', color: PINK_LIGHT },

  // Round result overlay
  resultOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  resultCard: {
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: PINK + '55',
    padding: spacing.xxl, alignItems: 'center', width: '100%',
  },
  resultEmoji: { fontSize: 64, marginBottom: spacing.md },
  resultWord: { fontSize: 32, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  resultText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
