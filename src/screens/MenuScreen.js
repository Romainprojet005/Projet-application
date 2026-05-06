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
const IS_DESKTOP_WEB = Platform.OS === 'web' && !IS_MOBILE_WEB;

const CARD_W = IS_MOBILE_WEB ? Math.min(SW * 0.52, 210)
             : IS_DESKTOP_WEB ? 280
             : Math.min(SW * 0.75, 300);
const CARD_H = IS_MOBILE_WEB ? Math.min(Math.round(CARD_W * 1.55), SH - 210)
             : IS_DESKTOP_WEB ? 420
             : Math.min(Math.round(CARD_W * 1.55), SH - 210);

const RADIUS = IS_MOBILE_WEB ? 300
             : IS_DESKTOP_WEB ? 560
             : CARD_W / (2 * Math.tan(Math.PI / N)) * 1.15;

const STEP = (2 * Math.PI) / N;
const DRAG_FACTOR = STEP / (IS_MOBILE_WEB ? CARD_W * 0.5 : CARD_W);

// ── Calcul position d'une carte ──────────────────────────────────────
function cardPos(rot, i) {
  const alpha = rot + i * STEP;
  const cosA  = Math.cos(alpha);
  const sinA  = Math.sin(alpha);
  const t     = (cosA + 1) / 2;
  if (IS_DESKTOP_WEB || IS_MOBILE_WEB) {
    return {
      x:     RADIUS * sinA,
      y:     (IS_DESKTOP_WEB ? -28 : -16) * t,
      z:     RADIUS * (cosA - 1),
      sc:    0.5 + 0.5 * t,
      op:    0.25 + 0.75 * t,
      ry:    alpha * 180 / Math.PI,
      depth: cosA,
    };
  }
  const sc = 0.28 + 0.72 * t;
  const op = 0.18 + 0.82 * t;
  return {
    x: RADIUS * sinA, z: 0, depth: cosA, sc, op,
    ry: alpha * 180 / Math.PI,
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
  if (!document.getElementById('sdl-menu-css-v2')) {
    const st = document.createElement('style');
    st.id = 'sdl-menu-css-v2';
    st.textContent = `
      /* === Carousel stage === */
      .sdl-stage {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
        cursor: grab; user-select: none; -webkit-user-select: none;
        perspective: 1400px;
        transform-style: preserve-3d;
      }
      .sdl-stage.grabbing { cursor: grabbing; }

      /* Slot GPU layer */
      .sdl-slot {
        position: absolute;
        will-change: transform, opacity;
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;
        transition: opacity 0.2s ease;
      }

      /* === Flip card wrapper === */
      .sdl-flip-card {
        position: relative;
        cursor: pointer;
      }

      /* Face / dos crossfade (pas de backface-visibility — problèmes de z-index) */
      .sdl-front, .sdl-back-face {
        transition: opacity 0.35s ease;
        border-radius: 18px;
      }
      .sdl-flip-card:not(.is-flipped) .sdl-back-face {
        opacity: 0; pointer-events: none; position: absolute; inset: 0;
      }
      .sdl-flip-card.is-flipped .sdl-front {
        opacity: 0; pointer-events: none; transition-delay: 0s;
      }
      .sdl-flip-card:not(.is-flipped) .sdl-front {
        opacity: 1; transition-delay: 0.35s;
      }
      .sdl-flip-card.is-flipped .sdl-back-face {
        opacity: 1; pointer-events: auto; transition-delay: 0.35s;
        position: absolute; inset: 0;
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

      /* === Carte Obsidienne (face) === */
      .ob-front {
        background:
          radial-gradient(ellipse at 50% 0%, color-mix(in oklab,var(--accent) 22%,transparent), transparent 62%),
          linear-gradient(180deg, #14101F 0%, #0A0815 60%, #0F0A1F 100%);
        border: 1px solid rgba(212,175,55,.28);
        box-shadow: 0 50px 120px rgba(0,0,0,.9),
                    0 20px 40px rgba(0,0,0,.6),
                    0 0 0 1px rgba(212,175,55,.07),
                    inset 0 1px 0 rgba(255,255,255,.04);
        padding: 22px 20px 18px;
        font-family: 'Cormorant Garamond', Georgia, serif;
        color: #F8E9C8;
        display: flex; flex-direction: column;
        border-radius: 18px; overflow: hidden; position: relative;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
        transition: border-color .25s ease, box-shadow .25s ease;
      }
      .ob-front:hover {
        border-color: rgba(212,175,55,.55);
        box-shadow: 0 60px 140px rgba(0,0,0,.95), 0 25px 50px rgba(0,0,0,.7),
                    0 0 0 1px rgba(212,175,55,.2),
                    0 0 40px rgba(212,175,55,.12), inset 0 1px 0 rgba(255,255,255,.06);
      }
      .ob-unavailable { opacity:.52; }

      .ob-grain { position:absolute; inset:0; pointer-events:none; opacity:.5;
        background-image: radial-gradient(circle at 20% 30%,rgba(212,175,55,.08) 1px,transparent 1.5px),
                          radial-gradient(circle at 80% 70%,rgba(255,255,255,.04) 1px,transparent 1.5px);
        background-size: 40px 40px,60px 60px; }
      .ob-corner { position:absolute; width:28px; height:28px; border-color:#D4AF37; }
      .ob-corner.tl { top:10px; left:10px; border-top:1.5px solid; border-left:1.5px solid; }
      .ob-corner.tr { top:10px; right:10px; border-top:1.5px solid; border-right:1.5px solid; }
      .ob-corner.bl { bottom:10px; left:10px; border-bottom:1.5px solid; border-left:1.5px solid; }
      .ob-corner.br { bottom:10px; right:10px; border-bottom:1.5px solid; border-right:1.5px solid; }
      .ob-header { display:flex; align-items:center; justify-content:center; gap:10px;
        font-family:'JetBrains Mono','Courier New',monospace; font-size:10px; letter-spacing:3px;
        color:#D4AF37; margin-bottom:6px; position:relative; z-index:1; }
      .ob-dot { width:4px; height:4px; background:#D4AF37; border-radius:50%; display:inline-block; }
      .ob-emoji-frame { position:relative; width:110px; height:110px; margin:12px auto 8px;
        display:flex; align-items:center; justify-content:center;
        border:1.5px solid #D4AF37; border-radius:50%; z-index:1; }
      .ob-emoji-frame::before { content:''; position:absolute; inset:-8px;
        border:1px solid rgba(212,175,55,.3); border-radius:50%; }
      .ob-frame-glow { position:absolute; inset:4px; border-radius:50%;
        background:radial-gradient(circle,color-mix(in oklab,var(--accent) 30%,transparent),transparent 70%);
        filter:blur(8px); }
      .ob-emoji { font-size:56px; position:relative; z-index:1; line-height:1;
        filter:drop-shadow(0 0 12px rgba(212,175,55,.4)); }
      .ob-name-block { text-align:center; margin:4px 0 8px; position:relative; z-index:1; }
      .ob-rule { height:1px; background:linear-gradient(90deg,transparent,#D4AF37,transparent); margin:6px 0; }
      .ob-name { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; font-style:italic;
        font-size:22px; color:#F8E9C8; letter-spacing:.5px; line-height:1.1; }
      .ob-title { font-family:'JetBrains Mono','Courier New',monospace; font-size:9px;
        letter-spacing:2.5px; color:rgba(212,175,55,.7); margin-top:4px; text-transform:uppercase; }
      .ob-game { text-align:center; font-family:'Cinzel',Georgia,serif; font-weight:700;
        font-size:18px; letter-spacing:4px; color:#D4AF37; text-shadow:0 0 10px rgba(212,175,55,.3);
        margin:6px 0 10px; position:relative; z-index:1; }
      .ob-meta { display:flex; align-items:center; justify-content:center; gap:18px;
        margin-top:auto; padding-top:10px; position:relative; z-index:1; }
      .ob-meta-cell { display:flex; flex-direction:column; align-items:center; gap:2px; }
      .ob-meta-label { font-family:'JetBrains Mono','Courier New',monospace; font-size:8px;
        letter-spacing:2px; color:rgba(212,175,55,.6); }
      .ob-meta-value { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600;
        font-size:16px; color:#F8E9C8; }
      .ob-meta-divider { width:1px; height:24px; background:rgba(212,175,55,.3); }
      .ob-soon { position:absolute; inset:0; background:rgba(5,4,16,.62); border-radius:18px;
        display:flex; align-items:center; justify-content:center; z-index:20; }
      .ob-soon-badge { font-family:'JetBrains Mono','Courier New',monospace; font-size:9px;
        letter-spacing:3px; color:rgba(255,255,255,.45);
        border:1px solid rgba(255,255,255,.18); padding:6px 14px; border-radius:999px; }

      /* === Dos Obsidien === */
      .ob-back {
        background: radial-gradient(circle at 50% 50%, #2A1A4A 0%, #0F0A1F 60%, #050410 100%);
        border: 1px solid rgba(212,175,55,.25);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      .bo-pattern {
        position: absolute; inset: 0;
        background-image:
          repeating-linear-gradient(45deg, rgba(212,175,55,.04) 0 1px, transparent 1px 14px),
          repeating-linear-gradient(-45deg, rgba(212,175,55,.04) 0 1px, transparent 1px 14px);
        pointer-events: none;
      }
      .bo-pattern::after {
        content: ''; position: absolute; inset: 30px;
        border: 1px solid rgba(212,175,55,.2); border-radius: 6px;
      }
      .bo-center { text-align: center; position: relative; z-index: 1; }
      .bo-monogram {
        display: flex; justify-content: center; align-items: center; gap: 4px;
        font-family: 'Cinzel', serif; font-weight: 700; font-size: 78px; line-height: 1;
        filter: drop-shadow(0 2px 12px rgba(212,175,55,.3));
      }
      .bo-mono-l, .bo-mono-r {
        background: linear-gradient(180deg, #F4DC8C 0%, #D4AF37 50%, #8B6914 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .bo-mono-l { transform: translateY(-2px); }
      .bo-mono-r { transform: translateY(2px); }
      .bo-rule {
        height: 1px; width: 140px; margin: 16px auto;
        background: linear-gradient(90deg, transparent, #D4AF37, transparent);
      }
      .bo-tag {
        font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 5px; color: #D4AF37;
      }
      .bo-tag-fr {
        font-family: 'Cormorant Garamond', serif; font-style: italic;
        font-size: 11px; letter-spacing: 1.5px; color: rgba(212,175,55,.6); margin-top: 8px;
      }

      /* Nav arrows */
      .sdl-nav {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 48px; height: 48px; border-radius: 50%;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.18);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        color: #fff; font-size: 28px; font-weight: 300; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 50; transition: background .2s, border-color .2s;
      }
      .sdl-nav:hover { background: rgba(255,255,255,.12); border-color: rgba(212,175,55,.5); }
      .sdl-nav-prev { left: 40px; }
      .sdl-nav-next { right: 40px; }

      /* Dots */
      .sdl-dots { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 0 6px; }
      .sdl-dot { height:7px; border-radius:4px; background:rgba(255,255,255,.20);
        border:none; cursor:pointer; padding:0; transition:width .3s,background .3s; }
      .sdl-dot.active { width:26px; box-shadow:0 0 10px var(--accent,#D4AF37); }

      /* Meta */
      .sdl-meta { display:flex; flex-direction:column; align-items:center; gap:8px; padding-bottom:10px; }
      .sdl-meta-line {
        display:flex; align-items:center; gap:12px;
        font-family:'JetBrains Mono','Courier New',monospace;
        font-size:11px; letter-spacing:3px;
      }
      .sdl-meta-idx { color:rgba(255,255,255,.45); }
      .sdl-meta-sep { color:rgba(255,255,255,.25); }
      .sdl-meta-game { font-weight:700; }
      .sdl-meta-hint {
        font-family:'JetBrains Mono','Courier New',monospace;
        font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,.32);
      }

      @media (max-width: 768px) {
        .sdl-nav-prev { left: 8px; }
        .sdl-nav-next { right: 8px; }
      }
      @media (max-width: 600px) {
        .sdl-stage { perspective: 800px; }
        .sdl-meta-hint { display: none; }
      }
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
// Native : couche unique allégée (moins de Views)
const STAR_NATIVE = makeStarLayer(12, 2.5);

// ── Carte Obsidienne — face ────────────────────────────────────────────
function ObsidianFront({ character, idx }) {
  const n = String(idx + 1).padStart(2, '0');
  return (
    <div
      className={`ob-front sdl-front${!character.available ? ' ob-unavailable' : ''}`}
      style={{ '--accent': character.color, width: CARD_W, height: CARD_H }}
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

// ── Carte Obsidienne — dos ────────────────────────────────────────────
function ObsidianBack({ character }) {
  return (
    <div
      className="ob-back sdl-back-face ob-grain"
      style={{ '--accent': character.color, width: CARD_W, height: CARD_H }}
    >
      <div className="ob-grain" />
      <div className="bo-pattern" />
      <div className="ob-corner tl" /><div className="ob-corner tr" />
      <div className="ob-corner bl" /><div className="ob-corner br" />
      <div className="bo-center">
        <div className="bo-monogram">
          <span className="bo-mono-l">S</span>
          <span className="bo-mono-r">L</span>
        </div>
        <div className="bo-rule" />
        <div className="bo-tag">LA SOIRÉE DES LÉGENDES</div>
        <div className="bo-tag-fr">— DOUZE LÉGENDES, UNE SEULE NUIT —</div>
      </div>
    </div>
  );
}

// ── Carte Obsidian native (reproduit fidèlement la version web) ───────
const OB_GOLD     = '#D4AF37';
const OB_CREAM    = '#F8E9C8';
const OB_BORDER   = 'rgba(212,175,55,0.28)';
const OB_GOLD_DIM = 'rgba(212,175,55,0.6)';
// Polices identiques au web (chargées via expo-font dans App.js)
const MONO   = Platform.OS !== 'web' ? 'JetBrainsMono_400Regular'          : 'monospace';
const SERIF  = Platform.OS !== 'web' ? 'CormorantGaramond_600SemiBold_Italic' : 'serif';
const CINZEL = Platform.OS !== 'web' ? 'Cinzel_700Bold'                    : 'serif';

const GameCardNative = memo(function GameCardNative({ character, idx, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const n = String(idx + 1).padStart(2, '0');

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        onPress={() => character.available && onPress(character)}
        onPressIn={() => { if (character.available) Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start(); }}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        activeOpacity={1}
        disabled={!character.available}
      >
        <LinearGradient
          colors={['#14101F', '#0A0815', '#0F0A1F']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={[ob.card, { width: CARD_W, height: CARD_H, opacity: character.available ? 1 : 0.52 }]}
        >
          {/* Halo de couleur accent en haut */}
          <View style={[ob.accentGlow, { backgroundColor: character.color }]} />

          {/* Coins dorés */}
          <View style={[ob.corner, ob.cTL]} />
          <View style={[ob.corner, ob.cTR]} />
          <View style={[ob.corner, ob.cBL]} />
          <View style={[ob.corner, ob.cBR]} />

          {/* En-tête N° XX · LÉGENDE */}
          <View style={ob.header}>
            <Text style={ob.headerTxt}>N° {n}</Text>
            <View style={ob.headerDot} />
            <Text style={ob.headerTxt}>LÉGENDE</Text>
          </View>

          {/* Cadre emoji circulaire avec anneau extérieur */}
          <View style={ob.emojiOuter}>
            <View style={ob.emojiRingOuter}>
              <View style={ob.emojiInner}>
                <View style={[ob.emojiGlow, { backgroundColor: character.color }]} />
                <Text style={ob.emojiTxt}>{character.emoji}</Text>
              </View>
            </View>
          </View>

          {/* Bloc nom avec filets dorés */}
          <View style={ob.nameBlock}>
            <LinearGradient colors={['transparent', OB_GOLD_DIM, 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={ob.rule} />
            <Text style={ob.charName}>{character.name}</Text>
            <Text style={ob.charTitle}>{character.title.toUpperCase()}</Text>
            <LinearGradient colors={['transparent', OB_GOLD_DIM, 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={ob.rule} />
          </View>

          {/* Nom du jeu */}
          <Text style={ob.gameName}>{character.gameName}</Text>

          {/* Espace flexible pour pousser la meta en bas */}
          <View style={{ flex: 1 }} />

          {/* Meta JOUEURS · DURÉE */}
          <View style={ob.meta}>
            <View style={ob.metaCell}>
              <Text style={ob.metaLabel}>JOUEURS</Text>
              <Text style={ob.metaVal}>{character.players || '2–12'}</Text>
            </View>
            <View style={ob.metaSep} />
            <View style={ob.metaCell}>
              <Text style={ob.metaLabel}>DURÉE</Text>
              <Text style={ob.metaVal}>{character.time || '15 min'}</Text>
            </View>
          </View>

          {/* Overlay "Bientôt" */}
          {!character.available && (
            <View style={ob.soonWrap}>
              <View style={ob.soonBadge}>
                <Text style={ob.soonTxt}>🔒  BIENTÔT</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ob = StyleSheet.create({
  card: {
    borderRadius: 18, borderWidth: 1, borderColor: OB_BORDER, overflow: 'hidden',
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, flexDirection: 'column',
    shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.85, shadowRadius: 36, elevation: 18,
  },
  accentGlow: { position: 'absolute', top: -24, left: '15%', right: '15%', height: 80, borderRadius: 40, opacity: 0.18 },
  corner:     { position: 'absolute', width: 28, height: 28 },
  cTL: { top: 10, left: 10, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: OB_GOLD },
  cTR: { top: 10, right: 10, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: OB_GOLD },
  cBL: { bottom: 10, left: 10, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: OB_GOLD },
  cBR: { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: OB_GOLD },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 },
  headerTxt:   { fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: OB_GOLD },
  headerDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: OB_GOLD },
  emojiOuter:  { alignItems: 'center', marginTop: 12, marginBottom: 8 },
  emojiRingOuter: { width: 126, height: 126, borderRadius: 63, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center', justifyContent: 'center' },
  emojiInner:  { width: 110, height: 110, borderRadius: 55, borderWidth: 1.5, borderColor: OB_GOLD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  emojiGlow:   { ...StyleSheet.absoluteFillObject, opacity: 0.28 },
  emojiTxt:    { fontSize: 52, lineHeight: 60 },
  nameBlock:   { alignItems: 'center', marginBottom: 6 },
  rule:        { height: 1, alignSelf: 'stretch', marginVertical: 6 },
  charName:    { fontFamily: SERIF, fontSize: 22, color: OB_CREAM, letterSpacing: 0.5, textAlign: 'center', lineHeight: 26 },
  charTitle:   { fontFamily: MONO, fontSize: 9, letterSpacing: 2.5, color: 'rgba(212,175,55,0.7)', textAlign: 'center', marginTop: 4 },
  gameName:    { fontFamily: CINZEL, fontSize: 17, letterSpacing: 4, color: OB_GOLD, textAlign: 'center' },
  meta:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)' },
  metaCell:    { alignItems: 'center', gap: 2 },
  metaLabel:   { fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: 'rgba(212,175,55,0.6)' },
  metaVal:     { fontFamily: SERIF, fontSize: 16, color: OB_CREAM },
  metaSep:     { width: 1, height: 24, backgroundColor: 'rgba(212,175,55,0.3)' },
  soonWrap:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,4,16,0.65)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  soonBadge:   { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  soonTxt:     { fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.45)' },
});

// ── MenuScreen ────────────────────────────────────────────────────────
export default function MenuScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const starSlow   = useRef(new Animated.Value(0)).current;
  const starMid    = useRef(new Animated.Value(0)).current;
  const starFast   = useRef(new Animated.Value(0)).current;

  const rotRef       = useRef(0);
  const targetRef    = useRef(0);
  const rafRef       = useRef(null);
  const dragRafRef   = useRef(null);

  const cardSlotRefs = useRef({});
  const stageRef     = useRef(null);
  const dotsRef      = useRef({});
  const metaIdxRef   = useRef(null);
  const metaGameRef  = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [positions, setPositions] = useState(() => computePositions(0));
  const [flipped, setFlipped]     = useState({});

  // ── Mise à jour du carousel ───────────────────────────────────────
  const updateCarousel = useCallback((rot) => {
    if (Platform.OS === 'web') {
      characters.forEach((_, i) => {
        const el = cardSlotRefs.current[i];
        if (!el) return;
        const p = cardPos(rot, i);
        el.style.transform = `translate3d(${p.x}px, ${p.y ?? 0}px, ${p.z}px) scale(${p.sc}) rotateY(${p.ry}deg)`;
        el.style.opacity   = String(p.op);
        el.style.zIndex    = String(Math.round((p.depth + 1) * 100));
      });
    } else {
      setPositions(computePositions(rot));
    }
  }, []);

  // ── Animation lerp vers la cible ─────────────────────────────────
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

  // ── Pointeur (web) ───────────────────────────────────────────────
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
      webDrag.current.vx    = (e.clientX - webDrag.current.lastX) / dt;
      webDrag.current.lastX = e.clientX;
      webDrag.current.lastT = now;
    }
    rotRef.current = webDrag.current.startRot + (e.clientX - webDrag.current.startX) * DRAG_FACTOR;
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
    const dx = Math.abs(e.clientX - webDrag.current.startX);
    if (dx < 6) {
      const char = characters[getFrontIdx(rotRef.current)];
      if (char?.available) handleSelectGameRef.current?.(char);
      return;
    }
    snapToNearest(webDrag.current.vx);
  }, [snapToNearest]);

  // ── PanResponder (natif) ─────────────────────────────────────────
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

  // ── Clavier (web) ────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  navigateCard(+1);
      if (e.key === 'ArrowRight') navigateCard(-1);
      if (e.key === ' ') {
        e.preventDefault();
        const frontChar = characters[getFrontIdx(rotRef.current)];
        if (frontChar) setFlipped(f => ({ ...f, [frontChar.id]: !f[frontChar.id] }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigateCard]);

  // ── Positions initiales web ──────────────────────────────────────
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    updateCarousel(0);
  }, [updateCarousel]);

  // ── Animations ───────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const runStar = (anim, dur) =>
      Animated.loop(Animated.timing(anim, { toValue: -SH, duration: dur, useNativeDriver: true, easing: Easing.linear })).start();
    if (Platform.OS === 'web') {
      runStar(starSlow, 30000); runStar(starMid, 18000); runStar(starFast, 9000);
    } else {
      runStar(starSlow, 30000);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Dots DOM update ──────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    Object.entries(dotsRef.current).forEach(([idx, el]) => {
      if (!el) return;
      const i = Number(idx);
      if (i === activeIdx) {
        el.style.width      = '26px';
        el.style.background = characters[activeIdx]?.color ?? '#D4AF37';
        el.style.setProperty('--accent', characters[activeIdx]?.color ?? '#D4AF37');
        el.classList.add('active');
      } else {
        el.style.width      = '7px';
        el.style.background = 'rgba(255,255,255,0.20)';
        el.classList.remove('active');
      }
    });
    // Meta DOM update
    if (metaIdxRef.current) {
      metaIdxRef.current.textContent =
        String(activeIdx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    }
    if (metaGameRef.current) {
      const c = characters[activeIdx];
      metaGameRef.current.textContent = c?.gameName ?? '';
      metaGameRef.current.style.color = c?.color ?? '#D4AF37';
    }
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
  const handleSelectGameRef = useRef(null);
  handleSelectGameRef.current = handleSelectGame;

  const sortedIndices = Platform.OS !== 'web'
    ? [...Array(N).keys()].sort((a, b) => positions[a].depth - positions[b].depth).slice(-5)
    : [];

  const starLayers = Platform.OS === 'web'
    ? [{ stars: STAR_L1, anim: starSlow }, { stars: STAR_L2, anim: starMid }, { stars: STAR_L3, anim: starFast }]
    : [{ stars: STAR_NATIVE, anim: starSlow }];

  return (
    <LinearGradient colors={['#050410', '#0A0820', '#050410']} style={s.container}>

      {Platform.OS === 'web' && (
        <>
          <div className="sdl-nebula sdl-nebula-1" />
          <div className="sdl-nebula sdl-nebula-2" />
          <div className="sdl-nebula sdl-nebula-3" />
        </>
      )}

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
              >
                <div
                  className={`sdl-flip-card${flipped[char.id] ? ' is-flipped' : ''}`}
                  style={{ width: CARD_W, height: CARD_H }}
                >
                  <ObsidianFront character={char} idx={i} />
                  {IS_DESKTOP_WEB && <ObsidianBack character={char} />}
                </div>
              </div>
            ))}
            <button className="sdl-nav sdl-nav-prev" onClick={() => navigateCard(+1)}>‹</button>
            <button className="sdl-nav sdl-nav-next" onClick={() => navigateCard(-1)}>›</button>
          </div>
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
                  <GameCardNative character={char} idx={i} onPress={handleSelectGame} />
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
              style={{ width: i === 0 ? 26 : 7, background: i === 0 ? (c.color) : 'rgba(255,255,255,0.20)', '--accent': c.color }}
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

      {/* Meta (web) */}
      {Platform.OS === 'web' && (
        <div className="sdl-meta">
          <div className="sdl-meta-line">
            <span className="sdl-meta-idx" ref={metaIdxRef}>
              {String(1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </span>
            <span className="sdl-meta-sep">·</span>
            <span
              className="sdl-meta-game"
              ref={metaGameRef}
              style={{ color: characters[0]?.color }}
            >
              {characters[0]?.gameName}
            </span>
          </div>
          <span className="sdl-meta-hint">
            cliquer pour jouer · espace pour retourner · ← → pour naviguer
          </span>
        </div>
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
