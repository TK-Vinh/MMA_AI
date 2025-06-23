import { API_BASE_URL } from '@env';

export const getAllFragrances = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/api/fragrances${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch fragrances');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fragrances:', error);
    throw error;
  }
};

export const getFragranceById = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch fragrance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fragrance by ID:', error);
    throw error;
  }
};

export const addToCloset = async (fragranceId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/closet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fragranceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to closet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding to closet:', error);
    throw error;
  }
};

export const rateFragrance = async (fragranceId, rating, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances/${fragranceId}/rating`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to rate fragrance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rating fragrance:', error);
    throw error;
  }
};

export const createFragrance = async (fragranceData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fragranceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create fragrance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating fragrance:', error);
    throw error;
  }
};

export const updateFragrance = async (id, fragranceData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fragranceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update fragrance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating fragrance:', error);
    throw error;
  }
};

export const deleteFragrance = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete fragrance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting fragrance:', error);
    throw error;
  }
};

export const uploadImageToS3 = async (fragranceId, formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fragrances/${fragranceId}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw error;
  }
};