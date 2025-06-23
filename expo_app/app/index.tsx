import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Fragrance {
  name: string;
  brand: string;
  category: string;
  gender: string;
  description: string;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
}

export default function CreateFragrance() {
  const [image, setImage] = useState<string | null>(null);
  const [fragrance, setFragrance] = useState<Fragrance | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'fragrance.jpg',
      } as any);

      const response = await axios.post(
        `${API_BASE_URL}/api/fragrances`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setFragrance(response.data);
      Alert.alert('Success', 'Fragrance created successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create fragrance');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <ScrollView className="flex-1 p-4 bg-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Create Fragrance</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-blue-500">Logout</Text>
        </TouchableOpacity>
      </View>
      
      <Button title="Pick an image" onPress={pickImage} disabled={loading} />
      
      {image && (
        <Image
          source={{ uri: image }}
          className="w-full h-64 mt-4 rounded-lg"
          resizeMode="contain"
        />
      )}

      {loading && <Text className="mt-4 text-blue-500">Processing image...</Text>}

      {fragrance && (
        <View className="mt-4">
          <Text className="text-lg font-semibold">Fragrance Details:</Text>
          
          <Text className="mt-2">Name:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.name}
            onChangeText={(text) => setFragrance({ ...fragrance, name: text })}
          />

          <Text className="mt-2">Brand:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.brand}
            onChangeText={(text) => setFragrance({ ...fragrance, brand: text })}
          />

          <Text className="mt-2">Category:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.category}
            onChangeText={(text) => setFragrance({ ...fragrance, category: text })}
          />

          <Text className="mt-2">Gender:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.gender}
            onChangeText={(text) => setFragrance({ ...fragrance, gender: text })}
          />

          <Text className="mt-2">Description:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1 h-24"
            value={fragrance.description}
            onChangeText={(text) => setFragrance({ ...fragrance, description: text })}
            multiline
          />

          <Text className="mt-2">Top Notes:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.notes.top.join(', ')}
            onChangeText={(text) => setFragrance({
              ...fragrance,
              notes: { ...fragrance.notes, top: text.split(', ') }
            })}
          />

          <Text className="mt-2">Middle Notes:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.notes.middle.join(', ')}
            onChangeText={(text) => setFragrance({
              ...fragrance,
              notes: { ...fragrance.notes, middle: text.split(', ') }
            })}
          />

          <Text className="mt-2">Base Notes:</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mt-1"
            value={fragrance.notes.base.join(', ')}
            onChangeText={(text) => setFragrance({
              ...fragrance,
              notes: { ...fragrance.notes, base: text.split(', ') }
            })}
          />
        </View>
      )}
    </ScrollView>
  );
}