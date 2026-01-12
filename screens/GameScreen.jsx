import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const iconSets = {
  easy: ["🍎", "🍌", "🍇"],
  medium: ["🍎", "🍌", "🍇", "🍓"],
  hard: ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝"],
};

export default function GameScreen({ route, navigation }) {
  const { username, difficulty } = route.params;
  const icons = iconSets[difficulty];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showConfetti, setShowConfetti] = useState(false);

  const flipAnim = useRef({}).current;

  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .map((i) => ({ id: i, key: Math.random().toString() }))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach((_, i) => (flipAnim[i] = new Animated.Value(0)));
    setCards(shuffled);
  }, []);

  /* ⏱ Timer */
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const flipCard = (index) => {
    if (flipped.length === 2 || flipped.includes(index)) return;

    Animated.timing(flipAnim[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) checkMatch(next);
  };

  const checkMatch = ([a, b]) => {
    if (cards[a].id === cards[b].id) {
      setMatched([...matched, a, b]);
      setScore((s) => s + 10);
      setFlipped([]);

      if (matched.length + 2 === cards.length) finishGame();
    } else {
      setTimeout(() => {
        Animated.timing(flipAnim[a], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        Animated.timing(flipAnim[b], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        setFlipped([]);
      }, 600);
    }
  };

  const finishGame = async () => {
    const bonus = timeLeft * 2;
    const finalScore = score + bonus;
    setShowConfetti(true);

    const entry = {
      username,
      score: finalScore,
      date: new Date().toLocaleDateString(),
    };

    const data = JSON.parse(await AsyncStorage.getItem("leaderboard")) || [];
    const updated = [entry, ...data]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    await AsyncStorage.setItem("leaderboard", JSON.stringify(updated));

    setTimeout(() => navigation.navigate("Leaderboard"), 2000);
  };

  return (
    <View style={styles.container}>
      <Text>👤 {username}</Text>
      <Text>
        ⏱ {timeLeft}s | ⭐ {score}
      </Text>

      <FlatList
        data={cards}
        numColumns={3}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => flipCard(index)}>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    {
                      rotateY: flipAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.text}>
                {flipped.includes(index) || matched.includes(index)
                  ? item.id
                  : "❓"}
              </Text>
            </Animated.View>
          </Pressable>
        )}
      />

      {showConfetti && <Text style={styles.confetti}>🎉🎉🎉</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40 },
  card: {
    width: 90,
    height: 90,
    margin: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 32 },
  confetti: { fontSize: 40, marginTop: 20 },
});
