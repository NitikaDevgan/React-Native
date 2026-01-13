import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const icons = ["🍎", "🍌", "🍇"];

export default function GameScreen() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const flipAnim = useRef([]);
  const { username } = route.params;

  const timerRef = useRef(null);

  /* ------------------ INIT GAME ------------------ */
  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .map((item, i) => ({ id: item, key: i.toString() }))
      .sort(() => Math.random() - 0.5);

    flipAnim.current = shuffled.map(() => new Animated.Value(0));
    setCards(shuffled);

    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  /* ------------------ MATCH LOGIC ------------------ */
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;

      if (cards[first].id === cards[second].id) {
        setMatched((prev) => [...prev, first, second]);
      } else {
        setTimeout(() => {
          Animated.timing(flipAnim.current[first], {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
          Animated.timing(flipAnim.current[second], {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }, 600);
      }

      setTimeout(() => setFlipped([]), 600);
    }
  }, [flipped]);

  /* ------------------ GAME COMPLETE ------------------ */
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current);
      console.log("🎉 GAME COMPLETED");
      setGameWon(true);
    }
  }, [matched]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current);
      saveScore();
      setGameWon(true);
    }
  }, [matched]);

  const saveScore = async () => {
    const newEntry = { name: username, time };

    const existing = await AsyncStorage.getItem("leaderboard");
    const scores = existing ? JSON.parse(existing) : [];

    scores.push(newEntry);
    scores.sort((a, b) => a.time - b.time);

    await AsyncStorage.setItem("leaderboard", JSON.stringify(scores));
  };

  /* ------------------ FLIP CARD ------------------ */
  const flipCard = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;

    Animated.timing(flipAnim.current[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setFlipped((prev) => [...prev, index]);
  };

  /* ------------------ RENDER CARD ------------------ */
  const renderCard = ({ item, index }) => {
    const rotateY = flipAnim.current[index].interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <Pressable onPress={() => flipCard(index)}>
        <Animated.View style={[styles.card, { transform: [{ rotateY }] }]}>
          <Text style={styles.cardText}>
            {flipped.includes(index) || matched.includes(index)
              ? item.id
              : "❓"}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⏱ {time}s</Text>

      <FlatList
        data={cards}
        numColumns={3}
        renderItem={renderCard}
        keyExtractor={(item) => item.key}
      />

      {/* 🎉 CONGRATS MODAL */}
      <Modal visible={gameWon} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.winText}>🎉 Congratulations!</Text>
            <Text>Player: {username}</Text>
            <Text>Time: {time}s</Text>

            <Pressable
              style={styles.modalBtn}
              onPress={() => navigation.navigate("Leaderboard")}
            >
              <Text>🏆 View Leaderboard</Text>
            </Pressable>

            <Pressable
              style={styles.modalBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text>🏠 Go Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    width: 90,
    height: 90,
    margin: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    fontSize: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  winText: {
    fontSize: 24,
    marginBottom: 10,
  },
});
