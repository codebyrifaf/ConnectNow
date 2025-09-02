import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService, Message } from '@/services/firestore';

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!id || !user) {
      Alert.alert('Error', 'Chat not found');
      router.back();
      return;
    }

    // Subscribe to real-time messages
    const unsubscribe = firestoreService.getChatMessages(id, (messages) => {
      setMessages(messages);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [id, user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!user || !id) return;

    const newMessage = {
      text,
      sender: user.displayName,
      senderId: user.id,
      chatId: id,
    };

    try {
      const success = await firestoreService.addMessage(newMessage);
      if (!success) {
        Alert.alert('Error', 'Failed to send message');
      }
      // No need to reload - real-time listener will update
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === user?.id}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText lightColor="#1C1C1E">Loading chat...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: name || 'Chat',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1C1C1E',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerShadowVisible: true,
        }} 
      />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id || 'unknown'}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContainer,
              { paddingBottom: Platform.OS === 'android' ? 20 : 0 }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText} lightColor="#8E8E93">
                  No messages yet. Start the conversation!
                </ThemedText>
              </View>
            )}
          />

          {/* Message Input */}
          <View style={{ 
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingHorizontal: 16 
          }}>
            <MessageInput 
              onSendMessage={handleSendMessage} 
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesContainer: {
    paddingVertical: 16,
    flexGrow: 1,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F2F2F7',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
    lineHeight: 26,
  },
});
