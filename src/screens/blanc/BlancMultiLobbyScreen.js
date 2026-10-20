import React, { useEffect, useRef, useState } from 'react';
import { supabase, channelName } from '../../services/supabase';
import alerte from '../../utils/alerte';
import { ANSWERS, QUESTIONS, initCards } from '../../data/blancMangerData';
import { LobbyScreen } from '../../components/game/Legende';

export default function BlancMultiLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [room, setRoom]       = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const channelRef  = useRef(null);
  const loadingRef  = useRef(false);

  const loadData = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('blanc_rooms').select().eq('id', roomId).single(),
      supabase.from('blanc_players').select().eq('room_id', roomId).order('created_at'),
    ]);
    if (r) setRoom(r);
    if (ps) setPlayers(ps);
  };

  useEffect(() => {
    loadData();
    channelRef.current = supabase
      .channel(channelName(`blanc_lobby:${roomId}`))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blanc_players', filter: `room_id=eq.${roomId}` },
        () => loadData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blanc_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'playing') {
            navigation.replace('BlancMultiGame', { roomId, playerId, isHost });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const handleStart = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { data: ps } = await supabase
        .from('blanc_players').select().eq('room_id', roomId).order('created_at');
      if (!ps || ps.length < 3) throw new Error('Il faut au moins 3 joueurs pour commencer !');

      const { data: r } = await supabase.from('blanc_rooms').select().eq('id', roomId).single();
      const category    = r.category;
      const totalRounds = r.total_rounds;

      const answerPool = ANSWERS.filter(a => !a.adulte || category === 'adulte');
      const { hands, deck } = initCards(ps.length, answerPool);

      const questionPool = [...QUESTIONS[category]].sort(() => Math.random() - 0.5);
      const questions    = questionPool.slice(0, Math.min(totalRounds, questionPool.length));

      await Promise.all(
        ps.map((p, i) =>
          supabase.from('blanc_players').update({ hand: hands[i] }).eq('id', p.id)
        )
      );

      await supabase.from('blanc_rooms').update({
        status: 'playing',
        phase: 'question',
        current_round: 0,
        judge_idx: 0,
        questions,
        current_question: questions[0],
        deck,
      }).eq('id', roomId);

    } catch (e) {
      alerte('Erreur', e.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  return (
    <LobbyScreen game="blanc_manger" code={room?.code} players={players} meId={playerId} isHost={isHost}
      starting={loading} onStart={handleStart} onLeave={() => navigation.navigate('Menu')} min={3}
      rules="Chacun choisit sa carte en secret sur son téléphone. Le jury du tour couronne la réponse la plus drôle." />
  );
}
