import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';

const ACCENT       = '#14B8A6';
const ACCENT_LIGHT = '#99F6E4';
const ACCENT_DARK  = '#0F766E';
const MIN_PLAYERS  = 4;
const MAX_PLAYERS  = 10;
const ROUND_OPTIONS = [3, 5, 7];

export default function VeritesSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [rounds,      setRounds]      = useState(3);
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
  const removePlayer = (i) => { if (playerNames.length > MIN_PLAYERS) setPlayerNames(playerNames.filter((_, j) => j !== i)); };
  const updatePlayer = (i, v) => { const n = [...playerNames]; n[i] = v; setPlayerNames(n); };

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const uniqueNames  = new Set(validPlayers.map(n => n.toLowerCase())).size === validPlayers.length;
  const canStart     = validPlayers.length >= MIN_PLAYERS && uniqueNames;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VeritesGame', { playerNames: validPlayers, rounds });
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🤥</Text>
            <View>
              <Text style={styles.badgeName}>Pinocchio</Text>
              <Text style={styles.badgeQuote}>"Tout est vrai… mais pas forcément à toi."</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>VÉRITÉS VOLÉES</Text>
          <Text style={styles.pageSubtitle}>Tout le monde dit la vérité… mais pas toujours la sienne</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: ACCENT + '35', backgroundColor: ACCENT + '15' }]}>
            <Text style={styles.rulesTitle}>🤥  Comment jouer</Text>
            <Text style={styles.rulesLine}>📝  Chacun complète en secret le <Text style={styles.rulesAccent}>même début de phrase</Text>, en disant la vérité</Text>
            <Text style={styles.rulesLine}>🔀  Le jeu <Text style={styles.rulesAccent}>échange en secret</Text> les vérités de 2 joueurs</Text>
            <Text style={styles.rulesLine}>🗣️  Chacun lit « sa » vérité à voix haute — les 2 tricheurs doivent l'assumer et bluffer</Text>
            <Text style={styles.rulesLine}>🗳️  Au vote final, chacun désigne <Text style={styles.rulesAccent}>2 suspects</Text></Text>
            <Text style={styles.rulesLine}>⭐  <Text style={styles.rulesAccent}>+1 pt</Text> par tricheur démasqué · tricheur : <Text style={styles.rulesAccent}>+1 pt</Text> par joueur berné</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (min. {MIN_PLAYERS})</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>{i === 0 ? '🤥' : '👤'}</Text>
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
                {playerNames.length > MIN_PLAYERS && (
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
            {validPlayers.length < MIN_PLAYERS && (
              <Text style={styles.hint}>Remplissez au moins {MIN_PLAYERS} noms pour commencer</Text>
            )}
            {validPlayers.length >= MIN_PLAYERS && !uniqueNames && (
              <Text style={styles.hint}>Deux joueurs ont le même nom</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🔁  Nombre de manches</Text>
            <View style={styles.roundRow}>
              {ROUND_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRounds(r)}
                  style={[styles.roundBtn, rounds === r && styles.roundBtnActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roundBtnText, rounds === r && styles.roundBtnTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
              <Text style={styles.launchText}>🤥  QUE LE BLUFF COMMENCE !</Text>
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

  pageTitle:    { fontSize: 28, fontWeight: '700', fontFamily: 'Cinzel_700Bold', color: colors.text, letterSpacing: 3, textAlign: 'center' },
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
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },

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

  roundRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  roundBtn: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  roundBtnActive:     { backgroundColor: ACCENT + '30', borderColor: ACCENT },
  roundBtnText:       { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
  roundBtnTextActive: { color: colors.text },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText:     { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 2 },
});
