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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { selectFilms } from '../../data/movieClues';

const CIN       = '#DC2626';
const CIN_DARK  = '#991B1B';
const CIN_LIGHT = '#FCA5A5';

const HINT_LABELS = ['Indice 1 / 3', 'Indice 2 / 3', 'Indice 3 / 3'];

// Image component with fade-in and graceful fallback
function CineImage({ uri, style }) {
  const [error, setError] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    setError(false);
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [uri]);

  if (!uri || error) {
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
        onError={() => setError(true)}
      />
    </Animated.View>
  );
}

// Dot indicators for image progress
function DotRow({ total, active }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i <= active && styles.dotActive, i < active && styles.dotPast]} />
      ))}
    </View>
  );
}

export default function CineFlashGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 10 } = route.params || {};

  const [films] = useState(() => selectFilms(roundCount));
  const [filmIdx, setFilmIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'answer' | 'final'
  const [foundAtIdx, setFoundAtIdx] = useState(null); // image index where film was found
  const [scores, setScores] = useState(() =>
    Object.fromEntries(playerNames.map((n) => [n, 0]))
  );
  const [results, setResults] = useState([]); // {title, year, finder, points}
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [pendingPoints, setPendingPoints] = useState(0);

  const answerSlide = useRef(new Animated.Value(300)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;

  const hasPlayers = playerNames.length > 0;
  const film = films[filmIdx] || films[0];
  const isLastImage = imgIdx === 2;
  const currentPoints = 3 - imgIdx;

  const showAnswer = (finder, points, atIdx) => {
    setFoundAtIdx(atIdx);
    setPhase('answer');
    setResults((prev) => [...prev, { title: film.title, year: film.year, finder, points }]);
    Animated.parallel([
      Animated.spring(answerSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(answerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleFound = () => {
    if (hasPlayers) {
      setPendingPoints(currentPoints);
      setShowPlayerModal(true);
    } else {
      showAnswer(null, currentPoints, imgIdx);
    }
  };

  const handlePlayerSelect = (name) => {
    setScores((prev) => ({ ...prev, [name]: (prev[name] || 0) + pendingPoints }));
    setShowPlayerModal(false);
    showAnswer(name, pendingPoints, imgIdx);
  };

  const handleNextImage = () => {
    if (!isLastImage) {
      setImgIdx((prev) => prev + 1);
    } else {
      showAnswer(null, 0, null);
    }
  };

  const handleNextFilm = () => {
    answerSlide.setValue(300);
    answerOpacity.setValue(0);
    if (filmIdx < films.length - 1) {
      setFilmIdx((prev) => prev + 1);
      setImgIdx(0);
      setFoundAtIdx(null);
      setPhase('playing');
    } else {
      setPhase('final');
    }
  };

  // ── Final screen ──────────────────────────────────────────────────────────
  if (phase === 'final') {
    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const foundCount = results.filter((r) => r.points > 0).length;

    return (
      <LinearGradient colors={['#0D0000', '#1A0500', '#0D0000']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.finalEmoji}>🏆</Text>
          <Text style={styles.finalTitle}>Fin de la partie !</Text>
          <Text style={styles.finalSub}>
            {foundCount}/{films.length} films trouvés
          </Text>

          {hasPlayers && (
            <View style={styles.leaderboard}>
              <Text style={styles.leaderboardTitle}>Classement</Text>
              {sortedScores.map(([name, pts], i) => (
                <View key={name} style={[styles.leaderboardRow, i === 0 && styles.leaderboardFirst]}>
                  <Text style={styles.leaderboardRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </Text>
                  <Text style={styles.leaderboardName}>{name}</Text>
                  <Text style={styles.leaderboardPts}>{pts} pts</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.recap}>
            <Text style={styles.recapTitle}>Récapitulatif</Text>
            {results.map((r, i) => (
              <View key={i} style={styles.recapRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recapFilm}>{r.title}</Text>
                  <Text style={styles.recapFinder}>
                    {r.points > 0
                      ? r.finder
                        ? `✅ ${r.finder} — ${r.points} pt${r.points > 1 ? 's' : ''}`
                        : `✅ Trouvé — ${r.points} pt${r.points > 1 ? 's' : ''}`
                      : '❌ Non trouvé'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('CineFlashSetup')}
            style={styles.replayBtn}
          >
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

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#0D0000', '#1A0500', '#0D0000']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.filmCounter}>
            🎬 Film {filmIdx + 1} / {films.length}
          </Text>
        </View>
        {hasPlayers ? (
          <View style={styles.topScores}>
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(([name, pts]) => (
                <Text key={name} style={styles.topScoreText}>
                  {name.slice(0, 6)} {pts}
                </Text>
              ))}
          </View>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Points badge */}
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsBadgeText}>{currentPoints}</Text>
        <Text style={styles.pointsBadgeLabel}>pt{currentPoints > 1 ? 's' : ''}</Text>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <CineImage uri={film.images[imgIdx]} style={styles.image} />
      </View>

      {/* Dot indicator */}
      <DotRow total={3} active={imgIdx} />

      {/* Hint label */}
      <Text style={styles.hintLabel}>{HINT_LABELS[imgIdx]}</Text>

      {/* Buttons */}
      <View style={styles.btns}>
        <TouchableOpacity onPress={handleFound} style={styles.foundBtn} activeOpacity={0.85}>
          <LinearGradient colors={['#16A34A', '#15803D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.foundGradient}>
            <Text style={styles.foundText}>✓  TROUVÉ !</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextImage} style={styles.nextBtn} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {isLastImage ? '✗  Pas trouvé' : `→  Indice ${imgIdx + 2}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Answer overlay */}
      {phase === 'answer' && (
        <Animated.View
          style={[
            styles.answerOverlay,
            { opacity: answerOpacity, transform: [{ translateY: answerSlide }] },
          ]}
        >
          <LinearGradient colors={['#1A0000', '#0D0000']} style={styles.answerCard}>
            {foundAtIdx !== null ? (
              <>
                <Text style={styles.answerResult}>🎉 Trouvé !</Text>
                <Text style={styles.answerPts}>+{3 - foundAtIdx} point{3 - foundAtIdx > 1 ? 's' : ''}</Text>
                {results[results.length - 1]?.finder && (
                  <Text style={styles.answerFinder}>par {results[results.length - 1].finder}</Text>
                )}
              </>
            ) : (
              <Text style={styles.answerResult}>😅 Pas de chance !</Text>
            )}

            <View style={styles.answerDivider} />

            <Text style={styles.answerLabel}>La réponse était :</Text>
            <Text style={styles.answerTitle}>{film.title}</Text>
            <Text style={styles.answerYear}>{film.year}</Text>

            {/* Show poster */}
            <View style={styles.answerPoster}>
              <CineImage uri={film.images[2]} style={StyleSheet.absoluteFillObject} />
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

      {/* Player selection modal */}
      <Modal visible={showPlayerModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Qui a trouvé ?</Text>
            <Text style={styles.modalSub}>{currentPoints} point{currentPoints > 1 ? 's' : ''} à attribuer</Text>
            {playerNames.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => handlePlayerSelect(name)}
                style={styles.modalPlayer}
                activeOpacity={0.8}
              >
                <Text style={styles.modalPlayerName}>{name || `Joueur`}</Text>
                <Text style={styles.modalPlayerPts}>{scores[name] || 0} pts</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowPlayerModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const IMG_SIZE = Platform.select({ web: 300, default: undefined });

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 55 : 36,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  filmCounter: { fontSize: 14, fontWeight: '700', color: colors.text },
  topScores: { width: 60, alignItems: 'flex-end' },
  topScoreText: { fontSize: 10, color: colors.textMuted, lineHeight: 14 },

  pointsBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: `${CIN}25`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: `${CIN}50`,
    marginVertical: spacing.sm,
    gap: 4,
  },
  pointsBadgeText: { fontSize: 28, fontWeight: '900', color: CIN_LIGHT },
  pointsBadgeLabel: { fontSize: 14, fontWeight: '700', color: `${CIN_LIGHT}AA` },

  imageContainer: {
    alignSelf: 'center',
    width: IMG_SIZE || '90%',
    height: IMG_SIZE || 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${CIN}40`,
    backgroundColor: '#1A0000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0000',
    gap: spacing.sm,
  },
  imgPlaceholderEmoji: { fontSize: 48 },
  imgPlaceholderText: { fontSize: 13, color: colors.textMuted },

  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: CIN, width: 20 },
  dotPast: { backgroundColor: `${CIN}60`, width: 8 },

  hintLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  btns: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  foundBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  foundGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  foundText: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 2 },

  nextBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },

  // Answer overlay
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
  answerResult: { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerPts: { fontSize: 22, fontWeight: '800', color: CIN_LIGHT, marginTop: 4 },
  answerFinder: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  answerDivider: { height: 1, backgroundColor: `${CIN}30`, width: '80%', marginVertical: spacing.md },
  answerLabel: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  answerTitle: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center' },
  answerYear: { fontSize: 13, color: CIN_LIGHT, marginBottom: spacing.md },
  answerPoster: {
    width: Platform.select({ web: 160, default: 130 }),
    height: Platform.select({ web: 160, default: 130 }),
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: '#1A0000',
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

  // Player modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: '#1A0A0A',
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: `${CIN}40`,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 4 },
  modalSub: { fontSize: 13, color: CIN_LIGHT, textAlign: 'center', marginBottom: spacing.lg },
  modalPlayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: `${CIN}18`,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${CIN}35`,
  },
  modalPlayerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  modalPlayerPts: { fontSize: 14, color: CIN_LIGHT, fontWeight: '600' },
  modalCancel: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm },
  modalCancelText: { color: colors.textMuted, fontSize: 14 },

  // Final screen
  finalScroll: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
    alignItems: 'center',
  },
  finalEmoji: { fontSize: 64, marginBottom: spacing.sm },
  finalTitle: { fontSize: 30, fontWeight: '900', color: colors.text, textAlign: 'center' },
  finalSub: { fontSize: 14, color: CIN_LIGHT, marginTop: 4, marginBottom: spacing.xl },

  leaderboard: {
    width: '100%',
    backgroundColor: `${CIN}15`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${CIN}30`,
    marginBottom: spacing.lg,
  },
  leaderboardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${CIN}15`,
  },
  leaderboardFirst: { backgroundColor: `${CIN}10`, borderRadius: radius.sm, padding: spacing.sm },
  leaderboardRank: { fontSize: 18, width: 32 },
  leaderboardName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  leaderboardPts: { fontSize: 15, fontWeight: '800', color: CIN_LIGHT },

  recap: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  recapTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  recapRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recapFilm: { fontSize: 13, fontWeight: '700', color: colors.text },
  recapFinder: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  replayBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    width: '100%',
    shadowColor: CIN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: spacing.md,
  },
  replayGradient: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  menuBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  menuBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
