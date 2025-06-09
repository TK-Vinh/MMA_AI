"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFragrance } from "../context/FragranceContext"
import { useAuth } from "../context/AuthContext"
import FragranceCard from "../components/FragranceCard"
import SearchBar from "../components/SearchBar"
import FilterChips from "../components/FilterChips"

const { height } = Dimensions.get("window")

const ExploreScreen = ({ navigation }) => {
  const {
    fragrances,
    isLoading,
    error,
    filters,
    pagination,
    fetchFragrances,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    loadMoreFragrances,
    refreshFragrances,
    clearError,
  } = useFragrance()

  const { isAuthenticated } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }])
    }
  }, [error])

  const handleSearch = (text) => {
    updateFilters({ search: text })
    fetchFragrances(1, true)
  }

  const handleFilterPress = () => {
    navigation.navigate("Filter")
  }

  const handleClearFilters = () => {
    clearFilters()
    fetchFragrances(1, true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshFragrances()
    setRefreshing(false)
  }

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      loadMoreFragrances()
    }
  }

  const handleFragrancePress = (fragrance) => {
    navigation.navigate("FragranceDetail", {
      id: fragrance._id,
      fragrance: fragrance,
    })
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Explore Fragrances</Text>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={handleSearch} placeholder="Search fragrances, brands..." value={filters.search} />
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="options-outline" size={24} color="#8A2BE2" />
          {hasActiveFilters() && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {hasActiveFilters() && (
        <View style={styles.filterChipsContainer}>
          <FilterChips
            filters={filters}
            onClearFilter={(key) => {
              updateFilters({ [key]: null })
              fetchFragrances(1, true)
            }}
            onClearAll={handleClearFilters}
          />
        </View>
      )}
    </View>
  )

  const renderFooter = () => {
    if (!isLoading || refreshing) return null

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8A2BE2" />
        <Text style={styles.loadingText}>Loading more fragrances...</Text>
      </View>
    )
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No fragrances found</Text>
      <Text style={styles.emptySubtext}>
        {hasActiveFilters() ? "Try adjusting your filters" : "Check your internet connection and try again"}
      </Text>
      {hasActiveFilters() && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderFragranceItem = ({ item }) => (
    <FragranceCard fragrance={item} onPress={() => handleFragrancePress(item)} style={styles.card} />
  )

  if (isLoading && !refreshing && fragrances.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text style={styles.loadingText}>Loading fragrances...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={fragrances}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={renderFragranceItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#8A2BE2"]} tintColor="#8A2BE2" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#8A2BE2",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  filterChipsContainer: {
    marginTop: 15,
  },
  list: {
    padding: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 5,
  },
  footerLoader: {
    padding: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: height * 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  clearButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#8A2BE2",
    borderRadius: 20,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default ExploreScreen
