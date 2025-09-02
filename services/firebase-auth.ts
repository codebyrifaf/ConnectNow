import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { firestoreService } from './firestore';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

class FirebaseAuthService {
  async signUp(
    username: string,
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
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

      // Check if username already exists (simple check)
      const existingUsers = await firestoreService.searchUsers(username, '');
      const usernameExists = existingUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
      
      if (usernameExists) {
        return { success: false, message: 'Username already exists' };
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth,email,password)
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: displayName,
      });

      // Create user document in Firestore
      const userData = {
        id: firebaseUser.uid,
        username: username,
        email: email,
        displayName: displayName,
      };

      await firestoreService.createUser(userData);

      const authUser: AuthUser = {
        ...userData,
        createdAt: new Date(),
      };

      return { success: true, message: 'Account created successfully', user: authUser };
    } catch (error: any) {
      console.error('Error during sign up:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'Email already exists' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, message: 'Password is too weak' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, message: 'Invalid email address' };
      }
      
      return { success: false, message: 'An error occurred during sign up' };
    }
  }

  async signIn(
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      if (!usernameOrEmail || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      let email = usernameOrEmail;

      // If it's a username, find the email
      if (!usernameOrEmail.includes('@')) {
        const users = await firestoreService.searchUsers(usernameOrEmail, '');
        const user = users.find(u => u.username.toLowerCase() === usernameOrEmail.toLowerCase());
        
        if (!user) {
          return { success: false, message: 'User not found' };
        }
        
        email = user.email;
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userData = await firestoreService.getUser(firebaseUser.uid);
      
      if (!userData) {
        return { success: false, message: 'User data not found' };
      }

      const authUser: AuthUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt as Date,
      };

      return { success: true, message: 'Signed in successfully', user: authUser };
    } catch (error: any) {
      console.error('Error during sign in:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: 'Invalid email or password' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, message: 'Invalid email address' };
      } else if (error.code === 'auth/too-many-requests') {
        return { success: false, message: 'Too many failed attempts. Please try again later.' };
      }
      
      return { success: false, message: 'An error occurred during sign in' };
    }
  }

  async signOut(): Promise<boolean> {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error during sign out:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userData = await firestoreService.getUser(firebaseUser.uid);
      if (!userData) return null;

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt as Date,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return !!auth.currentUser;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await firestoreService.getUser(firebaseUser.uid);
        if (userData) {
          const authUser: AuthUser = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            createdAt: userData.createdAt as Date,
          };
          callback(authUser);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  async updateProfile(
    userId: string,
    updates: { displayName?: string; email?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || firebaseUser.uid !== userId) {
        return { success: false, message: 'User not authenticated' };
      }

      // Update Firebase Auth profile if displayName is being updated
      if (updates.displayName) {
        await updateProfile(firebaseUser, {
          displayName: updates.displayName,
        });
      }

      // Update Firestore user document
      if (updates.displayName) {
        const userData = await firestoreService.getUser(userId);
        if (userData) {
          await firestoreService.createUser({
            ...userData,
            displayName: updates.displayName,
          });
        }
      }

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  }

  async searchUsers(query: string, excludeUserId?: string): Promise<AuthUser[]> {
    try {
      const users = await firestoreService.searchUsers(query, excludeUserId || '');
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt as Date,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
