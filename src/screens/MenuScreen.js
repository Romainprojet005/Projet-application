import React, {
  useRef, useEffect, useLayoutEffect, useState, useCallback, memo,
} from 'react';
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

// Cartes plus petites sur mobile pour laisser de l'espace entre elles
const CARD_W = IS_MOBILE_WEB ? Math.min(SW * 0.56, 200)
             : Platform.OS === 'web' ? 280
             : Math.min(SW * 0.75, 300);
const CARD_H = Math.round(CARD_W * 1.5);

// Rayon plus grand sur mobile → plus d'espace entre les cartes
const RADIUS = IS_MOBILE_WEB ? Math.max(SW * 1.05, 360)
             : Platform.OS === 'web' ? 490
             : CARD_W / (2 * Math.tan(Math.PI / N)) * 1.15;

const STEP = (2 * Math.PI) / N;

// Sensibilité du glisser
const DRAG_FACTOR = STEP / (IS_MOBILE_WEB ? CARD_W * 0.5 : CARD_W);

// ── Calcul position d'une carte pour une rotation donnée ─────────────
function cardPos(rot, i) {
  const alpha = rot + i * STEP;
  const cosA  = Math.cos(alpha);
  const sinA  = Math.sin(alpha);
  const t     = (cosA + 1) / 2; // 0 = derrière, 1 = devant
  // Sur mobile : falloff plus marqué → cartes latérales très petites/transparentes
  const pow = IS_MOBILE_WEB ? 2.2 : 1;
  const sc  = IS_MOBILE_WEB ? 0.12 + 0.88 * Math.pow(t, pow) : 0.28 + 0.72 * t;
  const op  = IS_MOBILE_WEB ? 0.05 + 0.95 * Math.pow(t, 2.8) : 0.18 + 0.82 * t;
  return {
    x:     RADIUS * sinA,
    depth: cosA,
    sc, op,
    ry:    alpha * 180 / Math.PI,
    z:     Math.round((cosA + 1) * 50),
  };
}

function computePositions(rot) {
  return characters.map((_, i) => cardPos(rot, i));
}

function getFrontIdx(rot) {
  let best = 0, bestD = -Infinity;
  for (let i = 0; i < N; i++) {
    const d = Math.cos(rot + i * STEP);
    if (d > bestD) { bestD = d; best = i; }
  }
  return best;
}

// ── CSS injection (web) ───────────────────────────────────────────────
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('sdl-fonts')) {
    const lk = document.createElement('link');
    lk.id = 'sdl-fonts'; lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Cinzel:wght@500;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(lk);
  }
  if (!document.getElementById('sdl-menu-css')) {
    const st = document.createElement('style');
    st.id = 'sdl-menu-css';
    st.textContent = `
      /* === Carousel stage === */
      .sdl-stage {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
        cursor: grab; user-select: none; -webkit-user-select: none;
        perspective: 900px;
      }
      .sdl-stage.grabbing { cursor: grabbing; }

      /* Slot GPU layer — will-change garantit un layer dédié */
      .sdl-slot {
        position: absolute;
        will-change: transform, opacity;
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;
      }

      /* === Nébuleuses === */
      .sdl-nebula {
        position: absolute; border-radius: 50%;
        filter: blur(80px); pointer-events: none;
        animation: sdl-drift 30s ease-in-out infinite alternate;
      }
      .sdl-nebula-1 { top:10%;  left:-10%; width:500px; height:500px; background:#7C3AED; opacity:.12; }
      .sdl-nebula-2 { top:50%;  right:-8%; width:400px; height:400px; background:#EC4899; opacity:.10; animation-delay:-10s; }
      .sdl-nebula-3 { bottom:-10%; left:30%; width:450px; height:450px; background:#0EA5E9; opacity:.10; animation-delay:-20s; }
      @keyframes sdl-drift { from{transform:translate(0,0)scale(1);} to{transform:translate(40px,-30px)scale(1.1);} }

      /* === Carte Obsidienne === */
      .ob-front {
        background:
          radial-gradient(ellipse at 50% 0%, color-mix(in oklab,var(--accent) 22%,transparent), transparent 62%),
          linear-gradient(180deg, #14101F 0%, #0A0815 60%, #0F0A1F 100%);
        border: 1px solid rgba(212,175,55,.28);
        box-shadow: 0 28px 70px rgba(0,0,0,.65),
                    0 0 0 1px rgba(212,175,55,.07),
                    inset 0 1px 0 rgba(255,255,255,.04);
        padding: 20px 18px 16px;
        font-family: 'Cormorant Garamond', Georgia, serif;
        color: #F8E9C8;
        display: flex; flex-direction: column;
        border-radius: 18px; overflow: hidden; position: relative;
        cursor: pointer;
        transition: border-color .25s ease, box-shadow .25s ease;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
      }
      .ob-front:hover {
        border-color: rgba(212,175,55,.55);
        box-shadow: 0 36px 90px rgba(0,0,0,.7), 0 0 0 1px rgba(212,175,55,.2),
                    0 0 28px rgba(212,175,55,.1), inset 0 1px 0 rgba(255,255,255,.06);
      }
      .ob-unavailable { cursor:default; opacity:.52; pointer-events:none; }

      .ob-grain { position:absolute; inset:0; pointer-events:none; opacity:.5;
        background-image: radial-gradient(circle at 20% 30%,rgba(212,175,55,.08) 1px,transparent 1.5px),
                          radial-gradient(circle at 80% 70%,rgba(255,255,255,.04) 1px,transparent 1.5px);
        background-size: 40px 40px,60px 60px; }
      .ob-corner { position:absolute; width:26px; height:26px; border-color:#D4AF37; }
      .ob-corner.tl { top:9px; left:9px; border-top:1.5px solid; border-left:1.5px solid; }
      .ob-corner.tr { top:9px; right:9px; border-top:1.5px solid; border-right:1.5px solid; }
      .ob-corner.bl { bottom:9px; left:9px; border-bottom:1.5px solid; border-left:1.5px solid; }
      .ob-corner.br { bottom:9px; right:9px; border-bottom:1.5px solid; border-right:1.5px solid; }
      .ob-header { display:flex; align-items:center; justify-content:center; gap:9px;
        font-family:'JetBrains Mono','Courier New',monospace; font-size:9px; letter-spacing:3px;
        color:#D4AF37; margin-bottom:5px; position:relative; z-index:1; }
      .ob-dot { width:4px; height:4px; background:#D4AF37; border-radius:50%; display:inline-block; }
      .ob-emoji-frame { position:relative; width:100px; height:100px; margin:10px auto 7px;
        display:flex; align-items:center; justify-content:center;
        border:1.5px solid #D4AF37; border-radius:50%; z-index:1; }
      .ob-emoji-frame::before { content:''; position:absolute; inset:-7px;
        border:1px solid rgba(212,175,55,.3); border-radius:50%; }
      .ob-frame-glow { position:absolute; inset:4px; border-radius:50;
        background:radial-gradient(circle,color-mix(in oklab,var(--accent) 30%,transparent),transparent 70%);
        filter:blur(8px); border-radius:50%; }
      .ob-emoji { font-size:50px; position:relative; z-index:1; line-height:1;
        filter:drop-shadow(0 0 10px rgba(212,175,55,.4)); }
      .ob-name-block { text-align:center; margin:3px 0 7px; position:relative; z-index:1; }
      .ob-rule { height:1px; background:linear-gradient(90deg,transparent,#D4AF37,transparent); margin:5px 0; }
      .ob-name { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; font-style:italic;
        font-size:20px; color:#F8E9C8; letter-spacing:.5px; line-height:1.1; }
      .ob-title { font-family:'JetBrains Mono','Courier New',monospace; font-size:8px;
        letter-spacing:2.5px; color:rgba(212,175,55,.7); margin-top:4px; text-transform:uppercase; }
      .ob-game { text-align:center; font-family:'Cinzel',Georgia,serif; font-weight:700;
        font-size:16px; letter-spacing:4px; color:#D4AF37; text-shadow:0 0 10px rgba(212,175,55,.3);
        margin:5px 0 9px; position:relative; z-index:1; }
      .ob-meta { display:flex; align-items:center; justify-content:center; gap:16px;
        margin-top:auto; padding-top:9px; position:relative; z-index:1; }
      .ob-meta-cell { display:flex; flex-direction:column; align-items:center; gap:2px; }
      .ob-meta-label { font-family:'JetBrains Mono','Courier New',monospace; font-size:7px;
        letter-spacing:2px; color:rgba(212,175,55,.6); }
      .ob-meta-value { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600;
        font-size:15px; color:#F8E9C8; }
      .ob-meta-divider { width:1px; height:22px; background:rgba(212,175,55,.3); }
      .ob-soon { position:absolute; inset:0; background:rgba(5,4,16,.62); border-radius:18px;
        display:flex; align-items:center; justify-content:center; z-index:20; }
      .ob-soon-badge { font-family:'JetBrains Mono','Courier New',monospace; font-size:9px;
        letter-spacing:3px; color:rgba(255,255,255,.45);
        border:1px solid rgba(255,255,255,.18); padding:6px 14px; border-radius:999px; }

      /* Nav arrows */
      .sdl-nav { position:absolute; top:50%; transform:translateY(-50%);
        width:44px; height:44px; border-radius:50%; border:1px solid rgba(255,255,255,.22);
        background:rgba(255,255,255,.08); backdrop-filter:blur(16px);
        color:#fff; font-size:28px; font-weight:300; line-height:1;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; z-index:50; transition:background .2s,border-color .2s; }
      .sdl-nav:hover { background:rgba(255,255,255,.14); border-color:rgba(212,175,55,.5); }
      .sdl-nav-prev { left:12px; }
      .sdl-nav-next { right:12px; }

      /* Dots */
      .sdl-dots { display:flex; align-items:center; justify-content:center; gap:7px; padding:10px 0; }
      .sdl-dot { height:6px; border-radius:3px; background:rgba(255,255,255,.2);
        border:none; cursor:pointer; padding:0; transition:width .3s,background .3s; }
      .sdl-dot.active { width:22px; box-shadow:0 0 8px var(--accent); }

      /* Hint */
      .sdl-hint { font-family:'JetBrains Mono','Courier New',monospace; font-size:10px;
        letter-spacing:1.5px; color:rgba(255,255,255,.28); display:block; text-align:center; padding-bottom:8px; }
    `;
    document.head.appendChild(st);
  }
}

// ── Étoiles (native) ──────────────────────────────────────────────────
function makeStarLayer(count, maxSize) {
  const base = Array.from({ length: count }, () => ({
    left: Math.random() * SW, top: Math.random() * SH,
    size: Math.random() * maxSize + 0.5,
    op:   Math.random() * 0.45 + 0.12,
  }));
  return [...base.map((s, i) => ({ ...s, id: i })),
          ...base.map((s, i) => ({ ...s, id: i + count, top: s.top + SH }))];
}
const STAR_L1 = makeStarLayer(30, 1.5);
const STAR_L2 = makeStarLayer(18, 2.2);
const STAR_L3 = makeStarLayer(10, 3.2);

// ── Carte Obsidienne (web, sans flip) ─────────────────────────────────
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

// ── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const starSlow   = useRef(new Animated.Value(0)).current;
  const starMid    = useRef(new Animated.Value(0)).current;
  const starFast   = useRef(new Animated.Value(0)).current;

  // Rotation du cylindre
  const rotRef       = useRef(0);
  const targetRef    = useRef(0);
  const rafRef       = useRef(null);
  const dragRafRef   = useRef(null);  // throttle drag sur web

  // DOM refs pour manipulation directe (web uniquement)
  const cardSlotRefs = useRef({});
  const stageRef     = useRef(null);
  const dotsRef      = useRef({});

  // State minimal : juste l'index actif (pour les dots et les positions natives)
  const [activeIdx, setActiveIdx] = useState(0);
  const [positions, setPositions] = useState(() => computePositions(0)); // natif seulement

  // ── Mise à jour du carousel ────────────────────────────────────────
  // Sur web : DOM direct → 0 re-render pendant l'animation
  // Sur natif : setState classique
  const updateCarousel = useCallback((rot) => {
    if (Platform.OS === 'web') {
      characters.forEach((_, i) => {
        const el = cardSlotRefs.current[i];
        if (!el) return;
        const p = cardPos(rot, i);
        el.style.transform = `translateX(${p.x}px) scale(${p.sc}) rotateY(${p.ry}deg)`;
        el.style.opacity    = p.op;
        el.style.zIndex     = p.z;
      });
    } else {
      setPositions(computePositions(rot));
    }
  }, []);

  // ── Animation lerp vers la cible ──────────────────────────────────
  const animate = useCallback(() => {
    const diff = targetRef.current - rotRef.current;
    if (Math.abs(diff) < 0.001) {
      rotRef.current = targetRef.current;
      updateCarousel(rotRef.current);
      setActiveIdx(getFrontIdx(rotRef.current));
      return;
    }
    rotRef.current += diff * 0.18;
    updateCarousel(rotRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [updateCarousel]);

  const navigateCard = useCallback((dir) => {
    targetRef.current = Math.round(rotRef.current / STEP) * STEP + dir * STEP;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const snapToNearest = useCallback((vx = 0) => {
    const momentum    = vx * DRAG_FACTOR * 55;
    targetRef.current = Math.round((rotRef.current + momentum) / STEP) * STEP;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // ── Gestionnaires pointer (web) ────────────────────────────────────
  const webDrag = useRef({ active: false, startX: 0, startRot: 0, lastX: 0, lastT: 0, vx: 0 });

  const onPtrDown = useCallback((e) => {
    webDrag.current = { active: true, startX: e.clientX, startRot: rotRef.current, lastX: e.clientX, lastT: performance.now(), vx: 0 };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stageRef.current?.setPointerCapture?.(e.pointerId);
    stageRef.current?.classList.add('grabbing');
  }, []);

  const onPtrMove = useCallback((e) => {
    if (!webDrag.current.active) return;
    const now = performance.now();
    const dt  = now - webDrag.current.lastT;
    if (dt > 8) {
      webDrag.current.vx     = (e.clientX - webDrag.current.lastX) / dt;
      webDrag.current.lastX  = e.clientX;
      webDrag.current.lastT  = now;
    }
    rotRef.current = webDrag.current.startRot + (e.clientX - webDrag.current.startX) * DRAG_FACTOR;
    // Throttle: 1 DOM update par frame
    if (!dragRafRef.current) {
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        updateCarousel(rotRef.current);
      });
    }
  }, [updateCarousel]);

  const onPtrUp = useCallback((e) => {
    if (!webDrag.current.active) return;
    webDrag.current.active = false;
    stageRef.current?.releasePointerCapture?.(e.pointerId);
    stageRef.current?.classList.remove('grabbing');
    snapToNearest(webDrag.current.vx);
  }, [snapToNearest]);

  // ── PanResponder (natif) ──────────────────────────────────────────
  const dragStartRot = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onMoveShouldSetPanResponder:         (_, gs) => Math.abs(gs.dx) > 4,
      onPanResponderGrant: () => {
        dragStartRot.current = rotRef.current;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onPanResponderMove: (_, gs) => {
        rotRef.current = dragStartRot.current + gs.dx * DRAG_FACTOR;
        setPositions(computePositions(rotRef.current));
      },
      onPanResponderRelease:   (_, gs) => snapToNearest(gs.vx),
      onPanResponderTerminate: ()      => snapToNearest(0),
    })
  ).current;

  // ── Keyboard (web) ────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  navigateCard(+1);
      if (e.key === 'ArrowRight') navigateCard(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigateCard]);

  // ── Positions initiales web ───────────────────────────────────────
  // useLayoutEffect = synchrone avant le premier paint → pas de flash
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    updateCarousel(0);
  }, [updateCarousel]);

  // ── Démarrage animations ──────────────────────────────────────────
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const runStar = (anim, dur) =>
      Animated.loop(Animated.timing(anim, { toValue: -SH, duration: dur, useNativeDriver: true, easing: Easing.linear })).start();
    runStar(starSlow, 30000); runStar(starMid, 18000); runStar(starFast, 9000);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Mise à jour dots (couleur) ────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    Object.entries(dotsRef.current).forEach(([idx, el]) => {
      if (!el) return;
      const i = Number(idx);
      if (i === activeIdx) {
        el.style.width      = '22px';
        el.style.background = characters[activeIdx]?.color ?? '#D4AF37';
        el.style.setProperty('--accent', characters[activeIdx]?.color ?? '#D4AF37');
        el.classList.add('active');
      } else {
        el.style.width      = '7px';
        el.style.background = 'rgba(255,255,255,0.20)';
        el.classList.remove('active');
      }
    });
  }, [activeIdx]);

  const handleSelectGame = (character) => {
    const routes = {
      undercover: 'UndercoverSetup', quiz: 'QuizSetup', amitie: 'AmitieSetup',
      personality: 'PersonalitySetup', cineflash: 'CineFlashSetup', emojiquiz: 'EmojiQuizSetup',
      motdepasse: 'MotDePasseSetup', blindtest: 'BlindTestSetup', vote: 'VoteSetup',
      mime: 'MimeSetup', buzzer: 'BuzzerSetup', tribunal: 'TribunalSetup',
    };
    if (routes[character.game]) navigation.navigate(routes[character.game]);
  };

  // ── Tri z-order (natif) ───────────────────────────────────────────
  const sortedIndices = Platform.OS !== 'web'
    ? [...Array(N).keys()].sort((a, b) => positions[a].depth - positions[b].depth)
    : [];

  const starLayers = [{ stars: STAR_L1, anim: starSlow }, { stars: STAR_L2, anim: starMid }, { stars: STAR_L3, anim: starFast }];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#050410', '#0A0820', '#050410']} style={s.container}>

      {/* Nébuleuses web */}
      {Platform.OS === 'web' && (
        <>
          <div className="sdl-nebula sdl-nebula-1" />
          <div className="sdl-nebula sdl-nebula-2" />
          <div className="sdl-nebula sdl-nebula-3" />
        </>
      )}

      {/* Étoiles */}
      {starLayers.map(({ stars, anim }, li) => (
        <Animated.View key={li} pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SH * 2, transform: [{ translateY: anim }] }}
        >
          {stars.map(star => (
            <View key={star.id} style={{ position: 'absolute', top: star.top, left: star.left, width: star.size, height: star.size, borderRadius: star.size / 2, backgroundColor: '#FFF', opacity: star.op }} />
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

      {/* ══ CARROUSEL WEB ══ */}
      {Platform.OS === 'web' && (
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            ref={stageRef}
            className="sdl-stage"
            onPointerDown={onPtrDown}
            onPointerMove={onPtrMove}
            onPointerUp={onPtrUp}
            onPointerCancel={onPtrUp}
          >
            {characters.map((char, i) => (
              <div
                key={char.id}
                ref={(el) => { cardSlotRefs.current[i] = el; }}
                className="sdl-slot"
                style={{ marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2 }}
              >
                <ObsidianCard character={char} idx={i} onPlay={() => handleSelectGame(char)} />
              </div>
            ))}
          </div>
          <button className="sdl-nav sdl-nav-prev" onClick={() => navigateCard(+1)}>‹</button>
          <button className="sdl-nav sdl-nav-next" onClick={() => navigateCard(-1)}>›</button>
        </div>
      )}

      {/* ══ CARROUSEL NATIF ══ */}
      {Platform.OS !== 'web' && (
        <View style={s.stageWrapper}>
          <View style={s.stage} {...panResponder.panHandlers}>
            {sortedIndices.map(i => {
              const pos = positions[i];
              const char = characters[i];
              return (
                <View key={char.id} style={[s.cardSlot, {
                  transform: [{ perspective: 900 }, { translateX: pos.x }, { scale: pos.sc }, { rotateY: `${pos.ry}deg` }],
                  opacity: pos.op, zIndex: Math.round((pos.depth + 1) * 50),
                }]}>
                  <GameCardNative character={char} onPress={handleSelectGame} />
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
      )}

      {/* Dots */}
      {Platform.OS === 'web' ? (
        <div className="sdl-dots">
          {characters.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => { dotsRef.current[i] = el; }}
              className={`sdl-dot${i === 0 ? ' active' : ''}`}
              style={{ width: i === 0 ? 22 : 7, background: i === 0 ? (c.color) : 'rgba(255,255,255,0.20)', '--accent': c.color }}
              onClick={() => {
                targetRef.current = -i * STEP;
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(animate);
              }}
            />
          ))}
        </div>
      ) : (
        <Animated.View style={[s.dots, { opacity: headerAnim }]}>
          {characters.map((c, i) => (
            <View key={c.id} style={[s.dot, i === activeIdx
              ? { width: 22, backgroundColor: characters[activeIdx]?.color ?? colors.primary }
              : { width: 6,  backgroundColor: 'rgba(255,255,255,0.20)' }
            ]} />
          ))}
        </Animated.View>
      )}

      {Platform.OS === 'web' && (
        <span className="sdl-hint">cliquer pour jouer · glisser ou ← → pour naviguer</span>
      )}

      <AdBanner />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, ...Platform.select({ web: { height: '100vh', display: 'flex', flexDirection: 'column' } }) },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn:      { width: 70 },
  backBtnText:  { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:        { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  subtitle:     { fontSize: 12, color: colors.primaryLight, letterSpacing: 2, marginTop: -2 },
  countLine:    { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: spacing.xs },
  stageWrapper: { flex: 1, position: 'relative' },
  stage:        { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  arrowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  arrowBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  arrowText:    { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34, marginTop: -2 },
  cardSlot:     { position: 'absolute' },
  dots:         { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 10 },
  dot:          { height: 6, borderRadius: 3 },
});
