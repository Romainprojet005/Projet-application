import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';
import LolTournamentView from './LolTournamentView';

const ACCENT = '#C89B3C';

export default function LolSelectMultiTournamentScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;
  const [payload, setPayload] = useState(null); // { result, hostTeam, guestTeam, hostName, guestName }
  const [isHost, setIsHost]   = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    load();
    channelRef.current = supabase
      .channel(`lolselect_result:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lolselect_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => { if (r.result_json) setPayload(r.result_json); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const load = async () => {
    const [{ data: room }, { data: me }] = await Promise.all([
      supabase.from('lolselect_rooms').select().eq('id', roomId).single(),
      supabase.from('lolselect_players').select().eq('id', playerId).single(),
    ]);
    if (room?.result_json) setPayload(room.result_json);
    if (me) setIsHost(!!me.is_host);
  };

  if (!payload) {
    return (
      <LinearGradient colors={OB_BG} style={styles.container}>
        <PageScroll contentContainerStyle={styles.loadingScroll}>
          <ActivityIndicator color={ACCENT} />
          <Text style={styles.loadingText}>Calcul du tournoi…</Text>
        </PageScroll>
      </LinearGradient>
    );
  }

  const { result, hostTeam, guestTeam, hostName, guestName } = payload;
  const youSide = isHost === null ? null : (isHost ? 'A' : 'B');

  return (
    <LolTournamentView
      labelA={hostName}
      labelB={guestName}
      teamA={hostTeam}
      teamB={guestTeam}
      result={result}
      youSide={youSide}
      onHome={() => navigation.navigate('Menu')}
      onReplay={() => navigation.navigate('LolSelectMultiSetup')}
      replayLabel="🔄  Nouvelle partie à distance"
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  loadingScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary, fontSize: 13 },
});
