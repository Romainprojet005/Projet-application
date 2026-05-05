import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { VOTE_CATEGORIES, selectQuestions } from '../../data/voteData';

import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
const VOTE_COLOR = GOLD;
const VOTE_DARK  = GOLD_DARK;
const VOTE_LIGHT = GOLD_LIGHT;

const ROUND_OPTIONS = [5, 10, 15, 20];
const MAX_PLAYERS   = 8;

export default function VoteSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]     = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [playerNames, setPlayerNames]   = useState(['', '', '']);
  const [inputFocus, setInputFocus]     = useState(null);

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
  const activeCat    = VOTE_CATEGORIES.find(c => c.id === categoryId) ?? VOTE_CATEGORIES[0];
  const available    = selectQuestions(999, categoryId, validPlayers).length;
  const canStart     = validPlayers.length >= 2 && !(activeCat.needsPlayers && validPlayers.length < 2);

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VoteGame', { questionCount, playerNames: validPlayers, categoryId });
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>⚖️</Text>
            <View>
              <Text style={styles.badgeName}>L'Arbitre</Text>
              <Text style={styles.badgeQuote}>"La majorité a toujours raison… ou presque !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>VOTE MAJORITÉ</Text>
          <Text style={styles.pageSubtitle}>Votez comme la majorité pour gagner des points</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: VOTE_COLOR + '35', backgroundColor: VOTE_COLOR + '18' }]}>
            <Text style={styles.rulesTitle}>⚖️  Comment jouer</Text>
            <Text style={styles.rulesLine}>📱  Passez le téléphone à chaque joueur</Text>
            <Text style={styles.rulesLine}>🗳️  Chaque joueur vote en secret</Text>
            <Text style={styles.rulesLine}>👥  Voter avec la majorité → <Text style={styles.rulesPoints}>+1 pt</Text></Text>
            <Text style={styles.rulesLine}>🏆  Vote unanime → <Text style={styles.rulesPoints}>+2 pts</Text> pour tous</Text>
            <Text style={styles.rulesLine}>⚖️  Égalité parfaite → <Text style={styles.rulesPoints}>0 pt</Text></Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎯  Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {VOTE_CATEGORIES.map(cat => {
                const active = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[styles.catPill, active && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
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

          <View style={styles.card}>
            <Text style={styles.cardLabel}>❓  Nombre de questions</Text>
            <View style={styles.pillRow}>
              {ROUND_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setQuestionCount(n)}
                  style={[styles.pill, questionCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillText, questionCount === n && styles.pillTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (min. 2)</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>⚖️</Text>
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
            {!canStart && (
              <Text style={styles.hint}>Remplissez au moins 2 noms pour commencer</Text>
            )}
          </View>

          <View style={[styles.summaryCard, { borderColor: VOTE_COLOR + '30', backgroundColor: VOTE_COLOR + '15' }]}>
            <Text style={styles.summaryTitle}>📋  Résumé</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Catégorie</Text>
              <Text style={styles.summaryValue}>{activeCat.emoji}  {activeCat.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Questions</Text>
              <Text style={styles.summaryValue}>{questionCount} / {available} disponibles</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Joueurs</Text>
              <Text style={styles.summaryValue}>{validPlayers.length >= 2 ? validPlayers.length : '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Max points</Text>
              <Text style={styles.summaryValue}>{questionCount * 2} pts / joueur</Text>
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
              colors={GOLD_GRADIENT}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>⚖️  QUE LE VOTE COMMENCE !</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('VoteMultiSetup')}
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
  scroll:    { paddingBottom: spacing.xl },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backBtn:     { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backBtnText: { color: VOTE_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${VOTE_COLOR}20`, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${VOTE_COLOR}40`, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  pageSubtitle: { fontSize: 12, color: VOTE_LIGHT, letterSpacing: 1.5, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  rulesPoints: { color: VOTE_LIGHT, fontWeight: '800' },

  catRow:  { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1,
    backgroundColor: colors.surface, borderColor: colors.border,
  },
  catEmoji: { fontSize: 16 },
  catText:  { fontSize: 13, fontWeight: '600', color: colors.textMuted },

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
  pillActive:     { backgroundColor: `${VOTE_COLOR}30`, borderColor: VOTE_COLOR },
  pillText:       { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  pillTextActive: { color: VOTE_LIGHT },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.sm, gap: spacing.xs,
  },
  inputWrapFocus: { borderColor: VOTE_COLOR },
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
    borderWidth: 1, borderColor: `${VOTE_COLOR}50`, borderRadius: radius.md, borderStyle: 'dashed',
  },
  addBtnText: { color: VOTE_LIGHT, fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },

  summaryCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: VOTE_COLOR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: LAUNCH_TEXT, letterSpacing: 2 },

  multiBtn: {
    marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: VOTE_COLOR + '55', borderRadius: radius.full,
  },
  multiBtnText: { color: VOTE_LIGHT, fontSize: 14, fontWeight: '700' },
});
