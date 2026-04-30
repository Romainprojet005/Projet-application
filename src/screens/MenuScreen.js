import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import { characters } from '../data/characters';

const { width: SW, height: SH } = Dimensions.get('window');

// CSS reflection pour web — fond sombre, reflet verre
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const _s = document.createElement('style');
  _s.textContent = `.card-reflect { -webkit-box-reflect: below 4px linear-gradient(transparent 50%, rgba(2,1,10,0.55)); }`;
  document.head?.appendChild(_s);
}

// Cartes : centre dominant, côtés visibles (style coverflow)
const CARD_W   = Platform.OS === 'web' ? Math.min(SW * 0.58, 268) : Math.min(SW * 0.63, 270);
const CARD_GAP = 8;
const ITEM_SIZE  = CARD_W + CARD_GAP;
const SIDE_INSET = (SW - CARD_W) / 2;

const N          = characters.length;
const COPIES     = 101;
const MID        = Math.floor(COPIES / 2);
const LOOP_ITEMS = Array.from({ length: COPIES }, () => characters).flat();
const INIT_IDX   = MID * N;
const INIT_OFF   = INIT_IDX * ITEM_SIZE;

// ─── Étoiles animées : 3 couches (lente / moyenne / rapide)
// Chaque couche est tuilée sur 2×SH pour un loop parfaitement seamless
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
const STAR_L1 = makeStarLayer(30, 1.5);   // petites étoiles — couche lente
const STAR_L2 = makeStarLayer(18, 2.2);   // moyennes — couche med
const STAR_L3 = makeStarLayer(10, 3.2);   // grandes — couche rapide

// ─── GameCard ──────────────────────────────────────────────────────────
function GameCard({ character, loopIdx, scrollX, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const btnPulse   = useRef(new Animated.Value(1)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;

  const nameChars    = character.gameName.replace(/\s+/g, '').length;
  const gameNameSize = nameChars <= 5 ? 34 : nameChars <= 9 ? 28 : nameChars <= 13 ? 23 : 19;
  const gameNameH    = gameNameSize * 1.25;

  // 5 points : ±2 cartes visibles en arrière-plan (effet "files qui se suivent")
  const inputRange = [
    (loopIdx - 2) * ITEM_SIZE,
    (loopIdx - 1) * ITEM_SIZE,
    loopIdx * ITEM_SIZE,
    (loopIdx + 1) * ITEM_SIZE,
    (loopIdx + 2) * ITEM_SIZE,
  ];
  // Toutes les cartes à la même hauteur (comme les packs Pokémon TCG) — seule la rotation 3D crée la profondeur
  const cardScale      = scrollX.interpolate({ inputRange, outputRange: [0.62, 0.82, 1, 0.82, 0.62], extrapolate: 'clamp' });
  const cardOpacity    = scrollX.interpolate({ inputRange, outputRange: [0.22, 0.65, 1, 0.65, 0.22], extrapolate: 'clamp' });
  const cardRotateY    = scrollX.interpolate({ inputRange, outputRange: ['-50deg', '-27deg', '0deg', '27deg', '50deg'], extrapolate: 'clamp' });
  const cardTranslateY = scrollX.interpolate({ inputRange, outputRange: [0, 0, 0, 0, 0], extrapolate: 'clamp' });

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
    <Animated.View style={{
      width: CARD_W, marginRight: CARD_GAP, alignSelf: 'center',
      transform: [{ perspective: 1000 }, { scale: cardScale }, { rotateY: cardRotateY }, { translateY: cardTranslateY }],
      opacity: cardOpacity,
    }}>
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
            {/* Shimmer top */}
            <LinearGradient
              colors={['rgba(255,255,255,0.13)', 'rgba(255,255,255,0)']}
              start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 0.35 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Status badge */}
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

            {/* Emoji hero */}
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

            {/* Nom du jeu */}
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

            {/* Personnage */}
            <Text style={[cd.charName, { color: character.color }]}>{character.name}</Text>
            <Text style={cd.charTitle}>{character.title.toUpperCase()}</Text>

            {/* Catchphrase */}
            <Text style={cd.catchphrase} numberOfLines={2}>{character.catchphrase}</Text>

            {/* Bouton jouer */}
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
    </Animated.View>
  );
}

const cd = StyleSheet.create({
  shadow: {
    position: 'absolute', top: 8, left: 8, right: 8, bottom: -14,
    borderRadius: 24, shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.85, shadowRadius: 36, elevation: 24,
  },
  card: {
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

  divider:  { height: 2, borderRadius: 1, marginVertical: Platform.select({ web: 6, default: 4 }) },
  gameName: { fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },

  charName:  { fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 6, marginBottom: 1 },
  charTitle: { fontSize: 8, fontWeight: '700', letterSpacing: 2, color: colors.textMuted, textAlign: 'center', marginBottom: 6 },
  catchphrase: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: 16, marginBottom: 4 },

  playBtnWrap: { marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  playBtn:     { paddingVertical: Platform.select({ web: 13, default: 10 }), borderRadius: radius.full, alignItems: 'center' },
  playBtnText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 2 },
});

// ─── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const scrollRef          = useRef(null);
  const dragContainerRef   = useRef(null);
  const currentScrollX     = useRef(INIT_OFF);
  const manualScrollOffset = useRef(INIT_OFF);
  const rafRef             = useRef(null);
  const isDragging         = useRef(false);
  const dragStartX         = useRef(0);
  const dragStartScroll    = useRef(0);
  const isMomentum         = useRef(false);
  const wheelCooldown      = useRef(false);

  const scrollX    = useRef(new Animated.Value(INIT_OFF)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Étoiles animées — 3 vitesses
  const starSlow = useRef(new Animated.Value(0)).current;
  const starMid  = useRef(new Animated.Value(0)).current;
  const starFast = useRef(new Animated.Value(0)).current;

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Fond espace mouvant — loop seamless grâce au tiling 2×SH
    const runStar = (anim, duration) => Animated.loop(
      Animated.timing(anim, { toValue: -SH, duration, useNativeDriver: true, easing: Easing.linear })
    ).start();
    runStar(starSlow, 30000);
    runStar(starMid,  18000);
    runStar(starFast,  9000);

    if (Platform.OS === 'web') {
      const t = setTimeout(() => {
        scrollRef.current?.scrollToOffset({ offset: INIT_OFF, animated: false });
        manualScrollOffset.current = INIT_OFF;
      }, 100);
      return () => clearTimeout(t);
    }
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

  const handleScrollEnd = useCallback((offset) => {
    const idx = Math.round(offset / ITEM_SIZE);
    const pos = ((idx % N) + N) % N;
    setActiveIdx(pos);
    const target = MID * N + pos;
    const targetOffset = target * ITEM_SIZE;
    manualScrollOffset.current = targetOffset;
    if (idx !== target) {
      scrollRef.current?.scrollToOffset({ offset: targetOffset, animated: false });
    }
  }, []);

  const navigateTo = useCallback((direction) => {
    const currentIdx = Math.round(manualScrollOffset.current / ITEM_SIZE);
    const targetOffset = (currentIdx + direction) * ITEM_SIZE;
    manualScrollOffset.current = targetOffset;
    scrollRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    setTimeout(() => handleScrollEnd(targetOffset), 400);
  }, [handleScrollEnd]);

  const onScrollEnd = useCallback((e) => {
    handleScrollEnd(e.nativeEvent.contentOffset.x);
  }, [handleScrollEnd]);

  const onMouseDown = (e) => {
    if (Platform.OS !== 'web') return;
    isDragging.current = true;
    dragStartX.current = e.nativeEvent.pageX;
    dragStartScroll.current = manualScrollOffset.current;
    if (dragContainerRef.current?.style) dragContainerRef.current.style.cursor = 'grabbing';
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const newOffset = dragStartScroll.current + (dragStartX.current - e.nativeEvent.pageX);
    manualScrollOffset.current = newOffset;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      scrollRef.current?.scrollToOffset({ offset: manualScrollOffset.current, animated: false });
      rafRef.current = null;
    });
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragContainerRef.current?.style) dragContainerRef.current.style.cursor = 'grab';
    const offset = manualScrollOffset.current;
    const snapped = Math.round(offset / ITEM_SIZE) * ITEM_SIZE;
    manualScrollOffset.current = snapped;
    scrollRef.current?.scrollToOffset({ offset: snapped, animated: true });
    setTimeout(() => handleScrollEnd(snapped), 350);
  };

  const onWheel = (e) => {
    if (Platform.OS !== 'web' || wheelCooldown.current) return;
    const delta = e.nativeEvent?.deltaY ?? 0;
    if (Math.abs(delta) < 3) return;
    wheelCooldown.current = true;
    navigateTo(delta > 0 ? 1 : -1);
    setTimeout(() => { wheelCooldown.current = false; }, 480);
  };

  const starLayers = [
    { stars: STAR_L1, anim: starSlow },
    { stars: STAR_L2, anim: starMid  },
    { stars: STAR_L3, anim: starFast },
  ];

  return (
    <LinearGradient colors={['#02010A', '#070420', '#02010A']} style={s.container}>

      {/* ── Fond espace mouvant ── */}
      {starLayers.map(({ stars, anim }, li) => (
        <Animated.View
          key={li}
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SH * 2, transform: [{ translateY: anim }] }}
        >
          {stars.map(star => (
            <View
              key={star.id}
              style={{
                position: 'absolute',
                top: star.top, left: star.left,
                width: star.size, height: star.size, borderRadius: star.size / 2,
                backgroundColor: '#FFF', opacity: star.op,
              }}
            />
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

      {/* Carousel infini */}
      <View style={{ flex: 1 }}>
        <View
          ref={dragContainerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={(e) => {
            if (Platform.OS !== 'web') return;
            const touch = e.nativeEvent.touches?.[0];
            if (!touch) return;
            isDragging.current = true;
            dragStartX.current = touch.pageX;
            dragStartScroll.current = manualScrollOffset.current;
          }}
          onTouchMove={(e) => {
            if (!isDragging.current) return;
            const touch = e.nativeEvent.touches?.[0];
            if (!touch) return;
            const newOffset = dragStartScroll.current + (dragStartX.current - touch.pageX);
            manualScrollOffset.current = newOffset;
            scrollRef.current?.scrollToOffset({ offset: newOffset, animated: false });
          }}
          onTouchEnd={() => {
            if (!isDragging.current) return;
            isDragging.current = false;
            const delta = manualScrollOffset.current - dragStartScroll.current;
            const baseIdx = Math.round(dragStartScroll.current / ITEM_SIZE);
            let snapped;
            if (Math.abs(delta) > ITEM_SIZE * 0.12) {
              snapped = (baseIdx + (delta > 0 ? 1 : -1)) * ITEM_SIZE;
            } else {
              snapped = Math.round(manualScrollOffset.current / ITEM_SIZE) * ITEM_SIZE;
            }
            manualScrollOffset.current = snapped;
            scrollRef.current?.scrollToOffset({ offset: snapped, animated: true });
            setTimeout(() => handleScrollEnd(snapped), 350);
          }}
          onWheel={onWheel}
          style={[{ flex: 1 }, Platform.OS === 'web' && { cursor: 'grab', userSelect: 'none' }]}
        >
          <FlatList
            ref={scrollRef}
            data={LOOP_ITEMS}
            horizontal
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <GameCard character={item} loopIdx={index} scrollX={scrollX} onPress={handleSelectGame} />
            )}
            getItemLayout={(_, index) => ({ length: ITEM_SIZE, offset: index * ITEM_SIZE, index })}
            initialScrollIndex={INIT_IDX}
            snapToInterval={ITEM_SIZE}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={Platform.OS !== 'web'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SIDE_INSET, paddingTop: 8, paddingBottom: 55 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: true,
                listener: (e) => { currentScrollX.current = e.nativeEvent.contentOffset.x; },
              }
            )}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => { isMomentum.current = false; }}
            onMomentumScrollBegin={() => { isMomentum.current = true; }}
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={(e) => { if (!isMomentum.current) onScrollEnd(e); }}
            initialNumToRender={Platform.OS === 'web' ? 15 : 7}
            maxToRenderPerBatch={Platform.OS === 'web' ? 10 : 5}
            windowSize={Platform.OS === 'web' ? 21 : 5}
            style={{ flex: 1 }}
          />
        </View>

        {/* Flèches */}
        <TouchableOpacity
          style={[s.arrowBtn, { left: 6, borderColor: (characters[activeIdx]?.color ?? '#fff') + '50' }]}
          onPress={() => navigateTo(-1)}
          activeOpacity={0.6}
        >
          <Text style={[s.arrowText, { color: characters[activeIdx]?.color ?? '#fff' }]}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.arrowBtn, { right: 6, borderColor: (characters[activeIdx]?.color ?? '#fff') + '50' }]}
          onPress={() => navigateTo(1)}
          activeOpacity={0.6}
        >
          <Text style={[s.arrowText, { color: characters[activeIdx]?.color ?? '#fff' }]}>›</Text>
        </TouchableOpacity>
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
  dots:         { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 },
  dot:          { height: 6, borderRadius: 3, ...Platform.select({ web: { transition: 'width 0.3s ease, background-color 0.3s ease' } }) },
  arrowBtn: {
    position: 'absolute', top: '38%',
    width: 34, height: 56, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  arrowText: { fontSize: 32, fontWeight: '900', lineHeight: 36 },
});
