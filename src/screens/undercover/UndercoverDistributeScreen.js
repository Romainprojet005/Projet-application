import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';

const AMB       = '#D97706';
const AMB_DARK  = '#92400E';
const AMB_LIGHT = '#FCD34D';

// --- Role config ---
const ROLE_CONFIG = {
  civilian: {
    label: 'VILLAGEOIS',
    emoji: '🏘️',
    color: AMB_LIGHT,
    gradient: ['#1C1207', '#2A1800'],
    message: 'Décris ton mot sans jamais le prononcer.\nTrouve l\'espion parmi vous !',
  },
  undercover: {
    label: 'ESPION',
    emoji: '🕵️',
    color: colors.danger,
    gradient: ['#450A0A', '#7F1D1D'],
    message: 'Tu es l\'espion infiltré.\nBluff, sème la confusion et survie !',
  },
  mrwhite: {
    label: 'MONSIEUR BLANC',
    emoji: '👻',
    color: colors.accent,
    gradient: ['#451A03', '#78350F'],
    message: 'Tu n\'as aucun mot.\nÉcoute les autres et invente un bluff parfait !',
  },
};

// --- Shuffle ---
function distributeRoles(playerCount, wordPair, undercoverCount, hasMrWhite) {
  const roles = [];
  const civCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);
  for (let i = 0; i < civCount; i++) roles.push({ type: 'civilian', word: wordPair.civilian });
  for (let i = 0; i < undercoverCount; i++) roles.push({ type: 'undercover', word: wordPair.undercover });
  if (hasMrWhite) roles.push({ type: 'mrwhite', word: null });
  // Fisher-Yates
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
}

// --- Done screen ---
function DoneScreen({ playerCount, undercoverCount, hasMrWhite, onBackToMenu }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const civCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);

  return (
    <LinearGradient colors={['#0A0600', '#1C0C00']} style={styles.container}>
      <Animated.View
        style={[styles.doneBox, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.doneEmoji}>⚔️</Text>
        <Text style={styles.doneTitle}>MISSION LANCÉE</Text>
        <Text style={styles.doneSub}>Tous les rôles ont été distribués</Text>
        <Text style={styles.doneBody}>
          {'La partie peut commencer.\nQue le meilleur menteur gagne !'}
        </Text>

        <View style={styles.doneStats}>
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatNum, { color: colors.success }]}>{civCount}</Text>
            <Text style={styles.doneStatLabel}>Villageois</Text>
          </View>
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatNum, { color: colors.danger }]}>{undercoverCount}</Text>
            <Text style={styles.doneStatLabel}>{undercoverCount > 1 ? 'Espions' : 'Espion'}</Text>
          </View>
          {hasMrWhite && (
            <View style={styles.doneStat}>
              <Text style={[styles.doneStatNum, { color: colors.accent }]}>1</Text>
              <Text style={styles.doneStatLabel}>M. Blanc</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={onBackToMenu} style={styles.doneBackBtn}>
          <Text style={styles.doneBackBtnText}>Retour au menu</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

// --- Main screen ---
export default function UndercoverDistributeScreen({ navigation, route }) {
  const { playerCount, wordPair, undercoverCount, hasMrWhite, themeName } = route.params;

  const [roles] = useState(() =>
    distributeRoles(playerCount, wordPair, undercoverCount, hasMrWhite)
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'revealed' | 'done'

  const screenFade = useRef(new Animated.Value(1)).current;
  const cardRevealOpacity = useRef(new Animated.Value(0)).current;
  const cardFrontOpacity = useRef(new Animated.Value(1)).current;
  const nextBtnOpacity = useRef(new Animated.Value(0)).current;

  const handleReveal = () => {
    if (phase !== 'waiting') return;
    Animated.sequence([
      Animated.timing(cardFrontOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(cardRevealOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(nextBtnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setPhase('revealed');
  };

  const handleNext = () => {
    if (currentPlayer >= playerCount - 1) {
      setPhase('done');
      return;
    }
    Animated.timing(screenFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      cardFrontOpacity.setValue(1);
      cardRevealOpacity.setValue(0);
      nextBtnOpacity.setValue(0);
      setCurrentPlayer((p) => p + 1);
      setPhase('waiting');
      Animated.timing(screenFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  if (phase === 'done') {
    return (
      <DoneScreen
        playerCount={playerCount}
        undercoverCount={undercoverCount}
        hasMrWhite={hasMrWhite}
        onBackToMenu={() => navigation.navigate('Menu')}
      />
    );
  }

  const role = roles[currentPlayer];
  const cfg = ROLE_CONFIG[role.type];
  const isLast = currentPlayer === playerCount - 1;

  return (
    <LinearGradient colors={['#0A0600', '#1C0C00', '#0A0600']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: screenFade }]}>

        {/* Header row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>✕  Annuler</Text>
          </TouchableOpacity>
          <View style={styles.progressRow}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentPlayer && styles.dotDone,
                  i === currentPlayer && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Player number */}
        <View style={styles.playerSection}>
          <Text style={styles.playerLabel}>JOUEUR</Text>
          <Text style={styles.playerNum}>{currentPlayer + 1}</Text>
          <Text style={styles.playerInstruction}>
            {phase === 'waiting'
              ? 'Prends le téléphone seul et appuie pour révéler ton rôle 👀'
              : 'Mémorise bien, puis passe le téléphone !'}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.cardZone}>
          {/* Front (locked) */}
          <Animated.View
            style={[styles.card, styles.cardAbsolute, { opacity: cardFrontOpacity }]}
          >
            <TouchableOpacity
              onPress={handleReveal}
              style={styles.cardInner}
              activeOpacity={0.92}
            >
              <LinearGradient colors={['#1A1A35', '#141428']} style={styles.cardGrad}>
                <Text style={styles.lockEmoji}>🔒</Text>
                <Text style={styles.lockTitle}>APPUYER POUR RÉVÉLER</Text>
                <Text style={styles.lockSub}>
                  Assure-toi que personne ne regarde votre écran !
                </Text>
                {/* Decorative pattern */}
                <View style={styles.pattern}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Text key={i} style={styles.patternItem}>🕵️</Text>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Back (revealed) */}
          <Animated.View
            style={[styles.card, styles.cardAbsolute, { opacity: cardRevealOpacity }]}
            pointerEvents="none"
          >
            <LinearGradient colors={cfg.gradient} style={styles.cardGrad}>
              {/* Role badge */}
              <View style={[styles.roleBadge, { borderColor: cfg.color + '60' }]}>
                <Text style={styles.roleBadgeEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.roleBadgeLabel, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              {/* Word */}
              <View style={styles.wordBox}>
                <Text style={styles.wordLabel}>TON MOT</Text>
                <Text style={styles.wordText}>
                  {role.type !== 'mrwhite' ? role.word : '???'}
                </Text>
                <Text style={styles.wordTheme}>
                  {role.type !== 'mrwhite' ? `Thème : ${themeName}` : 'Aucun mot attribué'}
                </Text>
              </View>

              {/* Message */}
              <Text style={styles.roleMsg}>{cfg.message}</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Next button */}
        <Animated.View style={[styles.nextWrap, { opacity: nextBtnOpacity }]}>
          <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[AMB, AMB_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGrad}
            >
              <Text style={styles.nextText}>
                {isLast ? '✅  TOUT LE MONDE A VU' : `Joueur ${currentPlayer + 2}  →`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  // Header
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  cancelBtn: { marginRight: spacing.md },
  cancelBtnText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.success },
  dotActive: { backgroundColor: AMB, width: 12, height: 12, borderRadius: 6 },

  // Player section
  playerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  playerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 4,
  },
  playerNum: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 90,
  },
  playerInstruction: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Card
  cardZone: {
    flex: 1,
    marginHorizontal: spacing.xl,
    position: 'relative',
    maxHeight: 300,
  },
  card: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  cardAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
  cardInner: { flex: 1 },
  cardGrad: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Lock state
  lockEmoji: { fontSize: 52, marginBottom: spacing.md },
  lockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  lockSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  pattern: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 90,
    opacity: 0.07,
  },
  patternItem: { fontSize: 14, margin: 2 },

  // Revealed state
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  roleBadgeEmoji: { fontSize: 18 },
  roleBadgeLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  wordBox: { alignItems: 'center', marginBottom: spacing.md },
  wordLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  wordText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  wordTheme: { fontSize: 11, color: 'rgba(255,255,255,0.38)' },
  roleMsg: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Next button
  nextWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  nextBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: AMB,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  nextGrad: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  nextText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },

  // Done screen
  doneBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  doneEmoji: { fontSize: 70, marginBottom: spacing.lg },
  doneTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 13,
    color: AMB_LIGHT,
    letterSpacing: 2,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  doneBody: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  doneStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  doneStat: { alignItems: 'center' },
  doneStatNum: { fontSize: 40, fontWeight: '900' },
  doneStatLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  doneBackBtn: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneBackBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
