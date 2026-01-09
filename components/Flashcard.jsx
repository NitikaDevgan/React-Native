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

const originalFlashcards = [
  { id: 1, image: require("../assets/Images/apple.jpg"), level: "hard" },
  { id: 2, image: require("../assets/Images/banana.jpg"), level: "hard" },
  { id: 3, image: require("../assets/Images/orange.jpg"), level: "hard" },
  { id: 4, image: require("../assets/Images/dog.jpg"), level: "hard" },
  { id: 5, image: require("../assets/Images/cat.jpg"), level: "hard" },
  { id: 6, image: require("../assets/Images/rabbit.jpg"), level: "hard" },
  { id: 7, image: require("../assets/Images/brown.jpg"), level: "medium" },
  { id: 8, image: require("../assets/Images/handDrawn.jpg"), level: "medium" },
  { id: 9, image: require("../assets/Images/nature.jpg"), level: "medium" },
  { id: 10, image: require("../assets/Images/bird.jpg"), level: "medium" },
  { id: 11, image: require("../assets/Images/tiger.jpg"), level: "easy" },
  { id: 12, image: require("../assets/Images/experiment.jpg"), level: "easy" },
  { id: 13, image: require("../assets/Images/wallpaper.jpg"), level: "easy" },
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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



  useEffect(() => {
    const filtered = originalFlashcards.filter(
      (card) => card.level === difficulty
    );
    const duplicated = [...filtered, ...filtered].map((card, index) => ({
      ...card,
      uniqueId: `${card.id}-${index}`,
    }));
    const shuffled = shuffleArray(duplicated);
    setCards(shuffled);

    // Set time based on difficulty
    let initialTime = 0;
    if (difficulty === "easy") initialTime = 60;
    else if (difficulty === "medium") initialTime = 90;
    else if (difficulty === "hard") initialTime = 120;

    setTimeLeft(initialTime);
    setTotalTime(initialTime);

  }, [difficulty]);

  useEffect(() => {
    if (showWinner || gameOver) return; // Stop timer if game ends

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


  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].id === cards[second].id) {
        setMatched((prev) => [...prev, first, second]);
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore === originalFlashcards.length) {
            setShowWinner(true);
          }
          return newScore;
        });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setShowTryAgain(true);
        }, 1000);
      }
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
    setScore(0);
    setMatched([]);
    setFlipped([]);
    setShowWinner(false);
    setGameOver(false);

    const filtered = originalFlashcards.filter(
      (card) => card.level === difficulty
    );
    const duplicated = [...filtered, ...filtered].map((card, index) => ({
      ...card,
      uniqueId: `${card.id}-${index}`,
    }));
    const shuffled = shuffleArray(duplicated);
    setCards(shuffled);

    let initialTime = 0;
    if (difficulty === "easy") initialTime = 60;
    else if (difficulty === "medium") initialTime = 90;
    else if (difficulty === "hard") initialTime = 120;
    setTimeLeft(initialTime);
    setTotalTime(initialTime); // ← ADD this line

  };


  return (
    <View style={styles.container}>
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

      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20 }}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.timer}>⏰ Time Left: {timeLeft}s</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isVisible = flipped.includes(index) || matched.includes(index);
          return (
            <TouchableOpacity
              key={card.uniqueId}
              onPress={() => handleCardPress(index)}
              style={styles.card}
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




      {/* Try Again Modal */}
      <Modal
        transparent
        visible={showTryAgain}
        animationType="fade"
        onRequestClose={() => setShowTryAgain(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              ❌ Try Again!
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowTryAgain(false)}
            >
              <Text style={{ color: "#fff" }}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Winner Modal */}
      <Modal
        transparent
        visible={showWinner}
        animationType="fade"
        onRequestClose={() => setShowWinner(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              🎉 Congratulations! You won! 🎉
            </Text>
            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={{ color: "#fff" }}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


      {/* Game Over Modal */}
      <Modal
        transparent
        visible={gameOver}
        animationType="fade"
        onRequestClose={() => setGameOver(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              ⌛ Time’s Up!
            </Text>
            <Pressable style={styles.modalButton} onPress={restartGame}>
              <Text style={{ color: "#fff" }}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


      {/* back button  */}
      <Pressable style={styles.modalButton} onPress={() => navigation.goBack()}>
        <Text style={{ color: "#fff" }}>Back to Home</Text>
      </Pressable>
      <Pressable style={styles.restartButton} onPress={restartGame}>
        <Text style={{ color: "#fff" }}>Restart</Text>
      </Pressable>
    </View>
  );
};

export default FlashcardGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  restartButton: {
    marginVertical: 10,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d9534f",
    marginBottom: 10,
    fontWeight: "black"
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
    borderRadius: 10,
  },

});
