import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FlashcardScreen from "./screens/FlashcardScreen";
import HomeScreen from "./screens/HomeScreen"; // ✅ Import the HomeScreen
import FlashcardGame from "./components/Flashcard";
import GameScreen from "./screens/GameScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* HomeScreen will now be the landing page */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // optional: hide top nav bar for cleaner UI
        />
        <Stack.Screen name="Flashcards" component={FlashcardScreen} />
        <Stack.Screen name="FlashcardGame" component={FlashcardGame} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
