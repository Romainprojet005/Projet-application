import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import MenuScreen from '../screens/MenuScreen';
import UndercoverSetupScreen from '../screens/undercover/UndercoverSetupScreen';
import UndercoverDistributeScreen from '../screens/undercover/UndercoverDistributeScreen';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
