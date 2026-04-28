import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { selectSongs } from '../../data/blindTestSongs';

const BEAT       = '#10B981';
const BEAT_DARK  = '#059669';
const BEAT_LIGHT = '#6EE7B7';

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
}

function isCorrectGuess(input, title) {
  const inp = normalize(input);
  const tit = normalize(title);
  if (!inp || inp.length < 2) return false;
  return tit === inp || (inp.length >= 4 && tit.includes(inp));
}

// ── YouTube iframe (web only) ─────────────────────────────────────────────────
function YoutubeAudio({ src }) {
  if (Platform.OS !== 'web' || !src) return null;
  return (
    <iframe
      src={src}
      style={{
        position: 'absolute', width: 1, height: 1,
        opacity: 0, pointerEvents: 'none', border: 'none',
      }}
      allow="autoplay; encrypted-media"
      title="blind-test-audio"
    />
  );
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
  const { playerNames = [], songCount = 10, timeLimit = 30 } = route.params || {};
  const hasPlayers = playerNames.length > 0;
  const isInfinite = timeLimit === null;
  const TOTAL_TIME = timeLimit ?? 30;

  const [songs]      = useState(() => selectSongs(songCount));
  const [songIdx,    setSongIdx]    = useState(0);
  const [phase,      setPhase]      = useState('idle'); // idle|playing|found|reveal|final
  const [scores,     setScores]     = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [results,    setResults]    = useState([]);
  const [inputText,  setInputText]  = useState('');
  const [timer,      setTimer]      = useState(TOTAL_TIME);
  const [iframeSrc,  setIframeSrc]  = useState(null);
  const [foundPts,   setFoundPts]   = useState(0);

  const timerRef  = useRef(null);
  const phaseRef  = useRef('idle');
  const songRef   = useRef(songs[0]);
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
    : timer >= TOTAL_TIME / 3 ? '#F59E0B'
    : '#EF4444';

  // ── Timer ──────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
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
    setPhase('playing');
    phaseRef.current = 'playing';
    setIframeSrc(
      `https://www.youtube.com/embed/${song.videoId}?autoplay=1&start=${song.startAt}&rel=0&modestbranding=1&controls=0&iv_load_policy=3`
    );
    if (!isInfinite) {
      timerRef.current = setInterval(() => {
        setTimer(t => Math.max(0, t - 1));
      }, 1000);
    }
  };

  // ── Guess ──────────────────────────────────────────────────────────────────
  const handleGuess = () => {
    if (phase !== 'playing' || !inputText.trim()) return;
    if (isCorrectGuess(inputText, song.title)) {
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
      animateFeedback();
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
    closeAnswerCard();
    setIframeSrc(null);
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

  // ── Final screen ───────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sortedScores = hasPlayers
      ? Object.entries(scores).sort(([, a], [, b]) => b - a)
      : [];
    const foundCount = results.filter(r => r.points > 0).length;
    const totalPts   = results.reduce((s, r) => s + r.points, 0);
    const maxPts     = isInfinite ? songs.length : songs.length * 3;
    const pct        = Math.round((totalPts / Math.max(maxPts, 1)) * 100);

    return (
      <LinearGradient colors={['#001A0F', '#00110A', '#001A0F']} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.finalScroll}
          showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' && { height: '100vh' }}
        >
          <View style={styles.compatCard}>
            <LinearGradient colors={[`${BEAT}30`, `${BEAT}18`]} style={styles.compatInner}>
              <Text style={styles.compatEmoji}>{pct >= 70 ? '🏆' : pct >= 40 ? '🎸' : '🤘'}</Text>
              <Text style={styles.compatPct}>{pct}%</Text>
              <Text style={styles.compatTitle}>des chansons trouvées</Text>
              <View style={styles.compatDivider} />
              <Text style={styles.compatLabel}>
                {pct >= 70 ? 'Oreille d\'or ! Véritable expert rock !' : pct >= 40 ? 'Pas mal ! Quelques classiques bien connus…' : 'Les riffs vous ont résisté !'}
              </Text>
            </LinearGradient>
          </View>

          {hasPlayers && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🏆 CLASSEMENT</Text>
              {sortedScores.map(([name, pts], i) => (
                <View key={name} style={styles.scoreRow}>
                  <Text style={styles.scoreRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</Text>
                  <Text style={styles.scoreName}>{name}</Text>
                  <View style={styles.scoreBarWrap}>
                    <View style={styles.scoreTrack}>
                      <View style={[styles.scoreFill, { width: `${(pts / Math.max(sortedScores[0][1], 1)) * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.scoreVal}>{pts} pts</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎵 RÉCAP — {foundCount}/{songs.length} trouvées</Text>
            {results.map((r, i) => (
              <View key={i} style={styles.recapRow}>
                <View>
                  <Text style={styles.recapTitle}>{r.song.title}</Text>
                  <Text style={styles.recapArtist}>{r.song.artist}</Text>
                </View>
                <Text style={styles.recapFinder}>
                  {r.points > 0
                    ? r.finder ? `✅ ${r.finder} — ${r.points} pt${r.points > 1 ? 's' : ''}` : `✅ ${r.points} pt${r.points > 1 ? 's' : ''}`
                    : '❌'}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('BlindTestSetup')} style={styles.replayBtn}>
            <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayGradient}>
              <Text style={styles.replayText}>🎸  Nouvelle partie</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#001A0F', '#00110A', '#001A0F']} style={styles.container}>
      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(songIdx / songs.length) * 100}%` }]} />
      </View>

      <ScrollView
        style={[styles.innerScroll, Platform.OS === 'web' && { height: '100vh' }]}
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.roundCounter}>🎵 {songIdx + 1} / {songs.length}</Text>
        </View>

        {/* Points chip */}
        <View style={styles.infoRow}>
          <View />
          {phase === 'playing' && (
            <View style={[styles.ptsChip, { borderColor: `${timerColor}50`, backgroundColor: `${timerColor}25` }]}>
              <Text style={[styles.ptsChipNum, { color: timerColor }]}>{currentPts}</Text>
              <Text style={[styles.ptsChipLabel, { color: `${timerColor}AA` }]}>pt{currentPts > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {/* Music zone */}
        <View style={styles.musicZone}>
          <YoutubeAudio src={iframeSrc} />

          {phase === 'idle' && (
            <View style={styles.idleContent}>
              <Text style={styles.idleNote}>🎵</Text>
              <Text style={styles.idleSongNum}>Chanson {songIdx + 1}</Text>
              <TouchableOpacity onPress={handlePlay} activeOpacity={0.85} style={styles.playBtnWrap}>
                <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.playBtn}>
                  <Text style={styles.playBtnText}>▶  JOUER L'EXTRAIT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {(phase === 'playing') && (
            <View style={styles.playingContent}>
              <EqBars />
              <View style={[styles.timerWrap, { borderColor: `${timerColor}60` }]}>
                {isInfinite ? (
                  <Text style={[styles.timerNum, { color: timerColor, fontSize: 40 }]}>∞</Text>
                ) : (
                  <>
                    <Text style={[styles.timerNum, { color: timerColor }]}>{timer}</Text>
                    <Text style={styles.timerLabel}>s</Text>
                  </>
                )}
              </View>
            </View>
          )}

          {phase === 'found' && (
            <View style={styles.foundContent}>
              <Animated.View style={[styles.foundBadge, { transform: [{ scale: feedbackScale }] }]}>
                <LinearGradient colors={[`${BEAT}EE`, `${BEAT_DARK}BB`]} style={styles.foundInner}>
                  <Text style={styles.foundEmoji}>✅</Text>
                  <Text style={styles.foundText}>+{foundPts} pt{foundPts > 1 ? 's' : ''} !</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.whoFoundLabel}>Qui a trouvé ?</Text>
              <View style={styles.playerBtns}>
                {playerNames.map(name => (
                  <TouchableOpacity key={name} onPress={() => handleAwardPlayer(name)} style={styles.playerBtnWrap}>
                    <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.playerBtn}>
                      <Text style={styles.playerBtnText}>{name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setResults(prev => [...prev, { song, finder: null, points: foundPts }]); setPhase('reveal'); phaseRef.current = 'reveal'; openAnswerCard(); }} style={styles.playerBtnWrap}>
                  <View style={[styles.playerBtn, styles.playerBtnNobody]}>
                    <Text style={styles.playerBtnTextMuted}>Personne n'a répondu</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Guess input — only during playing */}
        {phase === 'playing' && (
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Tapez le titre de la chanson..."
                placeholderTextColor={`${BEAT}66`}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleGuess}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.validateBtn, !inputText.trim() && styles.validateBtnDisabled]}
                onPress={handleGuess}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.validateBtnText}>✓</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleReveal} style={styles.skipBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#001A0F', '#002D1A']} style={styles.skipBtnInner}>
                <Text style={styles.skipBtnText}>❓  Je ne sais pas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Answer card */}
      {(phase === 'reveal') && (
        <Animated.View style={[styles.answerOverlay, { opacity: answerOpacity, transform: [{ translateY: answerSlide }] }]}>
          <LinearGradient colors={['#001A0F', '#000D07']} style={styles.answerCard}>
            {results[results.length - 1]?.points > 0 ? (
              <>
                <Text style={styles.answerResult}>🎉 Trouvé !</Text>
                {results[results.length - 1]?.finder && (
                  <Text style={styles.answerFinder}>par {results[results.length - 1].finder}</Text>
                )}
              </>
            ) : (
              <Text style={styles.answerResult}>😅 Pas trouvé !</Text>
            )}

            <View style={styles.answerDivider} />

            <Text style={styles.answerLabel}>LA CHANSON ÉTAIT :</Text>
            <Text style={styles.answerTitle}>{song.title}</Text>
            <Text style={styles.answerArtist}>{song.artist}</Text>

            {Platform.OS === 'web' && (
              <View style={styles.thumbWrap}>
                <img
                  src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                  alt={song.title}
                />
              </View>
            )}

            <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.85}>
              <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGradient}>
                <Text style={styles.nextText}>
                  {songIdx < songs.length - 1 ? '▶  Chanson suivante' : '🏆  Voir les scores'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  progressTrack: { height: 3, backgroundColor: colors.border, width: '100%' },
  progressFill:  { height: '100%', backgroundColor: BEAT, borderRadius: 2 },

  innerScroll: { flex: 1 },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 32,
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  quitBtn: { paddingVertical: 4 },
  quitText: { color: colors.textMuted, fontSize: 13 },
  roundCounter: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },

  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, minHeight: 40 },
  ptsChip: {
    flexDirection: 'row', alignItems: 'baseline',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, gap: 4,
  },
  ptsChipNum:   { fontSize: 22, fontWeight: '900' },
  ptsChipLabel: { fontSize: 12, fontWeight: '700' },

  // Music zone
  musicZone: {
    width: '100%',
    height: Platform.select({ web: '52vh', default: 280 }),
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#001A0F',
    borderWidth: 1,
    borderColor: `${BEAT}40`,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  idleContent: { alignItems: 'center', gap: spacing.lg },
  idleNote:    { fontSize: 64 },
  idleSongNum: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, letterSpacing: 2 },
  playBtnWrap: { borderRadius: radius.full, overflow: 'hidden', shadowColor: BEAT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  playBtn:     { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl + 8, borderRadius: radius.full, alignItems: 'center' },
  playBtnText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 2 },

  playingContent: { alignItems: 'center', gap: spacing.xl },
  timerWrap: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  timerNum:   { fontSize: 36, fontWeight: '900' },
  timerLabel: { fontSize: 14, fontWeight: '700', color: colors.textMuted },

  foundContent: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, width: '100%' },
  foundBadge:   { overflow: 'hidden', borderRadius: radius.lg },
  foundInner:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },
  foundEmoji:   { fontSize: 28 },
  foundText:    { fontSize: 24, fontWeight: '900', color: '#fff' },
  whoFoundLabel:{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
  playerBtns:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  playerBtnWrap:{ borderRadius: radius.full, overflow: 'hidden' },
  playerBtn:    { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, borderRadius: radius.full, alignItems: 'center' },
  playerBtnNobody: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  playerBtnText:     { fontSize: 14, fontWeight: '800', color: '#fff' },
  playerBtnTextMuted:{ fontSize: 12, fontWeight: '600', color: colors.textMuted },

  // Input
  inputContainer: { gap: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textInput: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: `${BEAT}66`,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    fontSize: 16, fontWeight: '700', color: colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  validateBtn:         { backgroundColor: BEAT, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  validateBtnDisabled: { backgroundColor: `${BEAT}44` },
  validateBtnText:     { fontSize: 20, fontWeight: '900', color: '#fff' },

  skipBtn:      { borderRadius: radius.full, overflow: 'hidden' },
  skipBtnInner: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', borderRadius: radius.full, borderWidth: 1, borderColor: `${BEAT}33` },
  skipBtnText:  { fontSize: 13, fontWeight: '800', color: `${BEAT_LIGHT}BB`, letterSpacing: 1 },

  // Answer card
  answerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  answerCard: {
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xl,
    borderTopWidth: 1, borderColor: `${BEAT}40`, alignItems: 'center',
  },
  answerResult: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerFinder: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  answerDivider:{ height: 1, backgroundColor: `${BEAT}30`, width: '80%', marginVertical: spacing.md },
  answerLabel:  { fontSize: 11, color: colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  answerTitle:  { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerArtist: { fontSize: 14, color: BEAT_LIGHT, fontWeight: '700', marginTop: 2, marginBottom: spacing.md },
  thumbWrap:    { width: 200, height: 112, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.lg, backgroundColor: '#001A0F' },

  nextBtn:     { borderRadius: radius.full, overflow: 'hidden', width: '100%', shadowColor: BEAT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  nextGradient:{ paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextText:    { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // Final
  finalScroll:  { paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 60 },
  compatCard:   { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.md, shadowColor: BEAT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20 },
  compatInner:  { padding: spacing.xl, alignItems: 'center' },
  compatEmoji:  { fontSize: 48, marginBottom: spacing.sm },
  compatPct:    { fontSize: 56, fontWeight: '900', color: colors.text },
  compatTitle:  { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  compatDivider:{ height: 1, backgroundColor: `${BEAT}30`, width: '80%', marginVertical: spacing.md },
  compatLabel:  { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  card:      { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  cardLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.md },

  scoreRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  scoreRank:   { fontSize: 18, width: 28 },
  scoreName:   { fontSize: 14, fontWeight: '700', color: colors.text, width: 80 },
  scoreBarWrap:{ flex: 1 },
  scoreTrack:  { height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  scoreFill:   { height: '100%', backgroundColor: BEAT, borderRadius: 3 },
  scoreVal:    { fontSize: 13, fontWeight: '800', color: BEAT_LIGHT, width: 44, textAlign: 'right' },

  recapRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  recapTitle:  { fontSize: 13, fontWeight: '700', color: colors.text },
  recapArtist: { fontSize: 11, color: colors.textMuted },
  recapFinder: { fontSize: 12, color: colors.textSecondary },

  replayBtn:     { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm, shadowColor: BEAT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  replayGradient:{ paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayText:    { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  menuBtn:       { paddingVertical: spacing.md, alignItems: 'center' },
  menuBtnText:   { fontSize: 13, color: colors.textMuted },
});
