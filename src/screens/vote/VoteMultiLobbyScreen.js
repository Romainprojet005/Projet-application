import React, { useEffect, useState, useRef } from 'react';
import { supabase, channelName } from '../../services/supabase';
import { selectQuestions } from '../../data/voteData';
import { LobbyScreen } from '../../components/game/Legende';

export default function VoteMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players, setPlayers] = useState([]);
  const [room, setRoom]       = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(channelName(`vote_lobby:${roomId}`))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vote_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vote_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('VoteMultiGame', { roomId, playerId });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const loadData = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('vote_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('vote_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r) setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < 2) return;
    setStarting(true);
    try {
      const playerNames = players.map(p => p.name);
      const questions   = selectQuestions(room.question_count, room.category_id, playerNames);
      await supabase.from('vote_rooms').update({
        status: 'playing',
        phase: 'voting',
        current_question_idx: 0,
        questions: questions,
        player_names: playerNames,
      }).eq('id', roomId);
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  const leave = async () => {
    await supabase.from('vote_players').delete().eq('id', playerId);
    navigation.navigate('Menu');
  };

  return (
    <LobbyScreen game="vote" code={room?.code} players={players} meId={playerId} isHost={isHost}
      starting={starting} onStart={handleStart} onLeave={leave}
      rules="Chacun vote sur son téléphone. Voter avec la majorité : +1 point. Vote unanime : +2 points pour tous. Égalité parfaite : 0 point." />
  );
}
