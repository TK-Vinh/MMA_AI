import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, getMe } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication state on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          // Verify token is still valid
          try {
            const userData = await getMe(token); // This will verify the token
            setUserToken(token);
            setUser(userData);
          } catch (error) {
            // Token is invalid/expired - clear it
            console.log('Invalid token, logging out...');
            await logout();
          }
        }
      } catch (e) {
        console.error('Auth state check failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      
      // Store both token and basic user info
      await AsyncStorage.multiSet([
        ['userToken', response.token],
        ['userData', JSON.stringify(response.user)]
      ]);
      
      setUserToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userToken, 
      isLoading, 
      isAuthenticated: !!userToken,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);