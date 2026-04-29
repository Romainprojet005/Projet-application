import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { BUZZER_MODES } from '../../data/buzzerQuestions';

const BUZZ_COLOR = '#DC2626';
const BUZZ_DARK  = '#B91C1C';
const BUZZ_LIGHT = '#FCA5A5';

export const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#F97316',
];

const COUNT_OPTIONS = [2, 3, 4, 5, 6];

export default function BuzzerSetupScreen({ navigation }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 6 }, (_, i) => `Joueur ${i + 1}`)
  );
  const [inputFocus, setInputFocus] = useState(null);
  const [mode, setMode] = useState('quiz');

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const updatePlayer = (i, v) => {
    const n = [...playerNames];
    n[i] = v || `Joueur ${i + 1}`;
    setPlayerNames(n);
  };

  const handleStart = () => {
    const names   = playerNames.slice(0, playerCount).map((n, i) => n.trim() || `Joueur ${i + 1}`);
    const colorss = PLAYER_COLORS.slice(0, playerCount);
    navigation.navigate('BuzzerGame', { playerNames: names, playerColors: colorss, mode });
  };

  const selectedMode = BUZZER_MODES.find(m => m.id === mode);

  return (
    <LinearGradient colors={['#1A0000', '#0A0000', '#1A0000']} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>⚡</Text>
            <View>
              <Text style={styles.badgeName}>Flash</Text>
              <Text style={styles.badgeQuote}>"Rapidité, instinct, victoire !"</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>BUZZER</Text>
          <Text style={styles.pageSubtitle}>Premier à buzzer répond — dans le temps imparti !</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: BUZZ_COLOR + '35', backgroundColor: BUZZ_COLOR + '18' }]}>
            <Text style={styles.rulesTitle}>⚡  Comment jouer</Text>
            <Text style={styles.rulesLine}>📱  Posez le téléphone au centre de la table</Text>
            <Text style={styles.rulesLine}>🎯  Une question s'affiche à l'écran</Text>
            <Text style={styles.rulesLine}>⚡  Appuyez "Lancer" — buzzez sur votre couleur dès que vous savez !</Text>
            <Text style={styles.rulesLine}>⏱  Le premier à buzzer a <Text style={styles.rulesPoints}>10 secondes</Text> pour répondre</Text>
            <Text style={styles.rulesLine}>✅  Bonne réponse → <Text style={styles.rulesPoints}>+1 pt</Text></Text>
            <Text style={styles.rulesLine}>❌  Mauvaise réponse → <Text style={styles.rulesPoints}>0 pt</Text></Text>
          </View>

          {/* Mode de jeu */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎮  Mode de jeu</Text>
            <View style={styles.modeRow}>
              {BUZZER_MODES.map(m => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMode(m.id)}
                  style={[
                    styles.modeBtn,
                    mode === m.id && { backgroundColor: m.color + '25', borderColor: m.color },
                  ]}
                >
                  <Text style={styles.modeEmoji}>{m.emoji}</Text>
                  <Text style={[styles.modeName, mode === m.id && { color: m.color, fontWeight: '800' }]}>{m.name}</Text>
                  <Text style={styles.modeDesc}>{m.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nombre de joueurs */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👥  Nombre de joueurs</Text>
            <View style={styles.pillRow}>
              {COUNT_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setPlayerCount(n)}
                  style={[styles.pill, playerCount === n && { backgroundColor: BUZZ_COLOR + '30', borderColor: BUZZ_COLOR }]}
                >
                  <Text style={[styles.pillText, playerCount === n && { color: BUZZ_LIGHT, fontWeight: '800' }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Noms des joueurs */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎮  Noms des joueurs</Text>
            {Array.from({ length: playerCount }, (_, i) => (
              <View key={i} style={styles.playerRow}>
                <View style={[styles.colorDot, { backgroundColor: PLAYER_COLORS[i] }]} />
                <View style={[styles.inputWrap, inputFocus === i && { borderColor: PLAYER_COLORS[i] }]}>
                  <TextInput
                    value={playerNames[i]}
                    onChangeText={v => updatePlayer(i, v)}
                    placeholder={`Joueur ${i + 1}`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    onFocus={() => setInputFocus(i)}
                    onBlur={() => setInputFocus(null)}
                    maxLength={12}
                    selectTextOnFocus
                  />
                </View>
              </View>
            ))}
          </View>

        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
          <TouchableOpacity onPress={handleStart} style={styles.launchBtn} activeOpacity={0.88}>
            <LinearGradient
              colors={[BUZZ_COLOR, BUZZ_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>⚡  QUE LE BUZZER SONNE !</Text>
            </LinearGradient>
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
  backBtnText: { color: BUZZ_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${BUZZ_COLOR}20`, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${BUZZ_COLOR}40`, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 40, fontWeight: '900', color: colors.text, letterSpacing: 6 },
  pageSubtitle: { fontSize: 12, color: BUZZ_LIGHT, letterSpacing: 1, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  rulesPoints: { color: BUZZ_LIGHT, fontWeight: '800' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  modeRow: { gap: spacing.sm },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
  },
  modeEmoji: { fontSize: 20 },
  modeName:  { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  modeDesc:  { fontSize: 11, color: colors.textMuted },

  pillRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  pillText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  colorDot:  { width: 24, height: 24, borderRadius: 12, flexShrink: 0 },
  inputWrap: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.sm,
  },
  input: {
    height: 44, color: colors.text, fontSize: 15, fontWeight: '600',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: BUZZ_COLOR, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 2 },
});
