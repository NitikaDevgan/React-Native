import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const scaleAnim = new Animated.Value(1);

  // const handlePressIn = () => {
  //   Animated.spring(scaleAnim, {
  //     toValue: 0.95,
  //     useNativeDriver: true,
  //   }).start();
  // };

  // const handlePressOut = () => {
  //   Animated.spring(scaleAnim, {
  //     toValue: 1,
  //     friction: 3,
  //     tension: 40,
  //     useNativeDriver: true,
  //   }).start();
  //   navigation.navigate('Flashcards');
  // };

  const handlePress = (level) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    navigation.navigate("Flashcards", { difficulty: level }); // pass difficulty
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Fun Flashcards Game!</Text>

      <Image
        source={require('../assets/Images/kid.jpg')}
        style={styles.image}
      />

      <Text style={styles.subtitle}>Choose Difficulty:</Text>

      {['Easy', 'Medium', 'Hard'].map((level) => (
        <Animated.View
          key={level}
          style={{ transform: [{ scale: scaleAnim }], marginVertical: 10 }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePress(level.toLowerCase())}
          >
            <Text style={styles.buttonText}>{level}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4B5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: '600',
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
