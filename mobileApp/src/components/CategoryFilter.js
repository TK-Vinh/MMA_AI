"use client"

import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native"

const CategoryFilter = ({ onSelectCategory, selectedCategory }) => {
  const categories = [
    "All",
    "Fresh",
    "Floral",
    "Oriental",
    "Woody",
    "Citrus",
    "Gourmand",
    "Aquatic",
    "Spicy",
    "Green",
    "Fruity",
  ]

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryItem, selectedCategory === category && styles.selectedCategory]}
          onPress={() => onSelectCategory(category === "All" ? null : category)}
        >
          <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 20,
  },
  categoryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedCategory: {
    backgroundColor: "white",
  },
  categoryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "#6A0DAD",
  },
})

export default CategoryFilter
