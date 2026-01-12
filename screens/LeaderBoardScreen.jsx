import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LeaderboardScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem("leaderboard").then((res) => {
      if (res) setData(JSON.parse(res));
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.item}>
            {index + 1}. {item.username} — {item.score}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40 },
  title: { fontSize: 24, marginBottom: 20 },
  item: { fontSize: 16, marginVertical: 6 },
});
