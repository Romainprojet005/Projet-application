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

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
