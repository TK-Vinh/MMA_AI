import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FragranceProvider } from './src/context/FragranceContext';
import { CollectionProvider } from './src/context/CollectionContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <FragranceProvider>
          <CollectionProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        </CollectionProvider>
        </FragranceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;