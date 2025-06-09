import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import FragranceDetailScreen from '../screens/FragranceDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen';
import ManageFragrancesScreen from '../screens/ManageFragrancesScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import AuthNavigator from './AuthNavigator';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FragranceStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="FragranceList"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="FragranceDetail"
      component={FragranceDetailScreen}
      options={{ title: 'Fragrance Details' }}
    />
    <Stack.Screen
      name="AdminPanel"
      component={AdminPanelScreen}
      options={{ title: 'Admin Panel' }}
    />
    <Stack.Screen
      name="ManageUsers"
      component={ManageUsersScreen}
      options={{ title: 'Manage Users' }}
    />
    <Stack.Screen
      name="ManageFragrances"
      component={ManageFragrancesScreen}
      options={{ title: 'Manage Fragrances' }}
    />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Browse') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen
      name="Browse"
      component={FragranceStack}
      options={{ title: 'Browse' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {userToken ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}