import React, { useState } from 'react';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, PlayerEditor } from '../../components/game/Legende';

const ROUND_OPTIONS = [3, 5, 8, 10];
const MIN_PLAYERS   = 3;
const MAX_PLAYERS   = 8;

export default function TrouveLaRegleSetupScreen({ navigation }) {
  const [roundCount,  setRoundCount]  = useState(5);
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= MIN_PLAYERS;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('TrouveLaRegleGame', { roundCount, playerNames: validPlayers });
  };

  return (
    <SetupLayout
      game="trouveLaRegle"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="Lancer l’enquête"
      note={canStart ? `${roundCount} manches · jusqu’à ${roundCount * 3} points` : `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`}
      rules={[
        'Un joueur, le détective, quitte la pièce.',
        'Le jeu révèle une règle secrète aux autres, par exemple « terminer chaque phrase par une question ».',
        'Le détective revient et pose des questions libres ; les autres répondent en suivant la règle.',
        'Il doit deviner la règle parmi quatre propositions : moins il pose de questions, plus il marque.',
      ]}
    >
      <Section label="Manches">
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
