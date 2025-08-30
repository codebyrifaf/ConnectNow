import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '../services/auth';
import { databaseService } from '../services/database';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (username: string, email: string, password: string, displayName: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; email?: string }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // DEVELOPMENT: Clear auth on app start (remove in production)
      if (__DEV__) {
        await authService.signOut();
        console.log('Development mode: Auth cleared on startup');
      }
      
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Initialize database when user is authenticated
          await databaseService.initDatabase();
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    const result = await authService.signIn(usernameOrEmail, password);
    if (result.success && result.user) {
      try {
        // Initialize database after successful sign in
        await databaseService.initDatabase();
        setUser(result.user);
      } catch (error) {
        console.error('Error initializing database after sign in:', error);
        return { success: false, message: 'Failed to initialize the app' };
      }
    }
    return result;
  };

  const signUp = async (username: string, email: string, password: string, displayName: string) => {
    const result = await authService.signUp(username, email, password, displayName);
    if (result.success && result.user) {
      try {
        // Initialize database after successful sign up
        await databaseService.initDatabase();
        setUser(result.user);
      } catch (error) {
        console.error('Error initializing database after sign up:', error);
        return { success: false, message: 'Failed to initialize the app' };
      }
    }
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: { displayName?: string; email?: string }) => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    const result = await authService.updateProfile(user.id, updates);
    if (result.success) {
      // Refresh user data
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
    return result;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
