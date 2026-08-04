import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { MIN_TOURS, MAX_TOURS } from '../../data/verreData';

const ACCENT       = '#BE123C';
const ACCENT_LIGHT = '#FDA4AF';
const ACCENT_DARK  = '#9F1239';
const MAX_PLAYERS  = 10;

export default function VerreSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState(['', '', '']);
  const [inputFocus,  setInputFocus]  = useState(null);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer    = () => { if (playerNames.length < MAX_PLAYERS) setPlayerNames([...playerNames, '']); };
  const removePlayer = (i) => { if (playerNames.length > 2) setPlayerNames(playerNames.filter((_, j) => j !== i)); };
  const updatePlayer = (i, v) => { const n = [...playerNames]; n[i] = v; setPlayerNames(n); };

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart      = validPlayers.length >= 2 && new Set(validPlayers).size === validPlayers.length;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VerreGame', { playerNames: validPlayers });
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🥂</Text>
            <View>
              <Text style={styles.badgeName}>Le Croupier</Text>
              <Text style={styles.badgeQuote}>"Boire ou tenter le sort ?"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>LE VERRE MAUDIT</Text>
          <Text style={styles.pageSubtitle}>Bluffe, parie, et bois le moins possible</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: ACCENT + '35', backgroundColor: ACCENT + '15' }]}>
            <Text style={styles.rulesTitle}>🥂  Comment jouer</Text>
            <Text style={styles.rulesLine}>🎴  Chaque joueur reçoit une <Text style={styles.rulesAccent}>carte secrète (1-20)</Text> que lui seul voit</Text>
            <Text style={styles.rulesLine}>🍷  Le verre commence avec <Text style={styles.rulesAccent}>1 gorgée</Text></Text>
            <Text style={styles.rulesLine}>👉  À ton tour : <Text style={styles.rulesAccent}>bois le verre</Text>, <Text style={styles.rulesAccent}>passe</Text>, ou <Text style={styles.rulesAccent}>challenge</Text> un joueur</Text>
            <Text style={styles.rulesLine}>⚔️  Si tu challenges, parie que ta carte est <Text style={styles.rulesAccent}>plus haute</Text> ou <Text style={styles.rulesAccent}>plus basse</Text></Text>
            <Text style={styles.rulesLine}>🍺  Si un joueur boit (ou perd un duel), <Text style={styles.rulesAccent}>la manche se termine</Text> et de nouvelles cartes sont distribuées</Text>
            <Text style={styles.rulesLine}>🔄  Si tout le monde passe, le verre <Text style={styles.rulesAccent}>se remplit encore un peu</Text></Text>
            <Text style={styles.rulesLine}>🎲  Un nombre de tours est <Text style={styles.rulesAccent}>tiré au sort</Text> à chaque manche ({MIN_TOURS}-{MAX_TOURS})</Text>
            <Text style={styles.rulesLine}>🃏  Si personne n'a bu au bout de ces tours, les cartes sont <Text style={styles.rulesAccent}>révélées</Text> et la <Text style={styles.rulesAccent}>plus petite carte boit le verre</Text></Text>
            <Text style={styles.rulesLine}>🏆  À la fin, celui qui a <Text style={styles.rulesAccent}>bu le moins</Text> gagne !</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (min. 2)</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    value={name}
                    onChangeText={v => updatePlayer(i, v)}
                    placeholder={`Joueur ${i + 1}`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    onFocus={() => setInputFocus(i)}
                    onBlur={() => setInputFocus(null)}
                    maxLength={16}
                  />
                </View>
                {playerNames.length > 2 && (
                  <TouchableOpacity onPress={() => removePlayer(i)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {playerNames.length < MAX_PLAYERS && (
              <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Ajouter un joueur</Text>
              </TouchableOpacity>
            )}
            {validPlayers.length >= 2 && new Set(validPlayers).size !== validPlayers.length && (
              <Text style={styles.hint}>Deux joueurs ne peuvent pas avoir le même nom</Text>
            )}
          </View>

        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={!canStart}
            style={[styles.launchBtn, !canStart && { opacity: 0.4 }]}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[ACCENT, ACCENT_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>🥂  LANCER LA PARTIE !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll:    { paddingBottom: spacing.xl },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backBtn:     { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${ACCENT}20`, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${ACCENT}40`, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 2, textAlign: 'center' },
  pageSubtitle: { fontSize: 12, color: ACCENT_LIGHT, letterSpacing: 1, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard:   { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  rulesAccent: { color: ACCENT_LIGHT, fontWeight: '800' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.sm, gap: spacing.xs,
  },
  inputWrapFocus: { borderColor: ACCENT },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1, height: 44, color: colors.text, fontSize: 15, fontWeight: '600',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  removeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  removeBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  addBtn: {
    marginTop: spacing.xs, paddingVertical: spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: `${ACCENT}50`, borderRadius: radius.md, borderStyle: 'dashed',
  },
  addBtnText: { color: ACCENT_LIGHT, fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText:     { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 2 },
});
