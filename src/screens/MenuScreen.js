import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PanResponder, Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import { characters } from '../data/characters';

const { width: SW, height: SH } = Dimensions.get('window');
const N = characters.length;

// Rayon du cylindre : assez grand pour espacer les cartes, assez petit pour rester visible
const CARD_W  = Platform.OS === 'web' ? Math.min(SW * 0.38, 215) : Math.min(SW * 0.62, 250);
const RADIUS  = CARD_W / (2 * Math.tan(Math.PI / N)) * 1.15; // cartes légèrement espacées
const STEP    = (2 * Math.PI) / N; // angle entre chaque carte

// Sensibilité du drag : 1 card-width → 1 position
const DRAG_FACTOR = STEP / CARD_W;

// Réflexion + 3D card flip (web)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const _s = document.createElement('style');
  _s.textContent = `
    .card-reflect { -webkit-box-reflect: below 4px linear-gradient(transparent 52%, rgba(2,1,10,0.5));
                    backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .card-slot-3d { transform-style: preserve-3d; }
  `;
  document.head?.appendChild(_s);
}

// ── Étoiles animées (3 couches tuilées seamless) ──────────────────────
function makeStarLayer(count, maxSize) {
  const base = Array.from({ length: count }, () => ({
    left: Math.random() * SW,
    top:  Math.random() * SH,
    size: Math.random() * maxSize + 0.5,
    op:   Math.random() * 0.45 + 0.12,
  }));
  return [
    ...base.map((s, i) => ({ ...s, id: i })),
    ...base.map((s, i) => ({ ...s, id: i + count, top: s.top + SH })),
  ];
}
const STAR_L1 = makeStarLayer(30, 1.5);
const STAR_L2 = makeStarLayer(18, 2.2);
const STAR_L3 = makeStarLayer(10, 3.2);

// ── Calcul des positions sur le cylindre ──────────────────────────────
function computePositions(rotation) {
  return characters.map((_, i) => {
    const alpha  = rotation + i * STEP;   // angle courant de la carte i
    const sinA   = Math.sin(alpha);
    const cosA   = Math.cos(alpha);       // depth : 1 = avant, -1 = arrière
    const x      = RADIUS * sinA;
    const depth  = cosA;
    // scale : 1.0 (avant) → 0.28 (arrière)
    const sc     = 0.28 + 0.72 * ((depth + 1) / 2);
    // opacity : 0 dès que la carte passe derrière (ry > 90°) pour éviter le miroir
    const op     = depth <= 0 ? 0 : Math.min(1, 0.2 + 0.8 * depth);
    // orientation tangentielle : la carte est tangente au cylindre
    const ry     = (alpha * 180 / Math.PI);
    return { x, depth, sc, op, ry };
  });
}

// ── GameCard — memoïsé : ne re-render pas pendant le scroll ──────────
const GameCard = memo(function GameCard({ character, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const btnPulse   = useRef(new Animated.Value(1)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;

  const nameChars    = character.gameName.replace(/\s+/g, '').length;
  const gameNameSize = nameChars <= 5 ? 34 : nameChars <= 9 ? 28 : nameChars <= 13 ? 23 : 19;
  const gameNameH    = gameNameSize * 1.25;

  useEffect(() => {
    if (character.available) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(btnPulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
          Animated.timing(btnPulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
    Animated.loop(Animated.timing(ring1, { toValue: 1, duration: 11000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(ring2, { toValue: 1, duration:  7500, useNativeDriver: true })).start();
  }, []);

  const r1 = ring1.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] });
  const r2 = ring2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg']   });

  return (
    <Animated.View
      style={{ transform: [{ scale: pressScale }] }}
      {...(Platform.OS === 'web' ? { className: 'card-reflect' } : {})}
    >
      {character.available && (
        <View style={[cd.shadow, { shadowColor: character.color, backgroundColor: character.color + '22' }]} />
      )}
      <TouchableOpacity
        onPress={() => character.available && onPress(character)}
        onPressIn={() => { if (character.available) Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start(); }}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        activeOpacity={character.available ? 0.92 : 1}
        disabled={!character.available}
      >
        <LinearGradient
          colors={['#0C0C22', character.color + '40', character.color + '20', '#07050E']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={[cd.card, {
            borderColor: character.available ? character.color + '70' : 'rgba(255,255,255,0.08)',
            opacity: character.available ? 1 : 0.55,
          }]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.13)', 'rgba(255,255,255,0)']}
            start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 0.35 }}
            style={StyleSheet.absoluteFill} pointerEvents="none"
          />
          <View style={cd.topRow}>
            {character.available ? (
              <LinearGradient colors={['#10B981EE', '#059669BB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cd.statusBadge}>
                <Text style={cd.statusText}>✦  DISPONIBLE</Text>
              </LinearGradient>
            ) : (
              <View style={[cd.statusBadge, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }]}>
                <Text style={[cd.statusText, { color: colors.textMuted }]}>🔒  BIENTÔT</Text>
              </View>
            )}
          </View>
          <View style={cd.emojiWrap}>
            <View style={[cd.halo, { backgroundColor: character.color + '15' }]} />
            <Animated.View style={[cd.ringOuter, { borderColor: character.color + '50', transform: [{ rotate: r1 }] }]} />
            <Animated.View style={[cd.ringInner, { borderColor: character.color + '80', transform: [{ rotate: r2 }] }]} />
            <LinearGradient
              colors={[character.color + '55', character.color + '25']}
              style={[cd.avatar, { borderColor: character.color + '90' }]}
            >
              <Text style={cd.emoji}>{character.emoji}</Text>
            </LinearGradient>
          </View>
          <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />
          <Text
            style={[cd.gameName, {
              color: character.color,
              fontSize: Platform.OS !== 'web' ? 32 : gameNameSize,
              ...(Platform.OS === 'web' && { lineHeight: gameNameH }),
            }]}
            numberOfLines={2}
            adjustsFontSizeToFit={Platform.OS !== 'web'}
            minimumFontScale={Platform.OS !== 'web' ? 0.45 : undefined}
          >
            {character.gameName}
          </Text>
          <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />
          <Text style={[cd.charName, { color: character.color }]}>{character.name}</Text>
          <Text style={cd.charTitle}>{character.title.toUpperCase()}</Text>
          <Text style={cd.catchphrase} numberOfLines={2}>{character.catchphrase}</Text>
          {character.available ? (
            <Animated.View style={[cd.playBtnWrap, { transform: [{ scale: btnPulse }] }]}>
              <LinearGradient
                colors={[character.color + 'FF', character.color + 'CC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={cd.playBtn}
              >
                <Text style={cd.playBtnText}>⚡  JOUER  ⚡</Text>
              </LinearGradient>
            </Animated.View>
          ) : (
            <View style={[cd.playBtn, { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }]}>
              <Text style={[cd.playBtnText, { color: colors.textMuted }]}>🚧  Bientôt</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const cd = StyleSheet.create({
  shadow: {
    position: 'absolute', top: 8, left: 8, right: 8, bottom: -14,
    borderRadius: 24, shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.85, shadowRadius: 36, elevation: 24,
  },
  card: {
    width: CARD_W,
    borderRadius: 24, borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingTop:    Platform.select({ web: spacing.sm, default: spacing.xs }),
    paddingBottom: Platform.select({ web: spacing.md, default: spacing.sm }),
    overflow: 'hidden', flexDirection: 'column',
  },
  topRow:      { alignItems: 'center', marginBottom: Platform.select({ web: spacing.sm, default: 6 }) },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  statusText:  { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },

  emojiWrap: {
    alignItems: 'center', justifyContent: 'center',
    height:       Platform.select({ web: 110, default: 88 }),
    marginBottom: Platform.select({ web: spacing.sm, default: 6 }),
  },
  halo:      { position: 'absolute', width: Platform.select({ web: 110, default: 88 }), height: Platform.select({ web: 110, default: 88 }), borderRadius: Platform.select({ web: 55, default: 44 }) },
  ringOuter: { position: 'absolute', width: Platform.select({ web: 100, default: 80 }), height: Platform.select({ web: 100, default: 80 }), borderRadius: Platform.select({ web: 50, default: 40 }), borderWidth: 1.5 },
  ringInner: { position: 'absolute', width: Platform.select({ web: 80,  default: 62 }), height: Platform.select({ web: 80,  default: 62 }), borderRadius: Platform.select({ web: 40, default: 31 }), borderWidth: 1 },
  avatar:    { width: Platform.select({ web: 66, default: 52 }), height: Platform.select({ web: 66, default: 52 }), borderRadius: Platform.select({ web: 33, default: 26 }), borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  emoji:     { fontSize: Platform.select({ web: 34, default: 26 }) },

  divider:     { height: 2, borderRadius: 1, marginVertical: Platform.select({ web: 6, default: 4 }) },
  gameName:    { fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  charName:    { fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 6, marginBottom: 1 },
  charTitle:   { fontSize: 8, fontWeight: '700', letterSpacing: 2, color: colors.textMuted, textAlign: 'center', marginBottom: 6 },
  catchphrase: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: 16, marginBottom: 4 },

  playBtnWrap: { marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  playBtn:     { paddingVertical: Platform.select({ web: 13, default: 10 }), borderRadius: radius.full, alignItems: 'center' },
  playBtnText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 2 },
});

// ── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const starSlow   = useRef(new Animated.Value(0)).current;
  const starMid    = useRef(new Animated.Value(0)).current;
  const starFast   = useRef(new Animated.Value(0)).current;

  // État du cylindre
  const rotRef       = useRef(0);   // rotation courante (radians)
  const targetRef    = useRef(0);   // rotation cible (snap)
  const dragStartRot = useRef(0);
  const isDragging   = useRef(false);
  const rafRef       = useRef(null);

  const [positions, setPositions] = useState(() => computePositions(0));
  const [activeIdx, setActiveIdx] = useState(0);

  // Calcul de la carte en avant (depth max = cos minimal vu que rotation est négative)
  const getFrontIdx = (rot) => {
    let best = 0, bestDepth = -Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.cos(rot + i * STEP);
      if (d > bestDepth) { bestDepth = d; best = i; }
    }
    return best;
  };

  const refresh = useCallback((rot) => {
    setPositions(computePositions(rot));
  }, []);

  // Lerp vers la cible + snap
  const animate = useCallback(() => {
    const cur = rotRef.current;
    const tgt = targetRef.current;
    const diff = tgt - cur;
    if (Math.abs(diff) < 0.001) {
      rotRef.current = tgt;
      refresh(tgt);
      setActiveIdx(getFrontIdx(tgt));
      return;
    }
    const next = cur + diff * 0.14;
    rotRef.current = next;
    refresh(next);
    rafRef.current = requestAnimationFrame(animate);
  }, [refresh]);

  const snapToNearest = useCallback((velocityX = 0) => {
    const momentum = velocityX * DRAG_FACTOR * 60;
    const raw = rotRef.current + momentum;
    const snapped = Math.round(raw / STEP) * STEP;
    targetRef.current = snapped;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // PanResponder — fonctionne sur iOS / Android / web
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:         () => true,
      onMoveShouldSetPanResponder:          (_, gs) => Math.abs(gs.dx) > 4,
      onPanResponderGrant: () => {
        isDragging.current = true;
        dragStartRot.current = rotRef.current;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onPanResponderMove: (_, gs) => {
        const rot = dragStartRot.current + gs.dx * DRAG_FACTOR;
        rotRef.current = rot;
        setPositions(computePositions(rot));
      },
      onPanResponderRelease: (_, gs) => {
        isDragging.current = false;
        snapToNearest(gs.vx);
      },
      onPanResponderTerminate: (_, gs) => {
        isDragging.current = false;
        snapToNearest(0);
      },
    })
  ).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const runStar = (anim, duration) => Animated.loop(
      Animated.timing(anim, { toValue: -SH, duration, useNativeDriver: true, easing: Easing.linear })
    ).start();
    runStar(starSlow, 30000);
    runStar(starMid,  18000);
    runStar(starFast,  9000);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleSelectGame = (character) => {
    const routes = {
      undercover:  'UndercoverSetup',
      quiz:        'QuizSetup',
      amitie:      'AmitieSetup',
      personality: 'PersonalitySetup',
      cineflash:   'CineFlashSetup',
      emojiquiz:   'EmojiQuizSetup',
      motdepasse:  'MotDePasseSetup',
      blindtest:   'BlindTestSetup',
      vote:        'VoteSetup',
      mime:        'MimeSetup',
      buzzer:      'BuzzerSetup',
    };
    if (routes[character.game]) navigation.navigate(routes[character.game]);
  };

  // Tri back-to-front pour le z-order correct (cartes du fond rendues en premier)
  const sortedIndices = [...Array(N).keys()].sort((a, b) => positions[a].depth - positions[b].depth);

  const starLayers = [
    { stars: STAR_L1, anim: starSlow },
    { stars: STAR_L2, anim: starMid  },
    { stars: STAR_L3, anim: starFast },
  ];

  return (
    <LinearGradient colors={['#02010A', '#070420', '#02010A']} style={s.container}>

      {/* Fond espace mouvant */}
      {starLayers.map(({ stars, anim }, li) => (
        <Animated.View
          key={li} pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SH * 2, transform: [{ translateY: anim }] }}
        >
          {stars.map(star => (
            <View key={star.id} style={{
              position: 'absolute', top: star.top, left: star.left,
              width: star.size, height: star.size, borderRadius: star.size / 2,
              backgroundColor: '#FFF', opacity: star.op,
            }} />
          ))}
        </Animated.View>
      ))}

      {/* Header */}
      <Animated.View style={[s.header, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={s.backBtn}>
          <Text style={s.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>CHOISISSEZ</Text>
          <Text style={s.subtitle}>votre aventure</Text>
        </View>
        <View style={{ width: 70 }} />
      </Animated.View>

      <Animated.Text style={[s.countLine, { opacity: headerAnim }]}>
        {characters.filter(c => c.available).length} jeux disponibles
      </Animated.Text>

      {/* Cylindre 3D — cartes positionnées en cercle */}
      <View style={s.stage} {...panResponder.panHandlers}>
        {sortedIndices.map(i => {
          const pos  = positions[i];
          const char = characters[i];
          return (
            <View
              key={char.id}
              {...(Platform.OS === 'web' ? { className: 'card-slot-3d' } : {})}
              style={[s.cardSlot, {
                transform: [
                  { perspective: 900 },
                  { translateX: pos.x },
                  { scale: pos.sc },
                  { rotateY: `${pos.ry}deg` },
                ],
                opacity: pos.op,
                zIndex: Math.round((pos.depth + 1) * 50),
              }]}
            >
              <GameCard character={char} onPress={handleSelectGame} />
            </View>
          );
        })}
      </View>

      {/* Pagination dots */}
      <Animated.View style={[s.dots, { opacity: headerAnim }]}>
        {characters.map((c, i) => (
          <View
            key={c.id}
            style={[
              s.dot,
              i === activeIdx
                ? { width: 22, backgroundColor: characters[activeIdx]?.color ?? colors.primary }
                : { width: 6,  backgroundColor: 'rgba(255,255,255,0.20)' },
            ]}
          />
        ))}
      </Animated.View>

    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn:      { width: 70 },
  backBtnText:  { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:        { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  subtitle:     { fontSize: 12, color: colors.primaryLight, letterSpacing: 2, marginTop: -2 },
  countLine:    { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: spacing.xs },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({ web: { cursor: 'grab', userSelect: 'none' } }),
  },
  cardSlot: {
    position: 'absolute',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 },
  dot:  { height: 6, borderRadius: 3, ...Platform.select({ web: { transition: 'width 0.3s ease, background-color 0.3s ease' } }) },
});
