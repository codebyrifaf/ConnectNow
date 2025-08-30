import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { generateId } from '../utils/helpers';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, this should be hashed
  displayName: string;
  createdAt: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: number;
}

const AUTH_TOKEN_KEY = '@chatapp_auth_token';
const CURRENT_USER_KEY = '@chatapp_current_user';

class AuthService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase() {
    try {
      if (this.db) return;

      let dbName = 'chatapp_auth';
      
      try {
        this.db = await SQLite.openDatabaseAsync(dbName);
      } catch (error1) {
        console.warn('First attempt failed, trying alternative approach:', error1);
        try {
          this.db = await SQLite.openDatabaseAsync('chatapp_auth.db');
        } catch (error2) {
          console.warn('Second attempt failed, trying fallback:', error2);
          try {
            // @ts-ignore - Fallback to older API if needed
            this.db = SQLite.openDatabase('chatapp_auth.db');
          } catch (error3) {
            console.error('All auth database initialization attempts failed:', error3);
            throw new Error('Could not initialize auth database');
          }
        }
      }

      if (!this.db) {
        throw new Error('Failed to open auth database');
      }

      // Create users table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          displayName TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );
      `);

      console.log('Auth database initialized successfully');
    } catch (error) {
      console.error('Error initializing auth database:', error);
      throw error;
    }
  }

  // Simple password hashing (in production, use bcrypt or similar)
  private hashPassword(password: string): string {
    // This is a very basic hash - in production use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async signUp(username: string, email: string, password: string, displayName: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      // Validation
      if (!username || !email || !password || !displayName) {
        return { success: false, message: 'All fields are required' };
      }

      if (username.length < 3) {
        return { success: false, message: 'Username must be at least 3 characters' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      if (!email.includes('@')) {
        return { success: false, message: 'Please enter a valid email' };
      }

      // Check if username or email already exists
      const existingUser = await this.db.getAllAsync(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser.length > 0) {
        const existing = existingUser[0] as User;
        if (existing.username === username) {
          return { success: false, message: 'Username already exists' };
        } else {
          return { success: false, message: 'Email already exists' };
        }
      }

      // Create new user
      const userId = generateId();
      const hashedPassword = this.hashPassword(password);
      const createdAt = Date.now();

      await this.db.runAsync(
        'INSERT INTO users (id, username, email, password, displayName, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, username, email, hashedPassword, displayName, createdAt]
      );

      const user: AuthUser = {
        id: userId,
        username,
        email,
        displayName,
        createdAt
      };

      // Auto-login after signup
      await this.saveAuthSession(user);

      return { success: true, message: 'Account created successfully', user };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { success: false, message: 'An error occurred during sign up' };
    }
  }

  async signIn(usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      if (!usernameOrEmail || !password) {
        return { success: false, message: 'Username/email and password are required' };
      }

      // Find user by username or email
      const users = await this.db.getAllAsync(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [usernameOrEmail, usernameOrEmail]
      );

      if (users.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = users[0] as User;
      const hashedPassword = this.hashPassword(password);

      if (user.password !== hashedPassword) {
        return { success: false, message: 'Invalid password' };
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      };

      // Save auth session
      await this.saveAuthSession(authUser);

      return { success: true, message: 'Signed in successfully', user: authUser };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { success: false, message: 'An error occurred during sign in' };
    }
  }

  async signOut(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return true;
    } catch (error) {
      console.error('Error during sign out:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private async saveAuthSession(user: AuthUser): Promise<void> {
    try {
      const token = generateId(); // Simple token generation
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving auth session:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: { displayName?: string; email?: string }): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      const setClause = [];
      const values = [];

      if (updates.displayName) {
        setClause.push('displayName = ?');
        values.push(updates.displayName);
      }

      if (updates.email) {
        setClause.push('email = ?');
        values.push(updates.email);
      }

      if (setClause.length === 0) {
        return { success: false, message: 'No updates provided' };
      }

      values.push(userId);

      await this.db.runAsync(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );

      // Update stored user data
      const updatedUser = await this.getUserById(userId);
      if (updatedUser) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  }

  private async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      const users = await this.db.getAllAsync('SELECT * FROM users WHERE id = ?', [userId]);
      
      if (users.length === 0) return null;

      const user = users[0] as User;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<AuthUser[]> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      const users = await this.db.getAllAsync('SELECT id, username, email, displayName, createdAt FROM users ORDER BY createdAt DESC');
      return users as AuthUser[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<AuthUser[]> {
    try {
      if (!this.db) await this.initDatabase();
      if (!this.db) throw new Error('Database not initialized');

      const searchTerm = `%${query.toLowerCase()}%`;
      let sql = 'SELECT id, username, email, displayName, createdAt FROM users WHERE (LOWER(username) LIKE ? OR LOWER(displayName) LIKE ? OR LOWER(email) LIKE ?)';
      let params: any[] = [searchTerm, searchTerm, searchTerm];

      if (excludeUserId) {
        sql += ' AND id != ?';
        params.push(excludeUserId);
      }

      sql += ' ORDER BY displayName ASC LIMIT 20';

      const users = await this.db.getAllAsync(sql, params);
      return users as AuthUser[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
