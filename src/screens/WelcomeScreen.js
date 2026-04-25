import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';

// ─── Space elements ──────────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  baseOpacity: Math.random() * 0.5 + 0.15,
  duration: 1200 + Math.random() * 2800,
}));

const NEBULAE = [
  { top: '2%',  left: '-18%', size: 380, color: '#7C3AED', opacity: 0.13 },
  { top: '52%', left: '62%',  size: 300, color: '#EC4899', opacity: 0.09 },
  { top: '72%', left: '-8%',  size: 220, color: '#0EA5E9', opacity: 0.08 },
];

function Star({ data }) {
  const opacity = useRef(new Animated.Value(data.baseOpacity)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: Math.min(1, data.baseOpacity + 0.6), duration: data.duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: data.baseOpacity * 0.2, duration: data.duration, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', top: `${data.top}%`, left: `${data.left}%`,
      width: data.size, height: data.size, borderRadius: data.size / 2,
      backgroundColor: '#FFFFFF', opacity,
    }} />
  );
}

function ShootingStar() {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fire = () => {
      tx.setValue(0); ty.setValue(0); op.setValue(0);
      Animated.parallel([
        Animated.timing(tx, { toValue: 260, duration: 700, useNativeDriver: true }),
        Animated.timing(ty, { toValue: 130, duration: 700, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 400, delay: 150, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(fire, 4000 + Math.random() * 6000));
    };
    setTimeout(fire, 2000 + Math.random() * 3000);
  }, []);

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', top: '18%', left: '15%',
      width: 90, height: 1.5, borderRadius: 2,
      backgroundColor: '#FFFFFF',
      opacity: op,
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '30deg' }],
      shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 3,
    }} />
  );
}

// ─── Confetti ─────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#A78BFA', '#F9A8D4', '#FCD34D'];
const CONFETTI_COUNT = 24;

function ConfettiPiece({ color, startX, anim }) {
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', bottom: 80, left: startX,
      width: 7, height: 7, borderRadius: 2, backgroundColor: color,
      opacity: anim.opacity,
      transform: [
        { translateX: anim.x }, { translateY: anim.y },
        { rotate: anim.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
      ],
    }} />
  );
}

// ─── Main screen ──────────────────────────────────────────────────
export default function WelcomeScreen({ navigation }) {
  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const logoY        = useRef(new Animated.Value(-60)).current;
  const logoScale    = useRef(new Animated.Value(0.4)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const buttonScale  = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const hoverScale   = useRef(new Animated.Value(1)).current;
  const shimmer      = useRef(new Animated.Value(0)).current;

  const [confetti] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      startX: 80 + Math.random() * 200,
      anim: {
        x: new Animated.Value(0), y: new Animated.Value(0),
        opacity: new Animated.Value(0), rotate: new Animated.Value(0),
      },
    }))
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoY,       { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.spring(buttonScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])).start();
    });
  }, []);

  const onBtnHoverIn  = () => Animated.spring(hoverScale, { toValue: 1.06, useNativeDriver: true }).start();
  const onBtnHoverOut = () => Animated.spring(hoverScale, { toValue: 1,    useNativeDriver: true }).start();

  const fireConfetti = () => {
    confetti.forEach(({ anim }) => {
      anim.x.setValue(0); anim.y.setValue(0); anim.opacity.setValue(0); anim.rotate.setValue(0);
    });
    Animated.parallel(confetti.map(({ anim }) => {
      const delay = Math.random() * 200;
      return Animated.parallel([
        Animated.sequence([
          Animated.timing(anim.opacity, { toValue: 1,   duration: 80,  delay, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 0,   duration: 500, delay: delay + 500, useNativeDriver: true }),
        ]),
        Animated.timing(anim.y,      { toValue: -(120 + Math.random() * 180), duration: 900 + Math.random() * 400, delay, useNativeDriver: true }),
        Animated.timing(anim.x,      { toValue: (Math.random() - 0.5) * 220,  duration: 900 + Math.random() * 400, delay, useNativeDriver: true }),
        Animated.timing(anim.rotate, { toValue: 1, duration: 900, delay, useNativeDriver: true }),
      ]);
    })).start();
  };

  return (
    <LinearGradient colors={['#06040F', '#0D0720', '#080415']} style={styles.container}>

      {/* Nebulae */}
      {NEBULAE.map((n, i) => (
        <View key={i} pointerEvents="none" style={{
          position: 'absolute', top: n.top, left: n.left,
          width: n.size, height: n.size, borderRadius: n.size / 2,
          backgroundColor: n.color, opacity: n.opacity,
        }} />
      ))}

      {/* Stars */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        {STARS.map(s => <Star key={s.id} data={s} />)}
      </Animated.View>

      {/* Shooting star */}
      <ShootingStar />

      {/* Large planet with ring */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '10%', right: '6%' }}>
        <View style={styles.planet}>
          <View style={styles.planetRing} />
        </View>
      </View>

      {/* Small amber planet */}
      <View pointerEvents="none" style={{ position: 'absolute', bottom: '22%', left: '5%' }}>
        <View style={styles.planetSmall} />
      </View>

      {/* Asteroid cluster */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '42%', right: '4%' }}>
        {[{ s: 14, t: 0,  l: 0  },
          { s: 8,  t: 14, l: 10 },
          { s: 5,  t: 5,  l: 18 }].map((a, i) => (
          <View key={i} style={{
            position: 'absolute', top: a.t, left: a.l,
            width: a.s, height: a.s * 0.65, borderRadius: 3,
            backgroundColor: '#64748B70',
            transform: [{ rotate: `${i * 50}deg` }],
          }} />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, {
          opacity: logoOpacity,
          transform: [{ translateY: logoY }, { scale: logoScale }],
        }]}>
          <Text style={styles.logoEmoji}>👑</Text>
          <Text style={styles.logoTitle}>LA SOIRÉE</Text>
          <Text style={styles.logoSubtitle}>DES LÉGENDES</Text>
          <LinearGradient
            colors={[colors.primary + '00', colors.primary, colors.primary + '00']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
        </Animated.View>

        <Animated.View style={{ width: '100%', alignItems: 'center', transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }] }}>
          <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: hoverScale }] }]}>
            <TouchableOpacity
              onPress={() => { fireConfetti(); setTimeout(() => navigation.replace('Menu'), 400); }}
              onMouseEnter={onBtnHoverIn}
              onMouseLeave={onBtnHoverOut}
              activeOpacity={0.88}
              style={styles.button}
            >
              <LinearGradient
                colors={[colors.primary, '#9D4EDD', colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🎮  COMMENCER LA SOIRÉE</Text>
                <Animated.View pointerEvents="none" style={[styles.shimmerBar, {
                  opacity: shimmer.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.6, 0.6, 0] }),
                  transform: [{ translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-200, 340] }) }],
                }]} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.Text style={[styles.version, { opacity: logoOpacity }]}>v1.0 · Bêta</Animated.Text>
      </View>

      {confetti.map((c, i) => <ConfettiPiece key={i} color={c.color} startX={c.startX} anim={c.anim} />)}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
  },

  // Planets
  planet: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#7C3AED22',
    borderWidth: 1.5, borderColor: '#7C3AED55',
    overflow: 'visible',
  },
  planetRing: {
    position: 'absolute', top: 24, left: -18,
    width: 106, height: 24, borderRadius: 60,
    borderWidth: 1.5, borderColor: '#7C3AED45',
    backgroundColor: 'transparent',
  },
  planetSmall: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F59E0B20', borderWidth: 1, borderColor: '#F59E0B55',
  },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  logoEmoji: { fontSize: 82, marginBottom: spacing.sm },
  logoTitle: { fontSize: 48, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  logoSubtitle: { fontSize: 17, fontWeight: '600', color: colors.primaryLight, letterSpacing: 6, marginTop: -4 },
  divider: { width: 100, height: 2, borderRadius: radius.full, marginTop: spacing.md },

  // Button
  buttonWrapper: { width: '100%', ...Platform.select({ web: { maxWidth: 340 } }) },
  button: {
    width: '100%', borderRadius: radius.full, overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 14,
  },
  buttonGradient: { paddingVertical: spacing.md + 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  shimmerBar: {
    position: 'absolute', top: 0, bottom: 0, width: 60,
    backgroundColor: 'white', transform: [{ skewX: '-20deg' }],
  },

  version: { marginTop: spacing.lg, fontSize: 11, color: colors.textMuted },
});
