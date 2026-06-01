import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { OB_BG, GOLD, GOLD_LIGHT, GOLD_DARK, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';

export default function BlancMultiFinalScreen({ navigation, route }) {
  const { roomId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    supabase
      .from('blanc_players')
      .select()
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data); });
  }, []);

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <Text style={styles.title}>🏆 RÉSULTATS FINAUX</Text>
        <Text style={styles.sub}>La partie est terminée !</Text>

        {players.map((p, idx) => (
          <LinearGradient
            key={p.id}
            colors={idx === 0 ? ['#2A1800', '#1A0D00'] : ['transparent', 'transparent']}
            style={[styles.row, idx === 0 && styles.rowFirst]}
          >
            <Text style={styles.rank}>
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
            </Text>
            <Text style={[styles.name, idx === 0 && { color: GOLD_LIGHT }]}>{p.name}</Text>
            <Text style={[styles.score, idx === 0 && { color: GOLD_LIGHT }]}>
              {p.score || 0} pt{(p.score || 0) > 1 ? 's' : ''}
            </Text>
          </LinearGradient>
        ))}

        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={{ marginTop: spacing.xl }}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <Text style={styles.btnTxt}>🏠 Retour au menu</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('BlancMultiSetup')} style={{ marginTop: spacing.md }}>
          <Text style={styles.newGame}>Nouvelle partie →</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xxl,
  },
  title: { fontSize: 28, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  sub:   { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
  },
  rowFirst: { borderColor: GOLD + '88' },
  rank:  { fontSize: 22, width: 36 },
  name:  { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
  score: { fontSize: 18, fontWeight: '900', color: colors.textSecondary },

  btn: {
    paddingVertical: spacing.md + 4, borderRadius: radius.full, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnTxt:  { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 2 },
  newGame: { fontSize: 14, color: colors.primaryLight, fontWeight: '600', textAlign: 'center' },
});
