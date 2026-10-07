import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radius } from '../theme';
import { OB_BG } from '../theme/obsidian';
import { characters } from '../data/characters';
import { BoosterFront } from '../components/BoosterCard';

// Web: inject fonts (partagé avec MenuScreen via même id)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('sdl-fonts')) {
    const lk = document.createElement('link');
    lk.id = 'sdl-fonts';
    lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Cinzel:wght@500;700&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap';
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

      /* Eco mode */
      body.sdl-eco .sdl-w-nebula { display: none !important; }
      .sdl-eco-btn {
        position: fixed; bottom: 14px; right: 14px;
        width: 32px; height: 32px; border-radius: 16px;
        background: rgba(0,0,0,0.40); border: 1px solid rgba(255,255,255,0.15);
        font-size: 14px; cursor: pointer; z-index: 9999;
        display: flex; align-items: center; justify-content: center; padding: 0;
        transition: background .2s, border-color .2s;
      }
      .sdl-eco-btn.active { background: rgba(34,197,94,0.18); border-color: rgba(34,197,94,0.4); }

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

const IS_MOBILE_WEB = Platform.OS === 'web' &&
  (typeof window !== 'undefined' ? window.innerWidth < 600 : false);
const WIN_H = typeof window !== 'undefined' ? window.innerHeight : 800;

// ── Accueil web : éventail de cartes booster ─────────────────────────
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-welcome-v2-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-welcome-v2-css';
  st.textContent = `
    .sdl-wl { position: relative; z-index: 1; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
      display: flex; color: #efeaf8; font-family: 'Outfit', system-ui, sans-serif; }
    .sdl-wl > * { animation: sdl-wl-in .8s cubic-bezier(.2,.8,.2,1) both; }
    .sdl-wl > *:nth-child(2) { animation-delay: .15s; }
    @keyframes sdl-wl-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

    /* Mobile : une colonne */
    .sdl-wl.m { flex-direction: column; align-items: center; justify-content: space-between;
      padding: 40px 24px 28px; gap: 12px; text-align: center; }
    .sdl-wl.m .sdl-wl-head { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .sdl-wl.m .sdl-logo-title { font-size: 38px; letter-spacing: 4px; }
    .sdl-wl.m .sdl-logo-sub { font-size: 14px; letter-spacing: 6px; }

    /* PC : texte à gauche, éventail à droite */
    .sdl-wl.d { flex-direction: column; }
    .sdl-wl-nav { width: 100%; max-width: 1240px; margin: 0 auto; box-sizing: border-box; padding: 24px 32px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .sdl-wl-brand { display: flex; align-items: center; gap: 12px; font-family: 'Cinzel', Georgia, serif;
      font-weight: 700; font-size: 17px; letter-spacing: .14em; color: #F4DC8C; }
    .sdl-wl-brand .sdl-crown { font-size: 28px; }
    .sdl-wl-link { background: none; border: 1px solid rgba(212,175,55,.5); color: #F4DC8C; border-radius: 99px;
      padding: 12px 20px; font-family: 'Outfit', system-ui, sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; }
    .sdl-wl-link:hover { background: rgba(212,175,55,.1); }
    .sdl-wl-main { width: 100%; max-width: 1240px; margin: 0 auto; box-sizing: border-box; padding: 24px 32px 56px;
      flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 48px; }
    .sdl-wl-copy { flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 22px; }
    .sdl-wl-kicker { font-size: 13px; font-weight: 600; letter-spacing: .28em; color: #b3a8ff; }
    .sdl-wl-h1 { margin: 0; font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: clamp(44px, 6vw, 84px);
      line-height: .98; letter-spacing: .04em;
      background: linear-gradient(180deg, #FFFFFF 0%, #F4DC8C 60%, #D4AF37 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent; }

    .sdl-wl-tag { margin: 0; font-size: 15px; line-height: 1.55; color: #cfc8e6; max-width: 300px; }
    .sdl-wl.d .sdl-wl-tag { font-size: 18px; line-height: 1.6; max-width: 480px; }
    .sdl-wl-rule { width: 72px; height: 1px; margin-top: 8px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); }

    .sdl-wl-actions { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
    .sdl-wl.d .sdl-wl-actions { flex-direction: row; flex-wrap: wrap; width: auto; margin-top: 8px; }
    .sdl-wl-cta { position: relative; overflow: hidden; width: min(100%, 360px); height: 56px; padding: 0 34px;
      border: 0; border-radius: 99px; cursor: pointer;
      background: linear-gradient(180deg, #F4DC8C, #D4AF37 55%, #B8892A); color: #1a1408;
      font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 15px; letter-spacing: .14em;
      box-shadow: 0 10px 34px rgba(212,175,55,.38); transition: transform .15s, box-shadow .15s; }
    .sdl-wl.d .sdl-wl-cta { width: auto; height: 58px; font-size: 16px; }
    .sdl-wl-cta:hover { transform: translateY(-1px); box-shadow: 0 14px 40px rgba(212,175,55,.5); }
    .sdl-wl-cta::after { content: ''; position: absolute; top: 0; bottom: 0; left: -80px; width: 60px;
      background: rgba(255,255,255,.4); transform: skewX(-20deg); animation: sdl-wl-shine 3.2s ease-in-out infinite; }
    @keyframes sdl-wl-shine { 0%, 55% { left: -80px; } 100% { left: 110%; } }

    /* Éventail */
    .sdl-fan { position: relative; perspective: 1000px; flex: none; }
    .sdl-wl.d .sdl-fan { flex: 1 1 480px; min-width: 0; height: 560px; perspective: 1200px; }
    .sdl-fan-aura { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); border-radius: 50%;
      pointer-events: none; background: radial-gradient(circle, rgba(124,58,237,.45) 0%, transparent 62%); }
    .sdl-fan-card { position: absolute; left: 50%; top: 46%; }
    .sdl-fan-card.center { -webkit-box-reflect: below 10px linear-gradient(transparent 70%, rgba(255,255,255,.25)); }
    body.sdl-eco .sdl-fan-card.center { -webkit-box-reflect: none; }
    body.sdl-eco .sdl-wl-cta::after { display: none; }
  `;
  document.head.appendChild(st);
}

const FAN_W = Math.max(130, Math.min(190, Math.round((WIN_H - 520) * 210 / 310)));

function pick(game) {
  const i = characters.findIndex(c => c.game === game);
  return { c: characters[Math.max(0, i)], i: Math.max(0, i) };
}

function Fan({ desktop }) {
  // [jeu, largeur, transform, luminosité]
  const W = desktop ? 260 : FAN_W;
  const cards = desktop
    ? [
        ['oracle',     210, 'translate3d(-190px, 20px, -200px) rotateY(28deg)',  .5],
        ['buzzer',     210, 'translate3d(190px, 20px, -200px) rotateY(-28deg)',  .5],
        ['undercover', 236, 'translate3d(-120px, 0, -60px) rotateY(16deg) rotateZ(-4deg)', .75],
        ['cineflash',  236, 'translate3d(120px, 0, -60px) rotateY(-16deg) rotateZ(4deg)',  .75],
        ['blindtest',  260, 'none', 1],
      ]
    : [
        ['undercover', Math.round(W * .9), `translate3d(${-Math.round(W * .55)}px, ${Math.round(W * .1)}px, -120px) rotateY(24deg) rotateZ(-6deg)`, .7],
        ['cineflash',  Math.round(W * .9), `translate3d(${Math.round(W * .55)}px, ${Math.round(W * .1)}px, -120px) rotateY(-24deg) rotateZ(6deg)`,  .7],
        ['blindtest',  W, 'none', 1],
      ];
  const boxH = desktop ? 560 : Math.round(W * 310 / 210 + W * 0.45);
  const auraS = desktop ? 520 : W * 2.6;
  return (
    <div className="sdl-fan" aria-hidden="true" style={desktop ? undefined : { width: '100%', height: boxH }}>
      <div className="sdl-fan-aura" style={{ width: auraS, height: auraS }} />
      {cards.map(([game, w, tf, br], k) => {
        const { c, i } = pick(game);
        return (
          <div
            key={game}
            className={`sdl-fan-card${k === cards.length - 1 ? ' center' : ''}`}
            style={{
              transform: `translate(-50%, -50%) ${tf === 'none' ? '' : tf}`,
              filter: br < 1 ? `brightness(${br})` : undefined,
              top: desktop ? '44%' : '42%',
            }}
          >
            <BoosterFront character={c} idx={i} width={w} />
          </div>
        );
      })}
    </div>
  );
}

function WelcomeWeb({ onStart }) {
  const nGames = characters.filter(c => c.available).length;
  if (IS_MOBILE_WEB) {
    return (
      <div className="sdl-wl m">
        <div className="sdl-wl-head">
          <span className="sdl-crown">♛</span>
          <div className="sdl-logo-title">LA SOIRÉE</div>
          <div className="sdl-logo-sub">DES LÉGENDES</div>
          <div className="sdl-wl-rule" />
          <p className="sdl-wl-tag">{nGames} jeux de soirée, chacun incarné par sa légende. Choisissez votre carte.</p>
        </div>
        <Fan />
        <div className="sdl-wl-actions">
          <button className="sdl-wl-cta" onClick={onStart}>♛  COMMENCER LA SOIRÉE</button>
          <span className="sdl-version">v1.0 · Bêta</span>
        </div>
      </div>
    );
  }
  return (
    <div className="sdl-wl d">
      <div className="sdl-wl-nav">
        <div className="sdl-wl-brand"><span className="sdl-crown">♛</span>LA SOIRÉE DES LÉGENDES</div>
        <button className="sdl-wl-link" onClick={onStart}>Les {nGames} jeux</button>
      </div>
      <div className="sdl-wl-main">
        <div className="sdl-wl-copy">
          <span className="sdl-wl-kicker">{nGames} JEUX · 1 À 12 JOUEURS</span>
          <h1 className="sdl-wl-h1">La Soirée<br />des Légendes</h1>
          <p className="sdl-wl-tag">Chaque jeu est une carte, chaque carte une légende. Ouvrez la collection, choisissez votre aventure et lancez la soirée.</p>
          <div className="sdl-wl-actions">
            <button className="sdl-wl-cta" onClick={onStart}>♛  COMMENCER LA SOIRÉE</button>
            <span className="sdl-version">v1.0 · Bêta</span>
          </div>
        </div>
        <Fan desktop />
      </div>
    </div>
  );
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
  const [ecoMode, setEcoMode] = useState(() => {
    if (Platform.OS !== 'web') return false;
    try { return localStorage.getItem('sdl-eco') === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.body.classList.toggle('sdl-eco', ecoMode);
  }, [ecoMode]);

  const toggleEco = () => setEcoMode(v => {
    const next = !v;
    try { localStorage.setItem('sdl-eco', next ? '1' : '0'); } catch {}
    return next;
  });

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
      {!ecoMode && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
          {STARS.map(s => <Star key={s.id} data={s} />)}
        </Animated.View>
      )}

      {!ecoMode && <ShootingStar />}

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
      {Platform.OS === 'web' ? (
        <WelcomeWeb onStart={() => navigation.replace('Menu')} />
      ) : (
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
      )}

      {Platform.OS === 'web' && IS_MOBILE_WEB && (
        <button
          onClick={toggleEco}
          className={`sdl-eco-btn${ecoMode ? ' active' : ''}`}
          title={ecoMode ? 'Mode éco actif — appuyer pour désactiver' : 'Activer le mode éco'}
        >
          {ecoMode ? '🌿' : '🔋'}
        </button>
      )}

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
