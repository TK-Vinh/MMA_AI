"use client"

import { useEffect, useState, useContext, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, Dimensions, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { FragranceContext } from "../context/FragranceContext"
import { CollectionContext } from "../context/CollectionContext"
import { AuthContext } from "../context/AuthContext"
import RatingStars from "../components/RatingStars"
import NotesSection from "../components/NotesSection"
import ImageGallery from "../components/ImageGallery"
import CollectionButton from "../components/CollectionButton"
import LoadingIndicator from "../components/LoadingIndicator"

const { width } = Dimensions.get("window")

const FragranceDetailScreen = ({ route, navigation }) => {
  const { id } = route.params
  const { state, getFragranceById, updateRating } = useContext(FragranceContext)
  const { state: collectionState, addToCollection } = useContext(CollectionContext)
  const { state: authState } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: "clamp",
  })

  useEffect(() => {
    const loadFragrance = async () => {
      setLoading(true)
      await getFragranceById(id)
      setLoading(false)
    }

    loadFragrance()
  }, [getFragranceById, id])

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      headerTransparent: true,
      headerBackground: () => <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />,
      headerRight: () => (
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#6A0DAD" />
        </TouchableOpacity>
      ),
    })
  }, [navigation, headerOpacity])

  const handleShare = async () => {
    if (!state.currentFragrance) return

    try {
      await Share.share({
        message: `Check out ${state.currentFragrance.name} by ${state.currentFragrance.brand} on Fragrance App!`,
        url: `https://fragranceapp.com/fragrances/${state.currentFragrance._id}`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleRating = async (rating) => {
    setUserRating(rating)
    if (authState.userToken) {
      await updateRating(id, rating)
    } else {
      navigation.navigate("Login", { returnTo: "FragranceDetail", params: { id } })
    }
  }

  const handleAddToCollection = (status) => {
    if (!authState.userToken) {
      navigation.navigate("Login", { returnTo: "FragranceDetail", params: { id } })
      return
    }

    navigation.navigate("AddToCollection", {
      fragranceId: id,
      fragrance: state.currentFragrance,
      initialStatus: status,
    })
  }

  if (loading || !state.currentFragrance) {
    return <LoadingIndicator />
  }

  const {
    name,
    brand,
    imageUrl,
    images,
    description,
    notes,
    concentration,
    gender,
    releaseYear,
    rating,
    totalRatings,
    category,
    size,
  } = state.currentFragrance

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
          {images && images.length > 0 ? (
            <ImageGallery images={images} />
          ) : (
            <Image
              source={{ uri: imageUrl || "https://via.placeholder.com/400" }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </Animated.View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{brand}</Text>
              <Text style={styles.name}>{name}</Text>
            </View>

            <View style={styles.ratingContainer}>
              <RatingStars rating={rating} size={20} onPress={() => setShowRatingModal(true)} />
              <Text style={styles.ratingText}>
                {rating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? "review" : "reviews"})
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            {concentration && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Concentration</Text>
                <Text style={styles.detailValue}>{concentration}</Text>
              </View>
            )}

            {gender && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{gender}</Text>
              </View>
            )}

            {category && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{category}</Text>
              </View>
            )}

            {releaseYear && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Released</Text>
                <Text style={styles.detailValue}>{releaseYear}</Text>
              </View>
            )}
          </View>

          {size && size.length > 0 && (
            <View style={styles.sizeContainer}>
              <Text style={styles.sectionTitle}>Available Sizes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {size.map((item, index) => (
                  <View key={index} style={styles.sizeItem}>
                    <Text style={styles.sizeVolume}>{item.volume} ml</Text>
                    {item.price && <Text style={styles.sizePrice}>${item.price}</Text>}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {notes && <NotesSection notes={notes} />}
        </View>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <CollectionButton onAddToCollection={handleAddToCollection} isAuthenticated={!!authState.userToken} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerBackground: {
    backgroundColor: "white",
    height: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  shareButton: {
    padding: 10,
    marginRight: 10,
  },
  imageContainer: {
    height: 300,
    width: "100%",
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brand: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    width: width * 0.6,
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  detailItem: {
    width: "50%",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  sizeContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sizeItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: "center",
    minWidth: 80,
  },
  sizeVolume: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sizePrice: {
    fontSize: 14,
    color: "#6A0DAD",
    marginTop: 5,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
})

export default FragranceDetailScreen
