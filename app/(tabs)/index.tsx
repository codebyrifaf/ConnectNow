import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ChatList } from '@/components/chat/ChatList';
import { useAuth } from '@/contexts/AuthContext';
import { AuthUser, firebaseAuthService } from '@/services/firebase-auth';
import { Chat, firestoreService, Unsubscribe } from '@/services/firestore';

export default function HomeScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFindUsersModal, setShowFindUsersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<AuthUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    
    if (user) {
      // Subscribe to user's chats
      unsubscribe = firestoreService.getUserChats(user.id, (chats) => {
        setChats(chats);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleCreateNewChat = () => {
    setShowFindUsersModal(true);
    setFoundUsers([]);
    setSearchQuery('');
  };

  const handleCreateChat = async (selectedUser: AuthUser) => {
    if (!user) return;
    
    try {
      // Check if chat already exists
      const existingChat = await firestoreService.checkChatExists(user.id, selectedUser.id);
      
      if (existingChat) {
        // Navigate to existing chat
        setShowFindUsersModal(false);
        setSearchQuery('');
        setFoundUsers([]);
        router.push({
          pathname: '/chat/[id]' as any,
          params: { id: existingChat.id, name: existingChat.name },
        });
        return;
      }

      const chatName = `${user.displayName} & ${selectedUser.displayName}`;
      const newChatData = {
        name: chatName,
        participants: [user.id, selectedUser.id],
        lastMessage: '',
        lastMessageTime: new Date(),
        createdBy: user.id,
      };
      
      const chatId = await firestoreService.createChat(newChatData);
      if (chatId) {
        setShowFindUsersModal(false);
        setSearchQuery('');
        setFoundUsers([]);
        router.push({
          pathname: '/chat/[id]' as any,
          params: { id: chatId, name: chatName },
        });
      } else {
        Alert.alert('Error', 'Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat with user:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleCancelNewChat = () => {
    setShowFindUsersModal(false);
    setSearchQuery('');
    setFoundUsers([]);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setFoundUsers([]);
      return;
    }

    setSearchLoading(true);
    try {
      const users = await firebaseAuthService.searchUsers(query.trim(), user?.id);
      setFoundUsers(users);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartChatWithUser = async (selectedUser: AuthUser) => {
    await handleCreateChat(selectedUser);
  };

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/chat/[id]' as any,
      params: { id: chat.id!, name: chat.name },
    });
  };

  const handleChatLongPress = (chat: Chat) => {
    Alert.alert(
      'Chat Options',
      `What would you like to do with "${chat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (chat.id) {
              const success = await firestoreService.deleteChat(chat.id);
              if (!success) {
                Alert.alert('Error', 'Failed to delete chat');
              }
              
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ThemedText lightColor="#1C1C1E">Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ThemedText lightColor="#1C1C1E">Please sign in to continue</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle} lightColor="#1C1C1E">Messages</ThemedText>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleCreateNewChat}
        >
          <Ionicons name="person-add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ChatList
        chats={chats}
        onChatPress={handleChatPress}
        onChatLongPress={handleChatLongPress}
      />

      
      <Modal
        visible={showFindUsersModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelNewChat}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.findUsersModal]}>
            <ThemedText style={styles.modalTitle}>Find Users</ThemedText>
            <ThemedText style={styles.modalSubtitle}>Search for people to chat with:</ThemedText>
            
            <TextInput
              style={styles.textInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
              placeholder="Search by name, username, or email"
              placeholderTextColor="#999"
              autoFocus={true}
            />
            
            {searchLoading && (
              <View style={styles.searchLoading}>
                <ThemedText style={styles.searchLoadingText}>Searching...</ThemedText>
              </View>
            )}
            
            {foundUsers.length > 0 && (
              <View style={styles.usersList}>
                <FlatList
                  data={foundUsers}
                  keyExtractor={(item) => item.id}
                  style={styles.usersListContainer}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.userItem}
                      onPress={() => handleStartChatWithUser(item)}
                    >
                      <View style={styles.userAvatar}>
                        <ThemedText style={styles.userAvatarText}>
                          {item.displayName.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={styles.userInfo}>
                        <ThemedText style={styles.userDisplayName}>{item.displayName}</ThemedText>
                        <ThemedText style={styles.userUsername}>@{item.username}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            
            {searchQuery && !searchLoading && foundUsers.length === 0 && (
              <View style={styles.noResults}>
                <ThemedText style={styles.noResultsText}>No users found</ThemedText>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelNewChat}
              >
                <ThemedText style={styles.cancelButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#8E8E93',
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    color: '#1C1C1E',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  // Find Users Modal Styles
  findUsersModal: {
    height: '75%',
    maxHeight: 650,
  },
  searchLoading: {
    padding: 24,
    alignItems: 'center',
  },
  searchLoadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  usersList: {
    flex: 1,
    maxHeight: 350,
    marginBottom: 16,
  },
  usersListContainer: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userDisplayName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
});
