import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, useSegments } from 'expo-router';

// Professional theme configuration - Force light theme for consistent UI
const ProfessionalLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.cardBackground,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const ProfessionalDarkTheme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.cardBackground,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

// this controls navigation flow
function InlineAuthWrapper({ children }: { children: React.ReactNode }) {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingSpinner} />
        <ThemedText style={styles.loadingText}>Loading your chat experience...</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={ProfessionalLightTheme}>
        <InlineAuthWrapper>
          <Stack screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#1C1C1E',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerShadowVisible: true,
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen 
              name="chat/[id]" 
              options={{ 
                presentation: 'card',
              }} 
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </InlineAuthWrapper>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}

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
