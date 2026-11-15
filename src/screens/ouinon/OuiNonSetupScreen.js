import React, { useState } from 'react';
import { OUINON_CATEGORIES, OUINON_ADULT, ouiNonPool } from '../../data/ouiNonQuestions';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, ToggleRow } from '../../components/game/Legende';

const ROUND_OPTIONS = [5, 10, 15];
const MIN_PLAYERS   = 3;
const MAX_PLAYERS   = 12;

export default function OuiNonSetupScreen({ navigation }) {
  const [categoryId,  setCategoryId]  = useState('all');
  const [roundCount,  setRoundCount]  = useState(10);
  const [gorgees,     setGorgees]     = useState(false);
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map((n) => n.trim()).filter(Boolean);
  const uniqueNames  = new Set(validPlayers.map((n) => n.toLowerCase())).size === validPlayers.length;
  const canStart     = validPlayers.length >= MIN_PLAYERS && uniqueNames;
  const drink        = gorgees || OUINON_ADULT.has(categoryId);

  const handleStart = () => {
    if (!canStart) return;
    const rounds = Math.min(roundCount, ouiNonPool(categoryId).length);
    navigation.navigate('OuiNonGame', { playerNames: validPlayers, categoryId, roundCount: rounds, drink });
  };

  return (
    <SetupLayout
      game="ouinon"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={validPlayers.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !uniqueNames ? 'Deux joueurs ont le même prénom : ajoutez une initiale.'
        : `Mauvais pronostic = 1 ${drink ? 'gorgée' : 'gage'}. Soyez honnêtes !`}
      rules={[
        'Une question s’affiche, par exemple : « Est-ce que tu embrasserais quelqu’un dans ce cercle ? »',
        'Chacun à son tour prend le téléphone, répond OUI ou NON en secret… et en toute honnêteté.',
        'Il annonce ensuite combien de « oui » il pense qu’il y aura au total, sa réponse comprise.',
        'Révélation : le nombre de « oui » s’affiche, jamais qui a répondu quoi.',
        `Bon pronostic : tu ne prends rien. Mauvais pronostic : 1 ${drink ? 'gorgée' : 'gage'}.`,
        'À la fin, celui qui a le moins de pénalités gagne.',
      ]}
    >
      <Section label="Catégorie">
        <ChoiceChips options={OUINON_CATEGORIES} value={categoryId} onChange={setCategoryId} />
      </Section>

      <Section label="Questions">
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <Section label="Pénalités">
        <ToggleRow label="Version à boire" hint="Les mauvais pronostics boivent une gorgée au lieu de prendre un gage."
          value={drink} onChange={setGorgees} adult />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
