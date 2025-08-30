// Add this to your app temporarily to clear stored auth data
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('@chatapp_auth_token');
    await AsyncStorage.removeItem('@chatapp_current_user');
    console.log('Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Call this function once to clear the data
clearAuthData();
