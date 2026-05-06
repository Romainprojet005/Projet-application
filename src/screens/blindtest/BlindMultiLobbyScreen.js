import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';
import { selectSongs } from '../../data/blindTestSongs';

const BEAT       = '#10B981';
const BEAT_DARK  = '#059669';
const BEAT_LIGHT = '#6EE7B7';
const BG = OB_BG;

export default function BlindMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom]       = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(`blind_lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blind_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blind_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('BlindMultiGame', { roomId, playerId });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadData = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('blind_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('blind_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < 2) return;
    setStarting(true);
    try {
      const songs = selectSongs(room.song_count, room.category_id);
      await supabase.from('blind_rooms').update({
        status: 'playing',
        phase: 'idle',
        current_song_idx: 0,
        songs: songs,
      }).eq('id', roomId);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} style={Platform.OS === 'web' && { height: '100vh' }}>
        <Text style={styles.title}>🎸 SALLE D'ATTENTE</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.code}>{room?.code ?? '…'}</Text>
          <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JOUEURS CONNECTÉS ({players.length})</Text>
          {players.map(p => (
            <View key={p.id} style={[styles.playerRow, p.id === playerId && styles.playerRowMe]}>
              <Text style={styles.playerEmoji}>{p.is_host ? '👑' : '🎸'}</Text>
              <Text style={[styles.playerName, p.id === playerId && { color: BEAT_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
          {players.length < 2 && <Text style={styles.waitText}>En attente d'au moins 2 joueurs…</Text>}
        </View>

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Comment jouer</Text>
          <Text style={styles.rulesText}>
            🎵 L'hôte lance la musique depuis son téléphone.{'\n'}
            ⌨️ Tous tapent le titre de la chanson simultanément.{'\n'}
            🏆 Le premier à trouver gagne les points !{'\n'}
            ⚡ Plus vite tu trouves, plus tu gagnes de points.
          </Text>
        </View>

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, (players.length < 2 || starting) && styles.startBtnDisabled]}
            onPress={handleStart} disabled={players.length < 2 || starting} activeOpacity={0.8}
          >
            <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              {starting ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>🚀 LANCER LA PARTIE</Text>}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitBanner}>
            <ActivityIndicator color={BEAT} />
            <Text style={styles.waitBannerText}>En attente que l'hôte lance la partie…</Text>
          </View>
        )}

        <TouchableOpacity style={styles.leaveBtn} onPress={async () => {
          await supabase.from('blind_players').delete().eq('id', playerId);
          navigation.navigate('Menu');
        }}>
          <Text style={styles.leaveBtnText}>Quitter</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '900', color: BEAT_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xl },
  codeCard: {
    backgroundColor: BEAT + '22', borderRadius: radius.xl, borderWidth: 1, borderColor: BEAT + '55',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: 11, fontWeight: '800', color: BEAT_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  code:      { fontSize: 56, fontWeight: '900', color: colors.text, letterSpacing: 12 },
  codeHint:  { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  section:   { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  playerRowMe:  { borderColor: BEAT + '66' },
  playerEmoji:  { fontSize: 20 },
  playerName:   { fontSize: 16, fontWeight: '700', color: colors.text },
  waitText:     { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  rules: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  rulesTitle: { fontSize: 13, fontWeight: '800', color: BEAT_LIGHT, marginBottom: spacing.sm },
  rulesText:  { fontSize: 13, color: colors.textSecondary, lineHeight: 24 },
  startBtn:         { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  startBtnDisabled: { opacity: 0.4 },
  startBtnGrad:     { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startBtnText:     { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  waitBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  waitBannerText: { color: colors.textSecondary, fontSize: 14 },
  leaveBtn:     { alignItems: 'center', paddingVertical: spacing.md },
  leaveBtnText: { color: colors.textMuted, fontSize: 13 },
});
