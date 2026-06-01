import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
import { ANSWERS, QUESTIONS, initCards } from '../../data/blancMangerData';

const PRP       = colors.primary;
const PRP_LIGHT = colors.primaryLight;

export default function BlancMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [room, setRoom]       = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const channelRef  = useRef(null);
  const loadingRef  = useRef(false);

  const loadData = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('blanc_rooms').select().eq('id', roomId).single(),
      supabase.from('blanc_players').select().eq('room_id', roomId).order('created_at'),
    ]);
    if (r) setRoom(r);
    if (ps) setPlayers(ps);
  };

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(`blanc_lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blanc_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blanc_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('BlancMultiGame', { roomId, playerId, isHost });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const handleStart = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { data: ps } = await supabase
        .from('blanc_players').select().eq('room_id', roomId).order('created_at');
      if (!ps || ps.length < 3) throw new Error('Il faut au moins 3 joueurs pour commencer !');

      const { data: r } = await supabase.from('blanc_rooms').select().eq('id', roomId).single();
      const category    = r.category;
      const totalRounds = r.total_rounds;

      const answerPool = ANSWERS.filter(a => !a.adulte || category === 'adulte');
      const { hands, deck } = initCards(ps.length, answerPool);

      const questionPool = [...QUESTIONS[category]].sort(() => Math.random() - 0.5);
      const questions    = questionPool.slice(0, Math.min(totalRounds, questionPool.length));

      await Promise.all(
        ps.map((p, i) =>
          supabase.from('blanc_players').update({ hand: hands[i] }).eq('id', p.id)
        )
      );

      await supabase.from('blanc_rooms').update({
        status: 'playing',
        phase: 'question',
        current_round: 0,
        judge_idx: 0,
        questions,
        current_question: questions[0],
        deck,
      }).eq('id', roomId);

    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const canStart = players.length >= 3;

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <View style={styles.inner}>

        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕ Quitter</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🃏 REMPLIS LE BLANC</Text>

        {/* Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.codeText}>{room?.code ?? '----'}</Text>
          <Text style={styles.codeHint}>Partage ce code à tes amis</Text>
        </View>

        {/* Joueurs */}
        <View style={styles.playersCard}>
          <Text style={styles.playersLabel}>
            👥 JOUEURS ({players.length}/10)
          </Text>
          {players.map(p => (
            <View key={p.id} style={styles.playerRow}>
              <View style={[styles.playerDot, { backgroundColor: p.is_host ? GOLD : PRP }]} />
              <Text style={styles.playerName}>{p.name}</Text>
              {p.is_host && <Text style={styles.hostTag}>HÔTE</Text>}
              {p.id === playerId && <Text style={styles.youTag}>toi</Text>}
            </View>
          ))}
          {players.length < 3 && (
            <Text style={styles.waitHint}>En attente ({3 - players.length} joueur{3 - players.length > 1 ? 's' : ''} minimum)</Text>
          )}
        </View>

        {isHost ? (
          <TouchableOpacity onPress={handleStart} disabled={!canStart || loading}>
            <LinearGradient
              colors={canStart && !loading ? GOLD_GRADIENT : [colors.border, colors.surface]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              {loading
                ? <ActivityIndicator color={LAUNCH_TEXT} />
                : <Text style={[styles.startTxt, !canStart && { color: colors.textMuted }]}>
                    LANCER LA PARTIE 🚀
                  </Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingBanner}>
            <ActivityIndicator color={PRP_LIGHT} style={{ marginRight: spacing.sm }} />
            <Text style={styles.waitingText}>En attente du lancement...</Text>
          </View>
        )}

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: spacing.xl,
  },

  quitBtn:  { alignSelf: 'flex-start', marginBottom: spacing.lg },
  quitText: { color: colors.textMuted, fontSize: 13 },

  title: {
    fontSize: 24, fontWeight: '900', color: colors.text,
    letterSpacing: 3, textAlign: 'center', marginBottom: spacing.lg,
  },

  codeCard: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 2, borderColor: PRP + '66',
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 3, marginBottom: spacing.sm },
  codeText:  { fontSize: 52, fontWeight: '900', color: PRP_LIGHT, letterSpacing: 12 },
  codeHint:  { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },

  playersCard: {
    flex: 1,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  playersLabel: { fontSize: 11, fontWeight: '800', color: PRP_LIGHT, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border + '55',
  },
  playerDot:  { width: 10, height: 10, borderRadius: 5 },
  playerName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  hostTag: {
    fontSize: 9, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 1,
    backgroundColor: GOLD + '22', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full, borderWidth: 1, borderColor: GOLD + '44',
  },
  youTag: { fontSize: 10, color: PRP_LIGHT, fontStyle: 'italic' },
  waitHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },

  startBtn: {
    paddingVertical: spacing.md + 4, borderRadius: radius.full, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  startTxt: { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 2 },

  waitingBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: PRP + '22', borderRadius: radius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderWidth: 1, borderColor: PRP + '44',
  },
  waitingText: { fontSize: 14, color: PRP_LIGHT, fontWeight: '600' },
});
