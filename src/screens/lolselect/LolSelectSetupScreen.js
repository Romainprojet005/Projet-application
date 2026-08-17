import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { ROLE_META, ROLE_ORDER } from '../../data/lolPlayers';
import { MAX_REROLLS, TRIO_SIZE } from '../../data/lolDraftEngine';

const ACCENT      = '#C89B3C';
const ACCENT_LIGHT= '#F0D68C';
const ACCENT_DARK = '#8B6914';
const HEXTECH     = '#0AC8B9';

export default function LolSelectSetupScreen({ navigation }) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎮</Text>
            <View>
              <Text style={styles.badgeName}>Le Sélectionneur</Text>
              <Text style={styles.badgeQuote}>"Composez la légende."</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>LE SÉLECTIONNEUR</Text>
          <Text style={styles.pageSubtitle}>Draft ton équipe de légendes League of Legends</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: ACCENT + '35', backgroundColor: ACCENT + '15' }]}>
            <Text style={styles.rulesTitle}>🎮  Comment jouer</Text>
            <Text style={styles.rulesLine}>🃏  Les 5 postes s'affichent en parallèle, chacun avec un trio de {TRIO_SIZE} cartes — <Text style={styles.rulesAccent}>15 joueurs</Text> au départ</Text>
            <Text style={styles.rulesLine}>🎯  Choisir une carte verrouille son poste : les {TRIO_SIZE} joueurs de ce trio disparaissent (les 2 autres sont écartés)</Text>
            <Text style={styles.rulesLine}>📉  La vitrine passe ainsi de <Text style={styles.rulesAccent}>15 → 12 → 9 → 6 → 3</Text> joueurs à chaque poste verrouillé</Text>
            <Text style={styles.rulesLine}>🔄  {MAX_REROLLS} relances au total — chacune rafraîchit <Text style={styles.rulesAccent}>tous les postes encore ouverts</Text> en une fois, un joueur écarté n'est jamais reproposé</Text>
            <Text style={styles.rulesLine}>🔒  Une fois les 5 postes remplis, <Text style={styles.rulesAccent}>impossible de revenir en arrière</Text> — place au tournoi !</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🧩  Les 5 postes à recruter</Text>
            <View style={styles.roleRow}>
              {ROLE_ORDER.map(r => (
                <View key={r} style={styles.rolePill}>
                  <Text style={styles.roleEmoji}>{ROLE_META[r].emoji}</Text>
                  <Text style={styles.roleLabel}>{ROLE_META[r].label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.hint}>Des dizaines de vraies légendes de l'esport (LCK, LEC, LPL), certaines à plusieurs années différentes de leur carrière — leur niveau reflète leur domination réelle cette année-là.</Text>
          </View>

          <View style={[styles.rulesCard, { borderColor: HEXTECH + '35', backgroundColor: HEXTECH + '12' }]}>
            <Text style={[styles.rulesTitle, { color: HEXTECH }]}>🏆  Le tournoi (BO3)</Text>
            <Text style={styles.rulesLine}>⚔️  Votre équipe affronte une équipe rivale en <Text style={styles.rulesAccent}>Best-of-3</Text> — la première à 2 manches gagne la série</Text>
            <Text style={styles.rulesLine}>📊  Chaque manche est déterminée par le niveau des joueurs et la <Text style={styles.rulesAccent}>alchimie</Text> entre coéquipiers ayant réellement joué ensemble</Text>
            <Text style={styles.rulesLine}>🔁  L'équipe battue ajuste sa stratégie pour la manche suivante — de vrais retournements sont possibles</Text>
            <Text style={styles.rulesLine}>📝  Le récit change à chaque partie, mais jamais sans raison : il ne doit rien au hasard des lignes de texte</Text>
          </View>

        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('LolSelectDraft')}
            style={styles.launchBtn}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>🎮  DRAFT SOLO (VS IA)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('LolSelectMultiSetup')}
            style={styles.multiBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.multiBtnText}>🌐  JOUER À DISTANCE (2 JOUEURS)</Text>
            <Text style={styles.multiBtnHint}>Chacun draft sur son propre ordinateur / téléphone</Text>
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
  backBtnText: { color: ACCENT_LIGHT, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${ACCENT}20`, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${ACCENT}40`, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 2, textAlign: 'center' },
  pageSubtitle: { fontSize: 12, color: ACCENT_LIGHT, letterSpacing: 1, marginTop: spacing.xs, textAlign: 'center' },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4, lineHeight: 19 },
  rulesAccent: { color: ACCENT_LIGHT, fontWeight: '800' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2,
    borderRadius: radius.full, borderWidth: 1,
    backgroundColor: colors.surface, borderColor: colors.border,
  },
  roleEmoji: { fontSize: 15 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic', lineHeight: 17 },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
  },
  launchGradient: { paddingVertical: spacing.md + 6, alignItems: 'center' },
  launchText: { fontSize: 15, fontWeight: '800', color: '#0A0815', letterSpacing: 2 },

  multiBtn: {
    borderRadius: radius.lg, borderWidth: 1, borderColor: `${HEXTECH}50`,
    backgroundColor: `${HEXTECH}12`, paddingVertical: spacing.md, alignItems: 'center', gap: 2,
  },
  multiBtnText: { fontSize: 13, fontWeight: '800', color: HEXTECH, letterSpacing: 1 },
  multiBtnHint: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
});
