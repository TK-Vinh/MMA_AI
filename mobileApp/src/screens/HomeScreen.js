import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@env';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch fragrance categories and featured products
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from your backend API
        // These are mock data for demonstration
        const mockCategories = [
          { id: '1', name: 'Floral', image: require('../../assets/bread.png') },
          { id: '2', name: 'Woody', image: require('../../assets/bread.png') },
          { id: '3', name: 'Citrus', image: require('../../assets/bread.png') },
          { id: '4', name: 'Oriental', image: require('../../assets/bread.png') },
        ];

        const mockFeatured = [
          { id: '1', name: 'Chanel No. 5', brand: 'Chanel', image: require('../../assets/bread.png') },
          { id: '2', name: 'Sauvage', brand: 'Dior', image: require('../../assets/bread.png') },
          { id: '3', name: 'Acqua di Gio', brand: 'Armani', image: require('../../assets/bread.png') },
        ];

        setCategories(mockCategories);
        setFeatured(mockFeatured);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Category', { categoryId: item.id })}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeatured = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigation.navigate('Product', { productId: item.id })}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <Text style={styles.featuredBrand}>{item.brand}</Text>
      <Text style={styles.featuredName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome{user ? `, ${user.username}` : ''}!</Text>
      </View>

      <Text style={styles.sectionTitle}>Fragrance Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <Text style={styles.sectionTitle}>Featured Fragrances</Text>
      <FlatList
        data={featured}
        renderItem={renderFeatured}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />

      <TouchableOpacity 
        style={styles.myClosetButton}
        onPress={() => navigation.navigate('Closet')}
      >
        <Text style={styles.myClosetText}>View My Fragrance Closet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  categoryList: {
    paddingBottom: 10,
  },
  categoryCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  categoryName: {
    padding: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuredList: {
    paddingBottom: 15,
  },
  featuredCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    paddingBottom: 10,
  },
  featuredImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  featuredBrand: {
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 12,
    color: '#666',
  },
  featuredName: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  myClosetButton: {
    marginTop: 20,
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  myClosetText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;