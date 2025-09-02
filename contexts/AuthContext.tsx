import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, firebaseAuthService } from '../services/firebase-auth';

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
    // Set up Firebase auth state listener
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (usernameOrEmail: string, password: string) => {
    const result = await firebaseAuthService.signIn(usernameOrEmail, password);
    return result;
  };

  const signUp = async (username: string, email: string, password: string, displayName: string) => {
    const result = await firebaseAuthService.signUp(username, email, password, displayName);
    return result;
  };

  const signOut = async () => {
    await firebaseAuthService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: { displayName?: string; email?: string }) => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    const result = await firebaseAuthService.updateProfile(user.id, updates);
    if (result.success) {
      // Refresh user data
      const updatedUser = await firebaseAuthService.getCurrentUser();
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
