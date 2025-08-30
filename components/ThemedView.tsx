import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Use consistent light theme background color
  const backgroundColor = lightColor || '#F2F2F7'; // Default to light gray background

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
