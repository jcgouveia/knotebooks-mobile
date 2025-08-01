import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'automatic' | 'light' | 'dark';

interface SettingsContextType {
  serverUrl: string;
  theme: Theme;
  currentColorScheme: ColorSchemeName;
  setServerUrl: (url: string) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.knotebooks.com';
const DEFAULT_THEME: Theme = 'automatic';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [serverUrl, setServerUrlState] = useState(DEFAULT_SERVER_URL);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [currentColorScheme, setCurrentColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    loadSettings();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setCurrentColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Update current color scheme based on theme setting
    if (theme === 'automatic') {
      setCurrentColorScheme(Appearance.getColorScheme());
    } else {
      setCurrentColorScheme(theme as ColorSchemeName);
    }
  }, [theme]);

  const loadSettings = async () => {
    try {
      const storedServerUrl = await AsyncStorage.getItem('settings_server_url');
      const storedTheme = await AsyncStorage.getItem('settings_theme');

      if (storedServerUrl) {
        setServerUrlState(storedServerUrl);
      }

      if (storedTheme && ['automatic', 'light', 'dark'].includes(storedTheme)) {
        setThemeState(storedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const setServerUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem('settings_server_url', url);
      setServerUrlState(url);
    } catch (error) {
      console.error('Failed to save server URL:', error);
      throw error;
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('settings_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      await AsyncStorage.removeItem('settings_server_url');
      await AsyncStorage.removeItem('settings_theme');
      setServerUrlState(DEFAULT_SERVER_URL);
      setThemeState(DEFAULT_THEME);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        serverUrl,
        theme,
        currentColorScheme,
        setServerUrl,
        setTheme,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}