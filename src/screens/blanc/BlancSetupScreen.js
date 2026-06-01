import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { QUESTIONS, ANSWERS } from '../../data/blancMangerData';
import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';

const PRP       = colors.primary;
const PRP_LIGHT = colors.primaryLight;

export default function BlancSetupScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [players, setPlayers]   = useState(['', '', '']);
  const [category, setCategory] = useState('classique');
  const [rounds, setRounds]     = useState(10);
  const [error, setError]       = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer    = () => { if (players.length < 10) setPlayers([...players, '']); };
  const removePlayer = (i) => { if (players.length > 3) setPlayers(players.filter((_, j) => j !== i)); };
  const updatePlayer = (i, text) => {
    const u = [...players]; u[i] = text; setPlayers(u);
    if (error) setError('');
  };

  const handleLaunch = () => {
    const trimmed = players.map(p => p.trim());
    if (trimmed.some(p => !p)) { setError('Tous les joueurs doivent avoir un prénom !'); return; }
    const unique = new Set(trimmed.map(n => n.toLowerCase()));
    if (unique.size !== trimmed.length) { setError('Deux joueurs ne peuvent pas avoir le même prénom !'); return; }

    const pool = [...QUESTIONS[category]].sort(() => Math.random() - 0.5);
    const questions = pool.slice(0, Math.min(rounds, pool.length));

    navigation.navigate('BlancGame', { players: trimmed, category, totalRounds: questions.length, questions });
  };

  const canLaunch = players.every(p => p.trim().length > 0);

  const CATEGORIES = [
    { id: 'classique', emoji: '🃏', name: 'Classique', desc: 'Tout public' },
    { id: 'adulte',    emoji: '🔞', name: 'Adulte',    desc: '18+ sans filtre' },
  ];

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <PageScroll contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🃏</Text>
              <Text style={styles.badgeQuote}>"Plus c'est absurde, plus c'est drôle !"</Text>
            </View>
            <Text style={styles.title}>REMPLIS LE BLANC</Text>
            <Text style={styles.subtitle}>Configuration de la partie</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Joueurs */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👥 JOUEURS</Text>
              <Text style={styles.cardHint}>3 à 10 participants</Text>
              {players.map((name, i) => (
                <View key={i} style={styles.playerRow}>
                  <View style={[styles.playerBadge, { backgroundColor: PRP + '33' }]}>
                    <Text style={[styles.playerNum, { color: PRP_LIGHT }]}>{i + 1}</Text>
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={t => updatePlayer(i, t)}
                    placeholder={`Joueur ${i + 1}`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    maxLength={18}
                  />
                  {players.length > 3 && (
                    <TouchableOpacity onPress={() => removePlayer(i)} style={styles.removeBtn}>
                      <Text style={styles.removeTxt}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {players.length < 10 && (
                <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
                  <Text style={[styles.addTxt, { color: PRP_LIGHT }]}>+ Ajouter un joueur</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Catégorie */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🎯 CATÉGORIE</Text>
              <View style={styles.modeRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.modeBtn, category === c.id && { borderColor: PRP, backgroundColor: PRP + '22' }]}
                    onPress={() => setCategory(c.id)}
                  >
                    <Text style={styles.modeEmoji}>{c.emoji}</Text>
                    <Text style={[styles.modeName, category === c.id && { color: PRP_LIGHT }]}>{c.name}</Text>
                    <Text style={styles.modeDesc}>{c.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tours */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🔄 NOMBRE DE TOURS</Text>
              <View style={styles.countRow}>
                {[5, 10, 15].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.countBtn, rounds === n && { borderColor: PRP, backgroundColor: PRP + '22' }]}
                    onPress={() => setRounds(n)}
                  >
                    <Text style={[styles.countNum, rounds === n && { color: PRP_LIGHT }]}>{n}</Text>
                    <Text style={styles.countLabel}>{n === 5 ? 'Rapide' : n === 10 ? 'Standard' : 'Long'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Résumé */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📋 RÉSUMÉ</Text>
              <SummaryRow label="Joueurs"    value={`${players.length} joueurs`} />
              <SummaryRow label="Catégorie"  value={category === 'classique' ? '🃏 Classique' : '🔞 Adulte'} />
              <SummaryRow label="Tours"      value={`${rounds} tours`} />
              <SummaryRow label="Jury"       value="Tourne à chaque tour" />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTxt}>⚠️ {error}</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleLaunch} disabled={!canLaunch} style={{ marginBottom: spacing.xxl }}>
              <LinearGradient
                colors={canLaunch ? GOLD_GRADIENT : [colors.border, colors.surface]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.launchBtn}
              >
                <Text style={[styles.launchTxt, !canLaunch && { color: colors.textMuted }]}>
                  LANCER LA PARTIE 🃏
                </Text>
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
        </PageScroll>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryKey}>{label}</Text>
      <Text style={[styles.summaryVal, { color: colors.primaryLight }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll:     { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn:    { alignSelf: 'flex-start', marginBottom: spacing.md },
  backText:   { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  badge: {
    alignItems: 'center',
    backgroundColor: PRP + '22',
    borderWidth: 1,
    borderColor: PRP + '55',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  badgeEmoji:  { fontSize: 40, marginBottom: 4 },
  badgeQuote:  { fontSize: 12, color: colors.primaryLight, fontStyle: 'italic', textAlign: 'center' },
  title:       { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 4, marginBottom: 4 },
  subtitle:    { fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: colors.primaryLight, letterSpacing: 2, marginBottom: 4 },
  cardHint:  { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },

  playerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  playerBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playerNum:   { fontSize: 14, fontWeight: '800' },
  input: {
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
  removeBtn:  { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  removeTxt:  { color: colors.textMuted, fontSize: 16 },
  addBtn:     { paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  addTxt:     { fontSize: 14, fontWeight: '700' },

  modeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeEmoji: { fontSize: 28, marginBottom: 4 },
  modeName:  { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 2 },
  modeDesc:  { fontSize: 11, color: colors.textMuted },

  countRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  countBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countNum:   { fontSize: 28, fontWeight: '900', color: colors.text },
  countLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
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
  errorTxt: { color: colors.danger, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  launchBtn: {
    paddingVertical: spacing.md + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  launchTxt: { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 2 },
});
