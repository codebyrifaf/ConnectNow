import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { signUp } = useAuth();
  
  // White theme colors
  const backgroundColor = '#FFFFFF';
  const textColor = '#1C1C1E';
  const borderColor = '#E5E5EA';
  const placeholderColor = '#8E8E93';

  const handleSignUp = async () => {
    if (loading) return;

    // Validation
    if (!username.trim() || !email.trim() || !displayName.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(
        username.trim(),
        email.trim(),
        password,
        displayName.trim()
      );
      
      if (result.success) {
        Alert.alert('Success', result.message, [
          { text: 'OK', onPress: () => {
            // AuthWrapper will handle the redirect automatically
            console.log('Sign up successful');
          }}
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={goToSignIn} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={60} color="#007AFF" />
            </View>
            <ThemedText type="title" style={[styles.title, { color: textColor }]}>
              Create Account
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: placeholderColor }]}>
              Join the conversation
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Username
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor }]}>
                <Ionicons name="at" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Display Name
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor }]}>
                <Ionicons name="person" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your display name"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Email
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor }]}>
                <Ionicons name="mail" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Password
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={placeholderColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Confirm Password
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInLinkContainer}
              onPress={goToSignIn}
            >
              <ThemedText style={[styles.signInLink, { color: placeholderColor }]}>
                Already have an account?{' '}
                <ThemedText style={[styles.signInLinkBold, { color: '#007AFF' }]}>
                  Sign In
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signInLinkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  signInLink: {
    fontSize: 16,
    textAlign: 'center',
  },
  signInLinkBold: {
    fontWeight: '600',
  },
});
