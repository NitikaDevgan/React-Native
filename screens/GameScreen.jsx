import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Animated, Switch } from "react-native";

const icons = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝"];

export default function GameScreen() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const flipAnim = useRef({}).current;

  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .map((item) => ({ id: item, key: Math.random().toString() }))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach((_, i) => {
      flipAnim[i] = new Animated.Value(0);
    });

    setCards(shuffled);
  }, []);

  const flipCard = (index) => {
    if (flipped.includes(index)) return;
    Animated.timing(flipAnim[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setFlipped([...flipped, index]);
  };

  const renderCard = ({ item, index }) => {
    const rotateY = flipAnim[index]
      ? flipAnim[index].interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        })
      : "0deg";

    return (
      <Pressable onPress={() => flipCard(index)}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: darkMode ? "#333" : "#fff", transform: [{ rotateY }] },
          ]}
        >
          <Text style={styles.cardText}>
            {flipped.includes(index) || matched.includes(index) ? item.id : "❓"}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#111" : "#f2f2f2" }]}>
      <Switch value={darkMode} onValueChange={setDarkMode} />
      <FlatList data={cards} numColumns={3} renderItem={renderCard} keyExtractor={(item) => item.key} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: "center" },
  card: { width: 90, height: 90, margin: 8, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardText: { fontSize: 32 },
});
