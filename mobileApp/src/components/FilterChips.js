"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const FilterChips = ({ filters, onClearFilter, onClearAll }) => {
  const activeFilters = []

  if (filters.category) activeFilters.push({ key: "category", label: filters.category })
  if (filters.brand) activeFilters.push({ key: "brand", label: filters.brand })
  if (filters.gender) activeFilters.push({ key: "gender", label: filters.gender })
  if (filters.concentration) activeFilters.push({ key: "concentration", label: filters.concentration })
  if (filters.minRating) activeFilters.push({ key: "minRating", label: `${filters.minRating}+ stars` })

  if (activeFilters.length === 0) return null

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {activeFilters.map((filter) => (
          <TouchableOpacity key={filter.key} style={styles.chip} onPress={() => onClearFilter(filter.key)}>
            <Text style={styles.chipText}>{filter.label}</Text>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    color: "white",
    fontSize: 12,
    marginRight: 6,
  },
  clearAllChip: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
})

export default FilterChips
