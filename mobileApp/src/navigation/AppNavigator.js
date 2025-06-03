import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Placeholder for unimplemented screens
const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, color: '#666' }}>Screen coming soon!</Text>
  </View>
);

// Admin Stack for nested navigation
const AdminStack = createStackNavigator();
const AdminStackNavigator = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="AdminPanel" component={AdminPanelScreen} />
    <AdminStack.Screen name="UserManagement" component={PlaceholderScreen} />
    <AdminStack.Screen name="FragranceManagement" component={PlaceholderScreen} />
    <AdminStack.Screen name="Analytics" component={PlaceholderScreen} />
    <AdminStack.Screen name="Moderation" component={PlaceholderScreen} />
    <AdminStack.Screen name="AppSettings" component={PlaceholderScreen} />
    <AdminStack.Screen name="Reports" component={PlaceholderScreen} />
  </AdminStack.Navigator>
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
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Closet') {
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
      <Tab.Screen name="Search" component={PlaceholderScreen} />
      <Tab.Screen name="Closet" component={PlaceholderScreen} />
      <Tab.Screen name="Chat" component={PlaceholderScreen} />
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