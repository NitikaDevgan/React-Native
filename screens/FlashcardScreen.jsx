import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const FlashcardScreen = ({ navigation }) => {
  const difficulties = ["easy", "medium", "hard"];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Difficulty Level</Text>
      {difficulties.map((level) => (
        <TouchableOpacity
          key={level}
          style={styles.button}
          onPress={() => navigation.navigate("FlashcardGame", { difficulty: level })}
        >
          <Text style={styles.buttonText}>{level.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default FlashcardScreen;
