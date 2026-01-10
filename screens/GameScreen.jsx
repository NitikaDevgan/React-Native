import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  Switch,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import AsyncStorage from "@react-native-async-storage/async-storage";

const icons = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝"];

const difficultyConfig = {
  easy: { time: 60, multiplier: 2 },
  medium: { time: 90, multiplier: 3 },
  hard: { time: 120, multiplier: 5 },
};

export default function GameScreen() {
  const difficulty = "medium";
  const totalPairs = icons.length;

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    difficultyConfig[difficulty].time
  );
  const [timeBonus, setTimeBonus] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const flipAnim = useRef({}).current;

  /* ------------------ SOUND ------------------ */
  const flipSound = useRef(null);
  const matchSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    loadSounds();
    loadLeaderboard();
    initializeGame();
    return () => unloadSounds();
  }, []);

  const loadSounds = async () => {
    try {
      flipSound.current = new Audio.Sound();
      matchSound.current = new Audio.Sound();
      winSound.current = new Audio.Sound();
  
      await flipSound.current.loadAsync(
        require("../assets/sounds/mixkit-retro-game-notification-212.wav")
      );
      await matchSound.current.loadAsync(
        require("../assets/sounds/mixkit-retro-game-notification-212.wav")
      );
      await winSound.current.loadAsync(
        require("../assets/sounds/mixkit-retro-game-notification-212.wav")
      );
    } catch (e) {
      console.warn("Sound loading failed:", e);
    }
  };
  

  const unloadSounds = async () => {
    flipSound.current && (await flipSound.current.unloadAsync());
    matchSound.current && (await matchSound.current.unloadAsync());
    winSound.current && (await winSound.current.unloadAsync());
  };

  /* ------------------ TIMER ------------------ */
  useEffect(() => {
    if (timeLeft <= 0 || showWinner) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showWinner]);

  /* ------------------ GAME LOGIC ------------------ */
  const initializeGame = () => {
    const shuffled = [...icons, ...icons]
      .map((item) => ({ id: item, key: Math.random().toString() }))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach((_, i) => {
      flipAnim[i] = new Animated.Value(0);
    });

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setTimeBonus(0);
    setShowWinner(false);
    setShowConfetti(false);
    setTimeLeft(difficultyConfig[difficulty].time);
  };

  const flipCard = (index) => {
    if (flipped.length === 2 || flipped.includes(index)) return;

    flipSound.current.replayAsync();

    Animated.timing(flipAnim[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setFlipped([...flipped, index]);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;

      if (cards[a].id === cards[b].id) {
        matchSound.current.replayAsync();
        setMatched((prev) => [...prev, a, b]);
        setScore((s) => {
          const newScore = s + 1;
          if (newScore === totalPairs) handleWin();
          return newScore;
        });
        setFlipped([]);
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
        }, 800);
      }
    }
  }, [flipped]);

  const handleWin = async () => {
    winSound.current.replayAsync();
    const bonus =
      timeLeft * difficultyConfig[difficulty].multiplier;
    setTimeBonus(bonus);
    setShowWinner(true);
    setShowConfetti(true);

    const entry = {
      score: score + bonus,
      date: new Date().toLocaleString(),
    };

    const updated = [entry, ...leaderboard].slice(0, 5);
    setLeaderboard(updated);
    await AsyncStorage.setItem(
      "leaderboard",
      JSON.stringify(updated)
    );
  };

  const loadLeaderboard = async () => {
    const data = await AsyncStorage.getItem("leaderboard");
    if (data) setLeaderboard(JSON.parse(data));
  };

  /* ------------------ RENDER CARD ------------------ */
  const renderCard = ({ item, index }) => {
    const rotateY = flipAnim[index].interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });
  
    return (
      <Pressable onPress={() => flipCard(index)}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? "#333" : "#fff",
              transform: [{ perspective: 1000 }, { rotateY }],
            },
          ]}
        >
          <Text style={styles.cardText}>
            {flipped.includes(index) || matched.includes(index)
              ? item.id
              : "❓"}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };
  

  /* ------------------ UI ------------------ */
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#111" : "#f2f2f2" },
      ]}
    >
      {showConfetti && <ConfettiCannon count={200} origin={{ x: 200, y: 0 }} />}

      <View style={styles.header}>
        <Text style={[styles.text, { color: darkMode ? "#fff" : "#000" }]}>
          ⏱ {timeLeft}s | ⭐ {score}
        </Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <FlatList
        data={cards}
        numColumns={3}
        renderItem={renderCard}
        keyExtractor={(item) => item.key}
      />

      {/* WIN MODAL */}
      <Modal visible={showWinner} transparent animationType="fade">
        <View style={styles.modal}>
          <Text style={styles.winText}>🎉 YOU WON 🎉</Text>
          <Text>Total Score: {score + timeBonus}</Text>

          <Text style={styles.leaderTitle}>🏆 Leaderboard</Text>
          {leaderboard.map((l, i) => (
            <Text key={i}>
              {i + 1}. {l.score} ({l.date})
            </Text>
          ))}

          <Pressable style={styles.button} onPress={initializeGame}>
            <Text style={styles.btnText}>Play Again</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "90%",
      marginBottom: 10,
    },
    text: {
      fontSize: 18,
      fontWeight: "bold",
    },
    card: {
      width: 90,
      height: 90,
      margin: 8,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
    },
    cardText: {
      fontSize: 32,
    },
    modal: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    winText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 10,
    },
    leaderTitle: {
      marginTop: 10,
      fontWeight: "bold",
    },
    button: {
      marginTop: 15,
      backgroundColor: "#ff9800",
      padding: 12,
      borderRadius: 8,
    },
    btnText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });
  