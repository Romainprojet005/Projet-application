import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Pressable } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { retour } from '../../utils/feedback';
import { isCorrectTitle } from '../../utils/reponseBlindTest';
import { selectSongs } from '../../data/blindTestSongs';
import useKeepTyping from '../../utils/useKeepTyping';
import alerte from '../../utils/alerte';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, Field, Ranking, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'blindtest';
const BEAT = '#4FD8A4';
const REVEAL_MS = 4000; // temps pour lire la réponse quand personne n'a trouvé

function songUrl(song) {
  return `https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&start=${song.startAt ?? 0}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
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
  const [roundResult, setRoundResult] = useState(null); // 'won' | 'lost' | 'passed' | null

  const isHostRef  = useRef(false);
  const channelRef = useRef(null);
  const timerRef   = useRef(null);
  const iframeRef  = useRef(null);
  const inputRef  = useRef(null);
  useKeepTyping(inputRef, room?.phase === 'playing' && !roundResult);
  const roomRef    = useRef(null);
  const playersRef = useRef([]);
  const autoNextRef = useRef(null);
  const aliveRef    = useRef(true);

  const playSong = (song) => {
    if (!song || !iframeRef.current) return;
    const url = songUrl(song);
    if (iframeRef.current.src !== url) iframeRef.current.src = url;
  };

  useEffect(() => {
    init();
    return () => {
      aliveRef.current = false;
      supabase.removeChannel(channelRef.current);
      clearInterval(timerRef.current);
      clearTimeout(autoNextRef.current);
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
    if (!aliveRef.current) return;

    channelRef.current = supabase
      .channel(channelName(`blind_game:${roomId}`))
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blind_rooms', filter: `id=eq.${roomId}` },
        async ({ new: nr }) => {
          const songs = parseSongs(nr.songs);
          const roomData = { ...nr, songs };
          setRoom(roomData);
          roomRef.current = roomData;

          if (nr.phase === 'idle') {
            // Nouvelle partie dans la même salle : scores remis à zéro par l'hôte
            if (nr.current_song_idx === 0) {
              const { data: ps } = await supabase.from('blind_players').select().eq('room_id', roomId).order('created_at');
              if (ps) { setPlayers(ps); playersRef.current = ps; }
            }
            clearInterval(timerRef.current);
            setTimer(null);
            setInputText('');
            setRoundResult(null);
            if (iframeRef.current) iframeRef.current.src = '';
          }
          if (nr.phase === 'playing') {
            setInputText('');
            setRoundResult(null);
            playSong(songs[nr.current_song_idx]);
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
    // Dans le clic : le navigateur autorise le son
    playSong(r.songs[r.current_song_idx]);
    await supabase.from('blind_rooms').update({
      phase: 'playing',
      round_started_at: new Date().toISOString(),
      found_player_id: null,
      found_pts: 0,
    }).eq('id', roomId);
  };

  const handleTimeout = () => endRoundNobody(roomRef.current?.current_song_idx);

  // Personne n'a trouvé (chrono écoulé ou tout le monde a passé) : on montre la réponse,
  // puis la chanson suivante démarre toute seule
  const endRoundNobody = async (idx) => {
    const { data } = await supabase.from('blind_rooms')
      .update({ phase: 'found', found_player_id: null, found_pts: 0 })
      .eq('id', roomId).eq('phase', 'playing').eq('current_song_idx', idx).select('id');
    if (data?.length) autoNextRef.current = setTimeout(() => autoNext(idx), REVEAL_MS);
  };

  const handlePass = async () => {
    const r = roomRef.current;
    if (!r || r.phase !== 'playing' || roundResult) return;
    const idx = r.current_song_idx;
    setRoundResult('passed');
    const { error } = await supabase.from('blind_players').update({ passed_idx: idx }).eq('id', playerId);
    if (error) { setRoundResult(null); alerte('Erreur', error.message); return; }
    // Le dernier à passer termine la manche
    const { data: ps } = await supabase.from('blind_players').select('id, passed_idx').eq('room_id', roomId);
    if (ps && ps.every(p => p.passed_idx === idx)) endRoundNobody(idx);
  };

  const autoNext = async (idx) => {
    const r = roomRef.current;
    if (!r) return;
    // .eq('phase', 'found').eq('current_song_idx', idx) : rien ne change si l'hôte a déjà cliqué « Chanson suivante »
    const nextIdx = idx + 1;
    if (nextIdx >= r.songs.length) {
      await supabase.from('blind_rooms').update({ status: 'finished', phase: 'found' })
        .eq('id', roomId).eq('phase', 'found').eq('current_song_idx', idx);
    } else {
      // phase 'playing' : chaque téléphone lance l'extrait en recevant la mise à jour
      await supabase.from('blind_rooms').update({
        current_song_idx: nextIdx,
        phase: 'playing',
        round_started_at: new Date().toISOString(),
        found_player_id: null,
        found_pts: 0,
      }).eq('id', roomId).eq('phase', 'found').eq('current_song_idx', idx);
    }
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

  // Rejouer dans la même salle (hôte) : nouvelles chansons, scores remis à zéro, mêmes joueurs
  const [relance, setRelance] = useState(false);
  const handleReplay = async () => {
    const r = roomRef.current;
    if (!r || relance) return;
    setRelance(true);
    try {
      const { error: pErr } = await supabase.from('blind_players').update({ score: 0, passed_idx: null }).eq('room_id', roomId);
      if (pErr) throw pErr;
      const { error: rErr } = await supabase.from('blind_rooms').update({
        status: 'playing',
        phase: 'idle',
        current_song_idx: 0,
        songs: selectSongs(r.song_count, r.category_id),
        round_started_at: null,
        found_player_id: null,
        found_pts: 0,
      }).eq('id', roomId);
      if (rErr) throw rErr;
    } catch (e) {
      alerte('Erreur', e.message);
    } finally {
      setRelance(false);
    }
  };

  const handleGuess = async () => {
    const r = roomRef.current;
    if (!inputText.trim() || !r || r.phase !== 'playing' || roundResult) return;

    const song = r.songs[r.current_song_idx];
    if (!song) return;

    if (!isCorrectTitle(inputText, song.title)) {
      setInputText('');
      retour('faux');
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
  const quit = () => navigation.navigate('Menu');

  if (!room) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} />} scroll={false}>
        <View style={s.center}><ActivityIndicator color={T.orTexte} size="large" /></View>
      </GameScreen>
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
    : timer >= tl / 3 ? T.orTexte
    : T.alerte;
  const foundPlayer = players.find(p => p.id === room.found_player_id);
  const myScore     = players.find(p => p.id === playerId)?.score ?? 0;
  const names       = [...players].sort((a, b) => b.score - a.score).map(p => p.name);
  const scoreMap    = Object.fromEntries(players.map(p => [p.name, p.score]));

  // ── Fin de partie ──
  if (finished) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={songs.length} total={songs.length} />}
        footer={isHost ? (
          <ActionBar note="Mêmes joueurs, nouvelles chansons : personne n’a besoin de revenir dans la salle.">
            <PrimaryButton label={relance ? 'Relance…' : 'Rejouer dans la même salle'} onPress={handleReplay} disabled={relance} />
            <TextLink label="Créer une nouvelle salle" onPress={() => navigation.navigate('BlindMultiSetup')} />
          </ActionBar>
        ) : (
          <ActionBar note="L’hôte peut relancer une partie dans la même salle : restez sur cet écran.">
            <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
          </ActionBar>
        )}>
        <Heading kicker="Résultats finaux" title={names[0] ? `${names[0]} l’emporte` : 'Le classement'} sub={names[0] ? `${scoreMap[names[0]]} points` : null} />
        <Ranking players={names} scores={scoreMap} order={names} suffix=" pts" />
      </GameScreen>
    );
  }

  const top = (
    <GameTopBar game={GAME} onBack={quit} current={room.current_song_idx + 1} total={songs.length}
      right={<Text style={s.counter}>{myScore} PTS</Text>} />
  );

  let footer = null;
  if (room.phase === 'idle') {
    footer = isHost
      ? <ActionBar><PrimaryButton label="Jouer l’extrait" onPress={handlePlay} /></ActionBar>
      : <ActionBar><View style={s.wait}><ActivityIndicator color={T.orTexte} /><Text style={s.waitText}>L’hôte va lancer la musique…</Text></View></ActionBar>;
  } else if (room.phase === 'playing' && !roundResult) {
    footer = (
      <ActionBar>
        <View style={s.inputRow}>
          <Field ref={inputRef} blurOnSubmit={false} style={[{ flex: 1 }, wrongFlash && { borderColor: T.alerte }]}
            placeholder="Titre de la chanson…" value={inputText} onChangeText={setInputText} onSubmitEditing={handleGuess}
            returnKeyType="done" autoCorrect={false} autoCapitalize="none" accessibilityLabel="Titre de la chanson" />
          <Pressable accessibilityRole="button" accessibilityLabel="Valider"
            style={[s.validate, !inputText.trim() && { opacity: 0.4 }]}
            onPress={Platform.OS !== 'web' ? handleGuess : undefined}
            onMouseDown={Platform.OS === 'web' ? (e) => { e.preventDefault(); handleGuess(); } : undefined}>
            <Icon name="check" color={T.surOr} />
          </Pressable>
        </View>
        <TextLink label="Je ne sais pas" color={T.encreDouce} onPress={handlePass} />
      </ActionBar>
    );
  } else if (room.phase === 'found') {
    footer = isHost
      ? <ActionBar><PrimaryButton label={room.current_song_idx < songs.length - 1 ? 'Chanson suivante' : 'Voir les scores'} onPress={handleNext} /></ActionBar>
      : foundPlayer ? <ActionBar note="L’hôte va lancer la chanson suivante…" /> : null;
  }

  const screen = (
    <GameScreen top={top} footer={footer}>
      {room.phase === 'idle' && (
        <View style={s.stage}>
          <Text style={s.kicker}>CHANSON {room.current_song_idx + 1} SUR {songs.length}</Text>
          <View style={s.disc}><View style={s.discHole} /></View>
          <Text style={s.sub}>Préparez vos oreilles.</Text>
        </View>
      )}

      {room.phase === 'playing' && (
        <View style={s.stage}>
          <View style={[s.timer, { borderColor: timerColor }]}>
            <Text style={[s.timerNum, { color: timerColor }]}>{tl && timer !== null ? timer : '∞'}</Text>
            {tl && timer !== null ? <Text style={s.timerUnit}>SECONDES</Text> : null}
          </View>
          {tl && timer !== null ? <Text style={[s.kicker, { color: timerColor }]}>{currentPts} POINT{currentPts > 1 ? 'S' : ''} EN JEU</Text> : null}
          {roundResult === 'won' && <Notice son="bon" title="Trouvé">En attente des autres…</Notice>}
          {roundResult === 'lost' && <Notice son="faux" tone="neutre" title="Quelqu’un a été plus rapide" />}
          {roundResult === 'passed' && <Notice tone="neutre" title="Vous avez passé">En attente des autres…</Notice>}
          {song && (
            <TextLink label="Relancer l’extrait" color={T.encreDouce} onPress={() => {
              if (!iframeRef.current) return;
              iframeRef.current.src = '';
              setTimeout(() => playSong(song), 100);
            }} />
          )}
        </View>
      )}

      {room.phase === 'found' && song && (
        <>
          <Heading kicker={foundPlayer ? `${foundPlayer.name} a trouvé · +${room.found_pts} pt${room.found_pts !== 1 ? 's' : ''}` : 'Personne n’a trouvé'}
            sub={foundPlayer ? null : 'Chanson suivante dans un instant…'} />
          <View style={s.answer}>
            <View style={s.answerInner}>
              {Platform.OS === 'web' && song.videoId && (
                <View style={s.thumb}>
                  <img src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`} alt={song.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                </View>
              )}
              <Text style={s.kicker}>LA CHANSON ÉTAIT</Text>
              <Text style={s.answerTitle}>{song.title}</Text>
              <Text style={s.answerArtist}>{song.artist}</Text>
            </View>
          </View>
          {players.length > 0 && <Ranking players={names} scores={scoreMap} order={names} suffix=" pts" />}
        </>
      )}
    </GameScreen>
  );

  // Lecteur caché, toujours au même endroit de l'arbre : son src est posé dans le clic (handlePlay),
  // ce qui autorise la lecture automatique sur mobile
  return (
    <View style={{ flex: 1 }}>
      {screen}
      {Platform.OS === 'web' && React.createElement('iframe', {
        ref: iframeRef,
        allow: 'autoplay; encrypted-media',
        style: { position: 'fixed', bottom: -1, left: -1, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' },
      })}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  counter: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  sub: { color: T.encreDouce, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  stage: { alignItems: 'center', gap: 20, paddingTop: 16 },
  disc: { width: 168, height: 168, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, alignItems: 'center', justifyContent: 'center' },
  discHole: { width: 36, height: 36, borderRadius: 999, borderWidth: 2, borderColor: BEAT },
  timer: { width: 132, height: 132, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timerNum: { fontFamily: F.chiffre, fontSize: 48, lineHeight: 54 },
  timerUnit: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
  wait: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  waitText: { color: T.encre, fontSize: 15 },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  validate: { width: 52, height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },
  answer: { borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  answerInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', padding: 18, alignItems: 'center', gap: 10 },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: T.creux },
  answerTitle: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 28, lineHeight: 33, textAlign: 'center' },
  answerArtist: { color: T.encreDouce, fontSize: 16, textAlign: 'center' },
});
