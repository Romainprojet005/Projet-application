import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { selectQuestions } from '../../data/voteData';

const VOTE_COLOR = '#6366F1';
const VOTE_DARK  = '#4F46E5';
const VOTE_LIGHT = '#A5B4FC';
const BG = ['#080818', '#0C0A24', '#080818'];

export default function VoteMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom]       = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(`vote_lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vote_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vote_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('VoteMultiGame', { roomId, playerId });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadData = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('vote_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('vote_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < 2) return;
    setStarting(true);
    try {
      const playerNames = players.map(p => p.name);
      const questions   = selectQuestions(room.question_count, room.category_id, playerNames);
      await supabase.from('vote_rooms').update({
        status: 'playing',
        phase: 'voting',
        current_question_idx: 0,
        questions: questions,
        player_names: playerNames,
      }).eq('id', roomId);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} style={Platform.OS === 'web' && { height: '100vh' }}>
        <Text style={styles.title}>⚖️ SALLE D'ATTENTE</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.code}>{room?.code ?? '…'}</Text>
          <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JOUEURS CONNECTÉS ({players.length})</Text>
          {players.map(p => (
            <View key={p.id} style={[styles.playerRow, p.id === playerId && styles.playerRowMe]}>
              <Text style={styles.playerEmoji}>{p.is_host ? '👑' : '⚖️'}</Text>
              <Text style={[styles.playerName, p.id === playerId && { color: VOTE_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
          {players.length < 2 && (
            <Text style={styles.waitText}>En attente d'au moins 2 joueurs…</Text>
          )}
        </View>

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Comment jouer</Text>
          <Text style={styles.rulesText}>
            📱 Chaque joueur vote sur son téléphone.{'\n'}
            👥 Voter avec la majorité → <Text style={styles.rulesHighlight}>+1 pt</Text>.{'\n'}
            🏆 Vote unanime → <Text style={styles.rulesHighlight}>+2 pts</Text> pour tous !{'\n'}
            ⚖️ Égalité parfaite → <Text style={styles.rulesHighlight}>0 pt</Text>.
          </Text>
        </View>

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, (players.length < 2 || starting) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={players.length < 2 || starting}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              {starting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.startBtnText}>🚀 LANCER LA PARTIE</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitBanner}>
            <ActivityIndicator color={VOTE_COLOR} />
            <Text style={styles.waitBannerText}>En attente que l'hôte lance la partie…</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={async () => {
            await supabase.from('vote_players').delete().eq('id', playerId);
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
  title: { fontSize: 22, fontWeight: '900', color: VOTE_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xl },
  codeCard: {
    backgroundColor: VOTE_COLOR + '22', borderRadius: radius.xl, borderWidth: 1, borderColor: VOTE_COLOR + '55',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: 11, fontWeight: '800', color: VOTE_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  code: { fontSize: 56, fontWeight: '900', color: colors.text, letterSpacing: 12 },
  codeHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  playerRowMe: { borderColor: VOTE_COLOR + '66' },
  playerEmoji: { fontSize: 20 },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  waitText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  rules: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  rulesTitle: { fontSize: 13, fontWeight: '800', color: VOTE_LIGHT, marginBottom: spacing.sm },
  rulesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 24 },
  rulesHighlight: { color: VOTE_LIGHT, fontWeight: '800' },
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
});
