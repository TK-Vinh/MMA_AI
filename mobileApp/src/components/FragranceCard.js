// Example FragranceCard.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const FragranceCard = ({ fragrance }) => {
  return (
    <View style={styles.card}>
      {fragrance.images?.[0]?.url && (
        <Image
          source={{ uri: fragrance.images[0].url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text style={styles.name}>{fragrance.name}</Text>
      <Text style={styles.brand}>{fragrance.brand}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  brand: {
    fontSize: 14,
    color: '#666',
  },
});

export default FragranceCard;