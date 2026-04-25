import React, { useRef, useEffect } from 'react';
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
  }, []);

  const onPressIn = () => {
    if (!character.available) return;
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        { width: CARD_WIDTH, marginBottom: spacing.lg },
        { opacity: cardOpacity, transform: [{ translateY: cardY }, { scale: pressScale }] },
      ]}
    >
      <TouchableOpacity
        onPress={() => character.available && onPress(character)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={character.available ? 0.9 : 1}
        disabled={!character.available}
      >
        <LinearGradient
          colors={character.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            { borderColor: character.available ? character.color + '50' : colors.border },
            !character.available && styles.cardLocked,
          ]}
        >
          {/* Status badge */}
          {character.available ? (
            <View style={[styles.badge, { backgroundColor: colors.success }]}>
              <Text style={styles.badgeText}>● DISPONIBLE</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.badgeText, { color: colors.textMuted }]}>🔒 BIENTÔT</Text>
            </View>
          )}

          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              {
                borderColor: character.color + '70',
                backgroundColor: character.color + '20',
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>{character.emoji}</Text>
          </View>

          {/* Identity */}
          <Text style={styles.cardName}>{character.name}</Text>
          <Text style={[styles.cardTitle, { color: character.color }]}>
            {character.title.toUpperCase()}
          </Text>
          <Text style={styles.cardDesc}>{character.description}</Text>

          {/* Divider */}
          <View style={[styles.separator, { backgroundColor: character.color + '35' }]} />

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
            <LinearGradient
              colors={[character.color, character.color + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playBtn}
            >
              <Text style={styles.playBtnText}>JOUER →</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.playBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.playBtnText, { color: colors.textMuted }]}>
                En développement
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MenuScreen({ navigation }) {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = scrollRef.current;
    if (!el) return;
    const node = el.getScrollableNode ? el.getScrollableNode() : el;
    const handleWheel = (e) => {
      e.preventDefault();
      node.scrollTop += e.deltaY;
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
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
    }
  };

  const availableCount = characters.filter((c) => c.available).length;
  const soonCount = characters.filter((c) => !c.available).length;

  return (
    <LinearGradient colors={['#0A0A1B', '#0D0D22', '#0A0A1B']} style={styles.container}>
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

      {/* Vertical card scroll */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {characters.map((character, index) => (
          <GameCard
            key={character.id}
            character={character}
            index={index}
            onPress={handleSelectGame}
          />
        ))}
      </ScrollView>

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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  cardLocked: { opacity: 0.75 },
  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: { fontSize: 50 },
  cardName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  separator: { height: 1, marginBottom: spacing.md },
  stats: { marginBottom: spacing.md },
  catchphrase: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  playBtn: {
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    paddingBottom: Platform.OS === 'ios' ? 38 : 20,
  },
});
