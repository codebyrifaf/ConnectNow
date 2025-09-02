import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Message } from '../../services/firestore';
import { formatTime } from '../../utils/helpers';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.sender}</Text>
        )}
        
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.text}
        </Text>
        
        <Text style={[
          styles.timestamp,
          isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTimestamp: {
    color: '#8E8E93',
  },
});
