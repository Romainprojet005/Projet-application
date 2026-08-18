import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme';
import PageScroll from '../../components/PageScroll';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';
import { getGame, DEFAULT_GAME_ID } from '../../data/selectGames';
import LolTournamentView from './LolTournamentView';

const ACCENT = '#C89B3C';

export default function LolSelectMultiTournamentScreen({ navigation, route }) {
  const { roomId, playerId, gameId } = route.params;
  const [payload, setPayload] = useState(null); // { result, hostTeam, guestTeam, hostName, guestName }
  const [isHost, setIsHost]   = useState(null);
  const [roomGameId, setRoomGameId] = useState(gameId || DEFAULT_GAME_ID);
  const channelRef = useRef(null);

  useEffect(() => {
    load();
    channelRef.current = supabase
      .channel(`lolselect_result:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lolselect_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          // L'un des deux joueurs a relancé une partie dans la même salle :
          // les deux écrans repartent directement sur un nouveau draft.
          if (r.status === 'drafting') { navigation.replace('LolSelectDraft', { roomId, playerId, gameId: r.game || gameId }); return; }
          if (r.result_json) setPayload(r.result_json);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  // Ne navigue pas directement : le changement de statut de la salle est
  // capté par l'abonnement realtime ci-dessus, sur CE client comme sur
  // celui de l'adversaire, pour que les deux repartent en même temps.
  const handleReplay = async () => {
    await supabase.from('lolselect_players').update({ team_json: null, ready: false }).eq('room_id', roomId);
    await supabase.from('lolselect_rooms').update({ status: 'drafting', result_json: null }).eq('id', roomId);
  };

  const load = async () => {
    const [{ data: room }, { data: me }] = await Promise.all([
      supabase.from('lolselect_rooms').select().eq('id', roomId).single(),
      supabase.from('lolselect_players').select().eq('id', playerId).single(),
    ]);
    if (room?.result_json) setPayload(room.result_json);
    if (room?.game) setRoomGameId(room.game);
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
      game={getGame(roomGameId)}
      labelA={hostName}
      labelB={guestName}
      teamA={hostTeam}
      teamB={guestTeam}
      result={result}
      youSide={youSide}
      onHome={() => navigation.navigate('Menu')}
      onReplay={handleReplay}
      replayLabel="🔄  Rejouer dans cette salle"
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  loadingScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary, fontSize: 13 },
});
