import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { selectFilms } from '../../data/movieClues';

const BG        = OB_BG;
const CIN       = '#DC2626';
const CIN_DARK  = '#991B1B';
const CIN_LIGHT = '#FCA5A5';

// Normalise pour comparaison : minuscules, sans accents ni ponctuation
function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Accepte le titre complet OU toute sous-chaîne significative (>= 4 caractères)
function isCorrectGuess(input, title) {
  const inp = normalize(input);
  const tit = normalize(title);
  if (!inp || inp.length < 2) return false;
  return tit === inp || (inp.length >= 4 && tit.includes(inp));
}

// ── Image : /cineflash/[Titre]/1.jpg → .jpeg → .png → .webp → placeholder ───
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];

function CineImage({ title, imgIndex, style }) {
  const [extIdx, setExtIdx] = useState(0);
  const [error, setError] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    setExtIdx(0);
    setError(false);
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [title, imgIndex]);

  const uri = Platform.OS === 'web'
    ? `/cineflash/${encodeURIComponent(title)}/${imgIndex + 1}.${EXTS[extIdx]}`
    : null;

  const handleError = () => {
    if (extIdx < EXTS.length - 1) { setExtIdx(e => e + 1); }
    else { setError(true); }
  };

  if (error || !uri) {
    return (
      <Animated.View style={[style, styles.imgPlaceholder, { opacity }]}>
        <Text style={styles.imgPlaceholderEmoji}>🎬</Text>
        <Text style={styles.imgPlaceholderText}>Image non disponible</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[style, { overflow: 'hidden' }, { opacity }]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        onError={handleError}
      />
    </Animated.View>
  );
}

// ── Dots de progression des indices ──────────────────────────────────────────
function DotRow({ total, active }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[
          styles.dot,
          i < active  && styles.dotPast,
          i === active && styles.dotActive,
        ]} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CineFlashGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 10 } = route.params || {};
  const hasPlayers = playerNames.length > 0;

  const [films]        = useState(() => selectFilms(roundCount));
  const [filmIdx,  setFilmIdx]  = useState(0);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [phase,    setPhase]    = useState('playing'); // 'playing'|'feedback'|'answer'|'final'
  const [wasCorrect, setWasCorrect] = useState(null);
  const [foundAtIdx,  setFoundAtIdx]  = useState(null);
  const [scores,   setScores]   = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );
  const [results,  setResults]  = useState([]);
  const [inputText, setInputText] = useState('');

  const feedbackScale = useRef(new Animated.Value(0)).current;
  const answerSlide   = useRef(new Animated.Value(300)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;

  const film         = films[filmIdx] || films[0];
  const totalImgs    = film.imgs ?? 3;
  const maxImgIdx    = totalImgs - 1;
  const currentPts   = totalImgs - imgIdx;     // adapté au nb d'images
  const currentPlayer = hasPlayers ? playerNames[filmIdx % playerNames.length] : null;

  // Reset input quand l'indice ou le film change
  useEffect(() => { setInputText(''); }, [filmIdx, imgIdx]);

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  const openAnswerCard = () => {
    Animated.parallel([
      Animated.spring(answerSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(answerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  // ── Soumission du guess ────────────────────────────────────────────────────
  const handleTextSubmit = () => {
    if (phase !== 'playing' || !inputText.trim()) return;

    if (isCorrectGuess(inputText, film.title)) {
      // ✅ Bonne réponse
      const pts = currentPts;
      if (hasPlayers && currentPlayer) {
        setScores(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] || 0) + pts }));
      }
      setResults(prev => [...prev, { title: film.title, finder: currentPlayer, points: pts }]);
      setFoundAtIdx(imgIdx);
      setWasCorrect(true);
      setPhase('feedback');
      animateFeedback();
      setTimeout(() => { setPhase('answer'); openAnswerCard(); }, 900);

    } else {
      // ❌ Mauvaise réponse
      setWasCorrect(false);
      setPhase('feedback');
      animateFeedback();
      setTimeout(() => {
        if (imgIdx < maxImgIdx) {
          setImgIdx(i => i + 1);
          setPhase('playing');
          setWasCorrect(null);
        } else {
          // Plus d'indices : révèle la réponse
          setResults(prev => [...prev, { title: film.title, finder: null, points: 0 }]);
          setPhase('answer');
          openAnswerCard();
        }
      }, 900);
    }
  };

  // ── Passer à l'indice suivant sans deviner ─────────────────────────────────
  const handleSkip = () => {
    if (phase !== 'playing') return;
    if (imgIdx < maxImgIdx) {
      setImgIdx(i => i + 1);
    } else {
      setResults(prev => [...prev, { title: film.title, finder: null, points: 0 }]);
      setPhase('answer');
      openAnswerCard();
    }
  };

  // ── Film suivant ───────────────────────────────────────────────────────────
  const handleNextFilm = () => {
    answerSlide.setValue(300);
    answerOpacity.setValue(0);
    setFoundAtIdx(null);
    setWasCorrect(null);
    setInputText('');
    if (filmIdx < films.length - 1) {
      setFilmIdx(i => i + 1);
      setImgIdx(0);
      setPhase('playing');
    } else {
      setPhase('final');
    }
  };

  // ── Écran final ────────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sortedScores = hasPlayers
      ? Object.entries(scores).sort(([, a], [, b]) => b - a)
      : [];
    const foundCount = results.filter(r => r.points > 0).length;
    const totalPts   = results.reduce((s, r) => s + r.points, 0);
    const maxPts     = films.length * 3;
    const pct        = Math.round((totalPts / Math.max(maxPts, 1)) * 100);

    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.finalScroll}
          showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' && { height: '100vh' }}
        >
          {/* Score global */}
          <View style={styles.compatCard}>
            <LinearGradient colors={['#2D0000', '#4A0000']} style={styles.compatInner}>
              <Text style={styles.compatEmoji}>
                {pct >= 70 ? '🏆' : pct >= 40 ? '🎬' : '😵'}
              </Text>
              <Text style={styles.compatPct}>{pct}%</Text>
              <Text style={styles.compatTitle}>de films trouvés</Text>
              <View style={styles.compatDivider} />
              <Text style={styles.compatLabel}>
                {pct >= 70
                  ? 'Impressionnant ! Vous connaissez vos classiques !'
                  : pct >= 40
                    ? 'Pas mal ! Quelques films bien vus...'
                    : 'Les films vous ont bien résisté !'}
              </Text>
            </LinearGradient>
          </View>

          {/* Classement */}
          {hasPlayers && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🏆 CLASSEMENT</Text>
              {sortedScores.map(([name, pts], i) => (
                <View key={name} style={styles.scoreRow}>
                  <Text style={styles.scoreRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </Text>
                  <Text style={styles.scoreName}>{name}</Text>
                  <View style={styles.scoreBarWrap}>
                    <View style={styles.scoreTrack}>
                      <View style={[styles.scoreFill, {
                        width: `${(pts / Math.max(sortedScores[0][1], 1)) * 100}%`,
                      }]} />
                    </View>
                  </View>
                  <Text style={styles.scoreVal}>{pts} pts</Text>
                </View>
              ))}
            </View>
          )}

          {/* Récapitulatif */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📽️ RÉCAPITULATIF — {foundCount}/{films.length} trouvés</Text>
            {results.map((r, i) => (
              <View key={i} style={styles.recapRow}>
                <Text style={styles.recapFilm}>{r.title}</Text>
                <Text style={styles.recapFinder}>
                  {r.points > 0
                    ? r.finder
                      ? `✅ ${r.finder} — ${r.points} pt${r.points > 1 ? 's' : ''}`
                      : `✅ Trouvé — ${r.points} pt${r.points > 1 ? 's' : ''}`
                    : '❌ Non trouvé'}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('CineFlashSetup')} style={styles.replayBtn}>
            <LinearGradient colors={[CIN, CIN_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayGradient}>
              <Text style={styles.replayText}>🎬  Nouvelle partie</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Écran de jeu ───────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={BG} style={styles.container}>
      {/* Barre de progression */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(filmIdx / films.length) * 100}%` }]} />
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
          <Text style={styles.roundCounter}>🎬 {filmIdx + 1} / {films.length}</Text>
        </View>

        {/* Joueur actuel + points en jeu */}
        <View style={styles.infoRow}>
          {currentPlayer ? (
            <View style={[styles.playerChip, { backgroundColor: CIN + '33', borderColor: CIN + '66' }]}>
              <Text style={styles.playerChipRole}>🎯 À toi</Text>
              <Text style={[styles.playerChipName, { color: CIN_LIGHT }]}>{currentPlayer}</Text>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.ptsChip}>
            <Text style={styles.ptsChipNum}>{currentPts}</Text>
            <Text style={styles.ptsChipLabel}>pt{currentPts > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Image — ordre obscur→reconnaissable */}
        <View style={styles.imageContainer}>
          <CineImage
            title={film.title}
            imgIndex={film.order ? film.order[imgIdx] : imgIdx}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Dots sur l'image */}
          {phase !== 'answer' && (
            <View style={styles.dotsOnImage}>
              <DotRow total={totalImgs} active={imgIdx} />
            </View>
          )}

          {/* Feedback overlay */}
          {phase === 'feedback' && (
            <Animated.View
              style={[styles.feedbackOverlay, { transform: [{ scale: feedbackScale }] }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={wasCorrect
                  ? [colors.success + 'EE', colors.success + 'BB']
                  : [colors.danger + 'EE', colors.danger + 'BB']}
                style={styles.feedbackInner}
              >
                <Text style={styles.feedbackEmoji}>
                  {wasCorrect ? '🎉' : imgIdx < maxImgIdx ? '💡' : '😅'}
                </Text>
                <Text style={styles.feedbackText}>
                  {wasCorrect
                    ? `+${currentPts} pt${currentPts > 1 ? 's' : ''} !`
                    : imgIdx < maxImgIdx ? 'Indice suivant...' : 'Raté !'}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        <Text style={styles.hintLabel}>
          Indice {imgIdx + 1} / {totalImgs}
        </Text>

        {/* Champ texte de guess */}
        {(phase === 'playing' || phase === 'feedback') && (
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Tapez le titre du film..."
                placeholderTextColor={CIN + '66'}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleTextSubmit}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="words"
                editable={phase === 'playing'}
              />
              <TouchableOpacity
                style={[styles.validateBtn, (!inputText.trim() || phase !== 'playing') && styles.validateBtnDisabled]}
                onPress={handleTextSubmit}
                activeOpacity={0.8}
                disabled={!inputText.trim() || phase !== 'playing'}
              >
                <Text style={styles.validateBtnText}>✓</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.8}
              style={styles.skipBtn}
              disabled={phase !== 'playing'}
            >
              <LinearGradient
                colors={['#0F0A1F', '#14101F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skipBtnInner}
              >
                <Text style={styles.skipBtnText}>
                  {imgIdx < maxImgIdx
                    ? `⏭  INDICE SUIVANT  (${imgIdx + 2}/${totalImgs})`
                    : '⏭  PASSER — révéler la réponse'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Carte réponse (slide du bas) */}
      {phase === 'answer' && (
        <Animated.View
          style={[styles.answerOverlay, { opacity: answerOpacity, transform: [{ translateY: answerSlide }] }]}
        >
          <LinearGradient colors={['#0F0A1F', '#07050E']} style={styles.answerCard}>
            {foundAtIdx !== null ? (
              <>
                <Text style={styles.answerResult}>🎉 Trouvé !</Text>
                <Text style={styles.answerPts}>+{totalImgs - foundAtIdx} point{totalImgs - foundAtIdx > 1 ? 's' : ''}</Text>
                {results[results.length - 1]?.finder && (
                  <Text style={styles.answerFinder}>par {results[results.length - 1].finder}</Text>
                )}
              </>
            ) : (
              <Text style={styles.answerResult}>😅 Personne n'a trouvé !</Text>
            )}

            <View style={styles.answerDivider} />

            <Text style={styles.answerLabel}>La réponse était :</Text>
            <Text style={styles.answerTitle}>{film.title}</Text>

            <View style={styles.answerPoster}>
              <CineImage title={film.title} imgIndex={film.order ? film.order[maxImgIdx] : maxImgIdx} style={StyleSheet.absoluteFillObject} />
            </View>

            <TouchableOpacity onPress={handleNextFilm} style={styles.nextFilmBtn} activeOpacity={0.85}>
              <LinearGradient colors={[CIN, CIN_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextFilmGradient}>
                <Text style={styles.nextFilmText}>
                  {filmIdx < films.length - 1 ? '▶  Film suivant' : '🏆  Voir les scores'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  progressTrack: { height: 3, backgroundColor: colors.border, width: '100%' },
  progressFill:  { height: '100%', backgroundColor: CIN, borderRadius: 2 },

  innerScroll: { flex: 1 },
  inner: {
    paddingHorizontal: Platform.select({ web: spacing.sm, default: spacing.lg }),
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 32,
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  quitBtn: { paddingVertical: 4 },
  quitText: { color: colors.textMuted, fontSize: 13 },
  roundCounter: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },

  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  playerChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  playerChipRole: { fontSize: 10, color: colors.textMuted },
  playerChipName: { fontSize: 15, fontWeight: '800' },
  ptsChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: `${CIN}25`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: `${CIN}50`,
    gap: 4,
  },
  ptsChipNum:   { fontSize: 22, fontWeight: '900', color: CIN_LIGHT },
  ptsChipLabel: { fontSize: 12, fontWeight: '700', color: `${CIN_LIGHT}AA` },

  imageContainer: {
    alignSelf: 'center',
    width: '100%',
    height: Platform.select({ web: '58vh', default: 320 }),
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${CIN}40`,
    backgroundColor: '#0F0A1F',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  imgPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0A1F', gap: spacing.sm },
  imgPlaceholderEmoji: { fontSize: 48 },
  imgPlaceholderText:  { fontSize: 13, color: colors.textMuted },

  dotsOnImage: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive:{ backgroundColor: CIN, width: 20, borderRadius: 4 },
  dotPast:  { backgroundColor: `${CIN}60`, width: 8, borderRadius: 4 },

  hintLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  feedbackOverlay: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  feedbackInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  feedbackEmoji: { fontSize: 30 },
  feedbackText:  { fontSize: 22, fontWeight: '900', color: colors.text },

  // Input
  inputContainer: { gap: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: CIN + '66',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  validateBtn: {
    backgroundColor: CIN,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateBtnDisabled: { backgroundColor: CIN + '44' },
  validateBtnText: { fontSize: 20, fontWeight: '900', color: colors.text },

  skipBtn: { borderRadius: radius.full, overflow: 'hidden' },
  skipBtnInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: `${CIN}33`,
  },
  skipBtnText: { fontSize: 13, fontWeight: '800', color: CIN_LIGHT + 'BB', letterSpacing: 1 },

  // Answer card
  answerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  answerCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xl,
    borderTopWidth: 1,
    borderColor: `${CIN}40`,
    alignItems: 'center',
  },
  answerResult: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerPts:    { fontSize: 20, fontWeight: '800', color: CIN_LIGHT, marginTop: 4 },
  answerFinder: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  answerDivider:{ height: 1, backgroundColor: `${CIN}30`, width: '80%', marginVertical: spacing.md },
  answerLabel:  { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  answerTitle:  { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerYear:   { fontSize: 13, color: CIN_LIGHT, marginBottom: spacing.md },
  answerPoster: {
    width: Platform.select({ web: 160, default: 130 }),
    height: Platform.select({ web: 160, default: 130 }),
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: '#0F0A1F',
  },
  nextFilmBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    width: '100%',
    shadowColor: CIN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextFilmGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  nextFilmText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  // Final
  finalScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
  },
  compatCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: CIN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  compatInner: {
    alignItems: 'center',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: CIN + '55',
    borderRadius: radius.xl,
  },
  compatEmoji:   { fontSize: 56, marginBottom: spacing.sm },
  compatPct:     { fontSize: 64, fontWeight: '900', color: CIN_LIGHT, lineHeight: 72 },
  compatTitle:   { fontSize: 14, color: colors.textSecondary, letterSpacing: 2, marginBottom: spacing.md },
  compatDivider: { height: 1, width: '60%', backgroundColor: CIN + '44', marginBottom: spacing.md },
  compatLabel:   { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center', lineHeight: 24 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: CIN_LIGHT, letterSpacing: 2, marginBottom: spacing.md },

  scoreRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  scoreRank:    { fontSize: 20, width: 32, textAlign: 'center' },
  scoreName:    { width: 80, fontSize: 14, fontWeight: '700', color: colors.text },
  scoreBarWrap: { flex: 1 },
  scoreTrack:   { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  scoreFill:    { height: '100%', backgroundColor: CIN, borderRadius: 3 },
  scoreVal:     { width: 48, fontSize: 12, color: colors.textSecondary, textAlign: 'right', fontWeight: '700' },

  recapRow:   { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  recapFilm:  { fontSize: 13, fontWeight: '700', color: colors.text },
  recapYear:  { fontWeight: '400', color: colors.textMuted },
  recapFinder:{ fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  replayBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  replayGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  menuBtn:    { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText:{ fontSize: 14, color: CIN_LIGHT, fontWeight: '600' },
});
