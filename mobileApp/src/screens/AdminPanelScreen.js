import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const AdminPanelScreen = ({ navigation }) => {
  const { user } = useAuth();

  const adminOptions = [
    {
      title: 'Manage Users',
      description: 'View, edit, and manage user accounts',
      icon: 'people',
      onPress: () => navigation.navigate('UserManagement'),
      color: '#4A90E2'
    },
    {
      title: 'Manage Fragrances',
      description: 'Add, edit, and organize fragrance database',
      icon: 'flask',
      onPress: () => navigation.navigate('FragranceManagement'),
      color: '#8A2BE2'
    },
    {
      title: 'System Analytics',
      description: 'View app usage and performance metrics',
      icon: 'analytics',
      onPress: () => navigation.navigate('Analytics'),
      color: '#50C878'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate user-generated content',
      icon: 'shield-checkmark',
      onPress: () => navigation.navigate('Moderation'),
      color: '#FF6B6B'
    },
    {
      title: 'App Settings',
      description: 'Configure global app settings and features',
      icon: 'cog',
      onPress: () => navigation.navigate('AppSettings'),
      color: '#FFA500'
    },
    {
      title: 'Reports & Logs',
      description: 'View system reports and error logs',
      icon: 'document-text',
      onPress: () => navigation.navigate('Reports'),
      color: '#9B59B6'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={32} color="#8A2BE2" />
            <Text style={styles.headerTitle}>Admin Panel</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome, {user?.username}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {adminOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Fragrances</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Active Sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 44,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  quickStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminPanelScreen;