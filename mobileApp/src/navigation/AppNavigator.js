import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import FragranceManagementScreen from '../screens/FragranceManagementScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FilterScreen from '../screens/FilterScreen';
import FragranceDetailScreen from '../screens/FragranceDetailScreen';
import AddToCollectionScreen from '../screens/AddToCollectionScreen';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import CreateEditFragranceScreen from '../screens/CreateEditFragranceScreen';

// Admin Stack for nested navigation
const AdminStack = createStackNavigator();
const AdminStackNavigator = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="AdminPanel" component={AdminPanelScreen} />
    <AdminStack.Screen name="FragranceManagement" component={FragranceManagementScreen} />
    <AdminStack.Screen 
      name="CreateFragrance" 
      component={CreateEditFragranceScreen} 
      initialParams={{ fragrance: null }} 
    />
    <AdminStack.Screen 
      name="EditFragrance" 
      component={CreateEditFragranceScreen} 
    />
    {/* Add other admin screens here when implemented */}
  </AdminStack.Navigator>
);

// Explore Stack for nested navigation
const ExploreStack = createStackNavigator();
const ExploreStackNavigator = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
    <ExploreStack.Screen name="Filter" component={FilterScreen} />
    <ExploreStack.Screen name="FragranceDetail" component={FragranceDetailScreen} />
  </ExploreStack.Navigator>
);

// Collection Stack for nested navigation
const CollectionStack = createStackNavigator();
const CollectionStackNavigator = () => (
  <CollectionStack.Navigator screenOptions={{ headerShown: false }}>
    {/* Add collection screens here when implemented */}
    <CollectionStack.Screen name="AddToCollection" component={AddToCollectionScreen} />
  </CollectionStack.Navigator>
);

const Tab = createBottomTabNavigator();
const MainAppNavigator = () => {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Collection') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8A2BE2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreStackNavigator} />
      <Tab.Screen name="Collection" component={CollectionStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
      {isAdmin() && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStackNavigator}
          options={{
            tabBarLabel: 'Admin Panel'
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const Stack = createStackNavigator();
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={MainAppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;