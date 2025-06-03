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

const UserManagementScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ isActive: true, role: 'user' });

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://your-api-url/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setUsers(data.data.users);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // Update user status or role
  const updateUser = async (field) => {
    try {
      const response = await fetch(`http://your-api-url/api/users/${selectedUser._id}/${field}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: formData[field] }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(users.map(u => (u._id === selectedUser._id ? data.data.user : u)));
        setModalVisible(false);
        Alert.alert('Success', `User ${field} updated successfully`);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  // Render user item
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        setSelectedUser(item);
        setFormData({ isActive: item.isActive, role: item.role });
        setModalVisible(true);
      }}
    >
      <View style={styles.itemContent}>
        <View>
          <Text style={styles.itemTitle}>{item.username}</Text>
          <Text style={styles.itemSubtitle}>Role: {item.role}</Text>
          <Text style={styles.itemSubtitle}>
            Status: {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={32} color="#4A90E2" />
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#8A2BE2" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {selectedUser?.username}
            </Text>
            
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

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Role</Text>
              <TouchableOpacity
                style={styles.formButton}
                onPress={() => setFormData({
                  ...formData,
                  role: formData.role === 'user' ? 'admin' : 'user'
                })}
              >
                <Text style={styles.formButtonText}>{formData.role}</Text>
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
                onPress={() => {
                  updateUser('isActive');
                  updateUser('role');
                }}
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

export default UserManagementScreen;