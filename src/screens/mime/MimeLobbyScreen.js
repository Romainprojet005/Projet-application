import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';
import { pickWord } from '../../data/mimeWords';

const PINK = '#C026D3';
const PINK_DARK = '#86198F';
const PINK_LIGHT = '#E879F9';
const BG = OB_BG;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MimeLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadPlayers();

    channelRef.current = supabase
      .channel(`lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mime_players', filter: `room_id=eq.${roomId}` },
        () => loadPlayers()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mime_rooms', filter: `id=eq.${roomId}` },
        ({ new: newRoom }) => {
          if (newRoom.status === 'playing') {
            navigation.replace('MimeGame', { roomId, playerId });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadPlayers = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('mime_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('mime_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < 2) return;
    setStarting(true);
    try {
      const shuffled = shuffle(players);
      await Promise.all(shuffled.map((p, i) =>
        supabase.from('mime_players').update({ turn_order: i }).eq('id', p.id)
      ));
      const firstMime = shuffled[0];
      await supabase.from('mime_rooms').update({
        status: 'playing',
        round_number: 1,
        current_mime_player_id: firstMime.id,
        current_word: pickWord(room?.category),
        round_started_at: new Date().toISOString(),
      }).eq('id', roomId);
    } catch (e) {
      setStarting(false);
    }
  };

  const myPlayer = players.find(p => p.id === playerId);

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <Text style={styles.title}>🎭 SALLE D'ATTENTE</Text>

        {/* Room code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.code}>{room?.code ?? '…'}</Text>
          <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
        </View>

        {/* Mode badge */}
        {room && (
          <View style={[styles.modeBadge, room.category === 'adulte' && styles.modeBadgeAdulte]}>
            <Text style={styles.modeBadgeText}>
              {room.category === 'adulte' ? '🔞 MODE ADULTE — 18+ sans filtre' : '🎭 MODE CLASSIQUE — Tout public'}
            </Text>
          </View>
        )}

        {/* Players list */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            JOUEURS CONNECTÉS ({players.length})
          </Text>
          {players.map(p => (
            <View key={p.id} style={[styles.playerRow, p.id === playerId && styles.playerRowMe]}>
              <Text style={styles.playerEmoji}>{p.is_host ? '👑' : '🎭'}</Text>
              <Text style={[styles.playerName, p.id === playerId && { color: PINK_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
          {players.length < 2 && (
            <Text style={styles.waitText}>En attente d'au moins 2 joueurs…</Text>
          )}
        </View>

        {/* Rules reminder */}
        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Comment jouer</Text>
          <Text style={styles.rulesText}>
            🎭 Le mime voit un mot et doit le faire deviner sans parler.{'\n'}
            ⌨️ Les autres tapent leur réponse sur leur téléphone.{'\n'}
            🏆 +3 pts pour le devineur, +2 pts pour le mime !
          </Text>
        </View>

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, (players.length < 2 || starting) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={players.length < 2 || starting}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[PINK, PINK_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              {starting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.startBtnText}>🚀 LANCER LA PARTIE</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitBanner}>
            <ActivityIndicator color={PINK} />
            <Text style={styles.waitBannerText}>En attente que l'hôte lance la partie…</Text>
          </View>
        )}

        <TouchableOpacity style={styles.leaveBtn} onPress={async () => {
          await supabase.from('mime_players').delete().eq('id', playerId);
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
  title: { fontSize: 22, fontWeight: '900', color: PINK_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xl },
  codeCard: {
    backgroundColor: PINK + '22',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: PINK + '55',
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: 11, fontWeight: '800', color: PINK_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  code: { fontSize: 56, fontWeight: '900', color: colors.text, letterSpacing: 12 },
  codeHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  playerRowMe: { borderColor: PINK + '66' },
  playerEmoji: { fontSize: 20 },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  waitText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  rules: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rulesTitle: { fontSize: 13, fontWeight: '800', color: PINK_LIGHT, marginBottom: spacing.sm },
  rulesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  startBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  startBtnDisabled: { opacity: 0.4 },
  startBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  waitBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, paddingVertical: spacing.lg,
  },
  waitBannerText: { color: colors.textSecondary, fontSize: 14 },
  leaveBtn: { alignItems: 'center', paddingVertical: spacing.md },
  leaveBtnText: { color: colors.textMuted, fontSize: 13 },
  modeBadge: {
    borderRadius: radius.full, borderWidth: 1, borderColor: PINK + '55',
    backgroundColor: PINK + '18', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    alignItems: 'center', marginBottom: spacing.xl,
  },
  modeBadgeAdulte: { borderColor: '#FF6B6B88', backgroundColor: '#FF6B6B18' },
  modeBadgeText: { fontSize: 12, fontWeight: '800', color: PINK_LIGHT, letterSpacing: 1 },
});
