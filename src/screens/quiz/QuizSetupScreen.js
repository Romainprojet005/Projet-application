import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { quizCategories, buildQuestions } from '../../data/quizQuestions';

const ZAPCOLOR = '#6366F1';
const HOT_COLOR = '#EF4444';
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const QUESTION_OPTIONS = [5, 10, 15];

export default function QuizSetupScreen({ navigation }) {
  const [playerCount, setPlayerCount] = useState(3);
  const [selectedCategories, setSelectedCategories] = useState(['culture', 'cinema']);
  const [questionCount, setQuestionCount] = useState(10);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const adjustPlayers = (delta) => {
    setPlayerCount((p) => Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, p + delta)));
  };

  const toggleCategory = (key) => {
    const cat = quizCategories[key];
    if (cat?.adult && !selectedCategories.includes(key)) {
      if (Platform.OS === 'web') {
        if (window.confirm('🔞 Contenu adulte\n\nCette catégorie contient des questions réservées aux adultes (+18). Confirmer ?')) {
          setSelectedCategories((prev) => [...prev, key]);
        }
      } else {
        Alert.alert(
          '🔞 Contenu adulte',
          'Cette catégorie contient des questions réservées aux adultes (+18). Confirmer ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', onPress: () => setSelectedCategories((prev) => [...prev, key]) },
          ]
        );
      }
      return;
    }
    setSelectedCategories((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const availableQuestions = selectedCategories.reduce(
    (acc, k) => acc + (quizCategories[k]?.questions.length || 0),
    0
  );
  const effectiveCount = Math.min(questionCount, availableQuestions);
  const questionsPerPlayer = Math.floor(effectiveCount / playerCount);

  const handleStart = () => {
    const questions = buildQuestions(selectedCategories, questionCount);
    const players = Array.from({ length: playerCount }, (_, i) => `Joueur ${i + 1}`);
    navigation.navigate('QuizGame', { players, questions });
  };

  const canStart = selectedCategories.length > 0 && effectiveCount > 0;

  return (
    <LinearGradient colors={['#05050E', '#0C0A2C', '#05050E']} style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true} style={Platform.OS === 'web' && { flex: 1, overflowY: 'scroll' }}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.agentBadge}>
            <Text style={styles.agentBadgeEmoji}>✨</Text>
            <View>
              <Text style={styles.agentBadgeName}>Hermione Granger</Text>
              <Text style={styles.agentBadgeQuote}>"Ce n'est pas de la magie, c'est du savoir !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>QUIZ</Text>
          <Text style={styles.pageSubtitle}>Configuration de la partie</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Joueurs */}
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

          {/* Catégories */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎲  Catégories</Text>
            <Text style={styles.cardHint}>Sélectionnez au moins une catégorie</Text>
            <View style={styles.categoryGrid}>
              {Object.entries(quizCategories).map(([key, cat]) => {
                const selected = selectedCategories.includes(key);
                const isAdult = cat.adult === true;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => toggleCategory(key)}
                    style={[
                      styles.categoryBtn,
                      isAdult && styles.categoryBtnAdult,
                      selected && { borderColor: cat.color, backgroundColor: cat.color + '22' },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryLabel, selected && { color: cat.color }, isAdult && !selected && { color: HOT_COLOR }]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.categoryCount}>{cat.questions.length} Q</Text>
                    {selected && (
                      <View style={[styles.categoryCheck, { backgroundColor: cat.color }]}>
                        <Text style={styles.categoryCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nombre de questions */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>❓  Nombre de questions</Text>
            <Text style={styles.cardHint}>
              {availableQuestions} questions disponibles avec les catégories choisies
            </Text>
            <View style={styles.qCountRow}>
              {QUESTION_OPTIONS.map((n) => {
                const selected = questionCount === n;
                const disabled = n > availableQuestions;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => !disabled && setQuestionCount(n)}
                    style={[
                      styles.qCountBtn,
                      selected && styles.qCountBtnSelected,
                      disabled && styles.qCountBtnDisabled,
                    ]}
                    disabled={disabled}
                  >
                    <Text style={[styles.qCountNum, selected && styles.qCountNumSelected, disabled && styles.qCountNumDisabled]}>
                      {n}
                    </Text>
                    <Text style={[styles.qCountLabel, disabled && styles.qCountNumDisabled]}>
                      questions
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Résumé */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋  Résumé de la partie</Text>
            <SummaryRow label="Joueurs" value={String(playerCount)} />
            <SummaryRow label="Questions" value={String(effectiveCount)} valueColor={ZAPCOLOR} />
            <SummaryRow
              label="Questions / joueur"
              value={questionsPerPlayer > 0 ? `~${questionsPerPlayer}` : '—'}
            />
            <SummaryRow label="Temps / question" value="15 sec" />
            <SummaryRow
              label="Catégories"
              value={selectedCategories.map((k) => quizCategories[k]?.emoji).join(' ')}
            />
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
            <LinearGradient
              colors={[ZAPCOLOR, '#0369A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>⚡  LANCER LE QUIZ</Text>
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
  backBtnText: { color: ZAPCOLOR, fontSize: 14, fontWeight: '600' },

  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAPCOLOR + '20',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: ZAPCOLOR + '40',
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
    color: ZAPCOLOR,
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
    backgroundColor: ZAPCOLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDim: { backgroundColor: colors.border },
  counterBtnText: { fontSize: 26, fontWeight: '300', color: colors.text, lineHeight: 30 },
  counterNum: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 95,
    position: 'relative',
  },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  categoryBtnAdult: {
    borderColor: HOT_COLOR + '66',
    borderStyle: 'dashed',
  },
  categoryCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCheckText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  qCountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  qCountBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qCountBtnSelected: {
    borderColor: ZAPCOLOR,
    backgroundColor: ZAPCOLOR + '22',
  },
  qCountBtnDisabled: { opacity: 0.35 },
  qCountNum: { fontSize: 24, fontWeight: '900', color: colors.text },
  qCountNumSelected: { color: ZAPCOLOR },
  qCountNumDisabled: { color: colors.textMuted },
  qCountLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },

  summaryCard: {
    backgroundColor: ZAPCOLOR + '15',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: ZAPCOLOR + '30',
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  launchBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
    shadowColor: ZAPCOLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 2 },
});
