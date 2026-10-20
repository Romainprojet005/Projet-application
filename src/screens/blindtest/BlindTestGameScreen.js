import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Linking, Pressable } from 'react-native';
import { selectSongs } from '../../data/blindTestSongs';
import { isCorrectTitle } from '../../utils/reponseBlindTest';
import useKeepTyping from '../../utils/useKeepTyping';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, TextLink, Heading, Notice, Field,
  PlayerChoice, PlayerGrid, Ranking, EndActions, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'blindtest';
const BEAT = '#4FD8A4'; // famille Savoir
// Les navigateurs mobiles bloquent l'autoplay dans les iframes cachées
const isMobileWeb = Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

function openYoutube(song) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  Linking.openURL(`https://www.youtube.com/results?search_query=${q}`);
}

// ── Equalizer animation ───────────────────────────────────────────────────────
function EqBars() {
  const vals = useRef(
    Array.from({ length: 7 }, (_, i) => new Animated.Value(0.2 + i * 0.1))
  ).current;

  useEffect(() => {
    vals.forEach((val, i) => {
      const loop = () => {
        const target = Math.random() * 0.75 + 0.15;
        const dur    = 100 + Math.random() * 250;
        Animated.timing(val, { toValue: target, duration: dur, useNativeDriver: false }).start(
          ({ finished }) => { if (finished) loop(); }
        );
      };
      setTimeout(loop, i * 60);
    });
  }, []);

  return (
    <View style={eq.wrap}>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          style={[eq.bar, {
            backgroundColor: BEAT,
            height: v.interpolate({ inputRange: [0, 1], outputRange: [4, 54] }),
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
          }]}
        />
      ))}
    </View>
  );
}
const eq = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 54 },
  bar:  { width: 8, borderRadius: 4 },
});

// ─────────────────────────────────────────────────────────────────────────────
export default function BlindTestGameScreen({ navigation, route }) {
  const { playerNames = [], songCount = 10, timeLimit = 30, categoryId = 'france' } = route.params || {};
  const hasPlayers = playerNames.length > 0;
  const isInfinite = timeLimit === null;
  const TOTAL_TIME = timeLimit ?? 30;

  const [songs, setSongs] = useState(() => selectSongs(songCount, categoryId));
  const [replaced, setReplaced] = useState(false); // une chanson indisponible vient d'être remplacée
  const songsRef = useRef(songs);
  useEffect(() => { songsRef.current = songs; }, [songs]);
  const [songIdx,    setSongIdx]    = useState(0);
  const [phase,      setPhase]      = useState('idle'); // idle|playing|found|blocked|reveal|final
  const [scores,     setScores]     = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [results,    setResults]    = useState([]);
  const [inputText,  setInputText]  = useState('');
  const [timer,      setTimer]      = useState(TOTAL_TIME);
  const [foundPts,   setFoundPts]   = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const timerRef  = useRef(null);
  const phaseRef  = useRef('idle');
  const songRef   = useRef(songs[0]);
  const iframeRef = useRef(null);
  const inputRef  = useRef(null);
  useKeepTyping(inputRef, phase === 'playing');
  const answerSlide   = useRef(new Animated.Value(300)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;

  const song = songs[songIdx];

  useEffect(() => { songRef.current = songs[songIdx]; }, [songIdx]);

  const currentPts = isInfinite ? 1
    : timer >= TOTAL_TIME * 2 / 3 ? 3
    : timer >= TOTAL_TIME / 3 ? 2
    : 1;
  const timerColor = isInfinite ? BEAT
    : timer >= TOTAL_TIME * 2 / 3 ? BEAT
    : timer >= TOTAL_TIME / 3 ? T.orTexte
    : T.alerte;

  // ── Timer ──────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const stopAudio = useCallback(() => {
    if (Platform.OS === 'web' && iframeRef.current) iframeRef.current.src = '';
  }, []);

  useEffect(() => {
    if (timer === 0 && phaseRef.current === 'playing') {
      stopTimer();
      phaseRef.current = 'reveal';
      setPhase('reveal');
      setResults(prev => [...prev, { song: songRef.current, finder: null, points: 0 }]);
      openAnswerCard();
    }
  }, [timer]);

  useEffect(() => () => stopTimer(), []);

  // ── YouTube embedding error detection ─────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onMsg = (e) => {
      if (!e.data) return;
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // codes 101 et 150 = vidéo non autorisée en lecture intégrée
        // 2 = identifiant invalide, 5 = lecture impossible, 100 = vidéo supprimée,
        // 101 / 150 = lecture intégrée interdite
        if (d?.event === 'error' && [2, 5, 100, 101, 150].includes(d?.info)) {
          if (phaseRef.current !== 'playing') return;
          stopTimer();
          if (iframeRef.current) iframeRef.current.src = '';
          // On remplace la chanson par une autre de la même catégorie, puis on relance
          const current = songsRef.current;
          const spare = selectSongs(1000, categoryId).find(sg => !current.some(c => c.id === sg.id));
          if (spare) {
            const idx = current.indexOf(songRef.current);
            const next = current.map((sg, i) => (i === idx ? spare : sg));
            songRef.current = spare;
            setSongs(next);
            setTimer(TOTAL_TIME);
            setReplaced(true);
            phaseRef.current = 'idle';
            setPhase('idle');
          } else {
            phaseRef.current = 'blocked';
            setPhase('blocked');
          }
        }
      } catch {}
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // ── Answer card animation ──────────────────────────────────────────────────
  const openAnswerCard = () => {
    Animated.parallel([
      Animated.spring(answerSlide,   { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(answerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeAnswerCard = () => {
    answerSlide.setValue(300);
    answerOpacity.setValue(0);
  };

  // ── Feedback animation ─────────────────────────────────────────────────────
  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  // ── Play ───────────────────────────────────────────────────────────────────
  const handlePlay = () => {
    setReplaced(false);
    setPhase('playing');
    phaseRef.current = 'playing';

    if (!isInfinite) {
      timerRef.current = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    }

    if (Platform.OS === 'web') {
      const start = song.startAt ?? 0;
      // Manipulation DOM synchrone dans le gestionnaire de clic = le navigateur mobile
      // reconnaît le geste utilisateur et autorise l'autoplay dans l'iframe caché
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&start=${start}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;
      }
    } else {
      Linking.openURL(`https://www.youtube.com/watch?v=${song.videoId}`);
    }
  };

  // ── Guess ──────────────────────────────────────────────────────────────────
  const handleGuess = (currentText) => {
    const text = typeof currentText === 'string' ? currentText : inputText;
    if (phase !== 'playing' || !text.trim()) return;
    if (isCorrectTitle(text, song.title)) {
      stopTimer();
      const pts = currentPts;
      setFoundPts(pts);
      animateFeedback();
      if (hasPlayers) {
        phaseRef.current = 'found';
        setPhase('found');
      } else {
        phaseRef.current = 'reveal';
        setResults(prev => [...prev, { song, finder: null, points: pts }]);
        setTimeout(() => { setPhase('reveal'); openAnswerCard(); }, 600);
      }
    } else {
      // Feedback visible pour mauvaise réponse
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 600);
    }
  };

  // ── Award point to a player ────────────────────────────────────────────────
  const handleAwardPlayer = (playerName) => {
    setScores(prev => ({ ...prev, [playerName]: (prev[playerName] || 0) + foundPts }));
    setResults(prev => [...prev, { song, finder: playerName, points: foundPts }]);
    phaseRef.current = 'reveal';
    setPhase('reveal');
    openAnswerCard();
  };

  // ── Reveal (skip) ──────────────────────────────────────────────────────────
  const handleReveal = () => {
    stopAudio();
    stopTimer();
    phaseRef.current = 'reveal';
    setPhase('reveal');
    if (results.length === songIdx) {
      setResults(prev => [...prev, { song, finder: null, points: 0 }]);
    }
    openAnswerCard();
  };

  // ── Next song ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    stopAudio();
    closeAnswerCard();
    setInputText('');
    setTimer(TOTAL_TIME);
    setFoundPts(0);
    if (songIdx < songs.length - 1) {
      setSongIdx(i => i + 1);
      phaseRef.current = 'idle';
      setPhase('idle');
    } else {
      phaseRef.current = 'final';
      setPhase('final');
    }
  };

  const quit = () => goBackOrMenu(navigation);
  const iframe = Platform.OS === 'web' ? React.createElement('iframe', {
    ref: iframeRef,
    allow: 'autoplay; encrypted-media',
    style: { position: 'fixed', bottom: -1, left: -1, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' },
  }) : null;

  // ── Fin de partie ──
  let screen;
  if (phase === 'final') {
    const foundCount = results.filter(r => r.points > 0).length;
    const totalPts   = results.reduce((s, r) => s + r.points, 0);
    const maxPts     = isInfinite ? songs.length : songs.length * 3;
    const pct        = Math.round((totalPts / Math.max(maxPts, 1)) * 100);
    screen = (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={songs.length} total={songs.length} />}
        footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
        <View style={styles.score}>
          <Text style={styles.kicker}>FIN DE PARTIE</Text>
          <Text style={styles.pct}>{pct} %</Text>
          <Text style={styles.sub}>des points possibles · {foundCount} chanson{foundCount > 1 ? 's' : ''} trouvée{foundCount > 1 ? 's' : ''} sur {songs.length}</Text>
          <Text style={styles.verdict}>
            {pct >= 70 ? 'Oreille d’or : vous connaissez vos classiques.' : pct >= 40 ? 'Pas mal, quelques tubes bien connus.' : 'Ces chansons vous ont résisté.'}
          </Text>
        </View>
        {hasPlayers && <Ranking players={playerNames} scores={scores} suffix=" pts" />}
        <View style={styles.recap}>
          <Text style={styles.kickerMuted}>RÉCAPITULATIF</Text>
          {results.map((r, i) => (
            <View key={i} style={styles.recapRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.recapTitle} numberOfLines={1}>{r.song.title}</Text>
                <Text style={styles.recapArtist} numberOfLines={1}>{r.song.artist}</Text>
              </View>
              <Text style={[styles.recapPts, r.points > 0 ? { color: BEAT } : null]}>
                {r.points > 0 ? `${r.finder ? r.finder + ' · ' : ''}+${r.points}` : '—'}
              </Text>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  const last = results[results.length - 1];
  const top = <GameTopBar game={GAME} onBack={quit} current={songIdx + 1} total={songs.length} />;

  // ── Réponse ──
  if (phase === 'reveal') {
    screen = (
      <GameScreen top={top} footer={(
        <ActionBar>
          <PrimaryButton label={songIdx < songs.length - 1 ? 'Chanson suivante' : 'Voir les scores'} onPress={handleNext} />
        </ActionBar>
      )}>
        <Heading kicker={last?.points > 0 ? (last?.finder ? `Trouvé par ${last.finder}` : 'Trouvé') : 'Pas trouvé'} />
        <View style={styles.answer}>
          <View style={styles.answerInner}>
            {Platform.OS === 'web' && (
              <View style={styles.thumb}>
                <img src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`} alt={song.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              </View>
            )}
            <Text style={styles.kicker}>LA CHANSON ÉTAIT</Text>
            <Text style={styles.answerTitle}>{song.title}</Text>
            <Text style={styles.answerArtist}>{song.artist}</Text>
            {last?.points > 0 ? <Text style={[styles.kicker, { color: BEAT }]}>+{last.points} POINT{last.points > 1 ? 'S' : ''}</Text> : null}
          </View>
        </View>
      </GameScreen>
    );
  }

  // ── Qui a trouvé ? ──
  if (phase === 'found') {
    screen = (
      <GameScreen top={top} footer={(
        <ActionBar>
          <TextLink label="Personne n’a répondu" color={T.encreDouce} onPress={() => { setResults(prev => [...prev, { song, finder: null, points: foundPts }]); setPhase('reveal'); phaseRef.current = 'reveal'; openAnswerCard(); }} />
        </ActionBar>
      )}>
        <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
          <Notice title={`Bonne réponse · +${foundPts} point${foundPts > 1 ? 's' : ''}`}>{song.title}</Notice>
        </Animated.View>
        <Heading title="Qui a trouvé ?" />
        <PlayerGrid>
          {playerNames.map((name, i) => (
            <PlayerChoice key={name} name={name} index={i} onPress={() => handleAwardPlayer(name)} label={`Donner les points à ${name}`} />
          ))}
        </PlayerGrid>
      </GameScreen>
    );
  }

  // ── Écoute / attente ──
  if (!screen) screen = (
    <GameScreen top={top} footer={phase === 'playing' ? (
      <ActionBar>
        <View style={styles.inputRow}>
          <Field ref={inputRef} blurOnSubmit={false} style={[{ flex: 1 }, wrongFlash && { borderColor: T.alerte }]}
            placeholder="Titre de la chanson…" value={inputText} onChangeText={setInputText} onSubmitEditing={handleGuess}
            returnKeyType="done" autoCorrect={false} autoCapitalize="none" accessibilityLabel="Titre de la chanson" />
          {/* Web : onMouseDown + preventDefault pour garder le focus dans le champ */}
          <Pressable accessibilityRole="button" accessibilityLabel="Valider"
            style={[styles.validate, !inputText.trim() && { opacity: 0.4 }]}
            onPress={Platform.OS !== 'web' ? handleGuess : undefined}
            onMouseDown={Platform.OS === 'web' ? (e) => { e.preventDefault(); handleGuess(inputText); } : undefined}>
            <Icon name="check" color={T.surOr} />
          </Pressable>
        </View>
        <TextLink label="Je ne sais pas" color={T.encreDouce} onPress={handleReveal} />
      </ActionBar>
    ) : phase === 'idle' ? (
      <ActionBar><PrimaryButton label="Jouer l’extrait" onPress={handlePlay} /></ActionBar>
    ) : null}>
      {phase === 'idle' && (
        <View style={styles.stage}>
          <Text style={styles.kicker}>CHANSON {songIdx + 1} SUR {songs.length}</Text>
          <View style={styles.disc}><View style={styles.discHole} /></View>
          <Text style={styles.sub}>Préparez vos oreilles. {isInfinite ? 'Pas de limite de temps.' : `Vous avez ${TOTAL_TIME} secondes.`}</Text>
          {replaced && <Notice tone="neutre">La chanson précédente n’était pas disponible : une autre a été choisie.</Notice>}
        </View>
      )}

      {phase === 'playing' && (
        <View style={styles.stage}>
          <EqBars />
          <View style={[styles.timer, { borderColor: timerColor }]}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{isInfinite ? '∞' : timer}</Text>
            {!isInfinite && <Text style={styles.timerUnit}>SECONDES</Text>}
          </View>
          <Text style={[styles.kicker, { color: timerColor }]}>{currentPts} POINT{currentPts > 1 ? 'S' : ''} EN JEU</Text>
        </View>
      )}

      {phase === 'blocked' && (
        <View style={styles.stage}>
          <Heading title="Vidéo indisponible" sub="Cette vidéo ne peut pas être lue ici. Ouvrez-la sur YouTube pour l’écouter." />
          <SecondaryButton label="Ouvrir sur YouTube" onPress={() => openYoutube(song)} />
          <TextLink label="Révéler la réponse" onPress={handleReveal} />
        </View>
      )}
    </GameScreen>
  );
  return <View style={{ flex: 1 }}>{screen}{iframe}</View>;
}

const styles = StyleSheet.create({
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  sub: { color: T.encreDouce, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  stage: { alignItems: 'center', gap: 20, paddingTop: 16 },
  disc: { width: 168, height: 168, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, alignItems: 'center', justifyContent: 'center' },
  discHole: { width: 36, height: 36, borderRadius: 999, borderWidth: 2, borderColor: BEAT },
  timer: { width: 132, height: 132, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timerNum: { fontFamily: F.chiffre, fontSize: 48, lineHeight: 54 },
  timerUnit: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  validate: { width: 52, height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },
  answer: { borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  answerInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', padding: 18, alignItems: 'center', gap: 10 },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: T.creux },
  answerTitle: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 28, lineHeight: 33, textAlign: 'center' },
  answerArtist: { color: T.encreDouce, fontSize: 16, textAlign: 'center' },
  score: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 6 },
  pct: { color: T.encre, fontFamily: F.affiche, fontSize: 56, lineHeight: 62 },
  verdict: { color: T.encre, fontSize: 16, textAlign: 'center' },
  recap: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16, gap: 10 },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.trait },
  recapTitle: { color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  recapArtist: { color: T.encreDouce, fontSize: 13 },
  recapPts: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
});
