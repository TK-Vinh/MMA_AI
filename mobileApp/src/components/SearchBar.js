"use client"

import { useState, useRef } from "react"
import { TextInput, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const SearchBar = ({ onSearch, placeholder = "Search fragrances..." }) => {
  const [searchText, setSearchText] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const animatedValue = useRef(new Animated.Value(0)).current

  const handleFocus = () => {
    setIsFocused(true)
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleBlur = () => {
    setIsFocused(false)
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleChangeText = (text) => {
    setSearchText(text)
    onSearch(text)
  }

  const handleClear = () => {
    setSearchText("")
    onSearch("")
  }

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.8)"],
  })

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Ionicons name="search-outline" size={20} color="rgba(255, 255, 255, 0.7)" />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={searchText}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        onSubmitEditing={() => onSearch(searchText)}
      />

      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    flex: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "white",
  },
})

export default SearchBar
