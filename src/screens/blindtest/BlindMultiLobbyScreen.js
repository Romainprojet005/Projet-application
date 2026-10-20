import React, { useEffect, useState, useRef } from 'react';
import { supabase, channelName } from '../../services/supabase';
import { selectSongs } from '../../data/blindTestSongs';
import { LobbyScreen } from '../../components/game/Legende';

export default function BlindMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom]       = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(channelName(`blind_lobby:${roomId}`))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blind_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blind_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('BlindMultiGame', { roomId, playerId });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadData = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('blind_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('blind_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < 2) return;
    setStarting(true);
    try {
      const songs = selectSongs(room.song_count, room.category_id);
      await supabase.from('blind_rooms').update({
        status: 'playing',
        phase: 'idle',
        current_song_idx: 0,
        songs: songs,
      }).eq('id', roomId);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  const leave = async () => {
    await supabase.from('blind_players').delete().eq('id', playerId);
    navigation.navigate('Menu');
  };

  return (
    <LobbyScreen game="blindtest" code={room?.code} players={players} meId={playerId} isHost={isHost}
      starting={starting} onStart={handleStart} onLeave={leave}
      rules="L’hôte lance l’extrait, la musique joue sur tous les téléphones. Le premier à trouver le titre gagne les points." />
  );
}
