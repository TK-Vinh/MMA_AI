"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native"
import { useAuth } from "../context/AuthContext"
import { useFragrance } from "../context/FragranceContext"
import { useCollection } from "../context/CollectionContext"
import { Ionicons } from "@expo/vector-icons"
import RatingStars from "../components/RatingStars"

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth()
  const { fragrances, isLoading: fragranceLoading, fetchFragrances, error: fragranceError } = useFragrance()
  const { stats, isLoading: collectionLoading, fetchStats, error: collectionError } = useCollection()
  const [refreshing, setRefreshing] = useState(false)

  // Mock categories data (you can replace with API call later)
  const categories = [
    { id: "1", name: "Floral", image: "https://via.placeholder.com/120x100/FFB6C1/FFFFFF?text=Floral" },
    { id: "2", name: "Woody", image: "https://via.placeholder.com/120x100/8B4513/FFFFFF?text=Woody" },
    { id: "3", name: "Citrus", image: "https://via.placeholder.com/120x100/FFA500/FFFFFF?text=Citrus" },
    { id: "4", name: "Oriental", image: "https://via.placeholder.com/120x100/800080/FFFFFF?text=Oriental" },
    { id: "5", name: "Fresh", image: "https://via.placeholder.com/120x100/00CED1/FFFFFF?text=Fresh" },
    { id: "6", name: "Gourmand", image: "https://via.placeholder.com/120x100/D2691E/FFFFFF?text=Gourmand" },
  ]

  useEffect(() => {
    const initializeData = async () => {
      await fetchFragrances(1, true)
      if (user) {
        await fetchStats()
      }
    }

    initializeData()
  }, [user])

  useEffect(() => {
    if (fragranceError) {
      Alert.alert("Error", fragranceError)
    }
  }, [fragranceError])

  useEffect(() => {
    if (collectionError) {
      Alert.alert("Error", collectionError)
    }
  }, [collectionError])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchFragrances(1, true)
    if (user) {
      await fetchStats()
    }
    setRefreshing(false)
  }

  const handleCategoryPress = (category) => {
    navigation.navigate("Explore", {
      screen: "ExploreMain",
      params: { initialCategory: category.name },
    })
  }

  const handleFragrancePress = (fragrance) => {
    navigation.navigate("FragranceDetail", {
      id: fragrance._id,
      fragrance: fragrance,
    })
  }

  const handleViewCollection = () => {
    if (user) {
      navigation.navigate("Collection")
    } else {
      Alert.alert("Login Required", "Please login to view your collection", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Auth") },
      ])
    }
  }

  const handleExploreAll = () => {
    navigation.navigate("Explore")
  }

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  )

  const renderFeatured = ({ item }) => (
    <TouchableOpacity 
    style={styles.featuredCard}
    onPress={() => navigation.navigate('FragranceDetail', { fragranceId: item._id })}
  >
    {item.images && item.images.length > 0 ? (
      <Image source={{ uri: item.images[0].url }} style={styles.featuredImage} />
    ) : (
      <View style={styles.fragranceImagePlaceholder}>
        <Text style={styles.fragranceInitial}>{item.name.charAt(0)}</Text>
      </View>
    )}
    <View style={styles.featuredContent}>
      <Text style={styles.featuredBrand}>{item.brand}</Text>
      <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
      <RatingStars rating={item.rating || 0} size={14} />
      {item.size && item.size.length > 0 && (
        <Text style={styles.featuredPrice}>${item.size[0].price}</Text>
      )}
    </View>
  </TouchableOpacity>
  )

  const renderCollectionStats = () => {
    if (!user) return null

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Collection</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("Collection", { initialStatus: "owned" })}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.owned}</Text>
            <Text style={styles.statLabel}>Owned</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("Collection", { initialStatus: "wishlist" })}
          >
            <Ionicons name="heart" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{stats.wishlist}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("Collection", { initialStatus: "tried" })}
          >
            <Ionicons name="flask" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.tried}</Text>
            <Text style={styles.statLabel}>Tried</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#8A2BE2" />
            <Text style={styles.statNumber}>${stats.totalSpent || 0}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>
      </View>
    )
  }

  if (fragranceLoading && fragrances.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text style={styles.loadingText}>Loading fragrances...</Text>
      </View>
    )
  }

  // Get featured fragrances (top rated or first 6)
  const featuredFragrances = fragrances
    .filter((f) => f.rating >= 4.0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)

  // If no high-rated fragrances, use first 6
  const displayedFeatured = featuredFragrances.length > 0 ? featuredFragrances : fragrances.slice(0, 6)

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8A2BE2"]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome{user ? `, ${user.username}` : ""}!</Text>
        <Text style={styles.headerSubtext}>Discover your perfect scent</Text>
      </View>

      {renderCollectionStats()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fragrance Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Fragrances</Text>
          <TouchableOpacity onPress={handleExploreAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={displayedFeatured}
          renderItem={renderFeatured}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
          ListEmptyComponent={
            <View style={styles.emptyFeatured}>
              <Text style={styles.emptyText}>No featured fragrances available</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity style={styles.myClosetButton} onPress={handleViewCollection}>
        <Ionicons name="library" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.myClosetText}>{user ? "View My Fragrance Collection" : "Login to View Collection"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exploreButton} onPress={handleExploreAll}>
        <Ionicons name="search" size={20} color="#8A2BE2" style={styles.buttonIcon} />
        <Text style={styles.exploreButtonText}>Explore All Fragrances</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#8A2BE2",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  seeAllText: {
    color: "#8A2BE2",
    fontWeight: "600",
    fontSize: 14,
  },
  statsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  categoryList: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  categoryName: {
    padding: 10,
    textAlign: "center",
    fontWeight: "500",
    color: "#333",
  },
  featuredList: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  featuredContent: {
    padding: 10,
  },
  featuredBrand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyFeatured: {
    width: 200,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  myClosetButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exploreButton: {
    marginTop: 15,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#8A2BE2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  myClosetText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  exploreButtonText: {
    color: "#8A2BE2",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomSpacing: {
    height: 30,
  },
})

export default HomeScreen
