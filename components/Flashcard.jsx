import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";


const originalFlashcards = [
  { id: 1, image: require("../assets/Images/apple.jpg"), level: "easy" },
  { id: 2, image: require("../assets/Images/banana.jpg"), level: "easy" },
  { id: 3, image: require("../assets/Images/orange.jpg"), level: "medium" },
  { id: 4, image: require("../assets/Images/dog.jpg"), level: "medium" },
  { id: 5, image: require("../assets/Images/cat.jpg"), level: "hard" },
  { id: 6, image: require("../assets/Images/rabbit.jpg"), level: "hard" },
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/* ================= COMPONENT ================= */

const FlashcardGame = ({ route, navigation }) => {
  const { difficulty = "easy" } = route.params || {};

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const timerRef = useRef(null);

  const difficultyConfig = {
    easy: { time: 60, multiplier: 2 },
    medium: { time: 90, multiplier: 3 },
    hard: { time: 120, multiplier: 5 },
  };

  /* ===== INIT GAME ===== */
  useEffect(() => {
    const selected = originalFlashcards.filter((c) => c.level === difficulty);

    const duplicated = [...selected, ...selected].map((c, i) => ({
      ...c,
      uid: `${c.id}-${i}`,
    }));

    setCards(shuffleArray(duplicated));
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setShowWinner(false);
    setShowGameOver(false);
    setShowConfetti(false);

    setTimeLeft(difficultyConfig[difficulty].time);
  }, [difficulty]);

  /* ===== TIMER ===== */
  useEffect(() => {
    if (showWinner || showGameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [showWinner, showGameOver]);

  /* ===== MATCH LOGIC ===== */
  useEffect(() => {
    if (flipped.length !== 2) return;

    const [a, b] = flipped;

    if (cards[a].id === cards[b].id) {
      setMatched((prev) => {
        const updated = [...prev, a, b];

        // 🎉 GAME COMPLETE
        if (updated.length === cards.length) {
          clearInterval(timerRef.current);
          setTimeout(() => {
            setShowWinner(true);
            setShowConfetti(true);
          }, 400);
        }

        return updated;
      });

      setScore((s) => s + 1);
      setFlipped([]);
    } else {
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped]);

  const handleCardPress = (index) => {
    if (
      flipped.includes(index) ||
      matched.includes(index) ||
      flipped.length === 2
    )
      return;

    setFlipped((prev) => [...prev, index]);
  };

  const restartGame = () => {
    navigation.replace("FlashcardGame", { difficulty });
  };

  const totalScore = score + timeLeft * difficultyConfig[difficulty].multiplier;

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {showConfetti && <ConfettiCannon count={200} fadeOut />}

      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.timer}>⏰ {timeLeft}s</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => {
          const visible = flipped.includes(index) || matched.includes(index);

          return (
            <TouchableOpacity
              key={card.uid}
              style={styles.card}
              onPress={() => handleCardPress(index)}
            >
              {visible ? (
                <Image source={card.image} style={styles.image} />
              ) : (
                <View style={styles.blank} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🎉 WINNER MODAL */}
      <Modal transparent visible={showWinner}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Congratulations!</Text>
            <Text>Matches: {score}</Text>
            <Text>Bonus: {timeLeft}</Text>
            <Text style={{ fontWeight: "bold", marginVertical: 8 }}>
              🏆 Total Score: {totalScore}
            </Text>

            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.modalBtnText}>Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ⏳ GAME OVER MODAL */}
      <Modal transparent visible={showGameOver && !showWinner}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⌛ Time’s Up!</Text>
            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FlashcardGame;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  score: { fontSize: 18, fontWeight: "bold" },
  timer: { fontSize: 18, fontWeight: "bold", color: "#d9534f" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  card: {
    width: 90,
    height: 90,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  blank: {
    width: 80,
    height: 80,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
});
