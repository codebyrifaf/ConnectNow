import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/database';
import { createSampleData, hasSampleData } from '@/utils/sampleData';

export default function ExploreScreen() {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
  });
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [hasData, setHasData] = useState(false);
  const { user, signOut, updateProfile } = useAuth();

  useEffect(() => {
    loadUserAndStats();
  }, []);

  const loadUserAndStats = async () => {
    try {
      if (user) {
        setNewName(user.displayName);
      }

      // Load stats
      const chats = await databaseService.getChats();
      let totalMessages = 0;
      
      for (const chat of chats) {
        const messages = await databaseService.getMessages(chat.id);
        totalMessages += messages.length;
      }

      setStats({
        totalChats: chats.length,
        totalMessages,
      });

      const dataExists = await hasSampleData();
      setHasData(dataExists);
    } catch (error) {
      console.error('Error loading user and stats:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    try {
      const result = await updateProfile({ displayName: newName.trim() });
      if (result.success) {
        setEditingName(false);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all chats and messages. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await databaseService.clearAllData();
              if (success) {
                Alert.alert('Success', 'All data cleared successfully');
                await loadUserAndStats();
              } else {
                Alert.alert('Error', 'Failed to clear data');
              }
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleCreateSampleData = async () => {
    try {
      const success = await createSampleData();
      if (success) {
        Alert.alert('Success', 'Sample data created successfully!');
        await loadUserAndStats();
      } else {
        Alert.alert('Error', 'Failed to create sample data');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      Alert.alert('Error', 'Failed to create sample data');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#007AFF" style={styles.statIcon} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>Profile & Settings</ThemedText>

        {/* User Profile Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>User Profile</ThemedText>
          
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </ThemedText>
            </View>
            
            <View style={styles.profileInfo}>
              {editingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    onSubmitEditing={handleUpdateName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleUpdateName} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingName(false);
                      setNewName(user?.displayName || '');
                    }}
                    style={styles.cancelButton}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <ThemedText style={styles.userName}>
                    {user?.displayName || 'Unknown User'}
                  </ThemedText>
                  <TouchableOpacity 
                    onPress={() => setEditingName(true)}
                    style={styles.editButton}
                  >
                    <Ionicons name="pencil" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account Info</ThemedText>
          
          <View style={styles.infoRow}>
            <Ionicons name="at" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Username</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.username || 'N/A'}</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.email || 'N/A'}</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Member Since</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Statistics</ThemedText>
          
          <View style={styles.statsContainer}>
            <StatCard title="Total Chats" value={stats.totalChats} icon="chatbubbles" />
            <StatCard title="Total Messages" value={stats.totalMessages} icon="mail" />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Actions</ThemedText>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => loadUserAndStats()}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <ThemedText style={styles.actionText}>
              Refresh Data
            </ThemedText>
          </TouchableOpacity>

          {!hasData && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCreateSampleData}
            >
              <Ionicons name="add-circle" size={20} color="#34C759" />
              <ThemedText style={[styles.actionText, { color: '#34C759' }]}>
                Create Sample Data
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <ThemedText style={[styles.actionText, { color: '#FF3B30' }]}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
          <ThemedText style={styles.aboutText}>
            Chat App v1.0.0{'\n'}
            Built with React Native & Expo{'\n'}
            SQLite local storage{'\n'}
            Real-time chat functionality
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    marginRight: 12,
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#34C759',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  aboutText: {
    lineHeight: 24,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});
