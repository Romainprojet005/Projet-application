import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const PINK = '#C026D3';
const PINK_DARK = '#86198F';
const PINK_LIGHT = '#E879F9';
const BG = OB_BG;
const MEDALS = ['🥇', '🥈', '🥉'];

export default function MimeFinalScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [players, setPlayers] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    supabase.from('mime_players').select().eq('room_id', roomId).order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data); });
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const maxScore = players[0]?.score || 1;
  const winner = players[0];

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>🎭 FIN DE PARTIE !</Text>

          {winner && (
            <View style={styles.winnerCard}>
              <LinearGradient colors={[PINK + '33', PINK + '11']} style={styles.winnerInner}>
                <Text style={styles.winnerTrophy}>🏆</Text>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerScore}>{winner.score} pts</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.leaderboard}>
            <Text style={styles.leaderboardLabel}>🏆 CLASSEMENT</Text>
            {players.map((p, idx) => (
              <View key={p.id} style={[styles.row, p.id === playerId && styles.rowMe]}>
                <Text style={styles.medal}>{idx < 3 ? MEDALS[idx] : `${idx + 1}.`}</Text>
                <Text style={[styles.playerName, p.id === playerId && { color: PINK_LIGHT }]}>
                  {p.name}{p.id === playerId ? ' (toi)' : ''}
                </Text>
                <View style={styles.barWrap}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(p.score / maxScore) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.scoreVal}>{p.score} pts</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.replayBtn}
            onPress={async () => {
              await supabase.from('mime_rooms').delete().eq('id', roomId);
              navigation.replace('MimeSetup');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[PINK, PINK_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.replayBtnGrad}>
              <Text style={styles.replayBtnText}>🔄 REJOUER</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '900', color: PINK_LIGHT, textAlign: 'center', letterSpacing: 2, marginBottom: spacing.xl },
  winnerCard: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl, borderWidth: 1, borderColor: PINK + '55' },
  winnerInner: { alignItems: 'center', padding: spacing.xl },
  winnerTrophy: { fontSize: 56, marginBottom: spacing.sm },
  winnerName: { fontSize: 28, fontWeight: '900', color: colors.text },
  winnerScore: { fontSize: 20, fontWeight: '700', color: PINK_LIGHT, marginTop: spacing.xs },
  leaderboard: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  leaderboardLabel: { fontSize: 11, fontWeight: '800', color: PINK_LIGHT, letterSpacing: 2, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.sm, borderWidth: 1, borderColor: 'transparent',
    paddingHorizontal: spacing.xs,
  },
  rowMe: { borderColor: PINK + '44' },
  medal: { fontSize: 20, width: 32, textAlign: 'center' },
  playerName: { width: 80, fontSize: 14, fontWeight: '700', color: colors.text },
  barWrap: { flex: 1 },
  barTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: PINK, borderRadius: 3 },
  scoreVal: { width: 48, fontSize: 12, color: colors.textSecondary, textAlign: 'right', fontWeight: '700' },
  replayBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  replayBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  replayBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  menuBtn: { alignItems: 'center', paddingVertical: spacing.md },
  menuBtnText: { fontSize: 14, color: PINK_LIGHT, fontWeight: '600' },
});
