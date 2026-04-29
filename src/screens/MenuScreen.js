import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import { characters } from '../data/characters';

const { width: SW, height: SH } = Dimensions.get('window');
// Sur web le navigateur lui-même prend de la place (barre d'adresse, onglets…)
// On réduit les dimensions pour que les cartes ne débordent pas en bas
const CARD_W   = Platform.OS === 'web' ? Math.min(SW * 0.72, 360) : Math.min(SW * 0.80, 400);
const CARD_GAP = 20;
const ITEM_SIZE  = CARD_W + CARD_GAP;
const SIDE_INSET = (SW - CARD_W) / 2;

// Infinite loop : 101 copies, start at the middle copy (copy 50)
// FlatList virtualise → seules ~7 cartes sont rendues en mémoire
const N          = characters.length;
const COPIES     = 101;
const MID        = Math.floor(COPIES / 2);   // 50
const LOOP_ITEMS = Array.from({ length: COPIES }, () => characters).flat();
const INIT_IDX   = MID * N;                  // index de départ (400 pour N=8)
const INIT_OFF   = INIT_IDX * ITEM_SIZE;     // offset pour Animated.Value

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.4 + 0.05,
}));

// ─── GameCard ──────────────────────────────────────────────────────────
function GameCard({ character, loopIdx, scrollX, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const btnPulse   = useRef(new Animated.Value(1)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;

  // Taille dynamique du nom selon longueur (hors espaces) — fonctionne web + natif
  const nameChars      = character.gameName.replace(/\s+/g, '').length;
  const gameNameSize   = nameChars <= 5 ? 40 : nameChars <= 9 ? 34 : nameChars <= 13 ? 28 : 23;
  const gameNameHeight = gameNameSize * 1.25;

  // Scale/opacity/rotation driven by scroll position of THIS card in the looped array
  const inputRange    = [(loopIdx - 1) * ITEM_SIZE, loopIdx * ITEM_SIZE, (loopIdx + 1) * ITEM_SIZE];
  const cardScale     = scrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });
  const cardOpacity   = scrollX.interpolate({ inputRange, outputRange: [0.48, 1, 0.48], extrapolate: 'clamp' });
  const cardRotateY   = scrollX.interpolate({ inputRange, outputRange: ['18deg', '0deg', '-18deg'], extrapolate: 'clamp' });
  const cardTranslateY = scrollX.interpolate({ inputRange, outputRange: [28, 0, 28], extrapolate: 'clamp' });

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
    <Animated.View style={{ width: CARD_W, marginRight: CARD_GAP, alignSelf: 'center', transform: [{ perspective: 1200 }, { scale: cardScale }, { rotateY: cardRotateY }, { translateY: cardTranslateY }], opacity: cardOpacity }}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>

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
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
              start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 0.35 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Status badge centré */}
            <View style={cd.topRow}>
              {character.available ? (
                <LinearGradient
                  colors={['#10B981EE', '#059669BB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={cd.statusBadge}
                >
                  <Text style={cd.statusText}>✦  DISPONIBLE</Text>
                </LinearGradient>
              ) : (
                <View style={[cd.statusBadge, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }]}>
                  <Text style={[cd.statusText, { color: colors.textMuted }]}>🔒  BIENTÔT</Text>
                </View>
              )}
            </View>

            {/* ── Emoji hero ── */}
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

            {/* ── Nom du jeu — pièce maîtresse ── */}
            <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />
            <Text
              style={[cd.gameName, {
                color: character.color,
                fontSize: Platform.OS !== 'web' ? 38 : gameNameSize,
                ...(Platform.OS === 'web' && { lineHeight: gameNameHeight }),
              }]}
              numberOfLines={2}
              adjustsFontSizeToFit={Platform.OS !== 'web'}
              minimumFontScale={Platform.OS !== 'web' ? 0.45 : undefined}
            >
              {character.gameName}
            </Text>
            <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />

            {/* ── Personnage ── */}
            <Text style={[cd.charName, { color: character.color }]}>{character.name}</Text>
            <Text style={cd.charTitle}>{character.title.toUpperCase()}</Text>

            {/* ── Catchphrase ── */}
            <Text style={cd.catchphrase} numberOfLines={2}>{character.catchphrase}</Text>

            {/* ── Bouton jouer ── */}
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
                <Text style={[cd.playBtnText, { color: colors.textMuted }]}>🚧  En développement</Text>
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
    position: 'absolute', top: 10, left: 10, right: 10, bottom: -16,
    borderRadius: 28, shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.85, shadowRadius: 40, elevation: 28,
  },
  card: {
    borderRadius: 28, borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingTop:    Platform.select({ web: spacing.md, default: spacing.sm }),
    paddingBottom: Platform.select({ web: spacing.lg, default: spacing.md }),
    overflow: 'hidden', flexDirection: 'column',
  },

  // Status
  topRow:      { alignItems: 'center', marginBottom: Platform.select({ web: spacing.md, default: spacing.sm }) },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full },
  statusText:  { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },

  // Emoji hero — taille réduite sur mobile pour éviter le débordement du bas
  emojiWrap: {
    alignItems: 'center', justifyContent: 'center',
    height:       Platform.select({ web: 148, default: 114 }),
    marginBottom: Platform.select({ web: spacing.md, default: spacing.sm }),
  },
  halo:     { position: 'absolute', width: Platform.select({ web: 148, default: 114 }), height: Platform.select({ web: 148, default: 114 }), borderRadius: Platform.select({ web: 74, default: 57 }) },
  ringOuter:{ position: 'absolute', width: Platform.select({ web: 136, default: 104 }), height: Platform.select({ web: 136, default: 104 }), borderRadius: Platform.select({ web: 68, default: 52 }), borderWidth: 1.5 },
  ringInner:{ position: 'absolute', width: Platform.select({ web: 110, default: 84  }), height: Platform.select({ web: 110, default: 84  }), borderRadius: Platform.select({ web: 55, default: 42 }), borderWidth: 1 },
  avatar:   { width: Platform.select({ web: 92, default: 70 }), height: Platform.select({ web: 92, default: 70 }), borderRadius: Platform.select({ web: 46, default: 35 }), borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  emoji:    { fontSize: Platform.select({ web: 48, default: 36 }) },

  // Nom du jeu
  divider:  { height: 2, borderRadius: 1, marginVertical: Platform.select({ web: 8, default: 5 }) },
  gameName: { fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },

  // Personnage
  charName:  { fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm, marginBottom: 2 },
  charTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },

  // Catchphrase
  catchphrase: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: 18, marginBottom: spacing.xs },

  // Bouton
  playBtnWrap: { marginTop: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 10 },
  playBtn:     { paddingVertical: Platform.select({ web: 16, default: 13 }), borderRadius: radius.full, alignItems: 'center' },
  playBtnText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2 },
});

// ─── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const scrollRef          = useRef(null);
  const dragContainerRef   = useRef(null);
  const currentScrollX     = useRef(INIT_OFF);
  const manualScrollOffset = useRef(INIT_OFF); // source de vérité pour le drag web
  const rafRef             = useRef(null);     // throttle RAF pour scroll web
  const isDragging         = useRef(false);
  const dragStartX         = useRef(0);
  const dragStartScroll    = useRef(0);
  const isMomentum         = useRef(false);
  const wheelCooldown      = useRef(false);
  // scrollX starts at INIT_OFF so the first render's interpolations are correct
  const scrollX    = useRef(new Animated.Value(INIT_OFF)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Sur web, scrollTo reste nécessaire car FlatList n'a pas initialScrollIndex fiable sur web
    if (Platform.OS === 'web') {
      const t = setTimeout(() => {
        scrollRef.current?.scrollToOffset({ offset: INIT_OFF, animated: false });
        manualScrollOffset.current = INIT_OFF;
      }, 100); // 100ms pour laisser le FlatList finir son layout
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
    };
    if (routes[character.game]) navigation.navigate(routes[character.game]);
  };

  // Normalise vers la copie centrale (copie 50) — filet de sécurité si l'utilisateur atteint un bord
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
    // Throttle à 1 appel par frame pour éviter les flashs noirs
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

  return (
    <LinearGradient colors={['#06040F', '#0D0720', '#060410']} style={s.container}>
      {STARS.map(star => (
        <View key={star.id} pointerEvents="none" style={{
          position: 'absolute', top: star.top, left: star.left,
          width: star.size, height: star.size, borderRadius: star.size / 2,
          backgroundColor: '#FFF', opacity: star.opacity,
        }} />
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

      {/* Infinite carousel */}
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
            contentContainerStyle={{ paddingHorizontal: SIDE_INSET, paddingVertical: 12 }}
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

        {/* Flèches de navigation — toutes plateformes */}
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
  container:   { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  header:      { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn:     { width: 70 },
  backBtnText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  headerCenter:{ flex: 1, alignItems: 'center' },
  title:       { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  subtitle:    { fontSize: 12, color: colors.primaryLight, letterSpacing: 2, marginTop: -2 },
  countLine:   { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: spacing.xs },
  dots:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 },
  dot:         { height: 6, borderRadius: 3, ...Platform.select({ web: { transition: 'width 0.3s ease, background-color 0.3s ease' } }) },
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
