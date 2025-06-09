import { View, ActivityIndicator, StyleSheet } from "react-native"

const LoadingIndicator = ({ size = "large", color = "#6A0DAD" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
})

export default LoadingIndicator
