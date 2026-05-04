import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import MenuScreen from '../screens/MenuScreen';
import UndercoverSetupScreen from '../screens/undercover/UndercoverSetupScreen';
import UndercoverDistributeScreen from '../screens/undercover/UndercoverDistributeScreen';
import QuizSetupScreen from '../screens/quiz/QuizSetupScreen';
import QuizGameScreen from '../screens/quiz/QuizGameScreen';
import AmitieSetupScreen from '../screens/amitie/AmitieSetupScreen';
import AmitieGameScreen from '../screens/amitie/AmitieGameScreen';
import PersonalitySetupScreen from '../screens/personality/PersonalitySetupScreen';
import PersonalityGameScreen from '../screens/personality/PersonalityGameScreen';
import CineFlashSetupScreen from '../screens/cineflash/CineFlashSetupScreen';
import CineFlashGameScreen from '../screens/cineflash/CineFlashGameScreen';
import EmojiQuizSetupScreen from '../screens/emojiquiz/EmojiQuizSetupScreen';
import EmojiQuizGameScreen from '../screens/emojiquiz/EmojiQuizGameScreen';
import MotDePasseSetupScreen from '../screens/motdepasse/MotDePasseSetupScreen';
import MotDePasseGameScreen from '../screens/motdepasse/MotDePasseGameScreen';
import BlindTestSetupScreen from '../screens/blindtest/BlindTestSetupScreen';
import BlindTestGameScreen from '../screens/blindtest/BlindTestGameScreen';
import BlindMultiSetupScreen from '../screens/blindtest/BlindMultiSetupScreen';
import BlindMultiLobbyScreen from '../screens/blindtest/BlindMultiLobbyScreen';
import BlindMultiGameScreen from '../screens/blindtest/BlindMultiGameScreen';
import VoteSetupScreen from '../screens/vote/VoteSetupScreen';
import VoteGameScreen from '../screens/vote/VoteGameScreen';
import VoteMultiSetupScreen from '../screens/vote/VoteMultiSetupScreen';
import VoteMultiLobbyScreen from '../screens/vote/VoteMultiLobbyScreen';
import VoteMultiGameScreen from '../screens/vote/VoteMultiGameScreen';
import VoteMultiFinalScreen from '../screens/vote/VoteMultiFinalScreen';
import MimeSetupScreen from '../screens/mime/MimeSetupScreen';
import MimeLobbyScreen from '../screens/mime/MimeLobbyScreen';
import MimeGameScreen from '../screens/mime/MimeGameScreen';
import MimeFinalScreen from '../screens/mime/MimeFinalScreen';
import BuzzerSetupScreen from '../screens/buzzer/BuzzerSetupScreen';
import BuzzerGameScreen from '../screens/buzzer/BuzzerGameScreen';
import TribunalSetupScreen from '../screens/tribunal/TribunalSetupScreen';
import TribunalLobbyScreen from '../screens/tribunal/TribunalLobbyScreen';
import TribunalGameScreen from '../screens/tribunal/TribunalGameScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: [
    'https://romainprojet005.github.io/Projet-application',
    'https://soireedeslegendes.com',
    'http://localhost:3000',
    'http://localhost',
  ],
  config: {
    screens: {
      Welcome: '',
      Menu: 'menu',
      UndercoverSetup: 'undercover',
      UndercoverDistribute: 'undercover/distribute',
      QuizSetup: 'quiz',
      QuizGame: 'quiz/game',
      AmitieSetup: 'amitie',
      AmitieGame: 'amitie/game',
      PersonalitySetup: 'personality',
      PersonalityGame: 'personality/game',
      CineFlashSetup: 'cineflash',
      CineFlashGame: 'cineflash/game',
      EmojiQuizSetup: 'emojiquiz',
      EmojiQuizGame: 'emojiquiz/game',
      MotDePasseSetup: 'motdepasse',
      MotDePasseGame: 'motdepasse/game',
      BlindTestSetup: 'blindtest',
      BlindTestGame: 'blindtest/game',
      BlindMultiSetup: 'blindtest/multi',
      BlindMultiLobby: 'blindtest/multi/lobby',
      BlindMultiGame: 'blindtest/multi/game',
      VoteSetup: 'vote',
      VoteGame: 'vote/game',
      VoteMultiSetup: 'vote/multi',
      VoteMultiLobby: 'vote/multi/lobby',
      VoteMultiGame: 'vote/multi/game',
      VoteMultiFinal: 'vote/multi/final',
      MimeSetup: 'mime',
      MimeLobby: 'mime/lobby',
      MimeGame: 'mime/game',
      MimeFinal: 'mime/final',
      BuzzerSetup: 'buzzer',
      BuzzerGame: 'buzzer/game',
      TribunalSetup: 'tribunal',
      TribunalLobby: 'tribunal/lobby',
      TribunalGame: 'tribunal/game',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0A0A1B' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="UndercoverSetup" component={UndercoverSetupScreen} />
        <Stack.Screen name="UndercoverDistribute" component={UndercoverDistributeScreen} />
        <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
        <Stack.Screen name="QuizGame" component={QuizGameScreen} />
        <Stack.Screen name="AmitieSetup" component={AmitieSetupScreen} />
        <Stack.Screen name="AmitieGame" component={AmitieGameScreen} />
        <Stack.Screen name="PersonalitySetup" component={PersonalitySetupScreen} />
        <Stack.Screen name="PersonalityGame" component={PersonalityGameScreen} />
        <Stack.Screen name="CineFlashSetup" component={CineFlashSetupScreen} />
        <Stack.Screen name="CineFlashGame" component={CineFlashGameScreen} />
        <Stack.Screen name="EmojiQuizSetup" component={EmojiQuizSetupScreen} />
        <Stack.Screen name="EmojiQuizGame" component={EmojiQuizGameScreen} />
        <Stack.Screen name="MotDePasseSetup" component={MotDePasseSetupScreen} />
        <Stack.Screen name="MotDePasseGame" component={MotDePasseGameScreen} />
        <Stack.Screen name="BlindTestSetup" component={BlindTestSetupScreen} />
        <Stack.Screen name="BlindTestGame" component={BlindTestGameScreen} />
        <Stack.Screen name="BlindMultiSetup" component={BlindMultiSetupScreen} />
        <Stack.Screen name="BlindMultiLobby" component={BlindMultiLobbyScreen} />
        <Stack.Screen name="BlindMultiGame" component={BlindMultiGameScreen} />
        <Stack.Screen name="VoteSetup" component={VoteSetupScreen} />
        <Stack.Screen name="VoteGame" component={VoteGameScreen} />
        <Stack.Screen name="VoteMultiSetup" component={VoteMultiSetupScreen} />
        <Stack.Screen name="VoteMultiLobby" component={VoteMultiLobbyScreen} />
        <Stack.Screen name="VoteMultiGame" component={VoteMultiGameScreen} />
        <Stack.Screen name="VoteMultiFinal" component={VoteMultiFinalScreen} />
        <Stack.Screen name="MimeSetup" component={MimeSetupScreen} />
        <Stack.Screen name="MimeLobby" component={MimeLobbyScreen} />
        <Stack.Screen name="MimeGame" component={MimeGameScreen} />
        <Stack.Screen name="MimeFinal" component={MimeFinalScreen} />
        <Stack.Screen name="BuzzerSetup" component={BuzzerSetupScreen} />
        <Stack.Screen name="BuzzerGame" component={BuzzerGameScreen} />
        <Stack.Screen name="TribunalSetup" component={TribunalSetupScreen} />
        <Stack.Screen name="TribunalLobby" component={TribunalLobbyScreen} />
        <Stack.Screen name="TribunalGame" component={TribunalGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
