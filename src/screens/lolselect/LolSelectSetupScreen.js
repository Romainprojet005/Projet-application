import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { ROLE_META, ROLE_ORDER } from '../../data/lolPlayers';
import { MAX_REROLLS, INITIAL_WINDOW_SIZE } from '../../data/lolDraftEngine';

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
            <Text style={styles.rulesLine}>🃏  {INITIAL_WINDOW_SIZE} joueurs pros vous sont présentés sous forme de cartes</Text>
            <Text style={styles.rulesLine}>🎯  Choisissez une carte pour verrouiller ce poste dans votre équipe</Text>
            <Text style={styles.rulesLine}>🔄  Vous disposez de <Text style={styles.rulesAccent}>{MAX_REROLLS} relances</Text> pour changer les propositions</Text>
            <Text style={styles.rulesLine}>⚠️  Chaque choix (ou relance) fait disparaître définitivement les cartes affichées — un joueur n'est jamais reproposé</Text>
            <Text style={styles.rulesLine}>📉  Chaque choix réduit de 3 le nombre de cartes proposées ensuite</Text>
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
            <Text style={styles.hint}>15 vraies légendes de l'esport, à des années différentes de leur carrière — leur niveau reflète leur domination réelle cette année-là.</Text>
          </View>

          <View style={[styles.rulesCard, { borderColor: HEXTECH + '35', backgroundColor: HEXTECH + '12' }]}>
            <Text style={[styles.rulesTitle, { color: HEXTECH }]}>🏆  Le tournoi</Text>
            <Text style={styles.rulesLine}>⚔️  Votre équipe affronte une équipe rivale générée avec les joueurs restants</Text>
            <Text style={styles.rulesLine}>📊  Le vainqueur est déterminé par le niveau des joueurs et la <Text style={styles.rulesAccent}>alchimie</Text> entre coéquipiers ayant réellement joué ensemble</Text>
            <Text style={styles.rulesLine}>📝  Le récit du match change à chaque partie, mais jamais le résultat : il ne doit rien au hasard</Text>
          </View>

        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48 }}>
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
              <Text style={styles.launchText}>🎮  COMMENCER LE DRAFT</Text>
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
});
