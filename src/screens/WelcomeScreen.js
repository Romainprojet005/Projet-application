import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

// Particles data generated once
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 4 + 2,
  color:
    i % 3 === 0
      ? colors.primary
      : i % 3 === 1
      ? colors.secondary
      : colors.accent,
  duration: 2000 + Math.random() * 3000,
  initOpacity: Math.random() * 0.5 + 0.1,
}));

function Particle({ data }) {
  const opacity = useRef(new Animated.Value(data.initOpacity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: data.initOpacity + 0.4,
          duration: data.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: data.initOpacity,
          duration: data.duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          top: `${data.top}%`,
          left: `${data.left}%`,
          width: data.size,
          height: data.size,
          borderRadius: data.size / 2,
          backgroundColor: data.color,
          opacity,
        },
      ]}
    />
  );
}

export default function WelcomeScreen({ navigation }) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-60)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoY, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.spring(buttonScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <LinearGradient colors={['#0A0A1B', '#170A35', '#0A1228']} style={styles.container}>
      {/* Particles */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        {PARTICLES.map((p) => (
          <Particle key={p.id} data={p} />
        ))}
      </Animated.View>

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logoEmoji}>🎭</Text>
          <Text style={styles.logoTitle}>LA SOIRÉE</Text>
          <Text style={styles.logoSubtitle}>DES LÉGENDES</Text>
          <View style={styles.divider} />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
          Les meilleurs jeux pour vos soirées inoubliables ✨
        </Animated.Text>

        {/* Character card */}
        <Animated.View
          style={[
            styles.characterCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardY }],
            },
          ]}
        >
          <LinearGradient
            colors={['#2D1069', '#1A0A3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.characterGradient}
          >
            <View style={styles.characterAvatarWrap}>
              <Text style={styles.characterAvatarEmoji}>🕵️</Text>
            </View>
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>AGENT OMBRE</Text>
              <Text style={styles.characterTitle}>Maître de l'Infiltration</Text>
              <Text style={styles.characterQuote}>
                "Qui cache quoi... et pourquoi ?"
              </Text>
            </View>
            <Text style={styles.characterStar}>✦</Text>
          </LinearGradient>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View
          style={{
            width: '100%',
            transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }],
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            activeOpacity={0.88}
            style={styles.button}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🎮  COMMENCER LA SOIRÉE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.version, { opacity: subtitleOpacity }]}>
          v1.0 · Bêta
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
  },
  particle: { position: 'absolute' },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: spacing.lg },
  logoEmoji: { fontSize: 70, marginBottom: spacing.sm },
  logoTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 8,
  },
  logoSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primaryLight,
    letterSpacing: 6,
    marginTop: -4,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },

  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  // Character card
  characterCard: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  characterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  characterAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}30`,
    borderWidth: 2,
    borderColor: `${colors.primary}60`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  characterAvatarEmoji: { fontSize: 36 },
  characterInfo: { flex: 1 },
  characterName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
  characterTitle: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  characterQuote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  characterStar: {
    fontSize: 20,
    color: colors.accent,
    alignSelf: 'flex-start',
    marginTop: -4,
  },

  // Button
  button: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: spacing.md + 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },

  version: {
    marginTop: spacing.lg,
    fontSize: 11,
    color: colors.textMuted,
  },
});
