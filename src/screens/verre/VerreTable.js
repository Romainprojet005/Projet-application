import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

// ── Table du Verre maudit, vue de dessus ──────────────────────────────
// Table ovale au centre (verre, gorgées, actions), joueurs assis autour,
// et une flèche qui tourne autour de la table jusqu'au joueur dont c'est le tour.

const ACCENT      = '#7E62E0';
const ACCENT_DARK = '#5B3FB8';
const GOLD        = '#E6C766';
const SEAT_W      = 78;           // largeur d'une étiquette de joueur
const GLASS_FULL  = 10;           // gorgées pour un verre plein (au-delà il déborde)

// Place n°i autour de la table : on part du haut et on tourne dans le sens des aiguilles d'une montre
const seatAngle = (i, n) => -Math.PI / 2 + (2 * Math.PI * i) / n;

function Glass({ sips, compact }) {
  const level = useRef(new Animated.Value(Math.min(1, sips / GLASS_FULL))).current;
  const plus  = useRef(new Animated.Value(0)).current;
  const prev  = useRef(sips);

  useEffect(() => {
    Animated.spring(level, { toValue: Math.min(1, sips / GLASS_FULL), friction: 6, tension: 60, useNativeDriver: false }).start();
    if (sips > prev.current) {
      plus.setValue(0);
      Animated.timing(plus, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    }
    prev.current = sips;
  }, [sips]);

  return (
    <View style={[styles.glassWrap, compact && { height: 46 }]}>
      <View style={[styles.glass, compact && { width: 34, height: 42 }]}>
        <Animated.View style={[styles.liquid, { height: level.interpolate({ inputRange: [0, 1], outputRange: ['8%', '96%'] }) }]} />
      </View>
      <Animated.Text
        style={[styles.plusOne, {
          opacity: plus.interpolate({ inputRange: [0, .15, .7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: plus.interpolate({ inputRange: [0, 1], outputRange: [6, -26] }) }],
        }]}
      >
        +1
      </Animated.Text>
    </View>
  );
}

// Angle de la flèche, animé : elle avance toujours dans le même sens autour de la table
function useArrowAngle(target) {
  const [angle, setAngle] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    let to = target;
    while (to < cur.current - 1e-6) to += 2 * Math.PI;
    const from = cur.current, t0 = Date.now(), dur = 520;
    let raf;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      cur.current = from + (to - from) * e;
      setAngle(cur.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return angle;
}

export default function VerreTable({
  playerNames, alive, activeIdx, glass, totalSips, canChallenge,
  onChallenge, onDrink, onPass,
}) {
  const { width: W, height: H } = useWindowDimensions();
  const n = playerNames.length;

  // Dimensions : ovale vertical qui occupe la place disponible
  const areaW = Math.min(W, 520) - 16;
  const areaH = Math.max(430, Math.min(H - 200, 660));
  const seatRx = areaW / 2 - SEAT_W / 2 - 2;
  const seatRy = areaH / 2 - 22;
  const tableRx = seatRx - SEAT_W / 2 - 18;
  const tableRy = seatRy - 44;
  const arrowRx = tableRx + 9, arrowRy = tableRy + 9;

  const t = useArrowAngle(seatAngle(activeIdx, n));
  const ax = arrowRx * Math.cos(t), ay = arrowRy * Math.sin(t);
  const towardX = seatRx * Math.cos(t) - ax, towardY = seatRy * Math.sin(t) - ay;
  const arrowDeg = (Math.atan2(towardY, towardX) * 180) / Math.PI;

  const btnW = Math.min(150, tableRx * 2 - 34);
  // Écran court (petit iPhone) : verre et boutons plus compacts pour rester dans l'ovale
  const compact = tableRy < 180;
  const btnH = compact ? 34 : 38;

  return (
    <View style={{ width: areaW, height: areaH }}>
      {/* Table */}
      <View style={[styles.table, {
        left: areaW / 2 - tableRx, top: areaH / 2 - tableRy, width: tableRx * 2, height: tableRy * 2,
        borderRadius: Platform.OS === 'web' ? '50%' : tableRx,
      }]}>
        <LinearGradient colors={['#221E3C', '#1A1730', '#120F24']} style={StyleSheet.absoluteFill} />
        <View style={styles.tableContent}>
          <Glass sips={glass} compact={compact} />
          <Text style={[styles.sipsValue, compact && { fontSize: 28, lineHeight: 32 }]}>{glass}</Text>
          <Text style={styles.sipsLabel}>gorgée{glass > 1 ? 's' : ''} dans le verre</Text>

          <View style={{ gap: compact ? 6 : 7, marginTop: compact ? 6 : 10 }}>
            {canChallenge && (
              <TouchableOpacity onPress={onChallenge} activeOpacity={0.85} accessibilityRole="button" style={[styles.btn, styles.btnChallenge, { width: btnW, height: btnH }]}>
                <Text style={[styles.btnText, { color: '#E6C766' }]}>Défier</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onDrink} activeOpacity={0.85} accessibilityRole="button" style={[styles.btn, styles.btnDrink, { width: btnW, height: btnH }]}>
              <Text style={[styles.btnText, { color: '#FF8A8A' }]}>Boire · {glass}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPass} activeOpacity={0.82} style={[styles.btn, styles.passBtn, { width: btnW, height: btnH }]}>
              <Text style={styles.btnText}>Passer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Flèche qui indique le joueur dont c'est le tour */}
      <View
        pointerEvents="none"
        style={[styles.arrow, { left: areaW / 2 + ax - 9, top: areaH / 2 + ay - 9, transform: [{ rotate: `${arrowDeg}deg` }] }]}
      >
        <View style={styles.arrowHead} />
      </View>

      {/* Joueurs autour de la table */}
      {playerNames.map((name, i) => {
        const a = seatAngle(i, n);
        const out = !alive.includes(i);
        const active = i === activeIdx;
        return (
          <View
            key={name + i}
            style={[styles.seat, out && styles.seatOut, active && styles.seatActive, {
              left: areaW / 2 + seatRx * Math.cos(a) - SEAT_W / 2,
              top: areaH / 2 + seatRy * Math.sin(a) - 21,
            }]}
          >
            <Text style={[styles.seatName, active && { color: '#1A1408' }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.seatSips, active && { color: '#3A2C08' }]}>{out ? 'éliminé' : `${totalSips[name]} gorgée${totalSips[name] > 1 ? 's' : ''}`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    position: 'absolute', overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(212,175,55,.55)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: .55, shadowRadius: 24, elevation: 12,
  },
  tableContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  glassWrap: { alignItems: 'center', justifyContent: 'flex-end', height: 62 },
  glass: {
    width: 42, height: 56, overflow: 'hidden', justifyContent: 'flex-end',
    borderWidth: 2, borderTopWidth: 0, borderColor: 'rgba(243,238,226,.6)',
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: 'rgba(255,255,255,.04)',
  },
  liquid: { width: '100%', backgroundColor: '#F59E0B', borderTopWidth: 3, borderTopColor: '#FDE68A' },
  plusOne: { position: 'absolute', top: 0, right: -26, fontSize: 18, fontWeight: '900', color: GOLD },

  sipsValue: { fontSize: 34, fontWeight: '900', color: GOLD, marginTop: 4, lineHeight: 38 },
  sipsLabel: { fontSize: 12, color: colors.textMuted },

  btn: { borderRadius: 99, overflow: 'hidden', alignSelf: 'center' },
  btnInner: { height: 38, alignItems: 'center', justifyContent: 'center' },
  btnChallenge: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.10)' },
  btnDrink: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FF8A8A', backgroundColor: 'rgba(255,138,138,0.12)' },
  passBtn: { height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6B6590' },
  btnText: { color: '#F3EEE2', fontSize: 14, fontFamily: 'Outfit_600SemiBold' },

  arrow: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  // Triangle pointant vers la droite (rotation = direction du joueur)
  arrowHead: {
    width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 15,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#D4AF37',
  },

  seat: {
    position: 'absolute', width: SEAT_W, height: 42, paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center', borderRadius: 12,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  seatActive: { backgroundColor: '#D4AF37', borderColor: '#F4DC8C' },
  seatOut: { opacity: .4 },
  seatName: { fontSize: 13, fontWeight: '800', color: colors.text, maxWidth: SEAT_W - 10 },
  seatSips: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginTop: 1 },
});
