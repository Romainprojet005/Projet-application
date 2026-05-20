import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';

const ACCENT       = '#F59E0B';
const ACCENT_LIGHT = '#FDE68A';
const ACCENT_DARK  = '#D97706';
const ROUND_OPTIONS = [3, 5, 8, 10];
const MAX_PLAYERS   = 8;

export default function TrouveLaRegleSetupScreen({ navigation }) {
  const [roundCount,   setRoundCount]   = useState(5);
  const [playerNames,  setPlayerNames]  = useState(['', '', '']);
  const [inputFocus,   setInputFocus]   = useState(null);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer    = () => { if (playerNames.length < MAX_PLAYERS) setPlayerNames([...playerNames, '']); };
  const removePlayer = (i) => { if (playerNames.length > 3) setPlayerNames(playerNames.filter((_, j) => j !== i)); };
  const updatePlayer = (i, v) => { const n = [...playerNames]; n[i] = v; setPlayerNames(n); };

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= 3;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('TrouveLaRegleGame', { roundCount, playerNames: validPlayers });
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🕵️</Text>
            <View>
              <Text style={styles.badgeName}>Columbo</Text>
              <Text style={styles.badgeQuote}>"Il y a juste une dernière chose…"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>TROUVE LA RÈGLE</Text>
          <Text style={styles.pageSubtitle}>Observe, déduis, démasque la règle secrète</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: ACCENT + '35', backgroundColor: ACCENT + '15' }]}>
            <Text style={styles.rulesTitle}>🕵️  Comment jouer</Text>
            <Text style={styles.rulesLine}>👋  Un joueur (le détective) <Text style={styles.rulesAccent}>quitte la pièce</Text></Text>
            <Text style={styles.rulesLine}>📜  L'app révèle une <Text style={styles.rulesAccent}>règle secrète</Text> aux autres</Text>
            <Text style={styles.rulesLine}>🗣️  Exemple : "terminer chaque phrase par une question"</Text>
            <Text style={styles.rulesLine}>🔔  Le détective revient et <Text style={styles.rulesAccent}>pose des questions</Text> libres</Text>
            <Text style={styles.rulesLine}>💡  Il doit deviner la règle parmi 4 propositions</Text>
            <Text style={styles.rulesLine}>⚡  Moins de questions = plus de points !</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🔄  Nombre de manches</Text>
            <View style={styles.pillRow}>
              {ROUND_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRoundCount(n)}
                  style={[styles.pill, roundCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillText, roundCount === n && styles.pillTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (min. 3)</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>{i === 0 ? '🕵️' : '👤'}</Text>
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
                {playerNames.length > 3 && (
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
            {!canStart && (
              <Text style={styles.hint}>Remplissez au moins 3 noms pour commencer</Text>
            )}
          </View>

          <View style={[styles.summaryCard, { borderColor: ACCENT + '30', backgroundColor: ACCENT + '12' }]}>
            <Text style={styles.summaryTitle}>📋  Résumé</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Manches</Text>
              <Text style={styles.summaryValue}>{roundCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Joueurs</Text>
              <Text style={styles.summaryValue}>{validPlayers.length >= 3 ? validPlayers.length : '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Points max</Text>
              <Text style={styles.summaryValue}>{roundCount * 3} pts</Text>
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
              <Text style={styles.launchText}>🕵️  LANCER L'ENQUÊTE !</Text>
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

  pageTitle:    { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 3 },
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

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  pillActive:     { backgroundColor: `${ACCENT}30`, borderColor: ACCENT },
  pillText:       { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  pillTextActive: { color: ACCENT_LIGHT },

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

  summaryCard:  { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 2 },
});
