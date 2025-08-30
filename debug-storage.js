// Debug script to check AsyncStorage contents
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStorage = async () => {
  try {
    console.log('=== AsyncStorage Debug ===');
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('All keys:', keys);
    
    // Check specific auth keys
    const authToken = await AsyncStorage.getItem('@chatapp_auth_token');
    const currentUser = await AsyncStorage.getItem('@chatapp_current_user');
    
    console.log('Auth token:', authToken);
    console.log('Current user:', currentUser);
    
    if (currentUser) {
      console.log('Parsed user:', JSON.parse(currentUser));
    }
    
    // Get all key-value pairs
    const multiGet = await AsyncStorage.multiGet(keys);
    console.log('All storage contents:');
    multiGet.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
  } catch (error) {
    console.error('Error checking storage:', error);
  }
};

// To clear storage if needed
const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

export { checkStorage, clearStorage };

