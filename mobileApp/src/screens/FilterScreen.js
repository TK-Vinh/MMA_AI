"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFragrance } from "../context/FragranceContext"
import RatingStars from "../components/RatingStars"

const FilterScreen = ({ navigation }) => {
  const { filters, updateFilters, clearFilters, fetchFragrances } = useFragrance()
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const categories = [
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
  const genders = ["Men", "Women", "Unisex"]
  const concentrations = ["EDT", "EDP", "Parfum", "EDC", "Cologne"]
  const brands = ["Chanel", "Dior", "Tom Ford", "Creed", "Maison Margiela", "Le Labo", "Byredo", "Hermès"]

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }))
  }

  const handleRatingChange = (rating) => {
    setLocalFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === rating ? null : rating,
    }))
  }

  const handleApplyFilters = async () => {
    updateFilters(localFilters)
    await fetchFragrances(1, true)
    navigation.goBack()
  }

  const handleClearFilters = () => {
    setLocalFilters({
      category: null,
      brand: null,
      gender: null,
      concentration: null,
      minRating: null,
      search: "",
    })
  }

  const handleClose = () => {
    navigation.goBack()
  }

  const renderFilterSection = (title, options, selectedValue, onSelect) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selectedValue === option && styles.selectedOption]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, selectedValue === option && styles.selectedOptionText]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderRatingSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Minimum Rating</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[styles.ratingOption, localFilters.minRating === rating && styles.selectedRatingOption]}
            onPress={() => handleRatingChange(rating)}
          >
            <RatingStars rating={rating} size={16} />
            <Text style={styles.ratingText}>{rating}+ stars</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const hasActiveFilters = Object.values(localFilters).some((value) => value !== null && value !== "")

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Filter Fragrances</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters} disabled={!hasActiveFilters}>
          <Text style={[styles.clearButtonText, !hasActiveFilters && styles.disabledText]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFilterSection("Category", categories, localFilters.category, (value) =>
          handleFilterChange("category", value),
        )}

        {renderFilterSection("Gender", genders, localFilters.gender, (value) => handleFilterChange("gender", value))}

        {renderFilterSection("Concentration", concentrations, localFilters.concentration, (value) =>
          handleFilterChange("concentration", value),
        )}

        {renderFilterSection("Brand", brands, localFilters.brand, (value) => handleFilterChange("brand", value))}

        {renderRatingSection()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: "#8A2BE2",
    fontWeight: "600",
  },
  disabledText: {
    color: "#ccc",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  option: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#8A2BE2",
    borderColor: "#8A2BE2",
  },
  optionText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "white",
  },
  ratingContainer: {
    flexDirection: "column",
  },
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: "#f9f9f9",
  },
  selectedRatingOption: {
    backgroundColor: "#8A2BE2",
  },
  ratingText: {
    marginLeft: 10,
    color: "#666",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  applyButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default FilterScreen;
