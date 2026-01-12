import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const startGame = () => {
    console.log("start clicked");
    if (!username.trim()) return;
    navigation.navigate("GameScreen", { username, difficulty });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Flashcard Game</Text>

      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <View style={styles.row}>
        {["easy", "medium", "hard"].map((level) => (
          <Pressable
            key={level}
            onPress={() => setDifficulty(level)}
            style={[styles.button, difficulty === level && styles.active]}
          >
            <Text>{level.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.start} onPress={startGame}>
        <Text style={{ color: "#fff" }}>Start Game</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Leaderboard")}>
        <Text style={{ marginTop: 20 }}>🏆 View Leaderboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, marginBottom: 20 },
  input: {
    borderWidth: 1,
    width: "70%",
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  row: { flexDirection: "row", gap: 10 },
  button: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  active: { backgroundColor: "#ddd" },
  start: {
    marginTop: 20,
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
  },
});
