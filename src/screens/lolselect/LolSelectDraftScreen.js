import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { ROLE_META, ROLE_ORDER, LOL_PLAYERS_BY_ID } from '../../data/lolPlayers';
import {
  createDraftState, pickPlayer, rerollWindow, getShownPlayers,
} from '../../data/lolDraftEngine';

const ACCENT       = '#C89B3C';
const ACCENT_LIGHT = '#F0D68C';
const ACCENT_DARK  = '#8B6914';
const HEXTECH      = '#0AC8B9';

function powerToStars(power) {
  return Math.max(1, Math.min(5, Math.round((power - 75) / 5)));
}

function PlayerCard({ player, onPick }) {
  const scale = useRef(new Animated.Value(1)).current;
  const meta = ROLE_META[player.role];
  const stars = powerToStars(player.power);

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={() => onPick(player.id)}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardRole}>{meta.emoji} {meta.label.toUpperCase()}</Text>
            <Text style={styles.cardFlag}>{player.flag}</Text>
          </View>

          <View style={styles.photoWrap}>
            {player.image
              ? <Image source={{ uri: player.image }} style={styles.photo} resizeMode="cover" />
              : <View style={[styles.photo, styles.photoFallback]}><Text style={styles.photoFallbackEmoji}>{meta.emoji}</Text></View>}
          </View>

          <Text style={styles.cardName} numberOfLines={1}>{player.name}</Text>
          <Text style={styles.cardTeam} numberOfLines={1}>{player.team} · {player.year}</Text>

          <Text style={styles.cardStars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>

          <Text style={styles.cardBio} numberOfLines={2}>{player.bio}</Text>

          <View style={styles.pickBtn}>
            <Text style={styles.pickBtnText}>CHOISIR</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LolSelectDraftScreen({ navigation }) {
  const [state, setState] = useState(createDraftState);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [state.shownIds.join(',')]);

  useEffect(() => {
    if (state.finished) {
      navigation.replace('LolSelectTournament', { team: state.team });
    }
  }, [state.finished]);

  const shown = useMemo(() => getShownPlayers(state), [state.shownIds]);

  const handlePick = useCallback((playerId) => {
    setState(s => pickPlayer(s, playerId));
  }, []);

  const handleReroll = useCallback(() => {
    setState(s => rerollWindow(s));
  }, []);

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReroll}
            disabled={state.rerollsLeft <= 0}
            style={[styles.rerollBtn, state.rerollsLeft <= 0 && styles.rerollBtnDisabled]}
          >
            <Text style={styles.rerollBtnText}>🔄  Relance ({state.rerollsLeft}/3)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>COMPOSEZ VOTRE ÉQUIPE</Text>

        <View style={styles.roleTracker}>
          {ROLE_ORDER.map(r => {
            const filled = state.team[r];
            const player = filled ? LOL_PLAYERS_BY_ID[filled] : null;
            return (
              <View key={r} style={[styles.trackerSlot, player && styles.trackerSlotFilled]}>
                <Text style={styles.trackerEmoji}>{ROLE_META[r].emoji}</Text>
                <Text style={styles.trackerLabel}>{ROLE_META[r].label}</Text>
                {player
                  ? <Text style={styles.trackerName} numberOfLines={1}>{player.name}</Text>
                  : <Text style={styles.trackerEmpty}>—</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>
          {shown.length} carte{shown.length > 1 ? 's' : ''} proposée{shown.length > 1 ? 's' : ''} · choisissez ou relancez — chaque action est définitive
        </Text>

        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {shown.map(player => (
            <PlayerCard key={player.id} player={player} onPick={handlePick} />
          ))}
        </Animated.View>

      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 48 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  quitText: { fontSize: 13, color: colors.textMuted },
  rerollBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full,
    backgroundColor: `${HEXTECH}20`, borderWidth: 1, borderColor: `${HEXTECH}50`,
  },
  rerollBtnDisabled: { opacity: 0.35 },
  rerollBtnText: { fontSize: 12, fontWeight: '800', color: HEXTECH },

  title: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.md },

  roleTracker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center', marginBottom: spacing.sm },
  trackerSlot: {
    width: 78, alignItems: 'center', paddingVertical: spacing.xs + 2, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  trackerSlotFilled: { backgroundColor: `${ACCENT}18`, borderColor: `${ACCENT}55` },
  trackerEmoji: { fontSize: 16 },
  trackerLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  trackerName: { fontSize: 10, color: ACCENT_LIGHT, fontWeight: '800', marginTop: 2 },
  trackerEmpty: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  hint: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, fontStyle: 'italic' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  cardWrap: { width: 168 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm + 2, alignItems: 'center',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: spacing.xs },
  cardRole: { fontSize: 10, fontWeight: '800', color: ACCENT_LIGHT, letterSpacing: 0.5 },
  cardFlag: { fontSize: 13 },

  photoWrap: { marginBottom: spacing.xs },
  photo: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: ACCENT },
  photoFallback: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  photoFallbackEmoji: { fontSize: 34 },

  cardName: { fontSize: 15, fontWeight: '900', color: colors.text },
  cardTeam: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  cardStars: { fontSize: 12, color: ACCENT_LIGHT, marginTop: 4, letterSpacing: 1 },
  cardBio: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 14, minHeight: 28 },

  pickBtn: {
    marginTop: spacing.sm, alignSelf: 'stretch', borderRadius: radius.full,
    paddingVertical: spacing.xs + 3, alignItems: 'center',
    backgroundColor: ACCENT, borderWidth: 1, borderColor: ACCENT_DARK,
  },
  pickBtnText: { fontSize: 11, fontWeight: '900', color: '#0A0815', letterSpacing: 1 },
});
