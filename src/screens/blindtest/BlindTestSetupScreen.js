import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { CATEGORIES, getSongsCount } from '../../data/blindTestSongs';

const BEAT       = '#10B981';
const BEAT_DARK  = '#059669';
const BEAT_LIGHT = '#6EE7B7';

const ROUND_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS  = [30, null]; // null = infini
const MAX_PLAYERS = 6;

export default function BlindTestSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]   = useState('france');
  const [songCount, setSongCount]     = useState(10);
  const [timeLimit, setTimeLimit]     = useState(30);
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [inputFocus, setInputFocus]   = useState(null);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer    = () => { if (playerNames.length < MAX_PLAYERS) setPlayerNames([...playerNames, '']); };
  const removePlayer = (i) => { if (playerNames.length > 1) setPlayerNames(playerNames.filter((_, j) => j !== i)); };
  const updatePlayer = (i, v) => { const n = [...playerNames]; n[i] = v; setPlayerNames(n); };

  const activeCat = CATEGORIES.find(c => c.id === categoryId) ?? CATEGORIES[0];
  const available = getSongsCount(categoryId);

  const handleStart = () => {
    const validNames = playerNames.map(n => n.trim()).filter(Boolean);
    navigation.navigate('BlindTestGame', { songCount, playerNames: validNames, timeLimit, categoryId });
  };

  return (
    <LinearGradient colors={['#001A0F', '#00110A', '#001A0F']} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎸</Text>
            <View>
              <Text style={styles.badgeName}>Marty McFly</Text>
              <Text style={styles.badgeQuote}>"Cette chanson va faire danser vos grands-parents !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>BLIND TEST</Text>
          <Text style={styles.pageSubtitle}>Reconnaissez les tubes avant le buzzer</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* ── Catégorie ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎵  Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {CATEGORIES.map(cat => {
                const active = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.catPill,
                      active && { backgroundColor: cat.color + '30', borderColor: cat.color },
                    ]}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catText, active && { color: cat.color, fontWeight: '800' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Règles ── */}
          <View style={[styles.rulesCard, { borderColor: activeCat.color + '35', backgroundColor: activeCat.color + '18' }]}>
            <Text style={styles.rulesTitle}>🎯  Comment jouer</Text>
            {timeLimit === null ? (
              <>
                <Text style={styles.rulesLine}>∞  Pas de limite de temps</Text>
                <Text style={styles.rulesLine}>✅  <Text style={styles.rulesPoints}>1 pt</Text>  si la chanson est trouvée</Text>
              </>
            ) : (
              <>
                <Text style={styles.rulesLine}>⏱  0 → {Math.round(timeLimit / 3)} s  →  <Text style={styles.rulesPoints}>3 pts</Text></Text>
                <Text style={styles.rulesLine}>⏱  {Math.round(timeLimit / 3)} → {Math.round(timeLimit * 2 / 3)} s  →  <Text style={styles.rulesPoints}>2 pts</Text></Text>
                <Text style={styles.rulesLine}>⏱  {Math.round(timeLimit * 2 / 3)} → {timeLimit} s  →  <Text style={styles.rulesPoints}>1 pt</Text></Text>
              </>
            )}
            <Text style={styles.rulesNote}>
              {timeLimit === null
                ? "Cliquez ▶ pour lancer l'extrait, puis tapez le titre. Appuyez sur \"Je ne sais pas\" pour passer."
                : "Cliquez ▶ pour lancer l'extrait, puis tapez le titre. Plus vite = plus de points !"}
            </Text>
          </View>

          {/* ── Temps ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⏱  Temps par chanson</Text>
            <View style={styles.pillRow}>
              {TIME_OPTIONS.map(t => (
                <TouchableOpacity
                  key={t ?? 'inf'}
                  onPress={() => setTimeLimit(t)}
                  style={[styles.pill, timeLimit === t && styles.pillActive]}
                >
                  <Text style={[styles.pillText, timeLimit === t && styles.pillTextActive]}>
                    {t === null ? '∞' : `${t} s`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Nb chansons ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎵  Nombre de chansons</Text>
            <View style={styles.pillRow}>
              {ROUND_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setSongCount(n)}
                  style={[styles.pill, songCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillText, songCount === n && styles.pillTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Joueurs ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (optionnel)</Text>
            <Text style={styles.cardHint}>Laissez vide pour jouer sans suivi des scores</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>🎸</Text>
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
                {playerNames.length > 1 && (
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
          </View>

          {/* ── Résumé ── */}
          <View style={[styles.summaryCard, { borderColor: activeCat.color + '30', backgroundColor: activeCat.color + '15' }]}>
            <Text style={styles.summaryTitle}>📋  Résumé</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Catégorie</Text>
              <Text style={styles.summaryValue}>{activeCat.emoji}  {activeCat.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Chansons</Text>
              <Text style={styles.summaryValue}>{songCount} / {available} disponibles</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Temps</Text>
              <Text style={styles.summaryValue}>{timeLimit === null ? 'Infini ∞' : `${timeLimit} s`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Joueurs</Text>
              <Text style={styles.summaryValue}>{playerNames.filter(n => n.trim()).length || 'Mode libre'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Max points</Text>
              <Text style={styles.summaryValue}>{timeLimit === null ? `${songCount} pts` : `${songCount * 3} pts`}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity onPress={handleStart} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.launchGradient}>
              <Text style={styles.launchText}>🎸  QUE LA MUSIQUE COMMENCE !</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('BlindMultiSetup')}
            style={styles.multiBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.multiBtnText}>📱  Mode multi-téléphones</Text>
          </TouchableOpacity>
        </Animated.View>

      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { paddingBottom: spacing.xl },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backBtn:     { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backBtnText: { color: BEAT_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${BEAT}20`, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${BEAT}40`, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  pageSubtitle: { fontSize: 12, color: BEAT_LIGHT, letterSpacing: 1.5, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  // Catégorie
  catRow:  { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1,
    backgroundColor: colors.surface, borderColor: colors.border,
  },
  catEmoji: { fontSize: 16 },
  catText:  { fontSize: 13, fontWeight: '600', color: colors.textMuted },

  // Règles
  rulesCard: {
    borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1,
  },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  rulesPoints: { color: BEAT_LIGHT, fontWeight: '800' },
  rulesNote:   { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  cardHint:  { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  pillActive:     { backgroundColor: `${BEAT}30`, borderColor: BEAT },
  pillText:       { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  pillTextActive: { color: BEAT_LIGHT },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.sm, gap: spacing.xs,
  },
  inputWrapFocus: { borderColor: BEAT },
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
    borderWidth: 1, borderColor: `${BEAT}50`, borderRadius: radius.md, borderStyle: 'dashed',
  },
  addBtnText: { color: BEAT_LIGHT, fontSize: 13, fontWeight: '600' },

  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: BEAT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 2 },

  multiBtn: {
    marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: BEAT + '55', borderRadius: radius.full,
  },
  multiBtnText: { color: BEAT_LIGHT, fontSize: 14, fontWeight: '700' },
});
