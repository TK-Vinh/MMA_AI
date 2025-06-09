import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingStars = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color="#FFD700" />
      ))}
      {hasHalfStar && (
        <Ionicons key="half" name="star-half" size={size} color="#FFD700" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFD700" />
      ))}
    </View>
  );
};

export default RatingStars;