import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LeaderboardScreen() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const data = await AsyncStorage.getItem("leaderboard");
      if (data) {
        const parsed = JSON.parse(data);

        parsed.sort((a, b) => {
          if (b.score === a.score) {
            return a.time - b.time;
          }
          return b.score - a.score;
        });

        setScores(parsed);
      }
    } catch (e) {
      console.log("Leaderboard load error", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      <FlatList
        data={scores}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.item}>
            {index + 1}. {item.name} — {item.score} pts — {item.time}s
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30 },
  title: { fontSize: 26, marginBottom: 20 },
  item: { fontSize: 18, marginVertical: 6 },
});
