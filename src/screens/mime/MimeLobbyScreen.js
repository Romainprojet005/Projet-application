import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase, channelName } from '../../services/supabase';
import { pickWord } from '../../data/mimeWords';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, RoomCode, LobbyPlayers, AdultTag, T,
} from '../../components/game/Legende';

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
      .channel(channelName(`lobby:${roomId}`))
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

  const leave = async () => {
    await supabase.from('mime_players').delete().eq('id', playerId);
    navigation.navigate('Menu');
  };

  return (
    <GameScreen
      top={<GameTopBar game="mime" onBack={leave} right={<Text style={s.tag}>ATTENTE</Text>} />}
      footer={(
        <ActionBar note={isHost ? null : null}>
          {isHost ? (
            <PrimaryButton label={starting ? 'Lancement…' : 'Lancer la partie'} onPress={handleStart} disabled={players.length < 2 || starting} />
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
      {room ? (
        <View style={s.mode}>
          <Text style={s.modeText}>{room.category === 'adulte' ? 'Mode adulte' : 'Mode classique · tout public'}</Text>
          {room.category === 'adulte' ? <AdultTag /> : null}
        </View>
      ) : null}
      <LobbyPlayers players={players} meId={playerId} />
      <Text style={s.rules}>Le mimeur voit un mot et le fait deviner sans parler. Les autres tapent leur réponse sur leur téléphone : +3 points pour qui trouve, +2 pour le mimeur.</Text>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  tag: { color: T.encreDouce, fontSize: 11, letterSpacing: 1.6 },
  mode: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modeText: { color: T.encreDouce, fontSize: 14 },
  wait: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  waitText: { color: T.encre, fontSize: 15 },
  rules: { color: T.encreDouce, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
