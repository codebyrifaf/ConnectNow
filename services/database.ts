import * as SQLite from 'expo-sqlite';

export interface Message {
  id?: number;
  text: string;
  sender: string;
  timestamp: number;
  chatId: string;
  imageUri?: string; // Optional image URI for photo messages
  messageType?: 'text' | 'image'; // Type of message
}

export interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase() {
    try {
      // Try to open the database with error handling
      try {
        this.db = await SQLite.openDatabaseAsync('chatapp.db');
      } catch (dbError) {
        console.warn('Error opening database, trying with different path:', dbError);
        // Fallback: try with a simpler database name
        this.db = await SQLite.openDatabaseAsync('chatapp');
      }

      if (!this.db) {
        throw new Error('Failed to open database');
      }
      
      // Create tables if they don't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          lastMessage TEXT,
          lastMessageTime INTEGER
        );
      `);

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          sender TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          chatId TEXT NOT NULL,
          imageUri TEXT,
          messageType TEXT DEFAULT 'text',
          FOREIGN KEY (chatId) REFERENCES chats (id)
        );
      `);

      // Add new columns if they don't exist (for existing databases)
      try {
        await this.db.execAsync(`ALTER TABLE messages ADD COLUMN imageUri TEXT;`);
      } catch (error) {
        // Column might already exist, ignore error
      }

      try {
        await this.db.execAsync(`ALTER TABLE messages ADD COLUMN messageType TEXT DEFAULT 'text';`);
      } catch (error) {
        // Column might already exist, ignore error
      }

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createChat(chat: Chat): Promise<boolean> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      await this.db.runAsync(
        'INSERT INTO chats (id, name, lastMessage, lastMessageTime) VALUES (?, ?, ?, ?)',
        [chat.id, chat.name, chat.lastMessage || '', chat.lastMessageTime || Date.now()]
      );
      
      return true;
    } catch (error) {
      console.error('Error creating chat:', error);
      return false;
    }
  }

  async getChats(): Promise<Chat[]> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      const result = await this.db.getAllAsync('SELECT * FROM chats ORDER BY lastMessageTime DESC');
      return result as Chat[];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  async addMessage(message: Omit<Message, 'id'>): Promise<boolean> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      // Insert the message with image support
      await this.db.runAsync(
        'INSERT INTO messages (text, sender, timestamp, chatId, imageUri, messageType) VALUES (?, ?, ?, ?, ?, ?)',
        [
          message.text, 
          message.sender, 
          message.timestamp, 
          message.chatId, 
          message.imageUri || null,
          message.messageType || 'text'
        ]
      );

      // Update the chat's last message (show "📷 Photo" for image messages)
      const lastMessageText = message.messageType === 'image' ? '📷 Photo' : message.text;
      await this.db.runAsync(
        'UPDATE chats SET lastMessage = ?, lastMessageTime = ? WHERE id = ?',
        [lastMessageText, message.timestamp, message.chatId]
      );

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      const result = await this.db.getAllAsync(
        'SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC',
        [chatId]
      );
      
      return result as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      // Delete messages first (foreign key constraint)
      await this.db.runAsync('DELETE FROM messages WHERE chatId = ?', [chatId]);
      
      // Delete the chat
      await this.db.runAsync('DELETE FROM chats WHERE id = ?', [chatId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');
      
      await this.db.runAsync('DELETE FROM messages');
      await this.db.runAsync('DELETE FROM chats');
      
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
