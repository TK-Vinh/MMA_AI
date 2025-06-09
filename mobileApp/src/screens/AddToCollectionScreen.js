"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useCollection } from "../context/CollectionContext"
import { useAuth } from "../context/AuthContext"

const AddToCollectionScreen = ({ route, navigation }) => {
  const { fragranceId, fragrance, initialStatus = "owned", existingItem } = route.params || {}
  const { addToCollection, updateCollectionItem, isLoading, error, clearError } = useCollection()
  const { isAuthenticated } = useAuth()

  const [status, setStatus] = useState(initialStatus)
  const [purchasePrice, setPurchasePrice] = useState(existingItem?.purchasePrice?.toString() || "")
  const [purchaseDate, setPurchaseDate] = useState(existingItem?.purchaseDate || "")
  const [notes, setNotes] = useState(existingItem?.notes || "")
  const [size, setSize] = useState(existingItem?.size?.toString() || "")

  const statusOptions = [
    { value: "owned", label: "Owned", icon: "checkmark-circle", color: "#4CAF50" },
    { value: "wishlist", label: "Wishlist", icon: "heart", color: "#FF6B6B" },
    { value: "tried", label: "Tried", icon: "flask", color: "#FF9800" },
    { value: "sold", label: "Sold", icon: "cash", color: "#9E9E9E" },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please login to manage your collection", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }])
    }
  }, [error])

  const handleSave = async () => {
    if (!fragranceId) {
      Alert.alert("Error", "Fragrance information is missing")
      return
    }

    const collectionData = {
      status,
      ...(purchasePrice && { purchasePrice: Number.parseFloat(purchasePrice) }),
      ...(purchaseDate && { purchaseDate }),
      ...(notes && { notes }),
      ...(size && { size: Number.parseFloat(size) }),
    }

    let result
    if (existingItem) {
      // Update existing item
      result = await updateCollectionItem(existingItem._id, collectionData)
    } else {
      // Add new item
      result = await addToCollection(fragranceId, status, collectionData)
    }

    if (result.success) {
      Alert.alert(
        "Success",
        existingItem ? "Collection item updated successfully" : "Added to collection successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      )
    }
  }

  const handleClose = () => {
    navigation.goBack()
  }

  const renderStatusOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[styles.statusOption, status === option.value && { backgroundColor: option.color }]}
      onPress={() => setStatus(option.value)}
    >
      <Ionicons name={option.icon} size={24} color={status === option.value ? "white" : option.color} />
      <Text style={[styles.statusText, status === option.value && { color: "white" }]}>{option.label}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{existingItem ? "Edit Collection Item" : "Add to Collection"}</Text>
        <View style={styles.placeholder} />
      </View>

      {fragrance && (
        <View style={styles.fragranceInfo}>
          <Text style={styles.fragranceBrand}>{fragrance.brand}</Text>
          <Text style={styles.fragranceName}>{fragrance.name}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>{statusOptions.map(renderStatusOption)}</View>
        </View>

        {(status === "owned" || status === "sold") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price (optional)"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>
        )}

        {status === "owned" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Size (ml)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter size in ml (optional)"
              value={size}
              onChangeText={setSize}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add your personal notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{existingItem ? "Update" : "Add to Collection"}</Text>
          )}
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
  placeholder: {
    width: 34,
  },
  fragranceInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fragranceBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  fragranceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    minWidth: 100,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AddToCollectionScreen;
