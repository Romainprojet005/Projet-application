import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';

const VOTE_COLOR = '#6366F1';
const VOTE_DARK  = '#4F46E5';
const VOTE_LIGHT = '#A5B4FC';
const BG = ['#080818', '#0C0A24', '#080818'];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function VoteMultiFinalScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    supabase
      .from('vote_players')
      .select()
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data); });
  }, []);

  const winner = players[0];

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} style={Platform.OS === 'web' && { height: '100vh' }}>
        <Text style={styles.title}>🏆 RÉSULTATS FINAUX</Text>
        <Text style={styles.subtitle}>Vote Majorité Multi-Téléphones</Text>

        {winner && (
          <View style={styles.winnerCard}>
            <Text style={styles.winnerEmoji}>🥇</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerScore}>{winner.score} point{winner.score !== 1 ? 's' : ''}</Text>
          </View>
        )}

        <View style={styles.rankList}>
          {players.map((p, i) => (
            <View key={p.id} style={[styles.rankRow, p.id === playerId && styles.rankRowMe]}>
              <Text style={styles.rankMedal}>{MEDALS[i] ?? `${i + 1}.`}</Text>
              <Text style={[styles.rankName, p.id === playerId && { color: VOTE_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
              <Text style={styles.rankScore}>{p.score} pts</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => navigation.navigate('VoteMultiSetup')}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
            <Text style={styles.mainBtnText}>⚖️ NOUVELLE PARTIE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuBtnText}>🏠 Retour au menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xxl },
  title:    { fontSize: 28, fontWeight: '900', color: VOTE_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xs },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },

  winnerCard: {
    backgroundColor: VOTE_COLOR + '22', borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: VOTE_COLOR + '55', marginBottom: spacing.xl,
  },
  winnerEmoji: { fontSize: 64, marginBottom: spacing.md },
  winnerName:  { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  winnerScore: { fontSize: 20, fontWeight: '700', color: VOTE_LIGHT },

  rankList: { gap: spacing.sm, marginBottom: spacing.xl },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  rankRowMe:  { borderColor: VOTE_COLOR + '66' },
  rankMedal:  { fontSize: 22, width: 36 },
  rankName:   { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  rankScore:  { fontSize: 16, fontWeight: '900', color: VOTE_LIGHT },

  mainBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },

  menuBtn:    { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
});
