// "use client"

// import { useEffect, useState, useContext } from "react"
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { CollectionContext } from "../context/CollectionContext"
// import { AuthContext } from "../context/AuthContext"
// // import CollectionCard from "../components/CollectionCard"
// import CollectionStats from "../components/CollectionStats"
// import EmptyState from "../components/EmptyState"
// import LoadingIndicator from "../components/LoadingIndicator"

// const CollectionScreen = ({ navigation, route }) => {
//   const { state, fetchCollection, fetchStats, setCollectionStatus, removeFromCollection, markAsWorn } =
//     useContext(CollectionContext)
//   const { state: authState } = useContext(AuthContext)
//   const [refreshing, setRefreshing] = useState(false)
//   const [selectedTab, setSelectedTab] = useState("owned")
//   const tabBarAnim = useState(new Animated.Value(0))[0]

//   useEffect(() => {
//     if (!authState.userToken) {
//       navigation.navigate("Login", { returnTo: "Collection" })
//       return
//     }

//     // Check if we have an initial status from route params
//     const initialStatus = route.params?.initialStatus
//     if (initialStatus) {
//       setSelectedTab(initialStatus)
//       setCollectionStatus(initialStatus)
//     }

//     fetchCollection(selectedTab)
//     fetchStats()
//   }, [authState.userToken, fetchCollection, fetchStats, navigation, route.params])

//   useEffect(() => {
//     // Animate tab indicator
//     let tabPosition = 0
//     switch (selectedTab) {
//       case "owned":
//         tabPosition = 0
//         break
//       case "wishlist":
//         tabPosition = 1
//         break
//       case "tried":
//         tabPosition = 2
//         break
//       case "sold":
//         tabPosition = 3
//         break
//     }

//     Animated.spring(tabBarAnim, {
//       toValue: tabPosition,
//       useNativeDriver: true,
//     }).start()
//   }, [selectedTab, tabBarAnim])

//   const onRefresh = async () => {
//     setRefreshing(true)
//     await fetchCollection(selectedTab)
//     await fetchStats()
//     setRefreshing(false)
//   }

//   const handleTabPress = (tab) => {
//     setSelectedTab(tab)
//     setCollectionStatus(tab)
//     fetchCollection(tab)
//   }

//   const handleRemove = async (id) => {
//     await removeFromCollection(id)
//     fetchStats()
//   }

//   const handleMarkAsWorn = async (id) => {
//     await markAsWorn(id)
//   }

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <Text style={styles.title}>My Collection</Text>
//       <CollectionStats stats={state.stats} />

//       <View style={styles.tabContainer}>
//         <TouchableOpacity style={styles.tab} onPress={() => handleTabPress("owned")}>
//           <Text style={[styles.tabText, selectedTab === "owned" && styles.activeTabText]}>Owned</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.tab} onPress={() => handleTabPress("wishlist")}>
//           <Text style={[styles.tabText, selectedTab === "wishlist" && styles.activeTabText]}>Wishlist</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.tab} onPress={() => handleTabPress("tried")}>
//           <Text style={[styles.tabText, selectedTab === "tried" && styles.activeTabText]}>Tried</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.tab} onPress={() => handleTabPress("sold")}>
//           <Text style={[styles.tabText, selectedTab === "sold" && styles.activeTabText]}>Sold</Text>
//         </TouchableOpacity>

//         <Animated.View
//           style={[
//             styles.tabIndicator,
//             {
//               transform: [
//                 {
//                   translateX: tabBarAnim.interpolate({
//                     inputRange: [0, 1, 2, 3],
//                     outputRange: [0, 80, 160, 240],
//                   }),
//                 },
//               ],
//             },
//           ]}
//         />
//       </View>
//     </View>
//   )

//   const renderEmptyList = () => (
//     <EmptyState
//       icon="flask-outline"
//       title={`No fragrances in your ${selectedTab} collection`}
//       message={
//         selectedTab === "owned"
//           ? "Add fragrances you own to your collection"
//           : selectedTab === "wishlist"
//             ? "Add fragrances you want to try"
//             : selectedTab === "tried"
//               ? "Add fragrances you've tried before"
//               : "Add fragrances you've sold"
//       }
//       actionLabel="Explore Fragrances"
//       onAction={() => navigation.navigate("Explore")}
//     />
//   )

//   if (state.loading && !refreshing) {
//     return <LoadingIndicator />
//   }

//   return (
//     <View style={styles.container}>
//       {renderHeader()}

//       <FlatList
//         data={state.collection}
//         keyExtractor={(item) => item._id}
//         // renderItem={({ item }) => (
//         //   <CollectionCard
//         //     item={item}
//         //     status={selectedTab}
//         //     onPress={() => navigation.navigate("FragranceDetail", { id: item.fragranceId._id })}
//         //     onRemove={() => handleRemove(item._id)}
//         //     onMarkAsWorn={selectedTab === "owned" ? () => handleMarkAsWorn(item._id) : null}
//         //   />
//         // )}
//         contentContainerStyle={styles.list}
//         onRefresh={onRefresh}
//         refreshing={refreshing}
//         ListEmptyComponent={renderEmptyList}
//       />

//       <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Explore")}>
//         <Ionicons name="add" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f8f8",
//   },
//   header: {
//     backgroundColor: "#6A0DAD",
//     paddingTop: 60,
//     paddingHorizontal: 20,
//     paddingBottom: 0,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//     marginBottom: 15,
//   },
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 10,
//     marginTop: 20,
//     position: "relative",
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 15,
//     alignItems: "center",
//   },
//   tabText: {
//     color: "rgba(255, 255, 255, 0.7)",
//     fontWeight: "600",
//   },
//   activeTabText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   tabIndicator: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     width: 80,
//     height: 3,
//     backgroundColor: "white",
//     borderRadius: 2,
//   },
//   list: {
//     padding: 15,
//   },
//   addButton: {
//     position: "absolute",
//     bottom: 30,
//     right: 30,
//     width: 56,
//     height: 56,
//     backgroundColor: "#6A0DAD",
//     borderRadius: 28,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
// })

// export default CollectionScreen
