import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const FragranceManagementScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [fragrances, setFragrances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Fresh',
    description: '',
    isActive: true,
  });

  // Fetch all fragrances
  useEffect(() => {
    const fetchFragrances = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://your-api-url/api/fragrances', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setFragrances(data.data.fragrances);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch fragrances');
      } finally {
        setLoading(false);
      }
    };
    fetchFragrances();
  }, [token]);

  // Create or update fragrance
  const saveFragrance = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `http://your-api-url/api/fragrances/${formData._id}`
        : 'http://your-api-url/api/fragrances';
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (isEditing) {
          setFragrances(fragrances.map(f => (f._id === formData._id ? data.data.fragrance : f)));
        } else {
          setFragrances([...fragrances, data.data.fragrance]);
        }
        setModalVisible(false);
        Alert.alert('Success', `Fragrance ${isEditing ? 'updated' : 'created'} successfully`);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} fragrance`);
    }
  };

  // Delete fragrance
  const deleteFragrance = async (id) => {
    try {
      const response = await fetch(`http://your-api-url/api/fragrances/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setFragrances(fragrances.filter(f => f._id !== id));
        Alert.alert('Success', 'Fragrance deleted successfully');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete fragrance');
    }
  };

  // Render fragrance item
  const renderFragrance = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>Brand: {item.brand}</Text>
          <Text style={styles.itemSubtitle}>Category: {item.category}</Text>
          <Text style={styles.itemSubtitle}>
            Status: {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => {
              setIsEditing(true);
              setFormData(item);
              setModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete ${item.name}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => deleteFragrance(item._id) },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={32} color="#8A2BE2" />
        <Text style={styles.headerTitle}>Manage Fragrances</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsEditing(false);
          setFormData({ name: '', brand: '', category: 'Fresh', description: '', isActive: true });
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Add Fragrance</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#8A2BE2" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={fragrances}
        renderItem={renderFragrance}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Fragrance' : 'Add Fragrance'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Fragrance name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Brand name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Category"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <TouchableOpacity
                style={styles.formButton}
                onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <Text style={styles.formButtonText}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveFragrance}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A2BE2',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8A2BE2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  formButton: {
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#C0C0C0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#8A2BE2',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FragranceManagementScreen;