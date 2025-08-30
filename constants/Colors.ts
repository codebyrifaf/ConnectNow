/**
 * Professional color palette for the chat application
 * Consistent, modern colors with proper contrast ratios
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    
    // Professional chat colors
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    
    // UI Elements
    cardBackground: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    border: '#C6C6C8',
    placeholder: '#C7C7CC',
    separator: '#E5E5EA',
    
    // Chat specific
    messageBackground: '#E9E9EB',
    myMessageBackground: '#007AFF',
    inputBackground: '#F2F2F7',
    headerBackground: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    
    // Professional chat colors
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    
    // UI Elements
    cardBackground: '#1C1C1E',
    secondaryBackground: '#2C2C2E',
    border: '#38383A',
    placeholder: '#48484A',
    separator: '#38383A',
    
    // Chat specific
    messageBackground: '#2C2C2E',
    myMessageBackground: '#0A84FF',
    inputBackground: '#1C1C1E',
    headerBackground: '#1C1C1E',
  },
};
