import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New flag to prevent logout loop

  // Initialize auth state from storage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          await fetchUserData(storedToken);
        }
      } catch (err) {
        console.error('Failed to load auth data:', err);
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error clearing auth data:', err);
    }
  };

  const storeAuthData = async (token, userData) => {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['userData', JSON.stringify(userData)]
      ]);
    } catch (err) {
      console.error('Error storing auth data:', err);
    }
  };

  const fetchUserData = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const userData = response.data.data.user;
      setUser(userData);
      await storeAuthData(authToken, userData);
      
      return userData;
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      if (!isLoggingOut) await logout(); // Only logout if not already in progress
      throw err;
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });

      const { token, data } = response.data;
      const userData = data.user;
      
      setToken(token);
      setUser(userData);
      await storeAuthData(token, userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        password
      });

      const { token, data } = response.data;
      const userData = data.user;
      
      setToken(token);
      setUser(userData);
      await storeAuthData(token, userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout calls
    setIsLoggingOut(true);
    setIsLoading(true);
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await clearAuthData();
      setIsLoading(false);
      setIsLoggingOut(false);
    }
  };

  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/auth/me`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      await storeAuthData(token, updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { token: newToken } = response.data;
      setToken(newToken);
      await storeAuthData(newToken, user);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for role checking
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    return true; // Users can access user-level resources
  };

  const canManageUsers = () => {
    return isAdmin();
  };

  const canManageFragrances = () => {
    return isAdmin();
  };

  // Setup axios interceptors for token handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
          originalRequest._retry = true;
          await logout(); // Only logout if not already in progress
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, isLoggingOut]); // Add isLoggingOut to dependencies

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!token,
        isAdmin,
        hasRole,
        canManageUsers,
        canManageFragrances,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};