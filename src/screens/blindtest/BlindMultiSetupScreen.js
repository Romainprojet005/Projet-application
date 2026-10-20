import React, { useState } from 'react';
import { Text } from 'react-native';
import { supabase } from '../../services/supabase';
import alerte from '../../utils/alerte';
import { CATEGORIES } from '../../data/blindTestSongs';
import { SetupLayout, Section, ChoicePills, ChoiceChips, Field, T } from '../../components/game/Legende';

const TABS = [{ value: 'create', label: 'Créer une salle' }, { value: 'join', label: 'Rejoindre' }];
const SONG_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS = [30, null]; // null = infini

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('blind_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('blind_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function BlindMultiSetupScreen({ navigation }) {
  const [tab, setTab]             = useState('create');
  const [name, setName]           = useState('');
  const [joinCode, setJoinCode]   = useState('');
  const [categoryId, setCategoryId] = useState('france');
  const [songCount, setSongCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading]     = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('blind_rooms')
        .insert({ code, category_id: categoryId, song_count: songCount, time_limit: timeLimit })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('blind_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlindMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
    } catch (e) {
      alerte('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || joinCode.length < 4) return;
    setLoading(true);
    try {
      const { data: room, error: rErr } = await supabase
        .from('blind_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifiez le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: player, error: pErr } = await supabase
        .from('blind_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlindMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
    } catch (e) {
      alerte('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = tab === 'create';
  const canStart = !loading && !!name.trim() && (create || joinCode.length >= 4);

  return (
    <SetupLayout
      game="blindtest"
      navigation={navigation}
      onBack={() => navigation.navigate('BlindTestSetup')}
      onStart={create ? handleCreate : handleJoin}
      canStart={canStart}
      startLabel={loading ? 'Connexion…' : create ? 'Créer la salle' : 'Rejoindre la salle'}
      subtitle="Mode multi-téléphones"
      note="Chaque joueur devine sur son propre téléphone."
      rules={[
        'L’hôte lance l’extrait : la musique joue sur tous les téléphones.',
        'Tous les joueurs tapent la réponse en même temps.',
        'Le premier à trouver gagne les points.',
      ]}
    >
      <ChoicePills options={TABS} value={tab} onChange={setTab} />

      <Section label="Votre prénom">
        <Field placeholder="Votre prénom…" value={name} onChangeText={setName} autoCapitalize="words" maxLength={20} accessibilityLabel="Votre prénom" />
      </Section>

      {create ? (
        <>
          <Section label="Catégorie">
            <ChoiceChips options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))} value={categoryId} onChange={setCategoryId} />
          </Section>
          <Section label="Chansons">
            <ChoicePills options={SONG_OPTIONS} value={songCount} onChange={setSongCount} />
          </Section>
          <Section label="Temps par chanson">
            <ChoicePills options={TIME_OPTIONS.map((t) => ({ value: t, label: t === null ? 'Illimité' : t + ' s' }))} value={timeLimit} onChange={setTimeLimit} />
          </Section>
        </>
      ) : (
        <Section label="Code de la salle">
          <Field placeholder="ABCD" value={joinCode} onChangeText={(t) => setJoinCode(t.toUpperCase())} autoCapitalize="characters" maxLength={4}
            accessibilityLabel="Code de la salle" style={{ textAlign: 'center', fontSize: 28, letterSpacing: 10, height: 64 }} />
          <Text style={{ color: T.encreDouce, fontSize: 13 }}>Demandez le code au joueur qui a créé la salle.</Text>
        </Section>
      )}
    </SetupLayout>
  );
}
