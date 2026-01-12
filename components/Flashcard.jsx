import React, { useEffect, useState } from "react";
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

/* ================= DATA ================= */

const originalFlashcards = [
  { id: 1, image: require("../assets/Images/apple.jpg"), level: "hard" },
  { id: 2, image: require("../assets/Images/banana.jpg"), level: "hard" },
  { id: 3, image: require("../assets/Images/orange.jpg"), level: "hard" },
  { id: 4, image: require("../assets/Images/dog.jpg"), level: "hard" },
  { id: 5, image: require("../assets/Images/cat.jpg"), level: "hard" },
  { id: 6, image: require("../assets/Images/rabbit.jpg"), level: "hard" },
  { id: 7, image: require("../assets/Images/brown.jpg"), level: "hard" },
  { id: 8, image: require("../assets/Images/handDrawn.jpg"), level: "medium" },
  { id: 9, image: require("../assets/Images/nature.jpg"), level: "medium" },
  { id: 10, image: require("../assets/Images/bird.jpg"), level: "medium" },
  { id: 11, image: require("../assets/Images/tiger.jpg"), level: "medium" },
  { id: 12, image: require("../assets/Images/experiment.jpg"), level: "easy" },
  { id: 13, image: require("../assets/Images/wallpaper.jpg"), level: "easy" },
  { id: 14, image: require("../assets/Images/apple.jpg"), level: "easy" },
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
  const { difficulty } = route.params;

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  /* ===== Difficulty Config ===== */
  const difficultyConfig = {
    easy: { time: 60, multiplier: 2 },
    medium: { time: 90, multiplier: 3 },
    hard: { time: 120, multiplier: 5 },
  };

  const filteredCards = originalFlashcards.filter(
    (card) => card.level === difficulty
  );

  const totalPairs = filteredCards.length;

  /* ===== Init Game ===== */
  useEffect(() => {
    const duplicated = [...filteredCards, ...filteredCards].map(
      (card, index) => ({
        ...card,
        uniqueId: `${card.id}-${index}`,
      })
    );

    setCards(shuffleArray(duplicated));

    const initialTime = difficultyConfig[difficulty].time;
    setTimeLeft(initialTime);
    setTotalTime(initialTime);
  }, [difficulty]);

  /* ===== Timer ===== */
  useEffect(() => {
    if (showWinner || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWinner, gameOver]);

  /* ===== Match Logic ===== */
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;

      if (cards[first].id === cards[second].id) {
        setMatched((prev) => [...prev, first, second]);
        setScore((prev) => prev + 1);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setShowTryAgain(true);
        }, 1000);
      }
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === totalPairs * 2) {
      handleWin();
    }
  }, [matched]);

  const handleWin = () => {
    const bonus = timeLeft * difficultyConfig[difficulty].multiplier;

    setTimeBonus(bonus);
    setShowWinner(true);
    setShowConfetti(true);
  };

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
    setScore(0);
    setMatched([]);
    setFlipped([]);
    setShowWinner(false);
    setGameOver(false);
    setTimeBonus(0);
    setShowConfetti(false);

    const duplicated = [...filteredCards, ...filteredCards].map(
      (card, index) => ({
        ...card,
        uniqueId: `${card.id}-${index}`,
      })
    );

    setCards(shuffleArray(duplicated));
    setTimeLeft(difficultyConfig[difficulty].time);
    setTotalTime(difficultyConfig[difficulty].time);
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: 200, y: 0 }} fadeOut />
      )}

      {totalTime > 0 && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(timeLeft / totalTime) * 100}%` },
            ]}
          />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.timer}>⏰ {timeLeft}s</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isVisible = flipped.includes(index) || matched.includes(index);

          return (
            <TouchableOpacity
              key={card.uniqueId}
              style={styles.card}
              onPress={() => handleCardPress(index)}
              disabled={isVisible}
            >
              {isVisible ? (
                <Image source={card.image} style={styles.image} />
              ) : (
                <View style={styles.blank} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Try Again */}
      <Modal transparent visible={showTryAgain} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>❌ Try Again!</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowTryAgain(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Winner */}
      <Modal transparent visible={showWinner} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Congratulations! 🎉</Text>
            <Text>Base Score: {score}</Text>
            <Text>⏱ Time Bonus: +{timeBonus}</Text>
            <Text style={{ fontWeight: "bold", marginVertical: 6 }}>
              🏆 Total Score: {score + timeBonus}
            </Text>

            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.modalBtnText}>Return Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Game Over */}
      <Modal transparent visible={gameOver} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⌛ Time’s Up!</Text>
            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.restartButton} onPress={restartGame}>
        <Text style={styles.modalBtnText}>Restart</Text>
      </Pressable>
    </View>
  );
};

export default FlashcardGame;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d9534f",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 8,
  },
  blank: {
    width: 80,
    height: 80,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  progressBarContainer: {
    height: 16,
    width: "90%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007BFF",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  restartButton: {
    marginVertical: 10,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
