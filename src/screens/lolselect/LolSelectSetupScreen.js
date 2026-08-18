import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { TRIO_SIZE } from '../../data/lolDraftEngine';
import { GAME_LIST, getGame, DEFAULT_GAME_ID } from '../../data/selectGames';

const HEXTECH = '#0AC8B9';

export default function LolSelectSetupScreen({ navigation }) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const [gameId, setGameId] = useState(DEFAULT_GAME_ID);
  const game = getGame(gameId);
  const ACCENT      = game.accent;
  const ACCENT_LIGHT= game.accentLight;
  const ACCENT_DARK = game.accentDark;

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
          <View style={[styles.badge, { backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}40` }]}>
            <Text style={styles.badgeEmoji}>🎮</Text>
            <View>
              <Text style={styles.badgeName}>Le Sélectionneur</Text>
              <Text style={styles.badgeQuote}>"Composez la légende."</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>LE SÉLECTIONNEUR</Text>
          <Text style={[styles.pageSubtitle, { color: ACCENT_LIGHT }]}>Draft ton équipe de {game.label} parmi de vrais joueurs pro</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
          <Text style={styles.gamePickerLabel}>QUEL JEU ?</Text>
          <View style={styles.gamePickerRow}>
            {GAME_LIST.map(g => {
              const active = g.id === gameId;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGameId(g.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.gameCard,
                    { borderColor: active ? g.accent : colors.border, backgroundColor: active ? `${g.accent}18` : colors.card },
                  ]}
                >
                  <Text style={styles.gameCardEmoji}>{g.emoji}</Text>
                  <Text style={[styles.gameCardLabel, active && { color: g.accentLight }]}>{g.label}</Text>
                  <Text style={styles.gameCardHint}>{g.squadLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <View style={[styles.rulesCard, { borderColor: ACCENT + '35', backgroundColor: ACCENT + '15' }]}>
            <Text style={styles.rulesTitle}>🎮  Comment jouer</Text>
            <Text style={styles.rulesLine}>🃏  Les {game.squadSize} slots s'affichent en parallèle, chacun avec un trio de {TRIO_SIZE} cartes — <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>{game.squadSize * TRIO_SIZE} joueurs</Text> au départ</Text>
            <Text style={styles.rulesLine}>🎯  Choisir une carte verrouille son slot : les {TRIO_SIZE} joueurs de ce trio disparaissent (les 2 autres sont écartés), et <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>tous les autres slots ouverts sont automatiquement relancés</Text></Text>
            <Text style={styles.rulesLine}>📉  La vitrine se réduit ainsi à chaque slot verrouillé, jusqu'aux 3 derniers joueurs</Text>
            <Text style={styles.rulesLine}>🔄  En plus, un nombre de relances manuelles <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>à choisir avant le draft</Text> (0 à 5) — chacune rafraîchit <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>tous les slots encore ouverts</Text> en une fois, un joueur écarté n'est jamais reproposé</Text>
            <Text style={styles.rulesLine}>🔒  Une fois les {game.squadSize} slots remplis, <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>impossible de revenir en arrière</Text> — place au tournoi !</Text>
            <Text style={styles.rulesLine}>🎯  Moins familier de la scène ? Un <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>niveau de connaissance</Text> (100/75/50/25 %) réduit le vivier aux joueurs les plus connus, à choisir juste avant le draft</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>🧩  {game.squadSize} joueurs à recruter</Text>
            <Text style={styles.hint}>
              {game.id === 'lol'
                ? "Des dizaines de vraies légendes de l'esport (LCK, LEC, LPL), certaines à plusieurs années différentes de leur carrière — leur niveau reflète leur domination réelle cette année-là."
                : "De vrais joueurs pro du RLCS (champions du monde, finalistes, vainqueurs de Major), certains à plusieurs années différentes de leur carrière — leur niveau reflète leur domination réelle cette année-là."}
            </Text>
          </View>

          <View style={[styles.rulesCard, { borderColor: HEXTECH + '35', backgroundColor: HEXTECH + '12' }]}>
            <Text style={[styles.rulesTitle, { color: HEXTECH }]}>🏆  Le tournoi (BO3)</Text>
            <Text style={styles.rulesLine}>⚔️  Votre équipe affronte une équipe rivale en <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>Best-of-3</Text> — la première à 2 manches gagne la série</Text>
            <Text style={styles.rulesLine}>📊  Chaque manche est déterminée par le niveau des joueurs et la <Text style={[styles.rulesAccent, { color: ACCENT_LIGHT }]}>alchimie</Text> entre coéquipiers ayant réellement joué ensemble</Text>
            <Text style={styles.rulesLine}>🔁  L'équipe battue ajuste sa stratégie pour la manche suivante — de vrais retournements sont possibles</Text>
            <Text style={styles.rulesLine}>📝  Le récit change à chaque partie, mais jamais sans raison : il ne doit rien au hasard des lignes de texte</Text>
          </View>

        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('LolSelectDraft', { gameId })}
            style={styles.launchBtn}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchText}>{game.emoji}  DRAFT SOLO (VS IA)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('LolSelectMultiSetup', { gameId })}
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
  backBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg, borderWidth: 1, gap: spacing.sm,
  },
  badgeEmoji: { fontSize: 26 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  badgeQuote: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

  pageTitle:    { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 2, textAlign: 'center' },
  pageSubtitle: { fontSize: 12, letterSpacing: 1, marginTop: spacing.xs, textAlign: 'center' },

  gamePickerLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm },
  gamePickerRow: { flexDirection: 'row', gap: spacing.sm },
  gameCard: {
    flex: 1, borderRadius: radius.lg, borderWidth: 1.5,
    paddingVertical: spacing.md, alignItems: 'center', gap: 2,
  },
  gameCardEmoji: { fontSize: 26 },
  gameCardLabel: { fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 },
  gameCardHint:  { fontSize: 10, color: colors.textMuted },

  form: { paddingHorizontal: spacing.xl, gap: spacing.md },

  rulesCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  rulesTitle:  { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  rulesLine:   { fontSize: 13, color: colors.textSecondary, marginBottom: 4, lineHeight: 19 },
  rulesAccent: { fontWeight: '800' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', lineHeight: 17 },

  launchBtn: {
    borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.lg,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
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
