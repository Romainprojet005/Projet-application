import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PanResponder, Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import { characters } from '../data/characters';
import AdBanner from '../components/AdBanner';

const { width: SW, height: SH } = Dimensions.get('window');
const N = characters.length;

const IS_MOBILE_WEB = Platform.OS === 'web' && SW < 600;
const CARD_W = IS_MOBILE_WEB ? Math.min(SW * 0.68, 230)
             : Platform.OS === 'web' ? 280
             : Math.min(SW * 0.75, 300);
const CARD_H = Math.round(CARD_W * 1.5);

const RADIUS = Platform.OS === 'web'
  ? (IS_MOBILE_WEB ? 300 : 480)
  : CARD_W / (2 * Math.tan(Math.PI / N)) * 1.15;
const STEP = (2 * Math.PI) / N;

// Plus sensible sur mobile (moins de pixels pour avancer d'une carte)
const DRAG_FACTOR = STEP / (IS_MOBILE_WEB ? CARD_W * 0.55 : CARD_W);

// ── Web: CSS ──────────────────────────────────────────────────────────
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('sdl-fonts')) {
    const lk = document.createElement('link');
    lk.id = 'sdl-fonts';
    lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Cinzel:wght@500;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(lk);
  }
  if (!document.getElementById('sdl-menu-css')) {
    const st = document.createElement('style');
    st.id = 'sdl-menu-css';
    st.textContent = `
      /* Carousel slots — GPU layer pour fluidité mobile */
      .card-slot-3d {
        transform-style: preserve-3d;
        will-change: transform, opacity;
        -webkit-transform-style: preserve-3d;
      }

      /* Nébuleuses */
      .sdl-nebula { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:sdl-drift 30s ease-in-out infinite alternate; }
      .sdl-nebula-1 { top:10%; left:-10%; width:500px; height:500px; background:#7C3AED; opacity:0.12; }
      .sdl-nebula-2 { top:50%; right:-8%; width:400px; height:400px; background:#EC4899; opacity:0.10; animation-delay:-10s; }
      .sdl-nebula-3 { bottom:-10%; left:30%; width:450px; height:450px; background:#0EA5E9; opacity:0.10; animation-delay:-20s; }
      @keyframes sdl-drift { from{transform:translate(0,0) scale(1);} to{transform:translate(40px,-30px) scale(1.1);} }

      /* Obsidian front */
      .ob-front {
        background: radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 60%),
                    linear-gradient(180deg, #14101F 0%, #0A0815 60%, #0F0A1F 100%);
        border: 1px solid rgba(212,175,55,0.25);
        box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        padding: 22px 20px 18px;
        font-family: 'Cormorant Garamond', Georgia, serif;
        color: #F8E9C8;
        display: flex; flex-direction: column;
        border-radius: 18px; overflow: hidden;
        position: relative;
        cursor: pointer;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .ob-front:hover {
        border-color: rgba(212,175,55,0.55);
        box-shadow: 0 36px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,175,55,0.2), 0 0 30px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .ob-unavailable { cursor: default; opacity: 0.55; }
      .ob-unavailable:hover { border-color: rgba(212,175,55,0.25) !important; box-shadow: 0 30px 80px rgba(0,0,0,0.6) !important; }

      .ob-grain { position:absolute; inset:0; pointer-events:none; opacity:0.5; background-image:radial-gradient(circle at 20% 30%, rgba(212,175,55,0.08) 1px, transparent 1.5px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 1px, transparent 1.5px); background-size:40px 40px,60px 60px; }
      .ob-corner { position:absolute; width:28px; height:28px; border-color:#D4AF37; }
      .ob-corner.tl { top:10px; left:10px; border-top:1.5px solid; border-left:1.5px solid; }
      .ob-corner.tr { top:10px; right:10px; border-top:1.5px solid; border-right:1.5px solid; }
      .ob-corner.bl { bottom:10px; left:10px; border-bottom:1.5px solid; border-left:1.5px solid; }
      .ob-corner.br { bottom:10px; right:10px; border-bottom:1.5px solid; border-right:1.5px solid; }
      .ob-header { display:flex; align-items:center; justify-content:center; gap:10px; font-family:'JetBrains Mono','Courier New',monospace; font-size:10px; letter-spacing:3px; color:#D4AF37; margin-bottom:6px; position:relative; z-index:1; }
      .ob-dot { width:4px; height:4px; background:#D4AF37; border-radius:50%; display:inline-block; }
      .ob-emoji-frame { position:relative; width:110px; height:110px; margin:12px auto 8px; display:flex; align-items:center; justify-content:center; border:1.5px solid #D4AF37; border-radius:50%; z-index:1; }
      .ob-emoji-frame::before { content:''; position:absolute; inset:-8px; border:1px solid rgba(212,175,55,0.3); border-radius:50%; }
      .ob-frame-glow { position:absolute; inset:4px; border-radius:50%; background:radial-gradient(circle, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%); filter:blur(8px); }
      .ob-emoji { font-size:56px; position:relative; z-index:1; line-height:1; filter:drop-shadow(0 0 12px rgba(212,175,55,0.4)); }
      .ob-name-block { text-align:center; margin:4px 0 8px; position:relative; z-index:1; }
      .ob-rule { height:1px; background:linear-gradient(90deg,transparent,#D4AF37,transparent); margin:6px 0; }
      .ob-name { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; font-style:italic; font-size:22px; color:#F8E9C8; letter-spacing:0.5px; line-height:1.1; }
      .ob-title { font-family:'JetBrains Mono','Courier New',monospace; font-size:9px; letter-spacing:2.5px; color:rgba(212,175,55,0.7); margin-top:4px; text-transform:uppercase; }
      .ob-game { text-align:center; font-family:'Cinzel',Georgia,serif; font-weight:700; font-size:18px; letter-spacing:4px; color:#D4AF37; text-shadow:0 0 10px rgba(212,175,55,0.3); margin:6px 0 10px; position:relative; z-index:1; }
      .ob-meta { display:flex; align-items:center; justify-content:center; gap:18px; margin-top:auto; padding-top:10px; position:relative; z-index:1; }
      .ob-meta-cell { display:flex; flex-direction:column; align-items:center; gap:2px; }
      .ob-meta-label { font-family:'JetBrains Mono','Courier New',monospace; font-size:8px; letter-spacing:2px; color:rgba(212,175,55,0.6); }
      .ob-meta-value { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; font-size:16px; color:#F8E9C8; }
      .ob-meta-divider { width:1px; height:24px; background:rgba(212,175,55,0.3); }
      .ob-soon { position:absolute; inset:0; background:rgba(5,4,16,0.62); border-radius:18px; display:flex; align-items:center; justify-content:center; z-index:20; }
      .ob-soon-badge { font-family:'JetBrains Mono','Courier New',monospace; font-size:10px; letter-spacing:3px; color:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.18); padding:7px 16px; border-radius:999px; }

      .sdl-hint { font-family:'JetBrains Mono','Courier New',monospace; font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.28); }
    `;
    document.head.appendChild(st);
  }
}

// ── Étoiles ───────────────────────────────────────────────────────────
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

// ── Positions cylindre ────────────────────────────────────────────────
function computePositions(rotation) {
  return characters.map((_, i) => {
    const alpha = rotation + i * STEP;
    const cosA  = Math.cos(alpha);
    const x     = RADIUS * Math.sin(alpha);
    const sc    = 0.28 + 0.72 * ((cosA + 1) / 2);
    const op    = 0.18 + 0.82 * ((cosA + 1) / 2);
    const ry    = alpha * 180 / Math.PI;
    return { x, depth: cosA, sc, op, ry };
  });
}

// ── Obsidian card (web, sans flip) ────────────────────────────────────
function ObsidianCard({ character, idx, onPlay }) {
  const n = String(idx + 1).padStart(2, '0');
  return (
    <div
      className={`ob-front${!character.available ? ' ob-unavailable' : ''}`}
      style={{ '--accent': character.color, width: CARD_W, height: CARD_H }}
      onClick={character.available ? onPlay : undefined}
    >
      <div className="ob-grain" />
      <div className="ob-corner tl" /><div className="ob-corner tr" />
      <div className="ob-corner bl" /><div className="ob-corner br" />
      <div className="ob-header">
        <span>N° {n}</span><span className="ob-dot" /><span>LÉGENDE</span>
      </div>
      <div className="ob-emoji-frame">
        <div className="ob-frame-glow" />
        <span className="ob-emoji">{character.emoji}</span>
      </div>
      <div className="ob-name-block">
        <div className="ob-rule" />
        <div className="ob-name">{character.name}</div>
        <div className="ob-title">{character.title}</div>
        <div className="ob-rule" />
      </div>
      <div className="ob-game">{character.gameName}</div>
      <div className="ob-meta">
        <div className="ob-meta-cell">
          <span className="ob-meta-label">JOUEURS</span>
          <span className="ob-meta-value">{character.players || '2–12'}</span>
        </div>
        <div className="ob-meta-divider" />
        <div className="ob-meta-cell">
          <span className="ob-meta-label">DURÉE</span>
          <span className="ob-meta-value">{character.time || '15 min'}</span>
        </div>
      </div>
      {!character.available && (
        <div className="ob-soon"><span className="ob-soon-badge">🔒 BIENTÔT</span></div>
      )}
    </div>
  );
}

// ── GameCard natif (mobile Expo) ──────────────────────────────────────
const GameCardNative = memo(function GameCardNative({ character, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const btnPulse   = useRef(new Animated.Value(1)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;

  const nameChars    = character.gameName.replace(/\s+/g, '').length;
  const gameNameSize = nameChars <= 5 ? 34 : nameChars <= 9 ? 28 : nameChars <= 13 ? 23 : 19;

  useEffect(() => {
    if (character.available) {
      Animated.loop(Animated.sequence([
        Animated.timing(btnPulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(btnPulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])).start();
    }
    Animated.loop(Animated.timing(ring1, { toValue: 1, duration: 11000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(ring2, { toValue: 1, duration:  7500, useNativeDriver: true })).start();
  }, []);

  const r1 = ring1.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] });
  const r2 = ring2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg']   });

  return (
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
          <LinearGradient colors={['rgba(255,255,255,0.13)', 'rgba(255,255,255,0)']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 0.35 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
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
            <LinearGradient colors={[character.color + '55', character.color + '25']} style={[cd.avatar, { borderColor: character.color + '90' }]}>
              <Text style={cd.emoji}>{character.emoji}</Text>
            </LinearGradient>
          </View>
          <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />
          <Text style={[cd.gameName, { color: character.color, fontSize: gameNameSize, lineHeight: gameNameSize * 1.25 }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.45}>
            {character.gameName}
          </Text>
          <View style={[cd.divider, { backgroundColor: character.color + '90' }]} />
          <Text style={[cd.charName, { color: character.color }]}>{character.name}</Text>
          <Text style={cd.charTitle}>{character.title.toUpperCase()}</Text>
          <Text style={cd.catchphrase} numberOfLines={2}>{character.catchphrase}</Text>
          {character.available ? (
            <Animated.View style={[cd.playBtnWrap, { transform: [{ scale: btnPulse }] }]}>
              <LinearGradient colors={[character.color + 'FF', character.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cd.playBtn}>
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
  shadow:      { position: 'absolute', top: 8, left: 8, right: 8, bottom: -14, borderRadius: 24, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.85, shadowRadius: 36, elevation: 24 },
  card:        { width: CARD_W, borderRadius: 24, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm, overflow: 'hidden', flexDirection: 'column' },
  topRow:      { alignItems: 'center', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  statusText:  { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  emojiWrap:   { alignItems: 'center', justifyContent: 'center', height: 88, marginBottom: 6 },
  halo:        { position: 'absolute', width: 88, height: 88, borderRadius: 44 },
  ringOuter:   { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1.5 },
  ringInner:   { position: 'absolute', width: 62, height: 62, borderRadius: 31, borderWidth: 1 },
  avatar:      { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  emoji:       { fontSize: 26 },
  divider:     { height: 2, borderRadius: 1, marginVertical: 4 },
  gameName:    { fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  charName:    { fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 6, marginBottom: 1 },
  charTitle:   { fontSize: 8, fontWeight: '700', letterSpacing: 2, color: colors.textMuted, textAlign: 'center', marginBottom: 6 },
  catchphrase: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: 16, marginBottom: 4 },
  playBtnWrap: { marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  playBtn:     { paddingVertical: 10, borderRadius: radius.full, alignItems: 'center' },
  playBtnText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 2 },
});

// ── GameCard — sélecteur web / natif ──────────────────────────────────
const GameCard = memo(function GameCard({ character, onPress, idx }) {
  if (Platform.OS === 'web') {
    return <ObsidianCard character={character} idx={idx} onPlay={() => onPress(character)} />;
  }
  return <GameCardNative character={character} onPress={onPress} />;
});

// ── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const starSlow   = useRef(new Animated.Value(0)).current;
  const starMid    = useRef(new Animated.Value(0)).current;
  const starFast   = useRef(new Animated.Value(0)).current;

  const rotRef       = useRef(0);
  const targetRef    = useRef(0);
  const dragStartRot = useRef(0);
  const isDragging   = useRef(false);
  const rafRef       = useRef(null);

  const [positions, setPositions] = useState(() => computePositions(0));
  const [activeIdx, setActiveIdx] = useState(0);

  const getFrontIdx = (rot) => {
    let best = 0, bestDepth = -Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.cos(rot + i * STEP);
      if (d > bestDepth) { bestDepth = d; best = i; }
    }
    return best;
  };

  const refresh = useCallback((rot) => { setPositions(computePositions(rot)); }, []);

  const animate = useCallback(() => {
    const cur  = rotRef.current;
    const tgt  = targetRef.current;
    const diff = tgt - cur;
    if (Math.abs(diff) < 0.001) {
      rotRef.current = tgt;
      refresh(tgt);
      setActiveIdx(getFrontIdx(tgt));
      return;
    }
    // Lerp légèrement plus rapide pour le ressenti mobile
    rotRef.current = cur + diff * 0.17;
    refresh(rotRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [refresh]);

  const navigateCard = useCallback((dir) => {
    const current = Math.round(rotRef.current / STEP) * STEP;
    targetRef.current = current + dir * STEP;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const snapToNearest = useCallback((velocityX = 0) => {
    const momentum    = velocityX * DRAG_FACTOR * 55;
    const raw         = rotRef.current + momentum;
    targetRef.current = Math.round(raw / STEP) * STEP;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onMoveShouldSetPanResponder:         (_, gs) => Math.abs(gs.dx) > 4,
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
      onPanResponderRelease:   (_, gs) => { isDragging.current = false; snapToNearest(gs.vx); },
      onPanResponderTerminate: ()      => { isDragging.current = false; snapToNearest(0); },
    })
  ).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const runStar = (anim, dur) =>
      Animated.loop(Animated.timing(anim, { toValue: -SH, duration: dur, useNativeDriver: true, easing: Easing.linear })).start();
    runStar(starSlow, 30000);
    runStar(starMid,  18000);
    runStar(starFast,  9000);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleSelectGame = (character) => {
    const routes = {
      undercover: 'UndercoverSetup', quiz: 'QuizSetup', amitie: 'AmitieSetup',
      personality: 'PersonalitySetup', cineflash: 'CineFlashSetup', emojiquiz: 'EmojiQuizSetup',
      motdepasse: 'MotDePasseSetup', blindtest: 'BlindTestSetup', vote: 'VoteSetup',
      mime: 'MimeSetup', buzzer: 'BuzzerSetup', tribunal: 'TribunalSetup',
    };
    if (routes[character.game]) navigation.navigate(routes[character.game]);
  };

  const sortedIndices = [...Array(N).keys()].sort((a, b) => positions[a].depth - positions[b].depth);
  const starLayers = [{ stars: STAR_L1, anim: starSlow }, { stars: STAR_L2, anim: starMid }, { stars: STAR_L3, anim: starFast }];

  return (
    <LinearGradient colors={['#050410', '#0A0820', '#050410']} style={s.container}>

      {/* Nébuleuses spatiales (web) */}
      {Platform.OS === 'web' && (
        <>
          <View {...{ className: 'sdl-nebula sdl-nebula-1' }} pointerEvents="none" style={s.nebula} />
          <View {...{ className: 'sdl-nebula sdl-nebula-2' }} pointerEvents="none" style={s.nebula} />
          <View {...{ className: 'sdl-nebula sdl-nebula-3' }} pointerEvents="none" style={s.nebula} />
        </>
      )}

      {/* Étoiles filantes */}
      {starLayers.map(({ stars, anim }, li) => (
        <Animated.View key={li} pointerEvents="none"
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

      {/* Cylindre 3D */}
      <View style={s.stageWrapper}>
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
                <GameCard character={char} onPress={handleSelectGame} idx={i} />
              </View>
            );
          })}
        </View>
        <View style={s.arrowOverlay} pointerEvents="box-none">
          <TouchableOpacity onPress={() => navigateCard(+1)} style={s.arrowBtn} activeOpacity={0.7}>
            <Text style={s.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateCard(-1)} style={s.arrowBtn} activeOpacity={0.7}>
            <Text style={s.arrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dots */}
      <Animated.View style={[s.dots, { opacity: headerAnim }]}>
        {characters.map((c, i) => (
          <View key={c.id} style={[
            s.dot,
            i === activeIdx
              ? { width: 22, backgroundColor: characters[activeIdx]?.color ?? colors.primary }
              : { width: 6,  backgroundColor: 'rgba(255,255,255,0.20)' },
          ]} />
        ))}
      </Animated.View>

      {Platform.OS === 'web' && (
        <Animated.View style={[s.hintWrap, { opacity: headerAnim }]}>
          <Text {...{ className: 'sdl-hint' }} style={s.hintText}>
            cliquer pour jouer · glisser ou ‹ › pour naviguer
          </Text>
        </Animated.View>
      )}

      <AdBanner />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  nebula:       { position: 'absolute' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn:      { width: 70 },
  backBtnText:  { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:        { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  subtitle:     { fontSize: 12, color: colors.primaryLight, letterSpacing: 2, marginTop: -2 },
  countLine:    { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: spacing.xs },
  stageWrapper: { flex: 1, position: 'relative' },
  stage:        { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...Platform.select({ web: { cursor: 'grab', userSelect: 'none' } }) },
  arrowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  arrowBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  arrowText:    { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34, marginTop: -2 },
  cardSlot:     { position: 'absolute' },
  dots:         { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 },
  dot:          { height: 6, borderRadius: 3, ...Platform.select({ web: { transition: 'width 0.3s ease, background-color 0.3s ease' } }) },
  hintWrap:     { alignItems: 'center', paddingBottom: 8 },
  hintText:     { fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: 1 },
});
