import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { getQuestions } from '../../data/amitieQuestions';

import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
const ROSE       = GOLD;
const ROSE_DARK  = GOLD_DARK;
const ROSE_LIGHT = GOLD_LIGHT;
const BG         = OB_BG;

export default function AmitieSetupScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [players, setPlayers] = useState(['', '']);
  const [mode, setMode] = useState('amitie');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer = () => {
    if (players.length < 6) setPlayers([...players, '']);
  };

  const removePlayer = (idx) => {
    if (players.length > 2) setPlayers(players.filter((_, i) => i !== idx));
  };

  const updatePlayer = (idx, text) => {
    const updated = [...players];
    updated[idx] = text;
    setPlayers(updated);
    if (error) setError('');
  };

  const handleLaunch = () => {
    const trimmed = players.map((p) => p.trim());
    if (trimmed.some((p) => !p)) {
      setError('Tous les joueurs doivent avoir un prénom !');
      return;
    }
    const uniqueNames = new Set(trimmed.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== trimmed.length) {
      setError('Deux joueurs ne peuvent pas avoir le même prénom !');
      return;
    }
    const questions = getQuestions(mode, questionsCount);
    navigation.navigate('AmitieGame', { players: trimmed, mode, questions });
  };

  const canLaunch = players.every((p) => p.trim().length > 0);

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <PageScroll
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
            <View style={styles.characterBadge}>
              <Text style={styles.characterEmoji}>🦊</Text>
              <Text style={styles.characterQuote}>"Les meilleurs amis pour toujours !"</Text>
            </View>
            <Text style={styles.title}>TEST DU LIEN</Text>
            <Text style={styles.subtitle}>Configuration du test</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Players Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👥 JOUEURS</Text>
              <Text style={styles.cardHint}>2 à 6 participants</Text>

              {players.map((name, idx) => (
                <View key={idx} style={styles.playerRow}>
                  <View style={[styles.playerBadge, { backgroundColor: ROSE + '33' }]}>
                    <Text style={[styles.playerBadgeText, { color: ROSE_LIGHT }]}>{idx + 1}</Text>
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={(text) => updatePlayer(idx, text)}
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

              {players.length < 6 && (
                <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
                  <Text style={[styles.addBtnText, { color: ROSE_LIGHT }]}>+ Ajouter un joueur</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Mode Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🎯 MODE DE JEU</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeBtn,
                    mode === 'amitie' && { borderColor: ROSE, backgroundColor: ROSE + '22' },
                  ]}
                  onPress={() => setMode('amitie')}
                >
                  <Text style={styles.modeEmoji}>🤝</Text>
                  <Text style={[styles.modeName, mode === 'amitie' && { color: ROSE_LIGHT }]}>
                    Amitié
                  </Text>
                  <Text style={styles.modeDesc}>Entre amis</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeBtn,
                    mode === 'couple' && { borderColor: ROSE, backgroundColor: ROSE + '22' },
                  ]}
                  onPress={() => setMode('couple')}
                >
                  <Text style={styles.modeEmoji}>💑</Text>
                  <Text style={[styles.modeName, mode === 'couple' && { color: ROSE_LIGHT }]}>
                    Couple
                  </Text>
                  <Text style={styles.modeDesc}>En amoureux</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Questions Count */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>❓ NOMBRE DE QUESTIONS</Text>
              <View style={styles.countRow}>
                {[5, 10, 15].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.countBtn,
                      questionsCount === n && { borderColor: ROSE, backgroundColor: ROSE + '22' },
                    ]}
                    onPress={() => setQuestionsCount(n)}
                  >
                    <Text style={[styles.countNum, questionsCount === n && { color: ROSE_LIGHT }]}>
                      {n}
                    </Text>
                    <Text style={styles.countLabel}>
                      {n === 5 ? 'Rapide' : n === 10 ? 'Standard' : 'Long'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📋 RÉSUMÉ</Text>
              <SummaryRow label="Joueurs" value={`${players.length} participants`} color={ROSE_LIGHT} />
              <SummaryRow
                label="Mode"
                value={mode === 'amitie' ? '🤝 Amitié' : '💑 Couple'}
                color={ROSE_LIGHT}
              />
              <SummaryRow label="Questions" value={`${questionsCount} questions`} color={ROSE_LIGHT} />
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Launch */}
            <TouchableOpacity
              onPress={handleLaunch}
              disabled={!canLaunch}
              style={{ marginBottom: spacing.xxl }}
            >
              <LinearGradient
                colors={canLaunch ? GOLD_GRADIENT : [colors.border, colors.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchBtn}
              >
                <Text style={[styles.launchBtnText, !canLaunch && { color: colors.textMuted }]}>
                  LANCER LE TEST 💝
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </PageScroll>
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
  backBtnText: { color: ROSE_LIGHT, fontSize: 14, fontWeight: '600' },
  characterBadge: {
    alignItems: 'center',
    backgroundColor: ROSE + '22',
    borderWidth: 1,
    borderColor: ROSE + '55',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  characterEmoji: { fontSize: 40, marginBottom: 4 },
  characterQuote: {
    fontSize: 12,
    color: ROSE_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ROSE_LIGHT,
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  playerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: colors.textMuted, fontSize: 16 },
  addBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addBtnText: { fontSize: 14, fontWeight: '700' },

  modeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeEmoji: { fontSize: 28, marginBottom: 4 },
  modeName: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 2 },
  modeDesc: { fontSize: 11, color: colors.textMuted },

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
  countNum: { fontSize: 28, fontWeight: '900', color: colors.text },
  countLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryKey: { fontSize: 13, color: colors.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: '700' },

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
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  launchBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: LAUNCH_TEXT,
    letterSpacing: 2,
  },
});
