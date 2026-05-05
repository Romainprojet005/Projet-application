import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { getMotDePasseCards } from '../../data/motDePasseData';

import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
const CYAN       = GOLD;
const CYAN_DARK  = GOLD_DARK;
const CYAN_LIGHT = GOLD_LIGHT;
const BG         = OB_BG;

const TIMER_OPTIONS = [30, 60, 90];
const WORDS_OPTIONS = [20, 30, 40];
const MAX_PLAYERS = 8;

export default function MotDePasseSetupScreen({ navigation }) {
  const [players,    setPlayers]    = useState(['', '']);
  const [timerSecs,  setTimerSecs]  = useState(60);
  const [wordCount,  setWordCount]  = useState(30);
  const [category,   setCategory]   = useState('normal');
  const [inputFocus, setInputFocus] = useState(null);
  const [error,      setError]      = useState('');

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer    = () => { if (players.length < MAX_PLAYERS) setPlayers([...players, '']); };
  const removePlayer = (i) => { if (players.length > 2) setPlayers(players.filter((_, idx) => idx !== i)); };
  const updatePlayer = (i, val) => {
    const next = [...players]; next[i] = val; setPlayers(next);
    if (error) setError('');
  };

  const handleStart = () => {
    const trimmed = players.map(p => p.trim());
    if (trimmed.some(p => !p)) { setError('Tous les joueurs doivent avoir un prénom !'); return; }
    if (new Set(trimmed.map(n => n.toLowerCase())).size !== trimmed.length) {
      setError('Deux joueurs ont le même prénom !'); return;
    }
    const cards = getMotDePasseCards(wordCount, category);
    navigation.navigate('MotDePasseGame', { players: trimmed, cards, timerSecs });
  };

  const canStart = players.every(p => p.trim().length > 0);
  const turnsEst = Math.ceil(wordCount / players.length);

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎭</Text>
            <View>
              <Text style={styles.badgeName}>Cyrano de Bergerac</Text>
              <Text style={styles.badgeQuote}>"Des mots, toujours des mots !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>MOT DE PASSE</Text>
          <Text style={styles.pageSubtitle}>Faites deviner sans dire les mots interdits</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Règles */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>🎯  Comment jouer</Text>
            <Text style={styles.rulesLine}>🎭  À votre tour, faites deviner un mot à vos adversaires</Text>
            <Text style={styles.rulesLine}>🚫  Vous ne pouvez pas dire les 5 mots interdits affichés</Text>
            <Text style={styles.rulesLine}>✓ / ✗  Appuyez sur ✓ si deviné, ✗ pour passer au suivant</Text>
            <Text style={styles.rulesLine}>🏆  Celui qui fait deviner le plus de mots gagne !</Text>
          </View>

          {/* Timer */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⏱️  Durée par tour</Text>
            <View style={styles.pillRow}>
              {TIMER_OPTIONS.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimerSecs(t)}
                  style={[styles.pill, timerSecs === t && styles.pillActive]}
                >
                  <Text style={[styles.pillNum, timerSecs === t && styles.pillNumActive]}>{t}</Text>
                  <Text style={[styles.pillLabel, timerSecs === t && { color: CYAN_LIGHT }]}>sec</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Catégorie */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🔞  Catégorie</Text>
            <View style={styles.pillRow}>
              {[
                { key: 'normal', label: 'Tout public', emoji: '👪' },
                { key: 'adult',  label: 'Adulte 18+',  emoji: '🔞' },
              ].map(c => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[styles.pill, category === c.key && styles.pillActive]}
                >
                  <Text style={styles.pillNum}>{c.emoji}</Text>
                  <Text style={[styles.pillLabel, category === c.key && { color: CYAN_LIGHT }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {category === 'adult' && (
              <Text style={styles.adultWarning}>⚠️  Contenu réservé aux adultes</Text>
            )}
          </View>

          {/* Nb mots */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🃏  Mots au total</Text>
            <View style={styles.pillRow}>
              {WORDS_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setWordCount(n)}
                  style={[styles.pill, wordCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillNum, wordCount === n && styles.pillNumActive]}>{n}</Text>
                  <Text style={[styles.pillLabel, wordCount === n && { color: CYAN_LIGHT }]}>mots</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Joueurs */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs</Text>
            {players.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>🎭</Text>
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
                {players.length > 2 && (
                  <TouchableOpacity onPress={() => removePlayer(i)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {players.length < MAX_PLAYERS && (
              <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Ajouter un joueur</Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Résumé */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋  Résumé</Text>
            {[
              ['Joueurs', String(players.length)],
              ['Durée du tour', `${timerSecs}s`],
              ['Mots à deviner', String(wordCount)],
              ['Tours / joueur', `~${turnsEst}`],
            ].map(([label, value]) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Lancer */}
        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={!canStart}
            style={[styles.launchBtn, !canStart && { opacity: 0.4 }]}
            activeOpacity={0.88}
          >
            <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.launchGradient}>
              <Text style={styles.launchText}>🎭  C'EST PARTI !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { paddingBottom: spacing.xl },

  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backBtnText: { color: CYAN_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: CYAN + '20', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.lg, borderWidth: 1, borderColor: CYAN + '40', gap: spacing.sm },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 3 },
  pageSubtitle: { fontSize: 12, color: CYAN_LIGHT, letterSpacing: 1.5, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { backgroundColor: CYAN + '18', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: CYAN + '35' },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, lineHeight: 18 },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  pill: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: CYAN + '30', borderColor: CYAN },
  pillNum: { fontSize: 20, fontWeight: '900', color: colors.textMuted },
  pillNumActive: { color: CYAN_LIGHT },
  pillLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  adultWarning: { fontSize: 11, color: '#F59E0B', marginTop: spacing.sm, textAlign: 'center', fontStyle: 'italic' },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, gap: spacing.xs },
  inputWrapFocus: { borderColor: CYAN },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, height: 44, color: colors.text, fontSize: 15, fontWeight: '600', ...Platform.select({ web: { outlineStyle: 'none' } }) },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  removeBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  addBtn: { marginTop: spacing.xs, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: CYAN + '50', borderRadius: radius.md, borderStyle: 'dashed' },
  addBtnText: { color: CYAN_LIGHT, fontSize: 13, fontWeight: '600' },

  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: -spacing.xs },

  summaryCard: { backgroundColor: CYAN + '15', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: CYAN + '30' },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg, shadowColor: CYAN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 16, fontWeight: '800', color: LAUNCH_TEXT, letterSpacing: 2 },
});
