import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { getPersonalities, buildChoices } from '../../data/personalityData';

const ORANGE = '#F97316';
const ORANGE_DARK = '#C2410C';
const ORANGE_LIGHT = '#FED7AA';
const BG = ['#1A0A00', '#2D1500', '#1A0A00'];

function shuffleTiles(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PersonalitySetupScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [players, setPlayers] = useState(['', '']);
  const [questionsCount, setQuestionsCount] = useState(10);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer = () => { if (players.length < 8) setPlayers([...players, '']); };
  const removePlayer = (idx) => { if (players.length > 2) setPlayers(players.filter((_, i) => i !== idx)); };
  const updatePlayer = (idx, text) => {
    const updated = [...players];
    updated[idx] = text;
    setPlayers(updated);
    if (error) setError('');
  };

  const handleLaunch = () => {
    const trimmed = players.map(p => p.trim());
    if (trimmed.some(p => !p)) {
      setError('Tous les joueurs doivent avoir un prénom !');
      return;
    }
    if (new Set(trimmed.map(n => n.toLowerCase())).size !== trimmed.length) {
      setError('Deux joueurs ne peuvent pas avoir le même prénom !');
      return;
    }
    const personalities = getPersonalities(questionsCount, filter);
    if (personalities.length < 4) {
      setError('Pas assez de personnalités dans ce filtre. Choisissez "Tous" ou augmentez la limite.');
      return;
    }
    // Pre-build choices and random tile reveal order for each personality
    const rounds = personalities.map(p => ({
      personality: p,
      choices: buildChoices(p, personalities.length >= 4 ? personalities : personalities),
      tileOrder: shuffleTiles(12),
    }));
    navigation.navigate('PersonalityGame', { players: trimmed, rounds });
  };

  const canLaunch = players.every(p => p.trim().length > 0);

  const FILTERS = [
    { key: 'all',           label: 'Tous',          emoji: '🌐' },
    { key: 'international', label: 'International',  emoji: '🌍' },
    { key: 'francais',      label: 'Français',       emoji: '🇫🇷' },
  ];

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
            <View style={styles.characterBadge}>
              <Text style={styles.characterEmoji}>🐭</Text>
              <Text style={styles.characterQuote}>"On ne les voit pas… mais on les reconnaît !"</Text>
            </View>
            <Text style={styles.title}>FLASH VISION</Text>
            <Text style={styles.subtitle}>Configuration du jeu</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Players */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👥 JOUEURS</Text>
              <Text style={styles.cardHint}>2 à 8 participants</Text>
              {players.map((name, idx) => (
                <View key={idx} style={styles.playerRow}>
                  <View style={[styles.playerBadge, { backgroundColor: ORANGE + '33' }]}>
                    <Text style={[styles.playerBadgeText, { color: ORANGE_LIGHT }]}>{idx + 1}</Text>
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={text => updatePlayer(idx, text)}
                    placeholder={`Joueur ${idx + 1}`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.playerInput}
                    maxLength={18}
                  />
                  {players.length > 2 && (
                    <TouchableOpacity onPress={() => removePlayer(idx)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {players.length < 8 && (
                <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
                  <Text style={[styles.addBtnText, { color: ORANGE_LIGHT }]}>+ Ajouter un joueur</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🌐 PERSONNALITÉS</Text>
              <View style={styles.filterRow}>
                {FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.filterBtn,
                      filter === f.key && { borderColor: ORANGE, backgroundColor: ORANGE + '22' },
                    ]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text style={styles.filterEmoji}>{f.emoji}</Text>
                    <Text style={[styles.filterLabel, filter === f.key && { color: ORANGE_LIGHT }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Questions count */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>❓ NOMBRE DE QUESTIONS</Text>
              <View style={styles.countRow}>
                {[5, 10, 15, 20].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.countBtn,
                      questionsCount === n && { borderColor: ORANGE, backgroundColor: ORANGE + '22' },
                    ]}
                    onPress={() => setQuestionsCount(n)}
                  >
                    <Text style={[styles.countNum, questionsCount === n && { color: ORANGE_LIGHT }]}>{n}</Text>
                    <Text style={styles.countLabel}>
                      {n === 5 ? 'Rapide' : n === 10 ? 'Normal' : n === 15 ? 'Long' : 'Maxi'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📋 RÉSUMÉ</Text>
              <SummaryRow label="Joueurs" value={`${players.length} joueurs`} color={ORANGE_LIGHT} />
              <SummaryRow
                label="Filtre"
                value={FILTERS.find(f => f.key === filter)?.emoji + ' ' + FILTERS.find(f => f.key === filter)?.label}
                color={ORANGE_LIGHT}
              />
              <SummaryRow label="Questions" value={`${questionsCount} célébrités`} color={ORANGE_LIGHT} />
            </View>

            {/* How to play */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📖 COMMENT JOUER</Text>
              <Text style={styles.rulesText}>
                Une <Text style={{ color: ORANGE_LIGHT }}>célébrité floue</Text> apparaît. Chaque
                bonne réponse rapporte des points selon l'étape (🥇3pts → 🥈2pts → 🥉1pt).{'\n\n'}
                Une question sur deux : seul un <Text style={{ color: ORANGE_LIGHT }}>fragment du visage</Text> est
                révélé (nez → bouche → yeux). À toi de deviner !
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLaunch}
              disabled={!canLaunch}
              style={{ marginBottom: spacing.xxl }}
            >
              <LinearGradient
                colors={canLaunch ? [ORANGE, ORANGE_DARK] : [colors.border, colors.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchBtn}
              >
                <Text style={[styles.launchBtnText, !canLaunch && { color: colors.textMuted }]}>
                  LANCER 👁️
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryKey}>{label}</Text>
      <Text style={[styles.summaryVal, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.md },
  backBtnText: { color: ORANGE_LIGHT, fontSize: 14, fontWeight: '600' },
  characterBadge: {
    alignItems: 'center',
    backgroundColor: ORANGE + '22',
    borderWidth: 1,
    borderColor: ORANGE + '55',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  characterEmoji: { fontSize: 40, marginBottom: 4 },
  characterQuote: { fontSize: 12, color: ORANGE_LIGHT, fontStyle: 'italic', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: ORANGE_LIGHT, letterSpacing: 2, marginBottom: 4 },
  cardHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },

  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  playerBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playerBadgeText: { fontSize: 14, fontWeight: '800' },
  playerInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  removeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: colors.textMuted, fontSize: 16 },
  addBtn: { paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  addBtnText: { fontSize: 14, fontWeight: '700' },

  filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  filterEmoji: { fontSize: 22 },
  filterLabel: { fontSize: 11, fontWeight: '700', color: colors.text },

  countRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  countBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countNum: { fontSize: 24, fontWeight: '900', color: colors.text },
  countLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryKey: { fontSize: 13, color: colors.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: '700' },

  rulesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  errorBox: {
    backgroundColor: colors.danger + '22',
    borderWidth: 1,
    borderColor: colors.danger + '55',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  launchBtn: {
    paddingVertical: spacing.md + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  launchBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
});
