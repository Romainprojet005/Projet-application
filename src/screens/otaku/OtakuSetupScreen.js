import React, { useState } from 'react';
import { Text } from 'react-native';
import { OTAKU_CATEGORIES, otakuPoolSize } from '../../data/otakuData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, ChoiceChips, PlayerEditor, T } from '../../components/game/Legende';

const MIN_PLAYERS   = 2;
const MAX_PLAYERS   = 10;
const COUNT_OPTIONS = [10, 20, 30];

export default function OtakuSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState([]);
  const [categories,  setCategories]  = useState(OTAKU_CATEGORIES.map(c => c.value));
  const [count,       setCount]       = useState(20);

  const toggleCategory = (id) => {
    if (categories.includes(id)) {
      if (categories.length > 1) setCategories(categories.filter(c => c !== id));
    } else {
      setCategories([...categories, id]);
    }
  };

  const validPlayers = playerNames.map((n) => n.trim()).filter(Boolean);
  const uniqueNames  = new Set(validPlayers.map((n) => n.toLowerCase())).size === validPlayers.length;
  const canStart     = validPlayers.length >= MIN_PLAYERS && uniqueNames;
  const poolSize     = otakuPoolSize(categories);

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('OtakuGame', { playerNames: validPlayers, categories, count: Math.min(count, poolSize) });
  };

  return (
    <SetupLayout
      game="otaku"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={validPlayers.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !uniqueNames ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : 'Le premier qui crie la bonne réponse marque !'}
      rules={[
        'Un seul téléphone, posé au milieu : une personne lit la question à voix haute.',
        'Le premier qui crie la bonne réponse marque les points.',
        'Devine l’animé : 3 points au 1er indice, 2 au 2e, 1 au 3e.',
        'Qui a dit ça, Attaque spéciale, Emoji animé : 2 points, ou 1 point si vous avez demandé l’aide.',
        'On touche le prénom de ceux qui ont trouvé, puis question suivante.',
      ]}
    >
      <Section label="Catégories" aside={`${poolSize} questions`}>
        <ChoiceChips options={OTAKU_CATEGORIES} value={categories} onChange={toggleCategory} multiple />
      </Section>

      <Section label="Questions">
        <ChoicePills options={COUNT_OPTIONS} value={count} onChange={setCount} />
        {count > poolSize ? (
          <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>
            Seulement {poolSize} questions dans ces catégories : la partie en comptera {poolSize}.
          </Text>
        ) : null}
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
