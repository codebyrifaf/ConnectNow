import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign in if not authenticated
      setTimeout(() => {
        router.replace('/auth/signin' as any);
      }, 100);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and in auth screens
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 100);
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingSpinner} />
        <ThemedText style={styles.loadingText}>Loading your chat experience...</ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}

// Also export as named export for compatibility
export { AuthWrapper };

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 32,
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
});
