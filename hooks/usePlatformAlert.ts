import { Alert, Platform } from 'react-native';

type ButtonConfig = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type OptionsConfig = { cancelable?: boolean };

type ConfirmConfig = {
  title: string;
  message?: string;
  buttons: ButtonConfig[];
  options?: OptionsConfig;
};

export const usePlatformAlert = () => {
  // Simple alert (OK button)
  const alert = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      window.alert([title, message].filter(Boolean).join('\n'));
    } else {
      Alert.alert(title, message);
    }
  };

  // Advanced confirm (custom buttons)
  const confirm = (
    title: string, 
    message: string, 
    buttons?: ButtonConfig[], 
    options?: OptionsConfig
  ) => {

    if (!buttons) {
        buttons = [{ text: 'OK' }];
    }
    if (Platform.OS === 'web') {
      // Fallback to simple `confirm` on web (or use a custom modal)
      const isConfirmed = window.confirm([title, message].filter(Boolean).join('\n'));
      if (isConfirmed) {
        const confirmButton = buttons.find((btn) => btn.style !== 'cancel');
        confirmButton?.onPress?.();
      } else {
        const cancelButton = buttons.find((btn) => btn.style === 'cancel');
        cancelButton?.onPress?.();
      }
    } else {
      Alert.alert(
        title,
        message,
        buttons.map((btn) => ({
          text: btn.text,
          style: btn.style,
          onPress: btn.onPress,
        })),
        options
      );
    }
  };

  return { alert, confirm };
};