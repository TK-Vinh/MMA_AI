"use client"

import { useContext, useEffect, useState } from "react"
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { AuthContext } from "../context/AuthContext"
import FragranceCard from "../components/FragranceCard"
import { getAllFragrances } from "../api/fragrances"

// Custom Dropdown Component
const CustomDropdown = ({ placeholder, value, options, onSelect, multiSelect = false, icon = "▼" }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedItems, setSelectedItems] = useState(multiSelect ? value || [] : value)

  const handleSelect = (option) => {
    if (multiSelect) {
      const newSelection = selectedItems.includes(option)
        ? selectedItems.filter((item) => item !== option)
        : [...selectedItems, option]
      setSelectedItems(newSelection)
      onSelect(newSelection)
    } else {
      setSelectedItems(option)
      onSelect(option)
      setIsVisible(false)
    }
  }

  const getDisplayText = () => {
    if (multiSelect) {
      return selectedItems.length > 0 ? `${selectedItems.length} selected` : placeholder
    }
    return selectedItems || placeholder
  }

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsVisible(true)}>
        <Text style={[styles.dropdownButtonText, !selectedItems && styles.placeholderText]}>{getDisplayText()}</Text>
        <Text style={styles.dropdownIcon}>{icon}</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => setIsVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {multiSelect && (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedItems([])
                    onSelect([])
                  }}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}

              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    (multiSelect ? selectedItems.includes(option) : selectedItems === option) && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (multiSelect ? selectedItems.includes(option) : selectedItems === option) &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {(multiSelect ? selectedItems.includes(option) : selectedItems === option) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const HomeScreen = ({ navigation }) => {
  const [fragrances, setFragrances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    gender: "",
    brand: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const { userToken } = useContext(AuthContext)

  // Enum options from your Fragrance model
  const categoryOptions = [
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

  const genderOptions = ["Men", "Women", "Unisex"]

  useEffect(() => {
    const fetchFragrances = async () => {
      try {
        setLoading(true)
        const data = await getAllFragrances(filters, userToken)
        setFragrances(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFragrances()
  }, [filters, userToken])

  const handleFragrancePress = (fragranceId) => {
  console.log('Navigating to FragranceDetail with fragranceId:', fragranceId);
  navigation.navigate('FragranceDetail', { fragranceId });
};

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "",
      gender: "",
      brand: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading fragrances...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>😔 Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null)
            setLoading(true)
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Fragrances</Text>
        <Text style={styles.headerSubtitle}>{fragrances.length} fragrances available</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fragrances, brands..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtersGrid}>
            <View style={styles.filterRow}>
              <CustomDropdown
                placeholder="Select Category"
                value={filters.category}
                options={categoryOptions}
                onSelect={(value) => setFilters({ ...filters, category: value })}
              />

              <CustomDropdown
                placeholder="Select Gender"
                value={filters.gender}
                options={genderOptions}
                onSelect={(value) => setFilters({ ...filters, gender: value })}
              />
            </View>

            <TextInput
              style={styles.brandInput}
              placeholder="Filter by brand..."
              value={filters.brand}
              onChangeText={(text) => setFilters({ ...filters, brand: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <ScrollView horizontal style={styles.activeFiltersContainer} showsHorizontalScrollIndicator={false}>
          {filters.search && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>"{filters.search}"</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, search: "" })}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.category && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{filters.category}</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, category: "" })}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.gender && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{filters.gender}</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, gender: "" })}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.brand && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{filters.brand}</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, brand: "" })}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Fragrances List */}
      <FlatList
  data={fragrances}
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleFragrancePress(item._id)}>
      <FragranceCard fragrance={item} />
    </TouchableOpacity>
  )}
  contentContainerStyle={styles.list}
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>🔍 No fragrances found</Text>
      <Text style={styles.emptyStateSubtext}>Try adjusting your filters or search terms</Text>
    </View>
  }
/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  filterToggle: {
    width: 48,
    height: 48,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 20,
  },
  filtersSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  clearFiltersText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "500",
  },
  filtersGrid: {
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownButton: {
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1f2937",
  },
  placeholderText: {
    color: "#9ca3af",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#6b7280",
  },
  brandInput: {
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedOption: {
    backgroundColor: "#eff6ff",
  },
  optionText: {
    fontSize: 16,
    color: "#1f2937",
  },
  selectedOptionText: {
    color: "#2563eb",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
  },
  clearAllText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  removeFilter: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "bold",
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
})

export default HomeScreen;
