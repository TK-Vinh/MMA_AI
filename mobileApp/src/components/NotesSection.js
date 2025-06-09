"use client"

import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const NotesSection = ({ notes }) => {
  if (!notes || (!notes.top?.length && !notes.middle?.length && !notes.base?.length)) {
    return null
  }

  const renderNoteCategory = (title, notesList, icon, color) => {
    if (!notesList || notesList.length === 0) return null

    return (
      <View style={styles.noteCategory}>
        <View style={styles.noteCategoryHeader}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={[styles.noteCategoryTitle, { color }]}>{title}</Text>
        </View>
        <View style={styles.notesContainer}>
          {notesList.map((note, index) => (
            <View key={index} style={[styles.noteChip, { borderColor: color }]}>
              <Text style={[styles.noteText, { color }]}>{note}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Fragrance Notes</Text>

      {renderNoteCategory("Top Notes", notes.top, "arrow-up-circle", "#FF6B6B")}
      {renderNoteCategory("Middle Notes", notes.middle, "ellipse", "#FF9800")}
      {renderNoteCategory("Base Notes", notes.base, "arrow-down-circle", "#4CAF50")}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  noteCategory: {
    marginBottom: 15,
  },
  noteCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 22,
  },
  noteChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default NotesSection
