import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radius } from '../theme';
import { OB_BG } from '../theme/obsidian';

// Web: inject fonts (partagé avec MenuScreen via même id)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('sdl-fonts')) {
    const lk = document.createElement('link');
    lk.id = 'sdl-fonts';
    lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Cinzel:wght@500;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(lk);
  }
  if (!document.getElementById('sdl-welcome-css')) {
    const st = document.createElement('style');
    st.id = 'sdl-welcome-css';
    st.textContent = `
      .sdl-crown {
        font-family: 'Cinzel', Georgia, serif;
        font-size: 52px;
        color: #D4AF37;
        text-shadow: 0 0 30px rgba(212,175,55,0.5), 0 0 60px rgba(212,175,55,0.2);
        line-height: 1;
      }
      .sdl-logo-title {
        font-family: 'Cinzel', Georgia, serif;
        font-weight: 700;
        font-size: 46px;
        letter-spacing: 8px;
        background: linear-gradient(180deg, #FFFFFF 0%, #F4DC8C 60%, #D4AF37 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: 1.1;
      }
      .sdl-logo-sub {
        font-family: 'Cinzel', Georgia, serif;
        font-size: 15px;
        letter-spacing: 8px;
        color: #D4AF37;
        opacity: 0.85;
        margin-top: 2px;
      }
      .sdl-btn-text {
        font-family: 'Cinzel', Georgia, serif;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 3px;
        color: #0A0815;
      }
      .sdl-version {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 10px;
        letter-spacing: 2px;
        color: rgba(212,175,55,0.45);
      }

      /* Nébuleuses welcome */
      .sdl-w-nebula { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
      .sdl-w-nebula-1 { top:2%;  left:-18%; width:380px; height:380px; background:#7C3AED; opacity:0.13; animation:sdl-drift 35s ease-in-out infinite alternate; }
      .sdl-w-nebula-2 { top:52%; right:-5%; width:300px; height:300px; background:#EC4899; opacity:0.09; animation:sdl-drift 28s ease-in-out infinite alternate; animation-delay:-12s; }
      .sdl-w-nebula-3 { bottom:8%;left:2%;  width:220px; height:220px; background:#0EA5E9; opacity:0.08; animation:sdl-drift 32s ease-in-out infinite alternate; animation-delay:-22s; }
      @keyframes sdl-drift { from{transform:translate(0,0) scale(1);} to{transform:translate(30px,-25px) scale(1.08);} }
    `;
    document.head.appendChild(st);
  }
}

// ── Étoiles ───────────────────────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top:         Math.random() * 100,
  left:        Math.random() * 100,
  size:        Math.random() * 2.5 + 0.5,
  baseOpacity: Math.random() * 0.5 + 0.15,
  duration:    1200 + Math.random() * 2800,
}));

function Star({ data }) {
  const opacity = useRef(new Animated.Value(data.baseOpacity)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: Math.min(1, data.baseOpacity + 0.6), duration: data.duration, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: data.baseOpacity * 0.2,             duration: data.duration, useNativeDriver: true }),
    ])).start();
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
      backgroundColor: '#D4AF37', opacity: op,
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '30deg' }],
      shadowColor: '#D4AF37', shadowOpacity: 0.8, shadowRadius: 4,
    }} />
  );
}

// ── WelcomeScreen ─────────────────────────────────────────────────────
export default function WelcomeScreen({ navigation }) {
  const bgOpacity   = useRef(new Animated.Value(0)).current;
  const logoY       = useRef(new Animated.Value(-60)).current;
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const shimmer     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoY,       { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.spring(buttonScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1100, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])).start();
    });
  }, []);

  return (
    <LinearGradient colors={OB_BG} style={st.container}>

      {/* Nébuleuses (web) */}
      {Platform.OS === 'web' && (
        <>
          <View {...{ className: 'sdl-w-nebula sdl-w-nebula-1' }} pointerEvents="none" style={st.nebula} />
          <View {...{ className: 'sdl-w-nebula sdl-w-nebula-2' }} pointerEvents="none" style={st.nebula} />
          <View {...{ className: 'sdl-w-nebula sdl-w-nebula-3' }} pointerEvents="none" style={st.nebula} />
        </>
      )}

      {/* Étoiles */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        {STARS.map(s => <Star key={s.id} data={s} />)}
      </Animated.View>

      <ShootingStar />

      {/* Planète avec anneau */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '10%', right: '6%' }}>
        <View style={st.planet}>
          <View style={st.planetRing} />
        </View>
      </View>

      {/* Petite planète or */}
      <View pointerEvents="none" style={{ position: 'absolute', bottom: '22%', left: '5%' }}>
        <View style={st.planetSmall} />
      </View>

      {/* Astéroïdes */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '42%', right: '4%' }}>
        {[{ s: 14, t: 0, l: 0 }, { s: 8, t: 14, l: 10 }, { s: 5, t: 5, l: 18 }].map((a, i) => (
          <View key={i} style={{
            position: 'absolute', top: a.t, left: a.l,
            width: a.s, height: a.s * 0.65, borderRadius: 3,
            backgroundColor: 'rgba(212,175,55,0.2)',
            transform: [{ rotate: `${i * 50}deg` }],
          }} />
        ))}
      </View>

      {/* Contenu central */}
      <View style={st.content}>
        <Animated.View style={[st.logoContainer, {
          opacity: logoOpacity,
          transform: [{ translateY: logoY }, { scale: logoScale }],
        }]}>
          {/* Couronne */}
          {Platform.OS === 'web' ? (
            <span className="sdl-crown">♛</span>
          ) : (
            <Text style={st.crown}>♛</Text>
          )}

          {/* Titre */}
          {Platform.OS === 'web' ? (
            <>
              <div className="sdl-logo-title">LA SOIRÉE</div>
              <div className="sdl-logo-sub">DES LÉGENDES</div>
            </>
          ) : (
            <>
              <Text style={st.logoTitle}>LA SOIRÉE</Text>
              <Text style={st.logoSubtitle}>DES LÉGENDES</Text>
            </>
          )}

          {/* Filet or */}
          <View style={st.divider} />

          {/* Coins décoratifs */}
          <View style={[st.obCorner, st.obTL]} />
          <View style={[st.obCorner, st.obTR]} />
          <View style={[st.obCorner, st.obBL]} />
          <View style={[st.obCorner, st.obBR]} />
        </Animated.View>

        {/* Bouton COMMENCER */}
        <Animated.View style={{ width: '100%', alignItems: 'center', transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }] }}>
          <TouchableOpacity
            onPress={() => navigation.replace('Menu')}
            activeOpacity={0.88}
            style={st.buttonWrap}
          >
            <LinearGradient
              colors={['#F4DC8C', '#D4AF37', '#8B6914']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={st.buttonGradient}
            >
              {Platform.OS === 'web' ? (
                <span className="sdl-btn-text">♛  COMMENCER LA SOIRÉE</span>
              ) : (
                <Text style={st.buttonText}>♛  COMMENCER LA SOIRÉE</Text>
              )}
              {/* Shimmer */}
              <Animated.View pointerEvents="none" style={[st.shimmerBar, {
                opacity: shimmer.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.5, 0.5, 0] }),
                transform: [{ translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-200, 340] }) }],
              }]} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Animated.View style={{ opacity: logoOpacity, marginTop: spacing.lg }}>
          {Platform.OS === 'web' ? (
            <span className="sdl-version">v1.0 · Bêta</span>
          ) : (
            <Text style={st.version}>v1.0 · Bêta</Text>
          )}
        </Animated.View>
      </View>

    </LinearGradient>
  );
}

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4DC8C';

const st = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  nebula:    { position: 'absolute' },
  content:   {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
  },

  // Logo
  logoContainer: {
    alignItems: 'center', marginBottom: spacing.xxl,
    position: 'relative', padding: 28,
  },
  crown:       { fontSize: 52, color: GOLD, marginBottom: 6 },
  logoTitle:   { fontSize: 44, fontWeight: '900', color: '#F4DC8C', letterSpacing: 8, lineHeight: 50 },
  logoSubtitle:{ fontSize: 15, fontWeight: '600', color: GOLD, letterSpacing: 8, marginTop: 2, opacity: 0.85 },
  divider:     {
    width: 120, height: 1, borderRadius: 1, marginTop: spacing.md,
    backgroundColor: GOLD, opacity: 0.5,
  },

  // Coins style Obsidienne
  obCorner: { position: 'absolute', width: 22, height: 22, borderColor: GOLD + 'AA' },
  obTL: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  obTR: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  obBL: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  obBR: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 },

  // Planètes
  planet: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: GOLD + '12', borderWidth: 1.5, borderColor: GOLD + '40',
    overflow: 'visible',
  },
  planetRing: {
    position: 'absolute', top: 24, left: -18,
    width: 106, height: 24, borderRadius: 60,
    borderWidth: 1.5, borderColor: GOLD + '35', backgroundColor: 'transparent',
  },
  planetSmall: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: GOLD + '15', borderWidth: 1, borderColor: GOLD + '45',
  },

  // Bouton
  buttonWrap: {
    width: '100%', ...Platform.select({ web: { maxWidth: 340 } }),
    borderRadius: radius.full, overflow: 'hidden',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 14,
  },
  buttonGradient: { paddingVertical: spacing.md + 8, alignItems: 'center' },
  buttonText:     { fontSize: 14, fontWeight: '900', color: '#0A0815', letterSpacing: 3 },
  shimmerBar: {
    position: 'absolute', top: 0, bottom: 0, width: 60,
    backgroundColor: 'rgba(255,255,255,0.4)', transform: [{ skewX: '-20deg' }],
  },

  version: { fontSize: 10, color: GOLD + '70', letterSpacing: 2 },
});
