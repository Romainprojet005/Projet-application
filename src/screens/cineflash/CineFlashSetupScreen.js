import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';

const CIN       = '#DC2626';
const CIN_DARK  = '#991B1B';
const CIN_LIGHT = '#FCA5A5';

const ROUND_OPTIONS = [5, 10, 15, 20];
const MAX_PLAYERS = 6;

export default function CineFlashSetupScreen({ navigation }) {
  const [roundCount, setRoundCount] = useState(10);
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [inputFocus, setInputFocus] = useState(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index) => {
    if (playerNames.length > 1) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index, value) => {
    const next = [...playerNames];
    next[index] = value;
    setPlayerNames(next);
  };

  const handleStart = () => {
    const validNames = playerNames.map(n => n.trim()).filter(Boolean);
    navigation.navigate('CineFlashGame', { roundCount, playerNames: validNames });
  };

  return (
    <LinearGradient colors={['#0D0000', '#1A0500', '#0D0000']} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎬</Text>
            <View>
              <Text style={styles.badgeName}>Indiana Jones</Text>
              <Text style={styles.badgeQuote}>"Je déteste les serpents… mais j'adore le cinéma !"</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>CINÉ-FLASH</Text>
          <Text style={styles.pageSubtitle}>Reconnaissez le film en 3 indices photos</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          {/* How to play */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>🎯  Comment jouer</Text>
            <Text style={styles.rulesLine}>📸  Indice 1 → <Text style={styles.rulesPoints}>3 pts</Text></Text>
            <Text style={styles.rulesLine}>📸  Indice 2 → <Text style={styles.rulesPoints}>2 pts</Text></Text>
            <Text style={styles.rulesLine}>📸  Indice 3 → <Text style={styles.rulesPoints}>1 pt</Text></Text>
            <Text style={styles.rulesNote}>Appuyez "Trouvé !" dès que vous connaissez le film.</Text>
          </View>

          {/* Number of films */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎞️  Nombre de films</Text>
            <View style={styles.pillRow}>
              {ROUND_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRoundCount(n)}
                  style={[styles.pill, roundCount === n && styles.pillActive]}
                >
                  <Text style={[styles.pillText, roundCount === n && styles.pillTextActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Players */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Joueurs (optionnel)</Text>
            <Text style={styles.cardHint}>Laissez vide pour jouer sans suivi des scores</Text>
            {playerNames.map((name, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.inputWrap, inputFocus === i && styles.inputWrapFocus]}>
                  <Text style={styles.inputIcon}>🎬</Text>
                  <TextInput
                    value={name}
                    onChangeText={(v) => updatePlayer(i, v)}
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

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋  Résumé de la partie</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Films à deviner</Text>
              <Text style={styles.summaryValue}>{roundCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Joueurs</Text>
              <Text style={styles.summaryValue}>
                {playerNames.filter(n => n.trim()).length || 'Mode libre'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Max points possibles</Text>
              <Text style={styles.summaryValue}>{roundCount * 3} pts</Text>
            </View>
          </View>
        </Animated.View>

        {/* Launch */}
        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity onPress={handleStart} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[CIN, CIN_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>🎬  LUMIÈRES, CAMÉRA... ACTION !</Text>
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

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backBtnText: { color: CIN_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${CIN}20`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${CIN}40`,
    gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  pageSubtitle: { fontSize: 12, color: CIN_LIGHT, letterSpacing: 1.5, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: {
    backgroundColor: `${CIN}18`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${CIN}35`,
  },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  rulesPoints: { color: CIN_LIGHT, fontWeight: '800' },
  rulesNote: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  cardHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: `${CIN}30`, borderColor: CIN },
  pillText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  pillTextActive: { color: CIN_LIGHT },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  inputWrapFocus: { borderColor: CIN },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  addBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${CIN}50`,
    borderRadius: radius.md,
    borderStyle: 'dashed',
  },
  addBtnText: { color: CIN_LIGHT, fontSize: 13, fontWeight: '600' },

  summaryCard: {
    backgroundColor: `${CIN}15`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${CIN}30`,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  launchBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
    shadowColor: CIN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 2 },
});
