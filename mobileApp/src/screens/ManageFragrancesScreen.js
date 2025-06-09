import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons'; // Added for remove icon
import { AuthContext } from '../context/AuthContext';
import {
  getAllFragrances,
  createFragrance,
  updateFragrance,
  deleteFragrance,
} from '../api/fragrances';

const ManageFragrancesScreen = () => {
  const { userToken } = useContext(AuthContext);
  const [fragrances, setFragrances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFragrance, setEditingFragrance] = useState(null);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    category: 'Fresh',
    subcategory: '',
    gender: 'Unisex',
    concentration: 'EDT',
    notes: { top: [], middle: [], base: [] },
    size: [{ volume: '', price: '' }],
    releaseYear: '',
    perfumer: '',
    rating: '0',
    totalRatings: '0',
    isActive: true,
    tags: [],
  });

  const categories = [
    'Fresh', 'Floral', 'Oriental', 'Woody', 'Citrus',
    'Gourmand', 'Aquatic', 'Spicy', 'Green', 'Fruity',
  ];
  const genders = ['Men', 'Women', 'Unisex'];
  const concentrations = ['EDT', 'EDP', 'Parfum', 'EDC', 'Cologne'];

  useEffect(() => {
    const fetchFragrances = async () => {
      try {
        setLoading(true);
        const data = await getAllFragrances({}, userToken);
        setFragrances(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFragrances();
  }, [userToken]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:[ 'images','videos'], // Reverted to Images only
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name || !form.brand || !form.category || !form.gender || !form.concentration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === 'notes') {
          formData.append('notes[top]', form.notes.top.join(','));
          formData.append('notes[middle]', form.notes.middle.join(','));
          formData.append('notes[base]', form.notes.base.join(','));
        } else if (key === 'size') {
          form.size.forEach((s, index) => {
            formData.append(`size[${index}][volume]`, s.volume);
            formData.append(`size[${index}][price]`, s.price);
          });
        } else if (key === 'tags') {
          formData.append('tags', form.tags.join(','));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const fileName = `fragrance-${Date.now()}.jpg`;
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: fileName,
        });
      }

      if (editingFragrance) {
        const updatedFragrance = await updateFragrance(editingFragrance._id, formData, userToken);
        setFragrances(
          fragrances.map((f) => (f._id === updatedFragrance._id ? updatedFragrance : f))
        );
        Alert.alert('Success', 'Fragrance updated successfully');
      } else {
        const newFragrance = await createFragrance(formData, userToken);
        setFragrances([...fragrances, newFragrance]);
        Alert.alert('Success', 'Fragrance created successfully');
      }
      setModalVisible(false);
      setForm({
        name: '',
        brand: '',
        description: '',
        category: 'Fresh',
        subcategory: '',
        gender: 'Unisex',
        concentration: 'EDT',
        notes: { top: [], middle: [], base: [] },
        size: [{ volume: '', price: '' }],
        releaseYear: '',
        perfumer: '',
        rating: '0',
        totalRatings: '0',
        isActive: true,
        tags: [],
      });
      setImage(null);
      setEditingFragrance(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEdit = (fragrance) => {
    setEditingFragrance(fragrance);
    setForm({
      name: fragrance.name,
      brand: fragrance.brand,
      description: fragrance.description || '',
      category: fragrance.category || 'Fresh',
      subcategory: fragrance.subcategory || '',
      gender: fragrance.gender || 'Unisex',
      concentration: fragrance.concentration || 'EDT',
      notes: fragrance.notes || { top: [], middle: [], base: [] },
      size: fragrance.size || [{ volume: '', price: '' }],
      releaseYear: fragrance.releaseYear ? fragrance.releaseYear.toString() : '',
      perfumer: fragrance.perfumer || '',
      rating: fragrance.rating.toString(),
      totalRatings: fragrance.totalRatings.toString(),
      isActive: fragrance.isActive,
      tags: fragrance.tags || [],
    });
    setImage(fragrance.images?.[0]?.url || null);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this fragrance?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFragrance(id, userToken);
              setFragrances(fragrances.filter((f) => f._id !== id));
              Alert.alert('Success', 'Fragrance deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const addSize = () => {
    setForm({
      ...form,
      size: [...form.size, { volume: '', price: '' }],
    });
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...form.size];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setForm({ ...form, size: newSizes });
  };

  const removeSize = (index) => {
    if (form.size.length === 1) {
      Alert.alert('Error', 'At least one size entry is required');
      return;
    }
    setForm({
      ...form,
      size: form.size.filter((_, i) => i !== index),
    });
  };

  const renderFragrance = ({ item }) => (
    <View style={styles.fragranceItem}>
      <Text style={styles.fragranceName}>{item.name}</Text>
      <Text style={styles.fragranceBrand}>{item.brand}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading fragrances...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Fragrances</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          setEditingFragrance(null);
          setForm({
            name: '',
            brand: '',
            description: '',
            category: 'Fresh',
            subcategory: '',
            gender: 'Unisex',
            concentration: 'EDT',
            notes: { top: [], middle: [], base: [] },
            size: [{ volume: '', price: '' }],
            releaseYear: '',
            perfumer: '',
            rating: '0',
            totalRatings: '0',
            isActive: true,
            tags: [],
          });
          setImage(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Create New Fragrance</Text>
      </TouchableOpacity>

      <FlatList
        data={fragrances}
        keyExtractor={(item) => item._id}
        renderItem={renderFragrance}
        contentContainerStyle={styles.list}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingFragrance ? 'Edit Fragrance' : 'Create Fragrance'}</Text>
            <ScrollView>

              <TextInput
                style={styles.input}
                placeholder="Fragrance Name"
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
                style={styles.input}
                placeholder="Description"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Category</Text>
                <Picker
                  selectedValue={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Subcategory"
                value={form.subcategory}
                onChangeText={(text) => setForm({ ...form, subcategory: text })}
              />
              <Text style={styles.label}>Gender</Text>
              {genders.map((gen) => (
                <View key={gen} style={styles.checkboxContainer}>
                  <BouncyCheckbox
                    size={25}
                    fillColor="#34C759"
                    unfillColor="#FFFFFF"
                    text={gen}
                    textStyle={[
                      styles.checkboxLabel,
                      { fontWeight: form.gender === gen ? 'bold' : 'normal' },
                      { textDecorationLine: 'none' },
                    ]}
                    isChecked={form.gender === gen}
                    onPress={() => setForm({ ...form, gender: gen })}
                    style={styles.bouncyCheckbox}
                  />
                </View>
              ))}
              <Text style={styles.label}>Concentration</Text>
              {concentrations.map((conc) => (
                <View key={conc} style={styles.checkboxContainer}>
                  <BouncyCheckbox
                    size={25}
                    fillColor="#34C759"
                    unfillColor="#FFFFFF"
                    text={conc}
                    textStyle={[
                      styles.checkboxLabel,
                      { fontWeight: form.concentration === conc ? 'bold' : 'normal' },
                      { textDecorationLine: 'none' },
                    ]}
                    isChecked={form.concentration === conc}
                    onPress={() => setForm({ ...form, concentration: conc })}
                    style={styles.bouncyCheckbox}
                  />
                </View>
              ))}
              <TextInput
                style={styles.input}
                placeholder="Top Notes (comma-separated)"
                value={form.notes.top.join(',')}
                onChangeText={(text) =>
                  setForm({ ...form, notes: { ...form.notes, top: text.split(',').map(t => t.trim()) } })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Middle Notes (comma-separated)"
                value={form.notes.middle.join(',')}
                onChangeText={(text) =>
                  setForm({ ...form, notes: { ...form.notes, middle: text.split(',').map(t => t.trim()) } })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Base Notes (comma-separated)"
                value={form.notes.base.join(',')}
                onChangeText={(text) =>
                  setForm({ ...form, notes: { ...form.notes, base: text.split(',').map(t => t.trim()) } })
                }
              />
              <Text style={styles.label}>Sizes</Text>
              {form.size.map((s, index) => (
                <View key={index} style={styles.sizeContainer}>
                  <TextInput
                    style={[styles.input, styles.sizeInput]}
                    placeholder="Volume (ml)"
                    value={s.volume}
                    onChangeText={(text) => updateSize(index, 'volume', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.sizeInput]}
                    placeholder="Price"
                    value={s.price}
                    onChangeText={(text) => updateSize(index, 'price', text)}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSize(index)}
                  >
                    <MaterialIcons name="delete" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addSize}>
                <Text style={styles.buttonText}>Add Size</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Release Year"
                value={form.releaseYear}
                onChangeText={(text) => setForm({ ...form, releaseYear: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Perfumer"
                value={form.perfumer}
                onChangeText={(text) => setForm({ ...form, perfumer: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                value={form.tags.join(',')}
                onChangeText={(text) => setForm({ ...form, tags: text.split(',').map(t => t.trim()) })}
              />
              <View style={styles.checkboxContainer}>
                <BouncyCheckbox
                  size={25}
                  fillColor="#34C759"
                  unfillColor="#FFFFFF"
                  text="Is Active"
                  textStyle={[
                    styles.checkboxLabel,
                    { fontWeight: form.isActive ? 'bold' : 'normal' },
                    { textDecorationLine: 'none' },
                  ]}
                  isChecked={form.isActive}
                  onPress={() => setForm({ ...form, isActive: !form.isActive })}
                  style={styles.bouncyCheckbox}
                />
              </View>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.buttonText}>{image ? 'Change Image' : 'Pick Image'}</Text>
              </TouchableOpacity>
              {image && <Text style={styles.imageText}>Image selected</Text>}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateOrUpdate}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  fragranceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  fragranceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  fragranceBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  bouncyCheckbox: {
    marginVertical: 5,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically
    marginBottom: 10,
  },
  sizeInput: {
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    padding: 10,
  },
  addButton: {
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
});

export default ManageFragrancesScreen;