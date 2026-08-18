import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';
import { simulateBo3 } from '../../data/lolSimulation';
import { getGame, DEFAULT_GAME_ID } from '../../data/selectGames';

const ACCENT       = '#C89B3C';
const ACCENT_LIGHT = '#F0D68C';

export default function LolSelectMultiWaitScreen({ navigation, route }) {
  const { roomId, playerId, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const channelRef = useRef(null);
  const computingRef = useRef(false);

  useEffect(() => {
    loadAndMaybeCompute();
    channelRef.current = supabase
      .channel(`lolselect_wait:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lolselect_players', filter: `room_id=eq.${roomId}` },
        () => loadAndMaybeCompute()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lolselect_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          if (r.status === 'finished') navigation.replace('LolSelectMultiTournament', { roomId, playerId, gameId: r.game || gameId });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadAndMaybeCompute = async () => {
    const { data: ps } = await supabase.from('lolselect_players').select().eq('room_id', roomId).order('created_at');
    if (!ps) return;
    setPlayers(ps);

    if (ps.length !== 2 || !ps.every(p => p.ready) || computingRef.current) return;

    const me = ps.find(p => p.id === playerId);
    if (!me?.is_host) return; // seul l'hôte calcule le résultat, pour éviter toute divergence entre écrans

    computingRef.current = true;
    // Relit la salle pour connaître le jeu de façon sûre (source de vérité),
    // au cas où les route params se seraient perdus entre écrans.
    const { data: room } = await supabase.from('lolselect_rooms').select().eq('id', roomId).single();
    const game = getGame(room?.game || gameId || DEFAULT_GAME_ID);
    const host  = ps.find(p => p.is_host);
    const guest = ps.find(p => !p.is_host);
    const result = simulateBo3(game, host.team_json, guest.team_json, host.name, guest.name);
    await supabase.from('lolselect_rooms').update({
      status: 'finished',
      result_json: { result, hostTeam: host.team_json, guestTeam: guest.team_json, hostName: host.name, guestName: guest.name },
      reveal_json: { phase: 'lineup', gameIdx: 0, lineIdx: 0 },
    }).eq('id', roomId);
  };

  const opponent = players.find(p => p.id !== playerId);
  const bothReady = players.length === 2 && players.every(p => p.ready);

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <PageScroll contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{bothReady ? '⚔️' : '⏳'}</Text>
          <Text style={styles.title}>{bothReady ? 'LES DEUX ÉQUIPES SONT PRÊTES !' : 'ÉQUIPE VERROUILLÉE'}</Text>
          <Text style={styles.sub}>
            {bothReady
              ? 'Calcul du tournoi en cours…'
              : opponent
                ? `En attente que ${opponent.name} termine son draft…`
                : "En attente de l'adversaire…"}
          </Text>
          <ActivityIndicator color={ACCENT} style={{ marginTop: spacing.lg }} />
        </View>
      </PageScroll>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: `${ACCENT}40`,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm, maxWidth: 420, alignSelf: 'center',
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: 1, textAlign: 'center' },
  sub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
});
