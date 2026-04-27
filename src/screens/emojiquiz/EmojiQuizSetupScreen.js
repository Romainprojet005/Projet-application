import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { EMOJI_CATEGORIES, buildEmojiRound } from '../../data/emojiQuizData';

const AMB       = '#F59E0B';
const AMB_DARK  = '#B45309';
const AMB_LIGHT = '#FDE68A';
const BG        = ['#1A0F00', '#2D1A00', '#1A0F00'];

const ROUND_OPTIONS = [5, 10, 15, 20];
const MAX_PLAYERS = 8;

export default function EmojiQuizSetupScreen({ navigation }) {
  const [players, setPlayers] = useState(['', '']);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCats, setSelectedCats] = useState(['film', 'musique', 'serie', 'personnalite']);
  const [inputFocus, setInputFocus] = useState(null);
  const [error, setError] = useState('');

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleCat = (key) => {
    setSelectedCats(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

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
    const rounds = buildEmojiRound(questionCount, selectedCats);
    navigation.navigate('EmojiQuizGame', { players: trimmed, rounds });
  };

  const canStart = players.every(p => p.trim().length > 0) && selectedCats.length > 0;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🤩</Text>
            <View>
              <Text style={styles.badgeName}>Willy Wonka</Text>
              <Text style={styles.badgeQuote}>"Décryptez le message des emojis !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>EMOJI QUIZ</Text>
          <Text style={styles.pageSubtitle}>Devinez ce que cachent les emojis</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Règles */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>🎯  Comment jouer</Text>
            <Text style={styles.rulesLine}>🤩  3 emojis représentent un film, une chanson, une série ou une célébrité</Text>
            <Text style={styles.rulesLine}>⚡  Choisissez la bonne réponse parmi 4 propositions</Text>
            <Text style={styles.rulesLine}>🏆  Le premier à trouver marque le point</Text>
          </View>

          {/* Catégories */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎲  Catégories</Text>
            <View style={styles.catGrid}>
              {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => {
                const sel = selectedCats.includes(key);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => toggleCat(key)}
                    style={[styles.catBtn, sel && { borderColor: cat.color, backgroundColor: cat.color + '22' }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, sel && { color: cat.color }]}>{cat.label}</Text>
                    {sel && (
                      <View style={[styles.catCheck, { backgroundColor: cat.color }]}>
                        <Text style={styles.catCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nb questions */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>❓  Nombre de questions</Text>
            <View style={styles.pillRow}>
              {ROUND_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setQuestionCount(n)}
                  style={[styles.pill, questionCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillNum, questionCount === n && styles.pillNumActive]}>{n}</Text>
                  <Text style={[styles.pillLabel, questionCount === n && { color: AMB_LIGHT }]}>Q</Text>
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
                  <Text style={styles.inputIcon}>🤩</Text>
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
              ['Questions', String(questionCount)],
              ['Catégories', selectedCats.map(k => EMOJI_CATEGORIES[k]?.emoji).join(' ')],
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
            <LinearGradient colors={[AMB, AMB_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.launchGradient}>
              <Text style={styles.launchText}>🤩  C'EST PARTI !</Text>
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
  backBtnText: { color: AMB_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: AMB + '20', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.lg, borderWidth: 1, borderColor: AMB + '40', gap: spacing.sm },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  pageSubtitle: { fontSize: 12, color: AMB_LIGHT, letterSpacing: 1.5, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { backgroundColor: AMB + '18', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: AMB + '35' },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, lineHeight: 18 },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border, minWidth: 90, position: 'relative' },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  catCheck: { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  catCheckText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  pill: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: AMB + '30', borderColor: AMB },
  pillNum: { fontSize: 20, fontWeight: '900', color: colors.textMuted },
  pillNumActive: { color: AMB_LIGHT },
  pillLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, gap: spacing.xs },
  inputWrapFocus: { borderColor: AMB },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, height: 44, color: colors.text, fontSize: 15, fontWeight: '600', ...Platform.select({ web: { outlineStyle: 'none' } }) },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  removeBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  addBtn: { marginTop: spacing.xs, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: AMB + '50', borderRadius: radius.md, borderStyle: 'dashed' },
  addBtnText: { color: AMB_LIGHT, fontSize: 13, fontWeight: '600' },

  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: -spacing.xs },

  summaryCard: { backgroundColor: AMB + '15', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: AMB + '30' },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg, shadowColor: AMB, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2 },
});
