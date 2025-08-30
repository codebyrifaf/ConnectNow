import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Chat } from '../../services/database';
import { formatTime, truncateText } from '../../utils/helpers';

interface ChatListProps {
  chats: Chat[];
  onChatPress: (chat: Chat) => void;
  onChatLongPress?: (chat: Chat) => void;
}

const ChatListItem: React.FC<{
  chat: Chat;
  onPress: () => void;
  onLongPress?: () => void;
}> = ({ chat, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {chat.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chat.name}
          </Text>
          {chat.lastMessageTime && (
            <Text style={styles.timestamp}>
              {formatTime(chat.lastMessageTime)}
            </Text>
          )}
        </View>
        
        {chat.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {truncateText(chat.lastMessage, 60)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatPress,
  onChatLongPress,
}) => {
  const renderChatItem = ({ item }: { item: Chat }) => (
    <ChatListItem
      chat={item}
      onPress={() => onChatPress(item)}
      onLongPress={onChatLongPress ? () => onChatLongPress(item) : undefined}
    />
  );

  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chats yet</Text>
        <Text style={styles.emptySubtext}>Tap the person+ button to find people and start chatting!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={renderChatItem}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 140,
    backgroundColor: '#F2F2F7',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});
