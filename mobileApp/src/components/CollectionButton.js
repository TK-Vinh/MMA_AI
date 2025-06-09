"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const CollectionButton = ({ onAddToCollection, isAuthenticated }) => {
  const buttons = [
    { status: "owned", label: "Own It", icon: "checkmark-circle", color: "#4CAF50" },
    { status: "wishlist", label: "Want It", icon: "heart", color: "#FF6B6B" },
    { status: "tried", label: "Tried It", icon: "flask", color: "#FF9800" },
  ]

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button.status}
          style={[styles.button, { backgroundColor: button.color }]}
          onPress={() => onAddToCollection(button.status)}
        >
          <Ionicons name={button.icon} size={20} color="white" />
          <Text style={styles.buttonText}>{button.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
})

export default CollectionButton
