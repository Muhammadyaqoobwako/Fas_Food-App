import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/presentation/state/AppContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { Platform, Alert } from 'react-native';

if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = message ? `${title}\n${message}` : title;
    if (buttons && buttons.length > 0) {
      if (buttons.length > 1) {
        const hasCancel = buttons.some(b => b.style === 'cancel');
        if (hasCancel) {
          const result = window.confirm(text);
          if (result) {
            const okButton = buttons.find(b => b.style !== 'cancel');
            if (okButton && okButton.onPress) okButton.onPress();
          } else {
            const cancelButton = buttons.find(b => b.style === 'cancel');
            if (cancelButton && cancelButton.onPress) cancelButton.onPress();
          }
        } else {
          window.alert(text);
          if (buttons[0] && buttons[0].onPress) buttons[0].onPress();
        }
      } else {
        window.alert(text);
        if (buttons[0] && buttons[0].onPress) buttons[0].onPress();
      }
    } else {
      window.alert(text);
    }
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
