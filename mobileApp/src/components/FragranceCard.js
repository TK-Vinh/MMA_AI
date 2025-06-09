"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native"
import RatingStars from "./RatingStars"

const FragranceCard = ({ fragrance, onPress, style }) => {
  const [scaleAnim] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const { name, brand, imageUrl, rating, concentration, category } = fragrance

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || "https://via.placeholder.com/200" }}
            style={styles.image}
            resizeMode="cover"
          />
          {concentration && (
            <View style={styles.concentrationBadge}>
              <Text style={styles.concentrationText}>{concentration}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.brand} numberOfLines={1}>
            {brand}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <View style={styles.footer}>
            <RatingStars rating={rating} size={14} />
            {category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  concentrationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  concentrationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    minHeight: 34,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    color: "#666",
  },
})

export default FragranceCard
