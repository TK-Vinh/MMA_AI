import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { addToCloset, rateFragrance, getFragranceById } from '../api/fragrances';

const FragranceDetailScreen = ({ route, navigation }) => {
  const { fragranceId } = route.params;
  const { userToken } = useContext(AuthContext);
  const [fragrance, setFragrance] = useState(null);
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFragrance = async () => {
      try {
        setLoading(true);
        const data = await getFragranceById(fragranceId, userToken);
        setFragrance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFragrance();
  }, [fragranceId, userToken]);

  const handleAddToCloset = async () => {
    if (!userToken) {
      Alert.alert(
        'Login Required',
        'You need to login to add fragrances to your closet',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      await addToCloset(fragranceId, userToken);
      Alert.alert('Success', 'Fragrance added to your closet');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRateFragrance = async () => {
    if (!userToken) {
      Alert.alert(
        'Login Required',
        'You need to login to rate fragrances',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      Alert.alert('Error', 'Please enter a rating between 0 and 5');
      return;
    }

    try {
      const updatedFragrance = await rateFragrance(fragranceId, ratingNum, userToken);
      setFragrance(updatedFragrance);
      Alert.alert('Success', 'Rating submitted successfully');
      setRating('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading fragrance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>😔 Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fragrance) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Fragrance not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {fragrance.images && fragrance.images.length > 0 && (
        <Image
          source={{ uri: fragrance.images[0].url }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{fragrance.name}</Text>
        <Text style={styles.brand}>{fragrance.brand}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>{fragrance.rating?.toFixed(1) || 'N/A'}</Text>
        </View>
        <View style={styles.ratingInputContainer}>
          <TextInput
            style={styles.ratingInput}
            placeholder="Rate (0-5)"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.rateButton} onPress={handleRateFragrance}>
            <Text style={styles.rateButtonText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{fragrance.description || 'No description available'}</Text>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.notesContainer}>
          <View style={styles.noteColumn}>
            <Text style={styles.noteTitle}>Top Notes</Text>
            {fragrance.notes?.top?.map((note, index) => (
              <Text key={index} style={styles.note}>{note}</Text>
            ))}
          </View>
          <View style={styles.noteColumn}>
            <Text style={styles.noteTitle}>Middle Notes</Text>
            {fragrance.notes?.middle?.map((note, index) => (
              <Text key={index} style={styles.note}>{note}</Text>
            ))}
          </View>
          <View style={styles.noteColumn}>
            <Text style={styles.noteTitle}>Base Notes</Text>
            {fragrance.notes?.base?.map((note, index) => (
              <Text key={index} style={styles.note}>{note}</Text>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCloset}>
          <Text style={styles.addButtonText}>Add to My Closet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  rateButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  notesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  noteColumn: {
    flex: 1,
  },
  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  note: {
    fontSize: 14,
    marginBottom: 3,
  },
  addButton: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FragranceDetailScreen;