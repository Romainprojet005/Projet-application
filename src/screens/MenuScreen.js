import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import { characters } from '../data/characters';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.88, 500);

// ─── Space background ─────────────────────────────────────────────
const MENU_STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.4 + 0.1,
}));

const MENU_NEBULAE = [
  { top: '0%',  left: '-15%', size: 320, color: '#7C3AED', opacity: 0.10 },
  { top: '45%', left: '70%',  size: 260, color: '#EC4899', opacity: 0.07 },
  { top: '80%', left: '-5%',  size: 200, color: '#0EA5E9', opacity: 0.07 },
];

// Animated stat bar
function StatBar({ label, value, color }) {
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: value,
      duration: 900,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.track}>
        <Animated.View
          style={[
            statStyles.fill,
            {
              backgroundColor: color,
              width: barWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={statStyles.val}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { width: 80, fontSize: 11, color: colors.textSecondary },
  track: {
    flex: 1,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: { height: '100%', borderRadius: 3 },
  val: { width: 26, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
});

// Individual game card
function GameCard({ character, index, onPress }) {
  const cardY = useRef(new Animated.Value(100)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const hoverScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardY, {
        toValue: 0,
        tension: 45,
        friction: 9,
        delay: index * 130,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 130,
        useNativeDriver: true,
      }),
    ]).start();

    if (character.available) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(btnPulse, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(btnPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const onPressIn = () => {
    if (!character.available) return;
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();
  };
  const onHoverIn = () => {
    if (!character.available) return;
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.03, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  const onHoverOut = () => {
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[
      { width: CARD_WIDTH, marginBottom: spacing.lg },
      { opacity: cardOpacity, transform: [{ translateY: cardY }, { scale: Animated.multiply(pressScale, hoverScale) }] },
    ]}>
      {/* Outer glow on hover */}
      <Animated.View style={{
        opacity: glowOpacity, position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
        borderRadius: radius.xl + 6, backgroundColor: character.color + '18', zIndex: -1,
      }} />
      {/* Colored shadow ring */}
      <View style={{
        position: 'absolute', top: 4, left: 4, right: 4, bottom: -4,
        borderRadius: radius.xl, backgroundColor: character.color + '25', zIndex: -2,
      }} />

      <TouchableOpacity
        onPress={() => character.available && onPress(character)}
        onPressIn={onPressIn} onPressOut={onPressOut}
        onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
        activeOpacity={character.available ? 0.9 : 1}
        disabled={!character.available}
      >
        <LinearGradient
          colors={character.gradientColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: character.available ? character.color + '60' : colors.border }, !character.available && styles.cardLocked]}
        >
          {/* Inner highlight at top */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={styles.cardShine}
            pointerEvents="none"
          />

          {/* Top row: number + status */}
          <View style={styles.cardTopRow}>
            <View style={[styles.cardNumber, { borderColor: character.color + '50' }]}>
              <Text style={[styles.cardNumberText, { color: character.color }]}>0{index + 1}</Text>
            </View>
            {character.available ? (
              <View style={[styles.badge, { backgroundColor: colors.success + 'CC' }]}>
                <Text style={styles.badgeText}>✦ DISPONIBLE</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.badgeText, { color: colors.textMuted }]}>🔒 BIENTÔT</Text>
              </View>
            )}
          </View>

          {/* Avatar with rings + Game name */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              {/* Outer ring */}
              <View style={[styles.avatarRingOuter, { borderColor: character.color + '25' }]} />
              {/* Mid ring */}
              <View style={[styles.avatarRingMid, { borderColor: character.color + '45' }]} />
              {/* Avatar */}
              <View style={[styles.avatar, { borderColor: character.color + '80', backgroundColor: character.color + '20' }]}>
                <Text style={styles.avatarEmoji}>{character.emoji}</Text>
              </View>
            </View>
            {character.gameName ? (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.gameNameLarge, { color: character.color }]}>{character.gameName}</Text>
                <Text style={[styles.gameNameSub, { color: character.color + '80' }]}>✦ ✦ ✦</Text>
              </View>
            ) : null}
          </View>

          {/* Identity */}
          <Text style={styles.cardName}>{character.name}</Text>
          <Text style={[styles.cardTitle, { color: character.color }]}>{character.title.toUpperCase()}</Text>
          <Text style={styles.cardDesc}>{character.description}</Text>

          {/* Gradient separator */}
          <LinearGradient
            colors={[character.color + '00', character.color + '70', character.color + '00']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.separator}
          />

          {/* Stats */}
          <View style={styles.stats}>
            {Object.entries(character.stats).map(([k, v]) => (
              <StatBar key={k} label={k} value={v} color={character.color} />
            ))}
          </View>

          {/* Catchphrase */}
          <Text style={styles.catchphrase}>{character.catchphrase}</Text>

          {/* Play button */}
          {character.available ? (
            <Animated.View style={{ transform: [{ scale: btnPulse }] }}>
              <LinearGradient
                colors={[character.color, character.color + 'BB', character.color + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.playBtn}
              >
                <Text style={styles.playBtnText}>⚡  JOUER MAINTENANT  ⚡</Text>
              </LinearGradient>
            </Animated.View>
          ) : (
            <View style={[styles.playBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.playBtnText, { color: colors.textMuted }]}>🚧  En développement</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MenuScreen({ navigation }) {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleSelectGame = (character) => {
    if (character.game === 'undercover') {
      navigation.navigate('UndercoverSetup');
    } else if (character.game === 'quiz') {
      navigation.navigate('QuizSetup');
    } else if (character.game === 'amitie') {
      navigation.navigate('AmitieSetup');
    } else if (character.game === 'personality') {
      navigation.navigate('PersonalitySetup');
    } else if (character.game === 'cineflash') {
      navigation.navigate('CineFlashSetup');
    } else if (character.game === 'emojiquiz') {
      navigation.navigate('EmojiQuizSetup');
    } else if (character.game === 'motdepasse') {
      navigation.navigate('MotDePasseSetup');
    }
  };

  const availableCount = characters.filter((c) => c.available).length;
  const soonCount = characters.filter((c) => !c.available).length;

  return (
    <LinearGradient colors={['#06040F', '#0D0720', '#060410']} style={styles.container}>
      {/* Space background */}
      {MENU_NEBULAE.map((n, i) => (
        <View key={i} pointerEvents="none" style={{
          position: 'absolute', top: n.top, left: n.left,
          width: n.size, height: n.size, borderRadius: n.size / 2,
          backgroundColor: n.color, opacity: n.opacity,
        }} />
      ))}
      {MENU_STARS.map((s, i) => (
        <View key={i} pointerEvents="none" style={{
          position: 'absolute', top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          backgroundColor: '#FFFFFF', opacity: s.opacity,
        }} />
      ))}
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CHOISISSEZ</Text>
          <Text style={styles.headerSubtitle}>votre aventure</Text>
        </View>
        <View style={{ width: 70 }} />
      </Animated.View>

      <Animated.Text style={[styles.countLine, { opacity: headerOpacity }]}>
        {availableCount} jeu{availableCount > 1 ? 'x' : ''} disponible{availableCount > 1 ? 's' : ''} · {soonCount} en développement
      </Animated.Text>

      {/* Card list */}
      <View style={{ flex: 1 }} onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
        {listHeight > 0 && Platform.OS === 'web' ? (
          <div style={{ height: listHeight, overflowY: 'scroll', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${spacing.sm}px ${spacing.xl}px ${spacing.lg}px`, boxSizing: 'border-box' }}>
            {characters.map((character, index) => (
              <GameCard key={character.id} character={character} index={index} onPress={handleSelectGame} />
            ))}
          </div>
        ) : (
          <ScrollView
            style={{ height: listHeight }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
          >
            {characters.map((character, index) => (
              <GameCard key={character.id} character={character} index={index} onPress={handleSelectGame} />
            ))}
          </ScrollView>
        )}
      </View>

      <Animated.Text style={[styles.swipeHint, { opacity: headerOpacity }]}>
        ↕ Faites défiler pour découvrir tous les jeux
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 70 },
  backBtnText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primaryLight,
    letterSpacing: 2,
    marginTop: -2,
  },
  countLine: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
    ...Platform.select({ web: { overflowY: 'auto' } }),
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  cardShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
  },
  cardLocked: { opacity: 0.7 },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  cardNumber: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardNumberText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  avatarRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.lg, gap: spacing.md,
  },
  avatarWrapper: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  avatarRingOuter: {
    position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 1,
  },
  avatarRingMid: {
    position: 'absolute', width: 86, height: 86, borderRadius: 43, borderWidth: 1.5,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 44 },
  gameNameLarge: { fontSize: 26, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  gameNameSub: { fontSize: 10, marginTop: 4, letterSpacing: 4 },
  badge: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  cardName: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  cardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  separator: { height: 1.5, marginBottom: spacing.md, borderRadius: 1 },
  stats: { marginBottom: spacing.md },
  catchphrase: {
    fontSize: 12, color: colors.textMuted, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg,
  },
  playBtn: {
    paddingVertical: spacing.md, borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  playBtnText: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 1.5 },
  swipeHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    paddingBottom: Platform.OS === 'ios' ? 38 : 20,
  },
});
