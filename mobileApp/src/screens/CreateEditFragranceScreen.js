// src/screens/CreateEditFragranceScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFragrance } from '../context/FragranceContext'
const CreateEditFragranceScreen = ({ navigation, route }) => {
  const { fragrance } = route.params || {};
  const { createFragrance, updateFragrance, uploadFragranceImage } = useFragrance();
  const [form, setForm] = useState({
    name: fragrance?.name || '',
    brand: fragrance?.brand || '',
    category: fragrance?.category || 'Fresh',
    description: fragrance?.description || '',
  });
  const [imageUri, setImageUri] = useState(fragrance?.images?.[0]?.url || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images','videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.brand) {
      Alert.alert('Error', 'Name and Brand are required');
      return;
    }

    setLoading(true);
    try {
      let fragranceId;
      if (fragrance) {
        const { success } = await updateFragrance(fragrance._id, form);
        if (!success) throw new Error('Update failed');
        fragranceId = fragrance._id;
      } else {
        const { success, data } = await createFragrance(form);
        if (!success) throw new Error('Creation failed');
        fragranceId = data._id;
      }

      if (imageUri && !imageUri.startsWith('http')) {
        await uploadFragranceImage(fragranceId, imageUri);
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{fragrance ? 'Edit Fragrance' : 'Create Fragrance'}</Text>

      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={40} color="#8A2BE2" />
            <Text style={styles.placeholderText}>Add Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={form.brand}
        onChangeText={(text) => setForm({ ...form, brand: text })}
      />
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Description"
        multiline
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#8A2BE2" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{fragrance ? 'Update' : 'Create'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  imageUpload: { alignSelf: 'center', marginBottom: 20 },
  image: { width: 150, height: 150, borderRadius: 75 },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { marginTop: 8, color: '#8A2BE2' },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CreateEditFragranceScreen;