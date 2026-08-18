import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const ACCENT       = '#C89B3C';
const ACCENT_LIGHT = '#F0D68C';
const ACCENT_DARK  = '#8B6914';

export default function LolSelectMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom]       = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(`lolselect_lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lolselect_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lolselect_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'drafting') {
            navigation.replace('LolSelectDraft', { roomId, playerId, gameId: r.game || gameId });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadData = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('lolselect_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('lolselect_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length !== 2) return;
    setStarting(true);
    try {
      await supabase.from('lolselect_rooms').update({ status: 'drafting' }).eq('id', roomId);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} style={Platform.OS === 'web' && { height: '100vh' }}>
        <Text style={styles.title}>🎮 SALLE D'ATTENTE</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.code}>{room?.code ?? '…'}</Text>
          <Text style={styles.codeHint}>Partage ce code avec la personne qui joue à distance</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JOUEURS CONNECTÉS ({players.length}/2)</Text>
          {players.map(p => (
            <View key={p.id} style={[styles.playerRow, p.id === playerId && styles.playerRowMe]}>
              <Text style={styles.playerEmoji}>{p.is_host ? '👑' : '🎮'}</Text>
              <Text style={[styles.playerName, p.id === playerId && { color: ACCENT_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
          {players.length < 2 && (
            <Text style={styles.waitText}>En attente d'un deuxième joueur…</Text>
          )}
        </View>

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Comment jouer</Text>
          <Text style={styles.rulesText}>
            🃏 Chacun draft sa propre équipe de 5, en privé sur son appareil.{'\n'}
            ⏳ Une fois les deux équipes complètes, le tournoi se lance automatiquement.{'\n'}
            📖 Le récit du match s'affiche ensuite, identique sur les deux écrans.
          </Text>
        </View>

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, (players.length !== 2 || starting) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={players.length !== 2 || starting}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              {starting
                ? <ActivityIndicator color="#0A0815" />
                : <Text style={styles.startBtnText}>🚀 LANCER LES DRAFTS</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitBanner}>
            <ActivityIndicator color={ACCENT} />
            <Text style={styles.waitBannerText}>En attente que l'hôte lance la partie…</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={async () => {
            await supabase.from('lolselect_players').delete().eq('id', playerId);
            navigation.navigate('Menu');
          }}
        >
          <Text style={styles.leaveBtnText}>Quitter</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '900', color: ACCENT_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xl },
  codeCard: {
    backgroundColor: ACCENT + '22', borderRadius: radius.xl, borderWidth: 1, borderColor: ACCENT + '55',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  code: { fontSize: 56, fontWeight: '900', color: colors.text, letterSpacing: 12 },
  codeHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  playerRowMe: { borderColor: ACCENT + '66' },
  playerEmoji: { fontSize: 20 },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  waitText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  rules: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  rulesTitle: { fontSize: 13, fontWeight: '800', color: ACCENT_LIGHT, marginBottom: spacing.sm },
  rulesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  startBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  startBtnDisabled: { opacity: 0.4 },
  startBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startBtnText: { fontSize: 15, fontWeight: '900', color: '#0A0815', letterSpacing: 2 },
  waitBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, paddingVertical: spacing.lg,
  },
  waitBannerText: { color: colors.textSecondary, fontSize: 14 },
  leaveBtn: { alignItems: 'center', paddingVertical: spacing.md },
  leaveBtnText: { color: colors.textMuted, fontSize: 13 },
});
