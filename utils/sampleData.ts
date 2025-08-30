import { authService } from '../services/auth';
import { databaseService } from '../services/database';
import { generateId } from './helpers';

export const createSampleData = async () => {
  try {
    // Get current user
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      console.log('No authenticated user found');
      return false;
    }

    // Create sample chats
    const sampleChats = [
      {
        id: generateId(),
        name: 'Family Group',
        lastMessage: 'See you at dinner!',
        lastMessageTime: Date.now() - 3600000, // 1 hour ago
      },
      {
        id: generateId(),
        name: 'Work Team',
        lastMessage: 'Meeting at 3 PM',
        lastMessageTime: Date.now() - 7200000, // 2 hours ago
      },
      {
        id: generateId(),
        name: 'Friends',
        lastMessage: 'Let\'s hang out this weekend',
        lastMessageTime: Date.now() - 86400000, // 1 day ago
      },
    ];

    // Create sample messages for each chat
    const sampleMessages = [
      // Family Group messages
      {
        text: 'Hey everyone! How are you doing?',
        sender: 'Mom',
        timestamp: Date.now() - 7200000,
        chatId: sampleChats[0].id,
      },
      {
        text: 'Hi Mom! I\'m doing great, thanks for asking!',
        sender: currentUser.displayName,
        timestamp: Date.now() - 7000000,
        chatId: sampleChats[0].id,
      },
      {
        text: 'That\'s wonderful to hear!',
        sender: 'Mom',
        timestamp: Date.now() - 6800000,
        chatId: sampleChats[0].id,
      },
      {
        text: 'See you at dinner!',
        sender: 'Dad',
        timestamp: Date.now() - 3600000,
        chatId: sampleChats[0].id,
      },
      
      // Work Team messages
      {
        text: 'Good morning team!',
        sender: 'Manager',
        timestamp: Date.now() - 10800000,
        chatId: sampleChats[1].id,
      },
      {
        text: 'Good morning! Ready for today\'s challenges',
        sender: currentUser.displayName,
        timestamp: Date.now() - 10600000,
        chatId: sampleChats[1].id,
      },
      {
        text: 'Meeting at 3 PM',
        sender: 'Manager',
        timestamp: Date.now() - 7200000,
        chatId: sampleChats[1].id,
      },
      
      // Friends messages
      {
        text: 'Hey everyone!',
        sender: 'Alex',
        timestamp: Date.now() - 172800000,
        chatId: sampleChats[2].id,
      },
      {
        text: 'What\'s up Alex?',
        sender: currentUser.displayName,
        timestamp: Date.now() - 172600000,
        chatId: sampleChats[2].id,
      },
      {
        text: 'Let\'s hang out this weekend',
        sender: 'Alex',
        timestamp: Date.now() - 86400000,
        chatId: sampleChats[2].id,
      },
    ];

    // Insert sample data
    for (const chat of sampleChats) {
      await databaseService.createChat(chat);
    }

    for (const message of sampleMessages) {
      await databaseService.addMessage(message);
    }

    console.log('Sample data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
};

export const hasSampleData = async (): Promise<boolean> => {
  try {
    const chats = await databaseService.getChats();
    return chats.length > 0;
  } catch (error) {
    console.error('Error checking for sample data:', error);
    return false;
  }
};
