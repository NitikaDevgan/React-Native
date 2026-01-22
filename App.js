import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import FlashcardGame from "./components/Flashcard";
import LeaderboardScreen from "./screens/LeaderBoardScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FlashcardGame"
          component={FlashcardGame}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
