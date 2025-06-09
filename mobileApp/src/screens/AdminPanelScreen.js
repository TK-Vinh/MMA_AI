import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AdminPanelScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ManageUsers')}
      >
        <Text style={styles.buttonText}>Manage Users</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ManageFragrances')}
      >
        <Text style={styles.buttonText}>Manage Fragrances</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default AdminPanelScreen;