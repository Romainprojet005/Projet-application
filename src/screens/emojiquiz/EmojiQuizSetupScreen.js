import React, { useState, useEffect } from 'react';
import { EMOJI_CATEGORIES, buildEmojiRound } from '../../data/emojiQuizData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor } from '../../components/game/Legende';

const ROUND_OPTIONS = [5, 10, 15, 20];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

export default function EmojiQuizSetupScreen({ navigation, route }) {
  const [players, setPlayers] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCats, setSelectedCats] = useState(['film', 'musique', 'serie', 'personnalite', 'jeu_video']);

  const toggleCat = (key) => {
    setSelectedCats(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const trimmed = players.map(p => p.trim()).filter(Boolean);
  const unique = new Set(trimmed.map(n => n.toLowerCase())).size === trimmed.length;
  const canStart = trimmed.length >= MIN_PLAYERS && unique && selectedCats.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    const rounds = buildEmojiRound(questionCount, selectedCats);
    navigation.navigate('EmojiQuizGame', { players: trimmed, rounds });
  };

  // « Rejouer » depuis la fin de partie : relance aussitôt avec les mêmes réglages
  const replayToken = route?.params?.replay;
  useEffect(() => {
    if (!replayToken) return;
    navigation.setParams({ replay: undefined });
    handleStart();
  }, [replayToken]);

  return (
    <SetupLayout
      game="emojiquiz"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="C’est parti"
      note={trimmed.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : `${questionCount} questions · 4 points dès le premier indice`}
      rules={[
        'Des emojis représentent un film, une chanson, une série, une célébrité ou un jeu vidéo.',
        'Un emoji d’abord, puis deux, puis trois : tapez la réponse.',
        '4 points au premier indice, 3 au deuxième, 2 au troisième ; puis 1 point en choisissant parmi quatre propositions.',
      ]}
    >
      <Section label="Catégories" aside="Au moins une">
        <ChoiceChips
          multiple
          options={Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => ({ value: key, label: cat.label }))}
          value={selectedCats}
          onChange={toggleCat}
        />
      </Section>

      <Section label="Questions">
        <ChoicePills options={ROUND_OPTIONS} value={questionCount} onChange={setQuestionCount} />
      </Section>

      <PlayerEditor names={players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
