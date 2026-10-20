import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, RoomCode, LobbyPlayers, T } from '../../components/game/Legende';

const MIN_PLAYERS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TribunalLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players,  setPlayers]  = useState([]);
  const [room,     setRoom]     = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    load();
    channelRef.current = supabase
      .channel(channelName(`tribunal_lobby:${roomId}`))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tribunal_players', filter: `room_id=eq.${roomId}` },
        () => load()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'writing') navigation.replace('TribunalGame', { roomId, playerId });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const load = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('tribunal_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('tribunal_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r)  setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < MIN_PLAYERS) return;
    setStarting(true);
    try {
      const shuffled = shuffle(players);
      const n = shuffled.length;
      // Assign circular targets: player[i] writes about player[(i+1)%n]
      await Promise.all(shuffled.map((p, i) =>
        supabase.from('tribunal_players').update({
          turn_order: i,
          target_id: shuffled[(i + 1) % n].id,
        }).eq('id', p.id)
      ));
      await supabase.from('tribunal_rooms').update({ status: 'writing' }).eq('id', roomId);
    } catch {
      setStarting(false);
    }
  };

  const leave = async () => {
    await supabase.from('tribunal_players').delete().eq('id', playerId);
    navigation.navigate('Menu');
  };

  return (
    <GameScreen
      top={<GameTopBar game="tribunal" onBack={leave} right={<Text style={s.tag}>ATTENTE</Text>} />}
      footer={(
        <ActionBar>
          {isHost ? (
            <PrimaryButton label={starting ? 'Lancement…' : 'Ouvrir l’audience'} onPress={handleStart} disabled={players.length < MIN_PLAYERS || starting} />
          ) : (
            <View style={s.wait}>
              <ActivityIndicator color={T.orTexte} />
              <Text style={s.waitText}>En attente que l’hôte lance la partie…</Text>
            </View>
          )}
          <TextLink label="Quitter la salle" color={T.encreDouce} onPress={leave} />
        </ActionBar>
      )}
    >
      <RoomCode code={room?.code} />
      <LobbyPlayers players={players} meId={playerId} min={MIN_PLAYERS} label="Jurés connectés" />
      <Text style={s.rules}>Chacun recevra le nom d’un autre joueur et écrira une vérité sur lui. Ensuite, chaque accusé devra convaincre le jury que c’est faux.</Text>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  tag: { color: T.encreDouce, fontSize: 11, letterSpacing: 1.6 },
  wait: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  waitText: { color: T.encre, fontSize: 15 },
  rules: { color: T.encreDouce, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
