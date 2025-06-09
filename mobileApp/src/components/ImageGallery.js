"use client"

import { useState } from "react"
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

const ImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return <Image source={{ uri: "https://via.placeholder.com/400" }} style={styles.singleImage} resizeMode="cover" />
  }

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0].url || "https://via.placeholder.com/400" }}
        style={styles.singleImage}
        resizeMode="cover"
      />
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width)
          setActiveIndex(index)
        }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image.url || "https://via.placeholder.com/400" }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View key={index} style={[styles.paginationDot, index === activeIndex && styles.activePaginationDot]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },
  image: {
    width,
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: "white",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})

export default ImageGallery
