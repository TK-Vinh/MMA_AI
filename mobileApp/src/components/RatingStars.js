import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const RatingStars = ({ rating, size = 16, onPress, interactive = false }) => {
  const stars = []

  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating)
    const halfFilled = i === Math.ceil(rating) && rating % 1 !== 0

    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => interactive && onPress && onPress(i)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <Ionicons
          name={filled ? "star" : halfFilled ? "star-half" : "star-outline"}
          size={size}
          color={filled || halfFilled ? "#FFD700" : "#ccc"}
        />
      </TouchableOpacity>,
    )
  }

  return <View style={styles.container}>{stars}</View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starContainer: {
    marginRight: 2,
  },
})

export default RatingStars
