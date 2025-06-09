import { API_BASE_URL } from '@env';

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return { token: data.token, user: data.data.user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return { token: data.token, user: data.data.user };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getMe = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};