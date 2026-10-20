import React, { useState } from 'react';
import { Text } from 'react-native';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import alerte from '../../utils/alerte';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, Field, GameScreen, GameTopBar, Heading, T } from '../../components/game/Legende';

function generateCode() {
  return Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');
}

function getPlayerId() {
  try {
    let id = (typeof localStorage !== 'undefined' ? localStorage : sessionStorage).getItem('mime_player_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      (typeof localStorage !== 'undefined' ? localStorage : sessionStorage).setItem('mime_player_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

const TABS = [{ value: 'create', label: 'Créer une salle' }, { value: 'join', label: 'Rejoindre' }];
const MODES = [
  { value: 'classique', label: 'Classique', sub: 'Tout public', heat: 1 },
  { value: 'adulte', label: 'Adulte', heat: 3, adult: true },
];

export default function MimeSetupScreen({ navigation }) {
  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [rounds, setRounds] = useState(5);
  const [category, setCategory] = useState('classique');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <GameScreen top={<GameTopBar game="mime" mode="setup" onBack={() => navigation.navigate('Menu')} />}>
        <Heading title="Indisponible" sub="Ce jeu a besoin d’une connexion au serveur, qui n’est pas configurée." />
      </GameScreen>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('mime_rooms')
        .insert({ code, max_rounds: rounds, category })
        .select()
        .single();
      if (rErr) throw rErr;
      const deviceId = getPlayerId();
      const { data: player, error: pErr } = await supabase
        .from('mime_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: deviceId })
        .select()
        .single();
      if (pErr) throw pErr;
      navigation.replace('MimeLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('mime_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifiez le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');
      const deviceId = getPlayerId();
      const { data: player, error: pErr } = await supabase
        .from('mime_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: deviceId })
        .select()
        .single();
      if (pErr) throw pErr;
      navigation.replace('MimeLobby', { roomId: room.id, playerId: player.id, isHost: false });
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
      game="mime"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={create ? handleCreate : handleJoin}
      canStart={canStart}
      startLabel={loading ? 'Connexion…' : create ? 'Créer la salle' : 'Rejoindre la salle'}
      note="Chaque joueur utilise son propre téléphone."
      rules={[
        'Un joueur crée la salle, les autres la rejoignent avec son code à 4 lettres.',
        'À chaque manche, un mimeur reçoit un mot sur son téléphone et le mime sans parler.',
        'Les autres devinent : le premier qui trouve marque des points, le mimeur aussi.',
      ]}
    >
      <ChoicePills options={TABS} value={tab} onChange={setTab} />

      <Section label="Votre prénom">
        <Field placeholder="Votre prénom…" value={name} onChangeText={setName} autoCapitalize="words" maxLength={20} accessibilityLabel="Votre prénom" />
      </Section>

      {create ? (
        <>
          <Section label="Manches">
            <ChoicePills options={[3, 5, 8, 10]} value={rounds} onChange={setRounds} />
          </Section>
          <Section label="Mode">
            <AmbianceSelector levels={MODES} value={category} onChange={setCategory} />
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
