import React, { useState } from 'react';
import { Text } from 'react-native';
import { supabase } from '../../services/supabase';
import alerte from '../../utils/alerte';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, Field, T } from '../../components/game/Legende';

const TABS = [{ value: 'create', label: 'Créer une salle' }, { value: 'join', label: 'Rejoindre' }];
const LEVELS = [
  { value: 'classique', label: 'Classique', sub: 'Tout public', heat: 1 },
  { value: 'adulte', label: 'Adulte', heat: 3, adult: true },
];

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('blanc_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('blanc_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

const CATEGORIES = [
  { id: 'classique', emoji: '', name: 'Classique' },
  { id: 'adulte',    emoji: '', name: 'Adulte'    },
];

export default function BlancMultiSetupScreen({ navigation }) {
  const [tab, setTab]         = useState('create');
  const [name, setName]       = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [category, setCategory] = useState('classique');
  const [rounds, setRounds]   = useState(10);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('blanc_rooms')
        .insert({ code, category, total_rounds: rounds })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('blanc_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlancMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('blanc_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifiez le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: player, error: pErr } = await supabase
        .from('blanc_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlancMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
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
      game="blanc_manger"
      navigation={navigation}
      onBack={() => navigation.navigate('BlancSetup')}
      onStart={create ? handleCreate : handleJoin}
      canStart={canStart}
      startLabel={loading ? 'Connexion…' : create ? 'Créer la salle' : 'Rejoindre la salle'}
      subtitle="Mode multi-téléphones"
      note="Chaque joueur choisit ses cartes sur son propre téléphone."
      rules={[
        'Un joueur crée la salle, les autres la rejoignent avec son code à 4 lettres.',
        'Chacun choisit en secret, sur son téléphone, la carte qui complète le mieux la phrase.',
        'Le jury du tour désigne sa réponse préférée : son auteur marque 1 point.',
      ]}
    >
      <ChoicePills options={TABS} value={tab} onChange={setTab} />

      <Section label="Votre prénom">
        <Field placeholder="Votre prénom…" value={name} onChangeText={setName} autoCapitalize="words" maxLength={20} accessibilityLabel="Votre prénom" />
      </Section>

      {create ? (
        <>
          <Section label="Ambiance">
            <AmbianceSelector levels={LEVELS} value={category} onChange={setCategory} />
          </Section>
          <Section label="Tours">
            <ChoicePills options={[5, 10, 15]} value={rounds} onChange={setRounds} />
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
