import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import GameScreen from "./screens/GameScreen"; // ✅ FIXED

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
          name="Flashcards"
          component={FlashcardScreen}
          options={{ title: "Select Difficulty" }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}   // ✅ ONLY SCREENS HERE
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
