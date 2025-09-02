import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id?: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: Timestamp | Date;
  chatId: string;
}

export interface Chat {
  id?: string;
  name: string;
  participants: string[]; // Array of user IDs
  lastMessage?: string;
  lastMessageTime?: Timestamp | Date;
  createdAt: Timestamp | Date;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Timestamp | Date;
}

class FirestoreService {
  // Collections
  private chatsCollection = collection(db, 'chats');
  private messagesCollection = collection(db, 'messages');
  private usersCollection = collection(db, 'users');

  // User Management
  async createUser(userData: Omit<User, 'createdAt'>): Promise<boolean> {
    try {
      await setDoc(doc(this.usersCollection, userData.id), {
        ...userData,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.usersCollection, userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async searchUsers(searchTerm: string, excludeUserId: string): Promise<User[]> {
    try {
      // Note: For free tier efficiency, we'll do a simple search
      // In production, you might want to use Algolia or implement better search
      const usersSnapshot = await getDocs(this.usersCollection);
      const users: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() } as User;
        if (
          userData.id !== excludeUserId &&
          (userData.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userData.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userData.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          users.push(userData);
        }
      });
      
      return users.slice(0, 20); // Limit results for free tier
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Chat Management
  async createChat(chatData: Omit<Chat, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(this.chatsCollection, {
        ...chatData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }

  getUserChats(userId: string, callback: (chats: Chat[]) => void): Unsubscribe {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      this.chatsCollection,
      where('participants', 'array-contains', userId),
      limit(50) // Limit for free tier
    );

    return onSnapshot(q, (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      
      // Sort on client side to avoid index requirement
      chats.sort((a, b) => {
        const aTime = a.lastMessageTime ? (a.lastMessageTime as any).toMillis?.() || a.lastMessageTime : 0;
        const bTime = b.lastMessageTime ? (b.lastMessageTime as any).toMillis?.() || b.lastMessageTime : 0;
        return bTime - aTime;
      });
      
      callback(chats);
    });
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      // Delete all messages in the chat first
      const messagesQuery = query(
        this.messagesCollection,
        where('chatId', '==', chatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Delete messages in batches (free tier has batch limits)
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Delete the chat
      await deleteDoc(doc(this.chatsCollection, chatId));
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  // Message Management
  async addMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      // Add message
      await addDoc(this.messagesCollection, {
        ...messageData,
        timestamp: serverTimestamp(),
      });

      // Update chat's last message
      const chatRef = doc(this.chatsCollection, messageData.chatId);
      await updateDoc(chatRef, {
        lastMessage: messageData.text,
        lastMessageTime: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  getChatMessages(chatId: string, callback: (messages: Message[]) => void): Unsubscribe {
    // Simplified query to avoid index requirement
    const q = query(
      this.messagesCollection,
      where('chatId', '==', chatId),
      limit(100) // Limit messages for free tier
    );

    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      // Sort on client side to avoid index requirement
      messages.sort((a, b) => {
        const aTime = a.timestamp ? (a.timestamp as any).toMillis?.() || a.timestamp : 0;
        const bTime = b.timestamp ? (b.timestamp as any).toMillis?.() || b.timestamp : 0;
        return aTime - bTime;
      });
      
      callback(messages);
    });
  }

  // Utility functions
  async checkChatExists(participant1: string, participant2: string): Promise<Chat | null> {
    try {
      const q = query(
        this.chatsCollection,
        where('participants', 'array-contains', participant1)
      );
      
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const chatData = doc.data() as Chat;
        if (chatData.participants.includes(participant2)) {
          return { id: doc.id, ...chatData };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking chat exists:', error);
      return null;
    }
  }
}

// Export types for unsubscribe function
type Unsubscribe = () => void;

export const firestoreService = new FirestoreService();
export type { Unsubscribe };
