import React, { useState, useEffect } from 'react';
import { quizCategories, buildQuestions } from '../../data/quizQuestions';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, StepperRow } from '../../components/game/Legende';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const QUESTION_OPTIONS = [5, 10, 15];
const DIFFICULTIES = [
  { value: 'facile', label: 'Facile' },
  { value: 'normal', label: 'Normal' },
  { value: 'difficile', label: 'Difficile' },
];

export default function QuizSetupScreen({ navigation, route }) {
  const [playerCount, setPlayerCount] = useState(3);
  const [selectedCategories, setSelectedCategories] = useState(['culture', 'cinema']);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('normal');

  const toggleCategory = (key) => {
    setSelectedCategories((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const availableQuestions = selectedCategories.reduce(
    (acc, k) => acc + (quizCategories[k]?.questions.length || 0),
    0
  );
  const effectiveCount = Math.min(questionCount, availableQuestions);

  const handleStart = () => {
    const questions = buildQuestions(selectedCategories, questionCount, difficulty);
    const players = Array.from({ length: playerCount }, (_, i) => `Joueur ${i + 1}`);
    navigation.navigate('QuizGame', { players, questions });
  };

  const canStart = selectedCategories.length > 0 && effectiveCount > 0;

  // « Rejouer » depuis la fin de partie : relance aussitôt avec les mêmes réglages
  const replayToken = route?.params?.replay;
  useEffect(() => {
    if (!replayToken) return;
    navigation.setParams({ replay: undefined });
    handleStart();
  }, [replayToken]);

  return (
    <SetupLayout
      game="quiz"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="Lancer le quiz"
      note={`${effectiveCount} questions · 15 secondes par question · ${availableQuestions} disponibles`}
      rules={[
        'Les joueurs répondent à tour de rôle, chacun sur sa question.',
        'Vous avez 15 secondes pour choisir la bonne réponse.',
        'Une bonne réponse rapporte des points ; le meilleur score l’emporte.',
      ]}
    >
      <StepperRow label="Joueurs" hint={`De ${MIN_PLAYERS} à ${MAX_PLAYERS}`} value={playerCount} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={setPlayerCount} />

      <Section label="Catégories" aside="Au moins une">
        <ChoiceChips
          multiple
          options={Object.entries(quizCategories).map(([key, cat]) => ({ value: key, label: cat.label, adult: cat.adult === true }))}
          value={selectedCategories}
          onChange={toggleCategory}
        />
      </Section>

      <Section label="Questions">
        <ChoicePills options={QUESTION_OPTIONS} value={questionCount} onChange={setQuestionCount} />
      </Section>

      <Section label="Difficulté">
        <ChoicePills options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
      </Section>
    </SetupLayout>
  );
}
