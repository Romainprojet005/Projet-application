import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import characterImages from '../../data/characterImages';

const BG = OB_BG;

// Small helper: shows a character image, or nothing if URL is missing / fails to load
function CharacterImage({ name, style }) {
  const [error, setError] = useState(false);
  const uri = name ? characterImages[name] : null;
  if (!uri || error) return null;
  return (
    <Image
      source={{ uri }}
      style={[styles.charImage, style]}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

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
    message: 'Bonne chance !',
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

// --- Game board screen ---
function GameBoardScreen({ roles, onBackToMenu }) {
  const [eliminated, setEliminated] = useState(new Set());
  const [modalIdx, setModalIdx]     = useState(null);
  const [winner, setWinner]         = useState(null); // null | 'spies' | 'civilians'
  const [peekPlayer, setPeekPlayer] = useState(null); // null | -1 (selecting) | number
  const [peekRevealed, setPeekRevealed] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = (idx) => {
    setModalIdx(idx);
    Animated.spring(modalAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setModalIdx(null);
    });
  };

  const handleEliminate = () => {
    const idx = modalIdx;
    closeModal();
    setTimeout(() => {
      const next = new Set(eliminated);
      next.add(idx);
      setEliminated(next);

      const aliveRoles     = roles.filter((_, i) => !next.has(i));
      const aliveCivilians = aliveRoles.filter(r => r.type === 'civilian').length;
      const aliveSpies     = aliveRoles.filter(r => r.type === 'undercover' || r.type === 'mrwhite').length;

      if (aliveCivilians === 0 || aliveSpies >= aliveCivilians) {
        setWinner('spies');
      } else if (aliveSpies === 0) {
        setWinner('civilians');
      }
    }, 190);
  };

  const openPeek       = () => { setPeekPlayer(-1); setPeekRevealed(false); };
  const selectPeek     = (idx) => { setPeekPlayer(idx); setPeekRevealed(false); };
  const closePeek      = () => { setPeekPlayer(null); setPeekRevealed(false); };

  const modalRole = modalIdx !== null ? roles[modalIdx] : null;
  const modalCfg  = modalRole ? ROLE_CONFIG[modalRole.type] : null;
  const peekRole  = (peekPlayer !== null && peekPlayer >= 0) ? roles[peekPlayer] : null;
  const peekCfg   = peekRole ? ROLE_CONFIG[peekRole.type] : null;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.gbContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gbHeader}>
          <Text style={styles.gbTitle}>⚔️  PARTIE EN COURS</Text>
          <Text style={styles.gbSub}>Appuyez sur un joueur pour révéler sa carte et l'éliminer</Text>
          <TouchableOpacity style={styles.peekBtn} onPress={openPeek}>
            <Text style={styles.peekBtnText}>👁️  Revoir mon mot</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gbGrid}>
          {roles.map((r, idx) => {
            const isElim = eliminated.has(idx);
            const roleCfg = ROLE_CONFIG[r.type];
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => { if (!isElim) openModal(idx); }}
                style={[styles.gbCard, isElim ? styles.gbCardElim : styles.gbCardAlive]}
                activeOpacity={isElim ? 1 : 0.78}
              >
                <Text style={styles.gbPlayerNum}>JOUEUR {idx + 1}</Text>
                {isElim ? (
                  <>
                    <Text style={styles.gbEmoji}>{roleCfg.emoji}</Text>
                    <Text style={[styles.gbRole, { color: roleCfg.color }]}>{roleCfg.label}</Text>
                    <View style={styles.gbElimTag}>
                      <Text style={styles.gbElimTagText}>💀 ÉLIMINÉ</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.gbEmoji}>🎭</Text>
                    <Text style={styles.gbAliveStatus}>En vie</Text>
                    <View style={styles.gbElimBtn}>
                      <Text style={styles.gbElimBtnText}>Éliminer</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={onBackToMenu} style={styles.gbBackBtn}>
          <Text style={styles.gbBackBtnText}>Retour au menu</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Elimination reveal modal */}
      {modalIdx !== null && modalRole && modalCfg && (
        <View style={styles.gbOverlay}>
          <Animated.View
            style={[
              styles.gbModalBox,
              {
                opacity: modalAnim,
                transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              },
            ]}
          >
            <LinearGradient colors={modalCfg.gradient} style={styles.gbModalGrad}>
              <Text style={styles.gbModalPlayerLabel}>JOUEUR {modalIdx + 1}</Text>
              <View style={[styles.roleBadge, { borderColor: modalCfg.color + '60' }]}>
                <Text style={styles.roleBadgeEmoji}>{modalCfg.emoji}</Text>
                <Text style={[styles.roleBadgeLabel, { color: modalCfg.color }]}>{modalCfg.label}</Text>
              </View>
              <TouchableOpacity onPress={handleEliminate} style={styles.gbConfirmBtn} activeOpacity={0.85}>
                <Text style={styles.gbConfirmBtnText}>💀  Confirmer l'élimination</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal} style={styles.gbCancelBtn}>
                <Text style={styles.gbCancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* Peek modal — revoir son mot */}
      {peekPlayer !== null && (
        <View style={styles.gbOverlay}>
          <View style={styles.gbModalBox}>
            {peekPlayer === -1 ? (
              // Step 1 : player selection
              <View style={styles.peekSelectBox}>
                <Text style={styles.peekSelectTitle}>👁️  Quel est ton numéro ?</Text>
                <Text style={styles.peekSelectSub}>Assure-toi d'être seul à regarder</Text>
                <View style={styles.peekSelectGrid}>
                  {roles.map((_, idx) =>
                    !eliminated.has(idx) && (
                      <TouchableOpacity key={idx} style={styles.peekPlayerBtn} onPress={() => selectPeek(idx)} activeOpacity={0.8}>
                        <Text style={styles.peekPlayerBtnText}>{idx + 1}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <TouchableOpacity onPress={closePeek} style={styles.gbCancelBtn}>
                  <Text style={styles.gbCancelBtnText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : !peekRevealed ? (
              // Step 2 : privacy lock
              <TouchableOpacity onPress={() => setPeekRevealed(true)} activeOpacity={0.92} style={{ width: '100%' }}>
                <LinearGradient colors={['#1A1A35', '#141428']} style={styles.peekLockGrad}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                  <Text style={styles.lockTitle}>JOUEUR {peekPlayer + 1}</Text>
                  <Text style={styles.lockSub}>
                    Assure-toi que personne ne regarde,{'\n'}puis appuie pour voir ton mot
                  </Text>
                  <TouchableOpacity onPress={closePeek} style={[styles.gbCancelBtn, { marginTop: 24 }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.gbCancelBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // Step 3 : word revealed
              <LinearGradient colors={peekCfg.gradient} style={styles.peekRevealGrad}>
                <Text style={styles.gbModalPlayerLabel}>JOUEUR {peekPlayer + 1}</Text>
                <View style={[styles.roleBadge, { borderColor: peekCfg.color + '60' }]}>
                  <Text style={styles.roleBadgeEmoji}>{peekCfg.emoji}</Text>
                  <Text style={[styles.roleBadgeLabel, { color: peekCfg.color }]}>{peekCfg.label}</Text>
                </View>
                {peekRole.type !== 'mrwhite' && <CharacterImage name={peekRole.word} />}
                <View style={styles.wordBox}>
                  <Text style={styles.wordLabel}>TON MOT</Text>
                  <Text style={styles.wordText}>
                    {peekRole.type !== 'mrwhite' ? peekRole.word : '???'}
                  </Text>
                </View>
                <TouchableOpacity onPress={closePeek} style={styles.gbCancelBtn}>
                  <Text style={[styles.gbCancelBtnText, { color: peekCfg.color }]}>✕  Fermer</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </View>
      )}

      {/* Winner overlay */}
      {winner && (
        <View style={styles.gbOverlay}>
          <View style={styles.gbModalBox}>
            <LinearGradient
              colors={winner === 'spies' ? ['#450A0A', '#7F1D1D'] : ['#052e16', '#14532d']}
              style={styles.gbModalGrad}
            >
              <Text style={styles.winnerEmoji}>{winner === 'spies' ? '🕵️' : '🏘️'}</Text>
              <Text style={styles.winnerTitle}>
                {winner === 'spies' ? 'Les espions gagnent !' : 'Les villageois gagnent !'}
              </Text>
              <Text style={styles.winnerSub}>
                {winner === 'spies'
                  ? 'Les espions sont en majorité — la mission est compromise !'
                  : 'Tous les espions ont été démasqués !'}
              </Text>
              <TouchableOpacity
                onPress={onBackToMenu}
                style={[styles.gbConfirmBtn, winner === 'civilians' && { backgroundColor: '#16A34A', shadowColor: '#16A34A' }]}
                activeOpacity={0.85}
              >
                <Text style={styles.gbConfirmBtnText}>🏠  Retour au menu</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      )}

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
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'revealed' | 'gameboard'

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
      setPhase('gameboard');
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

  if (phase === 'gameboard') {
    return (
      <GameBoardScreen
        roles={roles}
        onBackToMenu={() => navigation.navigate('Menu')}
      />
    );
  }

  const role = roles[currentPlayer];
  const cfg = ROLE_CONFIG[role.type === 'undercover' ? 'civilian' : role.type];
  const isLast = currentPlayer === playerCount - 1;

  return (
    <LinearGradient colors={BG} style={styles.container}>
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

              {/* Character image */}
              {role.type !== 'mrwhite' && (
                <CharacterImage name={role.word} />
              )}

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
    maxHeight: 400,
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

  // Character image (distribution card + modal)
  charImage: {
    width: '100%',
    height: 110,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...Platform.select({ web: { width: 200, height: 200, alignSelf: 'center' } }),
  },
  charImageModal: {
    height: 150,
    marginBottom: spacing.md,
    ...Platform.select({ web: { width: 220, height: 220, alignSelf: 'center' } }),
  },

  // Revealed state (distribution)
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

  // ─── Game board ───────────────────────────────────────────────────────────
  gbContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
  },
  gbHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  gbTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 3,
    textAlign: 'center',
  },
  gbSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  gbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  gbCard: {
    width: '47%',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 148,
    justifyContent: 'center',
  },
  gbCardAlive: {
    backgroundColor: colors.card,
    borderColor: colors.success + '50',
  },
  gbCardElim: {
    backgroundColor: '#160808',
    borderColor: colors.danger + '40',
    opacity: 0.85,
  },
  gbPlayerNum: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  gbEmoji: { fontSize: 26, marginBottom: 4 },
  gbAliveStatus: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  gbElimBtn: {
    backgroundColor: colors.danger + '28',
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger + '55',
  },
  gbElimBtnText: { fontSize: 11, color: colors.danger, fontWeight: '700' },
  gbRole: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  gbWord: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  gbElimTag: {
    backgroundColor: colors.danger + '22',
    borderRadius: radius.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  gbElimTagText: {
    fontSize: 9,
    color: colors.danger,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gbBackBtn: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gbBackBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  // Game board overlay + modal
  gbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 100,
  },
  gbModalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 20,
  },
  gbModalGrad: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  gbModalPlayerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  gbConfirmBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  gbConfirmBtnText: { fontSize: 14, fontWeight: '800', color: colors.text },
  gbCancelBtn: { marginTop: spacing.md, paddingVertical: spacing.sm },
  gbCancelBtnText: { fontSize: 13, color: colors.textMuted },

  // Peek button
  peekBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    backgroundColor: AMB + '22',
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: AMB + '55',
  },
  peekBtnText: { fontSize: 13, fontWeight: '700', color: AMB_LIGHT },

  // Peek selection
  peekSelectBox: { padding: spacing.xl, alignItems: 'center', backgroundColor: '#0F0F1A' },
  peekSelectTitle: { fontSize: 18, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  peekSelectSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  peekSelectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.md },
  peekPlayerBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: AMB + '22', borderWidth: 1, borderColor: AMB + '66',
    alignItems: 'center', justifyContent: 'center',
  },
  peekPlayerBtnText: { fontSize: 20, fontWeight: '900', color: AMB_LIGHT },

  // Peek lock / reveal
  peekLockGrad: { padding: spacing.xl, alignItems: 'center', minHeight: 300, justifyContent: 'center' },
  peekRevealGrad: { padding: spacing.xl, alignItems: 'center' },

  // Winner overlay
  winnerEmoji: { fontSize: 64, marginBottom: spacing.md },
  winnerTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  winnerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },

});
