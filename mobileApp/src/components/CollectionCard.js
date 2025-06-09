"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const CollectionCard = ({ item, status, onPress, onRemove, onMarkAsWorn }) => {
  const { fragranceId, purchasePrice, purchaseDate, notes, wearCount } = item

  const handleRemove = () => {
    Alert.alert(
      "Remove from Collection",
      `Are you sure you want to remove ${fragranceId.name} from your ${status} collection?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: onRemove },
      ],
    )
  }

  const getStatusIcon = () => {
    switch (status) {
      case "owned":
        return "checkmark-circle"
      case "wishlist":
        return "heart"
      case "tried":
        return "flask"
      case "sold":
        return "cash"
      default:
        return "flask"
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "owned":
        return "#4CAF50"
      case "wishlist":
        return "#FF6B6B"
      case "tried":
        return "#FF9800"
      case "sold":
        return "#9E9E9E"
      default:
        return "#6A0DAD"
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: fragranceId.imageUrl || "https://via.placeholder.com/80" }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.brand}>{fragranceId.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {fragranceId.name}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
          </View>
        </View>

        <View style={styles.details}>
          {fragranceId.concentration && <Text style={styles.concentration}>{fragranceId.concentration}</Text>}

          {status === "owned" && wearCount > 0 && <Text style={styles.wearCount}>Worn {wearCount} times</Text>}

          {purchasePrice && <Text style={styles.price}>${purchasePrice}</Text>}
        </View>

        {notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {notes}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {status === "owned" && onMarkAsWorn && (
          <TouchableOpacity style={styles.actionButton} onPress={onMarkAsWorn}>
            <Ionicons name="add-circle-outline" size={20} color="#6A0DAD" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusContainer: {
    marginLeft: 10,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  concentration: {
    fontSize: 12,
    color: "#6A0DAD",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  wearCount: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  price: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  notes: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  actions: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
  },
})

export default CollectionCard
