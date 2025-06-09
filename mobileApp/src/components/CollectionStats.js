"use client"

import { View, Text, StyleSheet } from "react-native"

const CollectionStats = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.owned}</Text>
        <Text style={styles.statLabel}>Owned</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.wishlist}</Text>
        <Text style={styles.statLabel}>Wishlist</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.tried}</Text>
        <Text style={styles.statLabel}>Tried</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>${stats.totalSpent}</Text>
        <Text style={styles.statLabel}>Spent</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
})

export default CollectionStats
