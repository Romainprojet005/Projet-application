import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const BEAT       = '#10B981';
const BEAT_DARK  = '#059669';
const BEAT_LIGHT = '#6EE7B7';
const BG = OB_BG;
const MEDALS = ['🥇', '🥈', '🥉'];

const isMobileWeb = Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
}

function isCorrect(input, title) {
  const inp = normalize(input);
  const tit = normalize(title);
  if (!inp || inp.length < 2) return false;
  return tit === inp || (inp.length >= 4 && tit.includes(inp));
}

function parseSongs(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return raw;
}

export default function BlindMultiGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;

  const [room, setRoom]           = useState(null);
  const [players, setPlayers]     = useState([]);
  const [timer, setTimer]         = useState(null);
  const [inputText, setInputText] = useState('');
  const [wrongFlash, setWrongFlash] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // 'won' | 'lost' | null

  const isHostRef  = useRef(false);
  const channelRef = useRef(null);
  const timerRef   = useRef(null);
  const iframeRef  = useRef(null);
  const roomRef    = useRef(null);
  const playersRef = useRef([]);

  useEffect(() => {
    init();
    return () => {
      supabase.removeChannel(channelRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const init = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('blind_rooms').select().eq('id', roomId).single(),
      supabase.from('blind_players').select().eq('room_id', roomId).order('created_at'),
    ]);
    if (ps) {
      setPlayers(ps);
      playersRef.current = ps;
      const me = ps.find(p => p.id === playerId);
      if (me) isHostRef.current = me.is_host;
    }
    if (r) {
      const songs = parseSongs(r.songs);
      const roomData = { ...r, songs };
      setRoom(roomData);
      roomRef.current = roomData;
      if (r.phase === 'playing' && r.round_started_at) startLocalTimer(r);
    }

    channelRef.current = supabase
      .channel(`blind_game:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blind_rooms', filter: `id=eq.${roomId}` },
        async ({ new: nr }) => {
          const songs = parseSongs(nr.songs);
          const roomData = { ...nr, songs };
          setRoom(roomData);
          roomRef.current = roomData;

          if (nr.phase === 'idle') {
            clearInterval(timerRef.current);
            setTimer(null);
            setInputText('');
            setRoundResult(null);
            if (iframeRef.current) iframeRef.current.src = '';
          }
          if (nr.phase === 'playing') {
            setInputText('');
            setRoundResult(null);
            if (isHostRef.current) {
              const song = songs[nr.current_song_idx];
              if (song && iframeRef.current) {
                const start = song.startAt ?? 0;
                iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&start=${start}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
              }
            }
            startLocalTimer(nr);
          }
          if (nr.phase === 'found' || nr.status === 'finished') {
            clearInterval(timerRef.current);
            if (iframeRef.current) iframeRef.current.src = '';
            const { data: ps } = await supabase
              .from('blind_players').select().eq('room_id', roomId).order('score', { ascending: false });
            if (ps) { setPlayers(ps); playersRef.current = ps; }
          }
        }
      )
      .subscribe();
  };

  const startLocalTimer = (r) => {
    clearInterval(timerRef.current);
    if (!r.time_limit || !r.round_started_at) { setTimer(null); return; }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(r.round_started_at).getTime()) / 1000);
      const remaining = Math.max(0, r.time_limit - elapsed);
      setTimer(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        if (isHostRef.current) handleTimeout();
      }
    };
    tick();
    timerRef.current = setInterval(tick, 500);
  };

  const handlePlay = async () => {
    const r = roomRef.current;
    if (!r) return;
    const song = r.songs[r.current_song_idx];
    if (song && iframeRef.current) {
      const start = song.startAt ?? 0;
      iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&start=${start}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
    }
    await supabase.from('blind_rooms').update({
      phase: 'playing',
      round_started_at: new Date().toISOString(),
      found_player_id: null,
      found_pts: 0,
    }).eq('id', roomId);
  };

  const handleTimeout = async () => {
    await supabase.from('blind_rooms')
      .update({ phase: 'found', found_player_id: null, found_pts: 0 })
      .eq('id', roomId).eq('phase', 'playing');
  };

  const handleNext = async () => {
    const r = roomRef.current;
    if (!r) return;
    const nextIdx = r.current_song_idx + 1;
    if (nextIdx >= r.songs.length) {
      await supabase.from('blind_rooms').update({ status: 'finished', phase: 'found' }).eq('id', roomId);
    } else {
      await supabase.from('blind_rooms').update({ current_song_idx: nextIdx, phase: 'idle' }).eq('id', roomId);
    }
  };

  const handleGuess = async () => {
    const r = roomRef.current;
    if (!inputText.trim() || !r || r.phase !== 'playing' || roundResult) return;

    const song = r.songs[r.current_song_idx];
    if (!song) return;

    if (!isCorrect(inputText, song.title)) {
      setInputText('');
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 600);
      return;
    }

    // Compute points based on time elapsed
    let pts = 1;
    if (r.time_limit && r.round_started_at) {
      const elapsed = Math.floor((Date.now() - new Date(r.round_started_at).getTime()) / 1000);
      pts = elapsed <= r.time_limit / 3 ? 3 : elapsed <= r.time_limit * 2 / 3 ? 2 : 1;
    }

    // Atomic: only one player wins per song (WHERE phase='playing' ensures race safety)
    const { data } = await supabase.from('blind_rooms')
      .update({ phase: 'found', found_player_id: playerId, found_pts: pts })
      .eq('id', roomId).eq('phase', 'playing').select('id');

    if (data && data.length > 0) {
      setRoundResult('won');
      const me = playersRef.current.find(p => p.id === playerId);
      await supabase.from('blind_players')
        .update({ score: (me?.score ?? 0) + pts })
        .eq('id', playerId);
    } else {
      setRoundResult('lost');
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!room) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={BEAT} size="large" /></View>
      </LinearGradient>
    );
  }

  const songs     = room.songs ?? [];
  const song      = songs[room.current_song_idx];
  const isHost    = isHostRef.current;
  const finished  = room.status === 'finished';
  const tl        = room.time_limit;

  const currentPts = !tl || timer === null ? 1
    : timer >= tl * 2 / 3 ? 3
    : timer >= tl / 3 ? 2
    : 1;
  const timerColor = !tl || timer === null ? BEAT
    : timer >= tl * 2 / 3 ? BEAT
    : timer >= tl / 3 ? '#F59E0B'
    : '#EF4444';

  const foundPlayer = players.find(p => p.id === room.found_player_id);
  const myScore     = players.find(p => p.id === playerId)?.score ?? 0;

  // ── Final screen ─────────────────────────────────────────────────────────────
  if (finished) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll} style={Platform.OS === 'web' && { height: '100vh' }}>
          <Text style={styles.finalTitle}>🏆 RÉSULTATS FINAUX</Text>
          <Text style={styles.finalSub}>Blind Test Multi-Téléphones</Text>
          {sorted[0] && (
            <View style={styles.winnerCard}>
              <Text style={styles.winnerEmoji}>🥇</Text>
              <Text style={styles.winnerName}>{sorted[0].name}</Text>
              <Text style={styles.winnerScore}>{sorted[0].score} pts</Text>
            </View>
          )}
          <View style={styles.rankList}>
            {sorted.map((p, i) => (
              <View key={p.id} style={[styles.rankRow, p.id === playerId && styles.rankRowMe]}>
                <Text style={styles.rankMedal}>{MEDALS[i] ?? `${i + 1}.`}</Text>
                <Text style={[styles.rankName2, p.id === playerId && { color: BEAT_LIGHT }]}>
                  {p.name}{p.id === playerId ? ' (toi)' : ''}
                </Text>
                <Text style={styles.rankScore}>{p.score} pts</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.replayBtn} onPress={() => navigation.navigate('BlindMultiSetup')} activeOpacity={0.8}>
            <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayGrad}>
              <Text style={styles.replayText}>🎸 NOUVELLE PARTIE</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.menuBtnText}>🏠 Retour au menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Game screen ───────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={BG} style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: songs.length > 0 ? `${(room.current_song_idx / songs.length) * 100}%` : '0%' }]} />
      </View>

      <ScrollView
        style={[styles.inner, Platform.OS === 'web' && { height: '100vh' }]}
        contentContainerStyle={styles.innerContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.roundCounter}>🎵 {room.current_song_idx + 1} / {songs.length}</Text>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreChipText}>⭐ {myScore} pts</Text>
          </View>
        </View>

        {/* Main zone */}
        <View style={styles.mainZone}>

          {/* IDLE */}
          {room.phase === 'idle' && (
            <View style={styles.zoneCenter}>
              <Text style={styles.bigNote}>🎵</Text>
              <Text style={styles.songLabel}>Chanson {room.current_song_idx + 1}</Text>
              {isHost ? (
                <TouchableOpacity onPress={handlePlay} activeOpacity={0.85} style={styles.playBtnWrap}>
                  <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.playBtn}>
                    <Text style={styles.playBtnText}>▶  JOUER L'EXTRAIT</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.waitBanner}>
                  <ActivityIndicator color={BEAT} />
                  <Text style={styles.waitBannerText}>L'hôte va lancer la musique…</Text>
                </View>
              )}
            </View>
          )}

          {/* PLAYING */}
          {room.phase === 'playing' && (
            <View style={styles.zoneCenter}>
              {tl && timer !== null ? (
                <View style={[styles.timerRing, { borderColor: timerColor + '80' }]}>
                  <Text style={[styles.timerNum, { color: timerColor }]}>{timer}</Text>
                  <Text style={styles.timerS}>s</Text>
                </View>
              ) : (
                <Text style={styles.infiniteIcon}>∞</Text>
              )}
              {tl && timer !== null && (
                <View style={[styles.ptsChip, { backgroundColor: timerColor + '22', borderColor: timerColor + '50' }]}>
                  <Text style={[styles.ptsNum, { color: timerColor }]}>{currentPts}</Text>
                  <Text style={[styles.ptsLabel, { color: timerColor + 'AA' }]}>{currentPts > 1 ? 'pts' : 'pt'}</Text>
                </View>
              )}
              {roundResult === 'won' && <Text style={styles.statusWon}>✅ Trouvé ! En attente des autres…</Text>}
              {roundResult === 'lost' && <Text style={styles.statusLost}>😅 Quelqu'un a été plus rapide !</Text>}
              {isHost && song && (
                <TouchableOpacity
                  onPress={() => {
                    if (!iframeRef.current) return;
                    const start = song.startAt ?? 0;
                    iframeRef.current.src = '';
                    setTimeout(() => {
                      iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&start=${start}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
                    }, 100);
                  }}
                  style={styles.relancerBtn}
                >
                  <Text style={styles.relancerText}>↩ Relancer l'extrait</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* FOUND */}
          {room.phase === 'found' && song && (
            <View style={styles.foundZone}>
              {foundPlayer ? (
                <>
                  <Text style={styles.foundEmoji}>🎉</Text>
                  <Text style={styles.foundWho}>{foundPlayer.name} a trouvé !</Text>
                  <Text style={styles.foundPts}>+{room.found_pts} pt{room.found_pts !== 1 ? 's' : ''}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.foundEmoji}>😅</Text>
                  <Text style={styles.foundWho}>Personne n'a trouvé !</Text>
                </>
              )}
              <View style={styles.songReveal}>
                <Text style={styles.songRevealLabel}>LA CHANSON ÉTAIT :</Text>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
              {Platform.OS === 'web' && song.videoId && (
                <View style={styles.thumbWrap}>
                  <img
                    src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                    alt={song.title}
                  />
                </View>
              )}
              {isHost ? (
                <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextBtnWrap}>
                  <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                    <Text style={styles.nextBtnText}>
                      {room.current_song_idx < songs.length - 1 ? '▶  Chanson suivante' : '🏆  Voir les scores'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <Text style={styles.waitNextText}>L'hôte va lancer la chanson suivante…</Text>
              )}
            </View>
          )}
        </View>

        {/* Guess input — only when playing and not yet decided */}
        {room.phase === 'playing' && !roundResult && (
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, wrongFlash && styles.textInputWrong]}
                placeholder="Tapez le titre de la chanson..."
                placeholderTextColor={BEAT + '66'}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleGuess}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.validateBtn, !inputText.trim() && styles.validateBtnOff]}
                onPress={Platform.OS !== 'web' ? handleGuess : undefined}
                onMouseDown={Platform.OS === 'web' ? (e) => { e.preventDefault(); handleGuess(); } : undefined}
                activeOpacity={0.8}
              >
                <Text style={styles.validateBtnText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Scores during found phase */}
        {room.phase === 'found' && players.length > 0 && (
          <View style={styles.scoresSection}>
            <Text style={styles.scoresLabel}>SCORES</Text>
            {players.map((p, i) => (
              <View key={p.id} style={[styles.scoreItem, p.id === playerId && styles.scoreItemMe]}>
                <Text style={styles.scoreRank}>{MEDALS[i] ?? `${i + 1}.`}</Text>
                <Text style={[styles.scoreName, p.id === playerId && { color: BEAT_LIGHT }]}>
                  {p.name}{p.id === playerId ? ' (toi)' : ''}
                </Text>
                <Text style={styles.scoreVal}>{p.score} pts</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {Platform.OS === 'web' && !isMobileWeb && !!ytSrc && React.createElement('iframe', {
        key: ytSrc,
        src: ytSrc,
        allow: 'autoplay; encrypted-media',
        style: { position: 'fixed', bottom: -1, left: -1, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' },
      })}
      {Platform.OS === 'web' && isMobileWeb && !!ytSrc && React.createElement('iframe', {
        key: ytSrc,
        src: ytSrc,
        allow: 'autoplay; encrypted-media',
        allowFullScreen: true,
        style: { position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: '92%', height: 180, border: 'none', borderRadius: 12, zIndex: 10 },
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressTrack: { height: 3, backgroundColor: colors.border },
  progressFill:  { height: '100%', backgroundColor: BEAT, borderRadius: 2 },
  inner:        { flex: 1 },
  innerContent: { padding: spacing.lg, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 48 },

  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  quitBtn:      { paddingVertical: 4 },
  quitText:     { color: colors.textMuted, fontSize: 13 },
  roundCounter: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  scoreChip:    { backgroundColor: BEAT + '20', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: BEAT + '40' },
  scoreChipText:{ fontSize: 12, fontWeight: '700', color: BEAT_LIGHT },

  mainZone: {
    backgroundColor: '#0F0A1F', borderRadius: radius.xl, borderWidth: 1, borderColor: BEAT + '40',
    minHeight: 280, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md, overflow: 'hidden', padding: spacing.xl,
  },
  zoneCenter: { alignItems: 'center', gap: spacing.lg, width: '100%' },
  bigNote:    { fontSize: 64 },
  songLabel:  { fontSize: 16, fontWeight: '700', color: colors.textSecondary, letterSpacing: 2 },
  playBtnWrap:{ borderRadius: radius.full, overflow: 'hidden', shadowColor: BEAT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  playBtn:    { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl + 8, alignItems: 'center' },
  playBtnText:{ fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  waitBanner:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  waitBannerText: { fontSize: 14, color: colors.textSecondary },

  timerRing: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', gap: 2,
  },
  timerNum:    { fontSize: 36, fontWeight: '900' },
  timerS:      { fontSize: 14, fontWeight: '700', color: colors.textMuted, alignSelf: 'flex-end', paddingBottom: 6 },
  infiniteIcon:{ fontSize: 64, fontWeight: '900', color: BEAT },
  ptsChip:     { flexDirection: 'row', alignItems: 'baseline', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, gap: 4 },
  ptsNum:      { fontSize: 22, fontWeight: '900' },
  ptsLabel:    { fontSize: 12, fontWeight: '700' },
  statusWon:    { fontSize: 13, fontWeight: '700', color: BEAT_LIGHT },
  statusLost:   { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  relancerBtn:  { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  relancerText: { fontSize: 12, color: BEAT_LIGHT + 'AA', fontWeight: '600', textDecorationLine: 'underline' },

  foundZone:      { alignItems: 'center', gap: spacing.md, width: '100%' },
  foundEmoji:     { fontSize: 48 },
  foundWho:       { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center' },
  foundPts:       { fontSize: 18, fontWeight: '700', color: BEAT_LIGHT },
  songReveal:     { alignItems: 'center', gap: 4 },
  songRevealLabel:{ fontSize: 11, color: colors.textMuted, letterSpacing: 1.5 },
  songTitle:      { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  songArtist:     { fontSize: 14, fontWeight: '700', color: BEAT_LIGHT },
  thumbWrap:      { width: 200, height: 112, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F0A1F' },
  nextBtnWrap:    { width: '100%', borderRadius: radius.full, overflow: 'hidden', shadowColor: BEAT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  nextBtnGrad:    { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextBtnText:    { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  waitNextText:   { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },

  inputSection: { gap: spacing.sm, marginBottom: spacing.md },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textInput: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: BEAT + '66',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 16, fontWeight: '700', color: colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  textInputWrong: { borderColor: '#EF4444', backgroundColor: '#1A0505' },
  validateBtn:    { backgroundColor: BEAT, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  validateBtnOff: { backgroundColor: BEAT + '44' },
  validateBtnText:{ fontSize: 20, fontWeight: '900', color: '#fff' },

  scoresSection: { gap: spacing.sm, marginTop: spacing.md },
  scoresLabel:   { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2 },
  scoreItem:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  scoreItemMe:   { borderColor: BEAT + '66' },
  scoreRank:     { fontSize: 18, width: 36 },
  scoreName:     { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  scoreVal:      { fontSize: 15, fontWeight: '900', color: BEAT_LIGHT },

  finalScroll: { padding: spacing.lg, paddingTop: 60, paddingBottom: 60 },
  finalTitle:  { fontSize: 28, fontWeight: '900', color: BEAT_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xs },
  finalSub:    { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  winnerCard:  { backgroundColor: BEAT + '22', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: BEAT + '55', marginBottom: spacing.xl },
  winnerEmoji: { fontSize: 64, marginBottom: spacing.md },
  winnerName:  { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  winnerScore: { fontSize: 20, fontWeight: '700', color: BEAT_LIGHT },
  rankList:    { gap: spacing.sm, marginBottom: spacing.xl },
  rankRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rankRowMe:   { borderColor: BEAT + '66' },
  rankMedal:   { fontSize: 22, width: 36 },
  rankName2:   { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScore:   { fontSize: 16, fontWeight: '900', color: BEAT_LIGHT },
  replayBtn:   { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  replayGrad:  { paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayText:  { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  menuBtn:     { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
});
