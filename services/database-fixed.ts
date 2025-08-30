import * as SQLite from 'expo-sqlite';

export interface Message {
  id?: number;
  text: string;
  sender: string;
  timestamp: number;
  chatId: string;
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
      // Try multiple approaches for database initialization
      let dbName = 'chatapp';
      
      try {
        // First try: simple database name
        this.db = await SQLite.openDatabaseAsync(dbName);
      } catch (error1) {
        console.warn('First attempt failed, trying alternative approach:', error1);
        
        try {
          // Second try: with .db extension
          this.db = await SQLite.openDatabaseAsync('chatapp.db');
        } catch (error2) {
          console.warn('Second attempt failed, trying fallback:', error2);
          
          // Final fallback: use legacy API if available
          try {
            // @ts-ignore - Fallback to older API if needed
            this.db = SQLite.openDatabase('chatapp.db');
          } catch (error3) {
            console.error('All database initialization attempts failed:', error3);
            throw new Error('Could not initialize database');
          }
        }
      }

      if (!this.db) {
        throw new Error('Failed to open database');
      }

      console.log('Database opened successfully');
      
      // Create tables with proper error handling
      await this.createTables();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create chats table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          lastMessage TEXT DEFAULT '',
          lastMessageTime INTEGER DEFAULT 0
        );
      `);

      // Create messages table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          sender TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          chatId TEXT NOT NULL,
          FOREIGN KEY (chatId) REFERENCES chats (id) ON DELETE CASCADE
        );
      `);

      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
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
      
      // Insert the message
      await this.db.runAsync(
        'INSERT INTO messages (text, sender, timestamp, chatId) VALUES (?, ?, ?, ?)',
        [message.text, message.sender, message.timestamp, message.chatId]
      );

      // Update the chat's last message
      await this.db.runAsync(
        'UPDATE chats SET lastMessage = ?, lastMessageTime = ? WHERE id = ?',
        [message.text, message.timestamp, message.chatId]
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

  // Method to check if database is working
  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) return false;
      
      // Simple test query
      await this.db.getAllAsync('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
