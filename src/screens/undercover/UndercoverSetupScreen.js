import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { wordThemes, generateRandomPair } from '../../data/wordLists';

const AMB       = '#D97706';
const AMB_DARK  = '#92400E';
const AMB_LIGHT = '#FCD34D';

// Persiste en mémoire tant que l'app n'est pas fermée
const usedPairsPerTheme = {};

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export default function UndercoverSetupScreen({ navigation }) {
  const [playerCount, setPlayerCount] = useState(5);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classique');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const maxUndercover = Math.max(1, Math.floor(playerCount / 3));

  const adjustPlayers = (delta) => {
    const next = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, playerCount + delta));
    setPlayerCount(next);
    const nextMaxUC = Math.max(1, Math.floor(next / 3));
    if (undercoverCount > nextMaxUC) setUndercoverCount(nextMaxUC);
  };

  const adjustUndercover = (delta) => {
    setUndercoverCount((prev) => Math.min(maxUndercover, Math.max(1, prev + delta)));
  };

  const civilianCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);

  const handleStart = () => {
    let randomPair;

    if (selectedTheme === 'aleatoire') {
      if (!usedPairsPerTheme['aleatoire']) usedPairsPerTheme['aleatoire'] = new Set();
      randomPair = generateRandomPair(usedPairsPerTheme['aleatoire']);
    } else {
      const theme = wordThemes[selectedTheme];
      if (!usedPairsPerTheme[selectedTheme]) usedPairsPerTheme[selectedTheme] = new Set();
      let available = theme.pairs.map((_, i) => i).filter(i => !usedPairsPerTheme[selectedTheme].has(i));
      if (available.length === 0) {
        usedPairsPerTheme[selectedTheme] = new Set();
        available = theme.pairs.map((_, i) => i);
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      usedPairsPerTheme[selectedTheme].add(idx);
      randomPair = theme.pairs[idx];
    }

    navigation.navigate('UndercoverDistribute', {
      playerCount,
      wordPair: randomPair,
      undercoverCount,
      hasMrWhite,
      themeName: wordThemes[selectedTheme].label,
    });
  };

  return (
    <LinearGradient colors={['#090400', '#1A0B00', '#090400']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.agentBadge}>
            <Text style={styles.agentBadgeEmoji}>🔍</Text>
            <View>
              <Text style={styles.agentBadgeName}>Sherlock Holmes</Text>
              <Text style={styles.agentBadgeQuote}>"Élémentaire, mon cher Watson !"</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>UNDERCOVER</Text>
          <Text style={styles.pageSubtitle}>Configuration de la mission</Text>
        </Animated.View>

        <Animated.View
          style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          {/* Player count */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Nombre de joueurs</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => adjustPlayers(-1)}
                style={[styles.counterBtn, playerCount <= MIN_PLAYERS && styles.counterBtnDim]}
                disabled={playerCount <= MIN_PLAYERS}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterNum}>{playerCount}</Text>
              <TouchableOpacity
                onPress={() => adjustPlayers(1)}
                style={[styles.counterBtn, playerCount >= MAX_PLAYERS && styles.counterBtnDim]}
                disabled={playerCount >= MAX_PLAYERS}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Undercover count */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🕵️  Nombre d'espions</Text>
            <Text style={styles.cardHint}>Recommandé : 1 espion pour 3 joueurs</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => adjustUndercover(-1)}
                style={[styles.counterBtn, undercoverCount <= 1 && styles.counterBtnDim]}
                disabled={undercoverCount <= 1}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterNum}>{undercoverCount}</Text>
              <TouchableOpacity
                onPress={() => adjustUndercover(1)}
                style={[styles.counterBtn, undercoverCount >= maxUndercover && styles.counterBtnDim]}
                disabled={undercoverCount >= maxUndercover}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mr. White */}
          <View style={[styles.card, styles.cardRow]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>👻  Monsieur Blanc</Text>
              <Text style={styles.cardHint}>Un joueur sans mot qui doit bluffer</Text>
            </View>
            <Switch
              value={hasMrWhite}
              onValueChange={setHasMrWhite}
              trackColor={{ false: colors.border, true: `${AMB}80` }}
              thumbColor={hasMrWhite ? AMB : colors.textMuted}
            />
          </View>

          {/* Theme */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎲  Thème des mots</Text>
            <View style={styles.themeGrid}>
              {Object.entries(wordThemes).map(([key, theme]) => {
                const selected = selectedTheme === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedTheme(key)}
                    style={[styles.themeBtn, selected && styles.themeBtnSelected]}
                  >
                    <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                    <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
                      {theme.label}
                    </Text>
                    {selected && (
                      <Text style={styles.themeDesc}>{theme.description}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋  Résumé de la partie</Text>
            <SummaryRow label="Joueurs total" value={String(playerCount)} />
            <SummaryRow
              label="Villageois"
              value={String(civilianCount)}
              valueColor={colors.success}
            />
            <SummaryRow
              label={`Espion${undercoverCount > 1 ? 's' : ''}`}
              value={String(undercoverCount)}
              valueColor={colors.danger}
            />
            {hasMrWhite && (
              <SummaryRow label="Monsieur Blanc" value="1" valueColor={colors.accent} />
            )}
            <SummaryRow label="Thème" value={wordThemes[selectedTheme].label} />
          </View>
        </Animated.View>

        {/* Launch */}
        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity onPress={handleStart} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[AMB, AMB_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>🚀  LANCER LA MISSION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function SummaryRow({ label, value, valueColor }) {
  return (
    <View style={summaryRowStyles.row}>
      <Text style={summaryRowStyles.label}>{label}</Text>
      <Text style={[summaryRowStyles.value, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const summaryRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { fontSize: 13, color: colors.textSecondary },
  value: { fontSize: 13, fontWeight: '700', color: colors.text },
});

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
  backBtnText: { color: AMB_LIGHT, fontSize: 14, fontWeight: '600' },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AMB}20`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${AMB}40`,
    gap: spacing.sm,
  },
  agentBadgeEmoji: { fontSize: 26 },
  agentBadgeName: { fontSize: 13, fontWeight: '700', color: colors.text },
  agentBadgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },
  pageTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: AMB_LIGHT,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },

  form: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  cardHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AMB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDim: { backgroundColor: colors.border },
  counterBtnText: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.text,
    lineHeight: 30,
  },
  counterNum: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },

  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  themeBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
  },
  themeBtnSelected: {
    borderColor: AMB,
    backgroundColor: `${AMB}22`,
  },
  themeEmoji: { fontSize: 22, marginBottom: 4 },
  themeLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  themeLabelSelected: { color: AMB_LIGHT },
  themeDesc: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  summaryCard: {
    backgroundColor: `${AMB}15`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${AMB}30`,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },

  launchBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
    shadowColor: AMB,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  launchGradient: {
    paddingVertical: spacing.md + 6,
    alignItems: 'center',
  },
  launchText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
});
